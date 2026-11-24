# Export DNS records from DreamHost

This script reads the DNS records loaded in the DreamHost panel and prints a zone-file fragment in your browser console. It makes no network requests and does not change your DNS settings.

## Instructions

1. Sign in to the [DreamHost panel](https://panel.dreamhost.com/).
2. In the left sidebar, open **Websites → Manage Websites**.
3. Find the primary domain you want to export, such as `example.com`. Click **DNS** on that domain’s row. Choose the primary domain row even if a subdomain such as `dev.example.com` has its own **DNS** link.
4. On the **DNS** tab, scroll down to **Records**. Click **Show more records** at the bottom of the list if it appears. Wait for the additional records to load before running the script.
5. Open your browser’s developer tools and select **Console**. Read [`extract.js`](extract.js), then paste the script into the console and run it.
6. Copy the output into a local text file. Compare it with the panel, check any skipped-record warnings, and set the destination zone’s origin and default TTL before importing.

## Include DreamHost-managed records

The script exports only **Custom Records** by default. To include the **DreamHost Records** section as well, set `includeManagedRecords` to `true` near the top of `extract.js` before running it. The script can only read records that have loaded on the page.

If the domain uses external nameservers, the records shown in DreamHost may differ from the live DNS records served by that provider.
