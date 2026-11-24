// SPDX-License-Identifier: Unlicense
// Run in the browser console on Namecheap's Advanced DNS page.
(() => {
    const tables = [...document.querySelectorAll('table.advanced-dns')].filter(table =>
        !table.closest('.ng-hide, [hidden], [aria-hidden="true"]') &&
        ['type', 'host', 'value', 'ttl'].every(column => table.querySelector(`thead th.${column}`))
    );
    if (!tables.length) {
        throw new Error('Namecheap DNS tables were not found. Open Advanced DNS and wait for the records to load.');
    }

    function cellText(cell) {
        const copy = cell.cloneNode(true);
        copy.querySelectorAll('.header, .ng-hide, [hidden], [aria-hidden="true"], input, select, button, svg')
            .forEach(element => element.remove());
        return copy.textContent.trim();
    }

    const dnsName = /^(?:\*\.)?[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.?$/i;
    const absoluteName = name => name.endsWith('.') ? name : `${name}.`;
    const isUint16 = value => /^\d+$/.test(value) && Number(value) <= 65535;

    function formatTxt(value) {
        const bytes = new TextEncoder().encode(value);
        const chunks = [];
        for (let offset = 0; offset < bytes.length; offset += 255) {
            const chunk = [...bytes.slice(offset, offset + 255)].map(byte => {
                if (byte < 32 || byte > 126) return '\\' + String(byte).padStart(3, '0');
                const character = String.fromCharCode(byte);
                return byte === 34 || byte === 92 ? '\\' + character : character;
            }).join('');
            chunks.push(`"${chunk}"`);
        }
        return chunks.join(' ') || '""';
    }

    function formatTtl(value) {
        if (!value || /^automatic$/i.test(value)) return '';
        const match = /^(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?)?$/i.exec(value);
        if (!match) return null;
        const scale = {s: 1, m: 60, h: 3600, d: 86400, w: 604800};
        const seconds = Number(match[1]) * scale[match[2]?.[0].toLowerCase() ?? 's'];
        return seconds <= 2147483647 ? String(seconds) : null;
    }

    function formatValue(type, cell) {
        const parts = [...cell.querySelectorAll('.subfield1, .subfield2')].map(cellText).filter(Boolean);
        const value = parts.length ? parts.join(' ') : cellText(cell);
        if (type === 'TXT') return formatTxt(value);
        if (type === 'A') {
            const octets = value.split('.');
            return octets.length === 4 && octets.every(octet => /^\d{1,3}$/.test(octet) && Number(octet) <= 255)
                ? value : null;
        }
        if (type === 'AAAA') {
            if (!/^[a-f0-9:.]+$/i.test(value) || !value.includes(':')) return null;
            try {
                new URL(`http://[${value}]/`);
                return value;
            } catch {
                return null;
            }
        }
        if (['CNAME', 'NS', 'PTR'].includes(type)) {
            return dnsName.test(value) ? absoluteName(value) : null;
        }

        const fields = value.split(/\s+/);
        if (type === 'MX' && fields.length === 2) {
            const [first, second] = fields;
            const [priority, host] = isUint16(first) ? [first, second] : [second, first];
            return isUint16(priority) && (host === '.' || dnsName.test(host))
                ? `${priority} ${absoluteName(host)}` : null;
        }
        if (type === 'SRV' && fields.length === 4) {
            const target = fields.pop();
            return fields.every(isUint16) && (target === '.' || dnsName.test(target))
                ? [...fields, absoluteName(target)].join(' ') : null;
        }
        return null;
    }

    const records = [];
    const skipped = [];
    let redirects = 0;
    for (const table of tables) {
        for (const row of table.querySelectorAll('tbody tr')) {
            if (row.closest('.ng-hide, [hidden], [aria-hidden="true"]')) continue;
            const [typeCell, hostCell, valueCell, ttlCell] = ['type', 'host', 'value', 'ttl']
                .map(column => row.querySelector(`td.${column}`));
            if (!typeCell || !hostCell || !valueCell || !ttlCell) continue;
            const type = cellText(typeCell).replace(/\s+Record$/i, '').toUpperCase();
            if (row.classList.contains('url-record') || type === 'URL REDIRECT') {
                redirects++;
                continue;
            }
            const owner = cellText(hostCell);
            const ttl = formatTtl(cellText(ttlCell));
            const data = formatValue(type, valueCell);
            if (!(owner === '@' || owner === '*' || dnsName.test(owner)) || ttl === null || !data) {
                skipped.push(/^[A-Z0-9]+$/.test(type) ? type : 'unknown');
                continue;
            }
            records.push([owner, ttl, 'IN', type, data].filter(Boolean).join('\t'));
        }
    }

    if (redirects) console.warn(`Excluded ${redirects} URL redirect(s). Recreate them separately if needed.`);
    if (skipped.length) {
        console.warn(`Skipped ${skipped.length} unsupported or incomplete record(s): ${[...new Set(skipped)].join(', ')}.`);
    }
    if (!records.length) {
        console.warn('No exportable DNS records were found in the loaded tables.');
        return;
    }
    console.log([
        '; Namecheap DNS record fragment',
        '; Set the intended zone origin and default TTL before importing.',
        ...records,
    ].join('\n'));
})();
