DNS Configuration
ICT171 — Ashfaqul Haque Bhuiyan (35720354)
This document explains how the custom domain ashfaqulshifttrack.online was configured to point to the Azure VM at 20.2.88.235.

DNS Approach
A custom domain was registered through a domain registrar and configured using DNS A records. Azure's built-in public IP DNS label (visible in the Azure Portal as "DNS name: Not configured") was not used — the final DNS is entirely handled by the custom domain.

DNS Records Created
Two A records were added in the domain registrar's DNS management panel:
TypeHost / NameValue / Points ToTTLA@20.2.88.235300Awww20.2.88.235300

The @ record covers the root domain: ashfaqulshifttrack.online
The www record covers the subdomain: www.ashfaqulshifttrack.online

Both records point to the Azure VM's public IP address.

DNS Verification
Both records were verified from a Windows command prompt using nslookup.
Root domain
nslookup ashfaqulshifttrack.online
Result:
Name:    ashfaqulshifttrack.online
Address: 20.2.88.235
WWW subdomain
nslookup www.ashfaqulshifttrack.online
Result:
Name:    www.ashfaqulshifttrack.online
Address: 20.2.88.235
Both names resolve correctly to 20.2.88.235.
Screenshot: screenshots/dns-nslookup-root.png, screenshots/dns-nslookup-www.png

Apache Virtual Host Update
After DNS resolved, the Apache virtual host was updated to recognise both names (see Website Deployment for the full steps):
apacheServerName ashfaqulshifttrack.online
ServerAlias www.ashfaqulshifttrack.online
This was done before running Certbot, as Let's Encrypt requires both names to be resolving and Apache to be configured correctly before a certificate can be issued.

Note on Azure DNS Label
The Azure Portal shows "DNS name: Not configured" for this VM. This is expected — the DNS label built into Azure was never set up because a custom registered domain was used instead. Both approaches achieve the same result; a custom domain was chosen to demonstrate real-world DNS configuration using A records.
bashsudo systemctl reload apache2

DNS Entry for Assignment Submission
DNS Name: [INSERT DNS NAME]
IP Address: 20.2.88.235
Place this at the top of the assignment PDF submission as required.
