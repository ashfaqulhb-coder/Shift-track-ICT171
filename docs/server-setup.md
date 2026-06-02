Server Setup
ICT171 — Ashfaqul Haque Bhuiyan (35720354)
This document covers the Azure VM details, SSH access, and installation of the required server software. All configuration was performed manually over SSH — this is an IaaS deployment, not a pre-configured image.

Azure VM Details
SettingValueCloud ProviderMicrosoft AzureResource Group171VM Nameict171Server UsernameashfaqulRegionEast Asia, Zone 1VM SizeStandard D2s v3vCPU2RAM8 GiBOSUbuntu 24.04.4 LTSKernelGNU/Linux 6.17.0-1013-azure x86_64Web ServerApache 2.4.58 (Ubuntu)Public IP20.2.88.235Private IP10.0.0.4SecurityTrusted Launch (Secure Boot + vTPM enabled)
Screenshot: screenshots/azure-vm-overview.png

Azure Network Security Group (NSG)
Before the server could be reached from a browser, two inbound rules were added to the Azure NSG:
RulePortProtocolActionAllow-SSH22TCPAllowAllow-HTTP80TCPAllowAllow-HTTPS443TCPAllow
To add a rule: Azure Portal → VM → Networking → Add inbound port rule.

SSH Connection
The server was accessed from a local terminal using the VM's public IP address:
bashssh ashfaqul@20.2.88.235
All subsequent configuration steps were performed through this SSH session. No graphical interface was used.
Screenshot: screenshots/ssh-login.png

System Update
Before installing any software, the package index was updated and existing packages were upgraded:
bashsudo apt update
sudo apt upgrade -y

Install Apache and Git
Apache 2 (web server) and Git (for cloning the repository) were installed in one command:
bashsudo apt install apache2 git -y
Both packages were already present on the VM. The command confirmed their installation and ensured the latest versions were in place.
Start and enable Apache so it runs automatically after a reboot:
bashsudo systemctl start apache2
sudo systemctl enable apache2

Verify Apache
bashsudo systemctl status apache2 --no-pager
Result:
● apache2.service - The Apache HTTP Server
     Loaded: loaded (/usr/lib/systemd/system/apache2.service; enabled; preset: enabled)
     Active: active (running)
Apache is running and set to start on boot.
Screenshot: screenshots/apache-running.png

UFW Firewall
Ubuntu's firewall (UFW) was configured to allow SSH and Apache traffic:
bashsudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'
sudo ufw enable
sudo ufw status
Apache Full opens both ports 80 (HTTP) and 443 (HTTPS).
