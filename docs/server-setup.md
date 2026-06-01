Server Setup Guide
ICT171 — Ashfaqul Haque Bhuiyan (35720354)
This document covers provisioning the Azure VM, connecting via SSH, and installing Apache 2 from scratch. No pre-installed bundles or marketplace images were used; this is a manual IaaS configuration.

1. Azure VM Details
SettingValueCloud ProviderMicrosoft AzureResource Group171VM Nameict171RegionEast Asia (Zone 1)SizeStandard D2s v3 (2 vCPU, 8 GiB RAM)OSUbuntu 24.04 LTSPublic IP20.2.88.235Private IP10.0.0.4

2. Connecting via SSH
Once the VM is running in Azure, connect from a local terminal:
bashssh azureuser@20.2.88.235
If you created the VM with an SSH key pair, specify the private key:
bashssh -i ~/.ssh/id_rsa azureuser@20.2.88.235
Verify you are on the correct machine:
bashhostname
uname -a

3. System Update
Always update the package index and upgrade installed packages before installing anything new:
bashsudo apt update && sudo apt upgrade -y
This ensures all security patches are applied and package lists are current.

4. Install Apache 2
Install the Apache web server:
bashsudo apt install apache2 -y
Start and enable Apache so it starts automatically after a reboot:
bashsudo systemctl start apache2
sudo systemctl enable apache2
Verify Apache is running:
bashsudo systemctl status apache2
You should see active (running) in the output.

5. Open Port 80 in Azure Network Security Group
By default, Azure VMs block inbound traffic. Port 80 (HTTP) must be opened in the Network Security Group (NSG).

In the Azure Portal, navigate to your VM.
Select Networking from the left menu.
Click Add inbound port rule.
Set the following:

Source: Any
Destination port ranges: 80
Protocol: TCP
Action: Allow
Priority: 300
Name: Allow-HTTP


Click Add.

For HTTPS (port 443), repeat the above with port 443 and name Allow-HTTPS.

6. Configure UFW Firewall (on the VM)
Ubuntu includes UFW (Uncomplicated Firewall). Allow SSH and HTTP/HTTPS, then enable it:
bashsudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'
sudo ufw enable
sudo ufw status
Apache Full opens both ports 80 and 443. Verify the rules show ALLOW for those ports.

7. Verify Apache Default Page
From a browser, navigate to:
http://20.2.88.235
You should see the Apache2 Ubuntu Default Page. This confirms Apache is installed and the port is open.
You can also test with curl from the server itself:
bashcurl -I http://localhost/
Expected output will include HTTP/1.1 200 OK.

8. Create a Scripts Directory
Create a dedicated directory for the project scripts in the home directory:
bashmkdir -p ~/scripts

Troubleshooting
ProblemSolutionSSH connection refusedCheck the NSG allows port 22 in Azure PortalApache page not loadingConfirm port 80 is open in both UFW and the Azure NSGapt update failsCheck internet connectivity: ping google.comPermission denied on /var/www/html/Use sudo or adjust file ownership (see Website Deployment)
