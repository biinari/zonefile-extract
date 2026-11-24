# Export DNS records from SiteGround

This script reads the records loaded in SiteGround's DNS Zone Editor and prints a zone-file fragment to the browser console. It makes no network requests or DNS changes.

## Instructions

1. Sign in to [SiteGround Site Tools](https://tools.siteground.com/).
2. Use the site selector at the top left to choose the website you want to export.
3. In the left sidebar, open **Domain → DNS Zone Editor**. Wait for the records to load and confirm that the editor is showing the intended DNS zone.
4. Open your browser's developer tools and select **Console**. Read [`extract.js`](extract.js), then paste and run it in the console.
5. Copy the output to a local text file and compare it with the panel. Review any warnings and set the appropriate default TTL before importing.

The extractor supports A, CNAME, MX, NS, and TXT records. It preserves MX priorities and quotes TXT values. The record list does not show individual TTLs, so the script leaves them out. Check which nameserver records belong in the destination zone before copying NS entries.
