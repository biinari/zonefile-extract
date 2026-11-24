// SPDX-License-Identifier: Unlicense
// Run in the browser console on your DreamHost Manage DNS page.
// Set this to true to include DreamHost-managed records in the output.
(() => {
    const includeManagedRecords = false;
    const sectionNames = includeManagedRecords
        ? ['Custom Records', 'DreamHost Records']
        : ['Custom Records'];
    const sections = [...document.querySelectorAll('.Manage-Box__table')].filter(
        section => sectionNames.includes(section.querySelector('.box-title')?.textContent.trim())
    );
    if (!sections.length) {
        throw new Error('DreamHost DNS record sections were not found. Open Manage DNS and wait for the records to load.');
    }

    const text = (row, selector) => row.querySelector(selector)?.textContent.trim() ?? '';
    const dnsName = /^(?:\*\.)?[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.?$/i;
    const absoluteName = name => name.endsWith('.') ? name : `${name}.`;
    const isUint16 = value => /^\d+$/.test(value) && Number(value) <= 65535;

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

    function formatData(type, value, priority) {
        if (type === 'TXT') return formatTxt(value);
        if (type === 'A') {
            const octets = value.split('.');
            return octets.length === 4 && octets.every(octet => /^\d{1,3}$/.test(octet) && Number(octet) <= 255)
                ? value : null;
        }
        if (type === 'AAAA') return /^[a-f0-9:.]+$/i.test(value) && value.includes(':') ? value : null;
        if (['CNAME', 'NS', 'PTR'].includes(type)) {
            return dnsName.test(value) ? absoluteName(value) : null;
        }

        const fields = value.split(/\s+/);
        const expected = { MX: 2, SRV: 4 }[type];
        if (!expected) return null;
        // DreamHost can show the priority in the data and in a separate column.
        if (priority && fields.length === expected - 1) fields.unshift(priority);
        if (fields.length !== expected || (priority && Number(fields[0]) !== Number(priority))) {
            return null;
        }
        const target = fields.pop();
        if (!fields.every(isUint16) || !(target === '.' || dnsName.test(target))) return null;
        return [...fields, absoluteName(target)].join(' ');
    }

    const lines = [
        '; DreamHost DNS record fragment',
        '; Set the intended zone origin and default TTL before importing.',
    ];
    const skipped = [];
    let count = 0;
    for (const section of sections) {
        lines.push(`; ${section.querySelector('.box-title').textContent.trim()}`);
        for (const row of section.querySelectorAll('.Table-row')) {
            const owner = text(row, '.row-name .name');
            const type = text(row, '.row-type').toUpperCase();
            if (!row.querySelector('.row-name .name')) continue; // Header row.
            const valueNode = row.querySelector('.row-value .value-content');
            const priority = text(row, '.row-priority');
            const value = valueNode?.textContent ?? '';
            const data = valueNode && formatData(type, type === 'TXT' ? value : value.trim(), priority);
            if (!(owner === '@' || owner === '*' || dnsName.test(owner)) || !data) {
                skipped.push(/^[A-Z0-9]+$/.test(type) ? type : 'unknown');
                continue;
            }
            lines.push(`${owner}\tIN\t${type}\t${data}`);
            count++;
        }
    }

    if (skipped.length) {
        console.warn(`Skipped ${skipped.length} unsupported or incomplete record(s): ${[...new Set(skipped)].join(', ')}. Review them in the panel.`);
    }
    if (!count) {
        console.warn('No exportable records were loaded in the selected sections.');
        return;
    }
    console.log(lines.join('\n'));
})();
