SSL/TLS Configuration Guide
ICT171 — Ashfaqul Haque Bhuiyan (35720354)
This document explains how to configure HTTPS on the Apache server using a free SSL/TLS certificate from Let's Encrypt via the Certbot tool. HTTPS encrypts traffic between the browser and the server.

Prerequisite: A domain name must be pointing to 20.2.88.235 before running Certbot, as Let's Encrypt uses HTTP verification to confirm you control the domain. See dns-setup.md first.


1. Install Certbot
bashsudo apt update
sudo apt install certbot python3-certbot-apache -y
python3-certbot-apache is the Apache plugin, which automatically edits your Apache config to enable HTTPS.

2. Obtain and Install a Certificate
Run Certbot with the Apache plugin, replacing the domain name with your actual DNS name:
bashsudo certbot --apache -d [INSERT DNS NAME]
Certbot will:

Ask for an email address (for renewal notifications).
Ask you to agree to the Let's Encrypt Terms of Service.
Verify ownership of the domain via an HTTP challenge.
Automatically configure Apache with HTTPS.
Set up an automatic redirect from HTTP to HTTPS.


3. Verify HTTPS
From the server:
bashcurl -I https://[INSERT DNS NAME]/
Expected response includes:
HTTP/2 200
From a browser, visit:
https://[INSERT DNS NAME]
The padlock icon should appear in the address bar. Clicking it should show the Let's Encrypt certificate details.

4. Check Apache SSL Configuration
Certbot creates a new Apache config file for HTTPS. View it:
bashsudo cat /etc/apache2/sites-available/000-default-le-ssl.conf
It will contain SSLCertificateFile and SSLCertificateKeyFile directives pointing to the certificate files in /etc/letsencrypt/live/[domain]/.

5. Auto-Renewal
Let's Encrypt certificates expire after 90 days. Certbot installs a cron job or systemd timer to renew them automatically. Test the renewal process without actually renewing:
bashsudo certbot renew --dry-run
If the dry run succeeds, automatic renewal is configured correctly.

6. Open Port 443 in Azure NSG
HTTPS requires port 443 to be open in the Azure Network Security Group. If not already done:

Azure Portal → VM → Networking → Add inbound port rule.
Set destination port 443, protocol TCP, action Allow.
Name: Allow-HTTPS, priority 310.
Click Add.

Also allow it in UFW on the server:
bashsudo ufw allow 'Apache Full'
sudo ufw status

7. Force HTTP → HTTPS Redirect
Certbot usually configures this automatically. To verify, check the HTTP VirtualHost config:
bashsudo cat /etc/apache2/sites-available/000-default.conf
It should contain a RewriteRule or Redirect line. If not, add it manually:
apache<VirtualHost *:80>
    ServerName [INSERT DNS NAME]
    Redirect permanent / https://[INSERT DNS NAME]/
</VirtualHost>
Reload Apache:
bashsudo systemctl reload apache2

Summary
ItemValueCertificate AuthorityLet's EncryptToolCertbotApache Pluginpython3-certbot-apacheCertificate Path/etc/letsencrypt/live/[domain]/Auto-renewalYes (via systemd timer)Expiry90 days (auto-renewed)
