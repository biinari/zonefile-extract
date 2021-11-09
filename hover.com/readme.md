# Extract DNS entries from hover.com DNS page

hover.com do not support exporting their zone files, which prompted me to create a script to extract the DNS entries automatically. 

## Instructions

Read through the script to confirm for yourself that it does nothing malicious. All it does is to get the info from the page and log it to your console.

1. Login to your hover.com control panel.
2. Usually this will open by default on the "Manage Domains" page which is the control panel homepage [https://www.hover.com/control_panel](https://www.hover.com/control_panel) If it doesn't, try opening this link.
3. Open the Developer tools in your browser (common shortcuts include F12 or Ctrl+Shift+I).
4. Click on the "Console" tab in developer tools.
5. Copy and paste the above script.
6. Press Enter to run.
7. The output to the console should be in zone file format.

## Disclaimer

I am not affiliated with hover.com. Their advanced DNS page may change at any time, which may break this script.
