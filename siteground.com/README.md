# Extract DNS entries from 123-reg advanced DNS page

***Update (11 Jul 2024): 123-reg now supports exporting the Zone File from their DNS Records page. Use the Actions menu.***

In the old system (pre-2023), 123-reg did not support exporting their zone files, which prompted me to create a script to extract the DNS entries automatically. 

## Instructions

Read through the script to confirm for yourself that it does nothing malicious. All it does is to get the info from the page and log it to your console.

1. Login to your 123-reg control panel.
2. Manage the domain you want to get entries from.
3. Go to "Manage DNS (A, MX, CNAME, TXT, SRV)".
4. Click on the "Advanced DNS" tab.
5. Open the Developer tools in your browser (common shortcuts include F12 or Ctrl+Shift+I).
6. Click on the "Console" tab in developer tools.
7. Copy and paste the above script.
8. The output to the console should be in zone file format.

## Disclaimer

I am not affiliated with 123-reg. Their advanced DNS page may change at any time, which may break this script.
