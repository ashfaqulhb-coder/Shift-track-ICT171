Script Documentation — generate-shift-report.sh
ICT171 — Ashfaqul Haque Bhuiyan (35720354)

Overview
generate-shift-report.sh is a Bash script that collects live server statistics and writes them into an HTML page at /var/www/html/shift-report.html. The page is publicly accessible via the web server, providing a verifiable, browser-viewable output of the script's work.
Live output: https://ashfaqulshifttrack.online/shift-report.html
The script serves two purposes:

It demonstrates practical Bash scripting using real system commands (df, free, uptime, curl, systemctl, awk).
It produces a live, publicly accessible URL that confirms the script ran on the real server and generated genuine output.


Locations
LocationPathGitHub repositoryscripts/generate-shift-report.shServer copy~/scripts/generate-shift-report.shOutput file/var/www/html/shift-report.htmlPublic URLhttps://ashfaqulshifttrack.online/shift-report.html

Deployment on the Server
bashmkdir -p ~/scripts
cp ~/Shift-track-ICT171/scripts/generate-shift-report.sh ~/scripts/
chmod +x ~/scripts/generate-shift-report.sh
sudo bash ~/scripts/generate-shift-report.sh
Terminal output:
[ShiftTrack] Generating server report...
[ShiftTrack] Report written to /var/www/html/shift-report.html
[ShiftTrack] Done. View at: http://20.2.88.235/shift-report.html
Confirm the output file exists:
bashls -la /var/www/html/shift-report.html
Result:
-rw-r--r-- 1 root root 6226 Jun  1 11:16 /var/www/html/shift-report.html

What the Script Collects
CommandVariablePurposedateREPORT_TIMETimestamp for when the report was generateduptime -pUPTIMEHuman-readable server uptime (e.g. up 2 days, 3 hours)uptime -sBOOT_TIMEDate and time the server last booteddf -h / + awkDISK_TOTAL, DISK_USED, DISK_AVAIL, DISK_PERCENTRoot filesystem disk usagefree -h + awkMEM_TOTAL, MEM_USED, MEM_FREERAM usagesystemctl is-active apache2APACHE_STATUSWhether Apache is running (active or inactive)curl -s -o /dev/null -w "%{http_code}"HTTP_STATUSHTTP response code from http://localhost/hostnameHOSTNAMEServer hostnameuname -rKERNELRunning Linux kernel version

Line-by-Line Explanation of Key Commands
Command substitution
bashUPTIME=$(uptime -p)
$(...) runs the command inside and captures its output into the variable. Used throughout the script to store each system metric.

Disk usage with awk
bashDISK_USED=$(df -h / | awk 'NR==2 {print $3}')
df -h / outputs a two-line table. awk 'NR==2' selects the second line (the data row). {print $3} prints the third column (Used). The other columns are $2 (Size), $4 (Avail), $5 (Use%).

Memory usage with awk
bashMEM_USED=$(free -h | awk '/^Mem:/ {print $3}')
free -h prints memory in human-readable form. awk '/^Mem:/' matches the line starting with Mem:. {print $3} extracts the Used column.

Apache status check
bashAPACHE_STATUS=$(systemctl is-active apache2)
if [ "$APACHE_STATUS" = "active" ]; then
  APACHE_COLOUR="#00e5a0"
  APACHE_LABEL="Running"
else
  APACHE_COLOUR="#f43f5e"
  APACHE_LABEL="Not Running"
fi
systemctl is-active returns active or inactive. The if block sets a colour and label used in the HTML badge — green for running, red for stopped.

HTTP check
bashHTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost/)

-o /dev/null — discards the response body
-s — silent (no progress output)
-w "%{http_code}" — prints only the HTTP status code (e.g. 200)

A result of 200 confirms Apache is responding correctly to requests.

Heredoc output
bashsudo tee "$OUTPUT_FILE" > /dev/null << HTML_EOF
...HTML content with ${VARIABLE} expansions...
HTML_EOF
A heredoc (<< HTML_EOF ... HTML_EOF) passes a multi-line string as input. sudo tee writes it to the output file with root permissions. Shell variables like ${UPTIME} are automatically expanded inside the heredoc. > /dev/null suppresses the duplicate copy tee would otherwise print to the terminal.

What the Report Page Shows
The generated HTML page at https://ashfaqulshifttrack.online/shift-report.html displays:

Server uptime and last boot time
Disk usage (total, used, available, percentage)
RAM usage (total, used, free)
Apache service status badge — green "Running" or red "Not Running"
HTTP check badge — green "200 OK" or red error code
Report generation timestamp
Server hostname and kernel version
Auto-refresh every 60 seconds via <meta http-equiv="refresh" content="60">

The generation timestamp and live system statistics together confirm the output was produced by the script running on the real Azure VM.
Screenshot: screenshots/server-report-page.png

Optional — Run Automatically with Cron
To regenerate the report every hour:
bashecho "0 * * * * root /home/ashfaqul/scripts/generate-shift-report.sh" \
  | sudo tee /etc/cron.d/shift-report
