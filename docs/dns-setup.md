DNS Configuration Guide
ICT171 — Ashfaqul Haque Bhuiyan (35720354)
This document explains how to configure a domain name to point to the Azure VM at 20.2.88.235, making the ShiftTrack website accessible via a human-readable URL rather than just an IP address.

Overview
DNS (Domain Name System) translates a domain name (e.g. shifttrack.example.com) into an IP address (20.2.88.235) so browsers can find the server. Two common approaches are used in this project:

Azure DNS Label — A free subdomain provided by Azure (e.g. shifttrack.eastasia.cloudapp.azure.com)
Custom Domain — A domain registered with a third-party registrar (e.g. Freenom, Namecheap, or No-IP)


Option 1 — Azure DNS Label (Recommended for This Assignment)
Azure allows you to assign a free DNS label to your VM's public IP address.
Steps

In the Azure Portal, navigate to your VM (ict171).
Under Settings, select Networking, then click the public IP address link.
Under the public IP resource, select Configuration.
In the DNS name label field, enter a unique label, e.g.:

   shifttrack35720354

Click Save.

The full DNS name will be:
shifttrack35720354.eastasia.cloudapp.azure.com
Replace eastasia with your actual Azure region if different.
Verify
From the server:
bashnslookup shifttrack35720354.eastasia.cloudapp.azure.com
Expected output will show the IP 20.2.88.235.
From a browser:
http://shifttrack35720354.eastasia.cloudapp.azure.com

Option 2 — Custom Domain with No-IP (Free Dynamic DNS)
No-IP provides free hostnames that can point to any IP address. Useful if you do not own a registered domain.
Steps

Create a free account at https://www.noip.com.
Click Add Hostname.
Choose a hostname (e.g. shifttrack) and a free domain (e.g. ddns.net).
Set the IP Address to 20.2.88.235.
Click Create Hostname.

The resulting hostname will be:
shifttrack.ddns.net
Verify
bashnslookup shifttrack.ddns.net
Then visit:
http://shifttrack.ddns.net

Option 3 — Custom Domain via A Record (Paid Registrar)
If you own a domain registered with Namecheap, GoDaddy, or similar:

Log in to your registrar's DNS management panel.
Add an A Record:

Host: @ (root) or a subdomain such as www
Value (Points to): 20.2.88.235
TTL: 300 (or Auto)


Save the record.

DNS propagation can take up to 24–48 hours, though it often resolves within minutes.

Update Apache ServerName (Optional but Recommended)
If using a custom domain, update Apache to recognise it:
bashsudo nano /etc/apache2/sites-available/000-default.conf
Add or update:
apacheServerName [INSERT DNS NAME]
Save the file, then reload Apache:
bashsudo systemctl reload apache2

DNS Entry for Assignment Submission
DNS Name: [INSERT DNS NAME]
IP Address: 20.2.88.235
Place this at the top of the assignment PDF submission as required.
