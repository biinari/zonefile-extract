# Export DNS records from Namecheap

## Open Advanced DNS

1. Sign in to the [Namecheap dashboard](https://ap.www.namecheap.com/dashboard).
2. Select **Domain List** in the left sidebar.
3. Click **Manage** next to the domain you want to export.
4. Open the **Advanced DNS** tab and wait for the records to load.
5. Clear any search or filters in **Host Records**. Check **Mail Settings** for additional DNS records displayed separately.

## Review records before migrating

Namecheap displays **URL Redirect Records** alongside ordinary DNS records. These redirects are a Namecheap forwarding feature and have no direct zone-file equivalent. Recreate them with the destination provider's redirect feature or on your web server.

Review any DNS records shown under **Mail Settings** against the destination's mail configuration. A provider-managed SPF record for email forwarding may need a different value if you change mail providers.
