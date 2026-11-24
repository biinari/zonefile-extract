// SPDX-License-Identifier: Unlicense
// Run in the browser console on SiteGround's DNS Zone Editor.
(() => {
    const tables = [...document.querySelectorAll('table.sg-table')].filter(table => {
        const headers = [...table.querySelectorAll('thead th')].map(cell => cell.textContent.trim());
        return ['Type', 'Name', 'Value'].every((label, index) => headers[index] === label);
    });
    if (tables.length !== 1) {
        throw new Error('Could not identify one SiteGround DNS records table. Open DNS Zone Editor and wait for the records to load.');
    }

    const dnsName = /^(?:\*\.)?[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.?$/i;
    const absoluteName = name => name.endsWith('.') ? name : `${name}.`;

    function formatTxt(value) {
        const bytes = new TextEncoder().encode(value);
        const chunks = [];
        for (let offset = 0; offset < bytes.length; offset += 255) {
            let chunk = '';
            for (const byte of bytes.slice(offset, offset + 255)) {
                if (byte < 32 || byte > 126) {
                    chunk += '\\' + String(byte).padStart(3, '0');
                } else {
                    const character = String.fromCharCode(byte);
                    chunk += byte === 34 || byte === 92 ? '\\' + character : character;
                }
            }
            chunks.push(`"${chunk}"`);
        }
        return chunks.join(' ') || '""';
    }

    function formatValue(type, cell) {
        const paragraph = cell.querySelector('p[data-e2e="text"]');
        if (!paragraph) return null;
        if (type === 'TXT') return formatTxt(paragraph.textContent);

        // These spans hold the values without SiteGround's explanatory labels.
        const fields = [...paragraph.querySelectorAll('span.sg-text--color-dark')]
            .map(span => span.textContent.trim());
        if (type === 'MX') {
            const [host, priority] = fields;
            if (fields.length !== 2 || !(host === '.' || dnsName.test(host)) ||
                !/^\d+$/.test(priority) || Number(priority) > 65535) return null;
            return `${priority} ${absoluteName(host)}`;
        }
        if (fields.length !== 1) return null;
        const [value] = fields;
        if (['CNAME', 'NS'].includes(type)) return dnsName.test(value) ? absoluteName(value) : null;
        if (type === 'A') {
            const octets = value.split('.');
            if (octets.length === 4 && octets.every(octet => /^\d{1,3}$/.test(octet) && Number(octet) <= 255)) {
                return value;
            }
        }
        return null;
    }

    const records = [];
    const skipped = [];
    for (const row of tables[0].querySelectorAll('tbody tr[data-e2e="table-row"]')) {
        const [typeCell, nameCell, valueCell] = row.cells;
        const type = typeCell?.textContent.trim().toUpperCase() ?? '';
        const name = nameCell?.querySelector('p[data-e2e="text"]')?.textContent.trim() ?? '';
        const value = valueCell && formatValue(type, valueCell);
        if (!dnsName.test(name) || !name.endsWith('.') || !value) {
            skipped.push(/^[A-Z0-9]+$/.test(type) ? type : 'unknown');
            continue;
        }
        records.push(`${name}\tIN\t${type}\t${value}`);
    }

    if (skipped.length) {
        console.warn(`Skipped ${skipped.length} unsupported or incomplete record(s): ${[...new Set(skipped)].join(', ')}.`);
    }
    if (!records.length) {
        console.warn('No exportable records were found in the SiteGround DNS table.');
        return;
    }
    console.log([
        '; SiteGround DNS record fragment',
        '; Set the appropriate default TTL before importing.',
        ...records,
    ].join('\n'));
})();
