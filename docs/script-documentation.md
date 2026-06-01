Script Documentation — generate-shift-report.sh
ICT171 — Ashfaqul Haque Bhuiyan (35720354)

Overview
generate-shift-report.sh is a Bash script that collects live server health statistics and writes them into an HTML page at /var/www/html/shift-report.html. When a user visits http://20.2.88.235/shift-report.html, they see an up-to-date server status dashboard generated entirely by the script.
This script serves two purposes within the assignment:

It demonstrates practical Bash scripting with real command-line tools (df, free, uptime, curl, systemctl).
It produces a publicly verifiable output — the rendered HTML page can be shared as a URL to confirm the script ran successfully.


Script Location
scripts/generate-shift-report.sh
On the server, it is stored at:
/home/azureuser/scripts/generate-shift-report.sh

How to Run
bashsudo bash ~/scripts/generate-shift-report.sh
Output will be written to:
/var/www/html/shift-report.html

Line-by-Line Explanation
Shebang and Header
bash#!/bin/bash
Tells the system this is a Bash script. Without this, the shell might use a different interpreter.

Output File and IP Configuration
bashOUTPUT_FILE="/var/www/html/shift-report.html"
SITE_IP="20.2.88.235"
Defining variables at the top makes it easy to update paths and IP addresses without editing multiple lines throughout the script.

Report Timestamp
bashREPORT_TIME=$(date "+%A, %d %B %Y — %H:%M:%S %Z")
$(...) is command substitution — the output of date is captured into the REPORT_TIME variable. The format string +%A, %d %B %Y — %H:%M:%S %Z produces output like:
Saturday, 11 April 2026 — 14:35:22 AWST

Uptime
bashUPTIME=$(uptime -p)
BOOT_TIME=$(uptime -s)

uptime -p — human-readable uptime, e.g. up 2 days, 3 hours
uptime -s — the date/time the system was last booted


Disk Usage
bashDISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')
DISK_USED=$(df -h /  | awk 'NR==2 {print $3}')
DISK_AVAIL=$(df -h / | awk 'NR==2 {print $4}')
DISK_PERCENT=$(df -h / | awk 'NR==2 {print $5}')
df -h / shows disk usage for the root filesystem (/) in human-readable units (GB). The raw output looks like:
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        30G  8.2G   20G  30% /
awk 'NR==2 {print $2}' selects the second row (NR==2) and prints the second field ($2). Each $N extracts a different column.

Memory Usage
bashMEM_TOTAL=$(free -h | awk '/^Mem:/ {print $2}')
MEM_USED=$(free -h  | awk '/^Mem:/ {print $3}')
MEM_FREE=$(free -h  | awk '/^Mem:/ {print $4}')
free -h outputs memory usage in human-readable form. The /^Mem:/ pattern in awk matches the line that starts with Mem:, then $2, $3, $4 extract total, used, and free values respectively.

Apache Status Check
bashAPACHE_STATUS=$(systemctl is-active apache2)
systemctl is-active returns either active or inactive (or failed). The if statement then sets a colour and label for the HTML badge:
bashif [ "$APACHE_STATUS" = "active" ]; then
  APACHE_COLOUR="#00e5a0"
  APACHE_LABEL="Running"
else
  APACHE_COLOUR="#f43f5e"
  APACHE_LABEL="Not Running"
fi

HTTP Status Check
bashHTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost/)

-o /dev/null — discard the response body
-s — silent mode (suppress progress output)
-w "%{http_code}" — print only the HTTP response code (e.g. 200)

A code of 200 means the web server is responding normally.

HTML Output with Heredoc
bashsudo tee "$OUTPUT_FILE" > /dev/null << HTML_EOF
...HTML content...
HTML_EOF
A heredoc (<< HTML_EOF ... HTML_EOF) passes multi-line content as input. tee writes it to the file. sudo is required because /var/www/html/ is owned by root. > /dev/null suppresses the duplicate output that tee would print to the terminal.
Shell variables like ${UPTIME} are expanded inside the heredoc automatically.

Verifiable Output
The script produces a live, browser-accessible page at:
http://20.2.88.235/shift-report.html
The page includes:

Server uptime and last boot time
Disk usage (total / used / available / percentage)
Memory usage (total / used / free)
Apache service status badge (green = running / red = stopped)
HTTP check badge (green = 200 OK / red = error)
Report generation timestamp
Auto-refresh every 60 seconds

This provides clear visual evidence that the script ran on the live server and produced real output.

(Optional) Schedule with Cron
To run the script automatically every hour:
bashecho "0 * * * * root /home/azureuser/scripts/generate-shift-report.sh" \
  | sudo tee /etc/cron.d/shift-report
Verify the cron entry:
bashcat /etc/cron.d/shift-report
