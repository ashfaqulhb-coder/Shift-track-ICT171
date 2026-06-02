SSL/TLS Configuration
ICT171 — Ashfaqul Haque Bhuiyan (35720354)
This document covers how HTTPS was enabled on ashfaqulshifttrack.online using a free SSL/TLS certificate from Let's Encrypt, installed via Certbot.

Result Summary
ItemValueCertificate AuthorityLet's EncryptToolCertbot with Apache pluginDomains Securedashfaqulshifttrack.online, www.ashfaqulshifttrack.onlineCertificate File/etc/letsencrypt/live/ashfaqulshifttrack.online/fullchain.pemPrivate Key/etc/letsencrypt/live/ashfaqulshifttrack.online/privkey.pemExpiry2026-08-30Auto-renewalYes — configured by CertbotHTTPS Status✓ Active

Prerequisites
Before running Certbot, the following were confirmed:

ashfaqulshifttrack.online resolved to 20.2.88.235 via nslookup.
www.ashfaqulshifttrack.online resolved to 20.2.88.235 via nslookup.
Apache was running and serving the website on port 80.
Port 443 was open in the Azure Network Security Group.
UFW was set to allow Apache Full (ports 80 and 443).


Step 1 — Install Certbot
bashsudo apt update
sudo apt install certbot python3-certbot-apache -y
python3-certbot-apache is the Apache plugin. It reads the existing Apache configuration to locate the domain names and automatically updates the virtual host files to enable HTTPS.

Step 2 — Request the Certificate
bashsudo certbot --apache -d ashfaqulshifttrack.online -d www.ashfaqulshifttrack.online
During the process, Certbot:

Registered a new account with Let's Encrypt.
Asked for an email address for renewal notifications.
Asked for agreement to the Terms of Service.
Verified domain ownership using the HTTP-01 challenge — it temporarily placed a file in the web root that Let's Encrypt fetched to confirm control of the domain.
Issued the certificate and saved it to /etc/letsencrypt/live/ashfaqulshifttrack.online/.
Automatically edited the Apache configuration to serve both domains over HTTPS.
Set up an automatic redirect from HTTP to HTTPS.

Certbot output:
Account registered.
Successfully received certificate.
Certificate is saved at:
  /etc/letsencrypt/live/ashfaqulshifttrack.online/fullchain.pem
Key is saved at:
  /etc/letsencrypt/live/ashfaqulshifttrack.online/privkey.pem
This certificate expires on 2026-08-30.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for ashfaqulshifttrack.online
Successfully deployed certificate for www.ashfaqulshifttrack.online
Congratulations! You have successfully enabled HTTPS on:
  https://ashfaqulshifttrack.online
  https://www.ashfaqulshifttrack.online
Screenshot: screenshots/certbot-success.png

Step 3 — Verify HTTPS
bashcurl -I https://ashfaqulshifttrack.online
Result:
HTTP/1.1 200 OK
Server: Apache/2.4.58 (Ubuntu)
Content-Type: text/html
Content-Length: 8572
The 200 OK response confirms the certificate is valid and the site is being served correctly over HTTPS.
Screenshot: screenshots/website-https-working.png, screenshots/www-https-working.png

Step 4 — Auto-Renewal
Let's Encrypt certificates expire after 90 days. Certbot installs a systemd timer that renews certificates automatically before they expire. The dry-run test confirms the renewal mechanism is working:
bashsudo certbot renew --dry-run
No manual renewal is required as long as the server remains running and the domain continues to resolve correctly.
