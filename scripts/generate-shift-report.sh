#!/bin/bash
# ============================================================
# generate-shift-report.sh
# ICT171 Cloud Server Project — Script Component
# Author: Ashfaqul Haque Bhuiyan (35720354)
# Murdoch University, 2026 Semester 1
#
# PURPOSE:
#   This script gathers live server health statistics and writes
#   them into an HTML page at /var/www/html/shift-report.html.
#   The page is then accessible via the web server, giving a
#   verifiable, browser-viewable output of the script's work.
#
# USAGE:
#   sudo bash generate-shift-report.sh
#
# TO SCHEDULE (optional, runs every hour):
#   echo "0 * * * * root /home/azureuser/scripts/generate-shift-report.sh" \
#     | sudo tee /etc/cron.d/shift-report
# ============================================================

# ---- CONFIGURATION ----------------------------------------
OUTPUT_FILE="/var/www/html/shift-report.html"
SITE_IP="20.2.88.235"
# -----------------------------------------------------------

echo "[ShiftTrack] Generating server report..."

# ---- COLLECT SYSTEM DATA ----------------------------------
# $(date) returns the current date and time from the system clock
REPORT_TIME=$(date "+%A, %d %B %Y — %H:%M:%S %Z")

# uptime -p returns human-readable uptime, e.g. "up 2 days, 3 hours, 15 minutes"
UPTIME=$(uptime -p)

# uptime -s returns the date/time the server was last started
BOOT_TIME=$(uptime -s)

# df -h / shows disk usage for the root filesystem in human-readable form
DISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')
DISK_USED=$(df -h /  | awk 'NR==2 {print $3}')
DISK_AVAIL=$(df -h / | awk 'NR==2 {print $4}')
DISK_PERCENT=$(df -h / | awk 'NR==2 {print $5}')

# free -h shows memory in human-readable form; awk extracts used/total from the "Mem:" line
MEM_TOTAL=$(free -h | awk '/^Mem:/ {print $2}')
MEM_USED=$(free -h  | awk '/^Mem:/ {print $3}')
MEM_FREE=$(free -h  | awk '/^Mem:/ {print $4}')

# hostname returns the server's hostname
HOSTNAME=$(hostname)

# uname -r returns the running Linux kernel version
KERNEL=$(uname -r)

# ---- CHECK APACHE STATUS ----------------------------------
# systemctl is-active returns "active" if Apache is running, "inactive" otherwise
APACHE_STATUS=$(systemctl is-active apache2)

# Derive a colour and label for the badge
if [ "$APACHE_STATUS" = "active" ]; then
  APACHE_COLOUR="#00e5a0"
  APACHE_LABEL="Running"
else
  APACHE_COLOUR="#f43f5e"
  APACHE_LABEL="Not Running"
fi

# ---- CHECK WEBSITE HTTP STATUS ----------------------------
# curl -o /dev/null  — discard the body
# -s                 — silent (no progress meter)
# -w "%{http_code}"  — print only the HTTP status code
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost/)

if [ "$HTTP_STATUS" = "200" ]; then
  HTTP_COLOUR="#00e5a0"
  HTTP_LABEL="200 OK"
else
  HTTP_COLOUR="#f43f5e"
  HTTP_LABEL="Status $HTTP_STATUS"
fi

# ---- WRITE HTML OUTPUT ------------------------------------
# Using a heredoc (cat << 'EOF' ... EOF) to write a multi-line string
# to the output file. sudo tee writes with root permissions.
sudo tee "$OUTPUT_FILE" > /dev/null << HTML_EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="refresh" content="60" />
  <title>Server Report — ShiftTrack</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #0c0e14; --bg-card: #13161f; --bg-card-2: #1a1e2b;
      --border: #252a3a; --accent: #00e5a0; --text: #e2e8f0;
      --text-muted: #64748b; --text-dim: #94a3b8;
      --mono: 'Space Mono', monospace; --sans: 'DM Sans', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 15px; line-height: 1.6; padding: 40px 24px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 1px solid var(--border); padding-bottom: 24px; margin-bottom: 40px; }
    .header-top { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .brand { font-family: var(--mono); font-size: 1.4rem; color: var(--accent); }
    .script-badge { background: var(--bg-card-2); border: 1px solid var(--border); padding: 6px 14px; border-radius: 20px; font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted); }
    .report-time { margin-top: 10px; font-family: var(--mono); font-size: 0.8rem; color: var(--text-muted); }
    .notice { background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.2); border-radius: 8px; padding: 14px 18px; margin-bottom: 36px; font-size: 0.88rem; color: var(--text-dim); font-family: var(--mono); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 36px; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 22px; }
    .card h3 { font-family: var(--mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 14px; }
    .stat-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid var(--border); font-size: 0.87rem; }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { color: var(--text-muted); }
    .stat-value { color: var(--text-dim); font-family: var(--mono); font-size: 0.83rem; }
    .stat-value.highlight { color: var(--accent); }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-family: var(--mono); font-size: 0.78rem; font-weight: 700; }
    .back-link { display: inline-block; font-family: var(--mono); font-size: 0.8rem; color: var(--accent); text-decoration: none; margin-bottom: 28px; }
    .back-link:hover { opacity: 0.7; }
    .footer-note { border-top: 1px solid var(--border); padding-top: 20px; font-family: var(--mono); font-size: 0.75rem; color: var(--text-muted); margin-top: 40px; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="header-top">
      <div class="brand">⏱ ShiftTrack — Server Report</div>
      <span class="script-badge">Generated by generate-shift-report.sh</span>
    </div>
    <div class="report-time">Report generated: ${REPORT_TIME}</div>
    <div class="report-time">Server hostname: ${HOSTNAME} &nbsp;|&nbsp; Kernel: ${KERNEL}</div>
  </div>

  <a href="/" class="back-link">← Back to ShiftTrack</a>

  <div class="notice">
    ℹ This page is automatically generated by a Bash script running on the Azure Ubuntu server.
    It refreshes every 60 seconds. This script is part of the ICT171 Assignment 3 scripting component.
    Author: Ashfaqul Haque Bhuiyan (35720354) — Murdoch University 2026 S1.
  </div>

  <div class="grid">

    <div class="card">
      <h3>⏰ Uptime</h3>
      <div class="stat-row">
        <span class="stat-label">Current uptime</span>
        <span class="stat-value highlight">${UPTIME}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Last boot</span>
        <span class="stat-value">${BOOT_TIME}</span>
      </div>
    </div>

    <div class="card">
      <h3>💾 Disk Usage (/)</h3>
      <div class="stat-row">
        <span class="stat-label">Total</span>
        <span class="stat-value">${DISK_TOTAL}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Used</span>
        <span class="stat-value highlight">${DISK_USED} (${DISK_PERCENT})</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Available</span>
        <span class="stat-value">${DISK_AVAIL}</span>
      </div>
    </div>

    <div class="card">
      <h3>🧠 Memory Usage</h3>
      <div class="stat-row">
        <span class="stat-label">Total RAM</span>
        <span class="stat-value">${MEM_TOTAL}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Used</span>
        <span class="stat-value highlight">${MEM_USED}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Free</span>
        <span class="stat-value">${MEM_FREE}</span>
      </div>
    </div>

    <div class="card">
      <h3>🌐 Service Status</h3>
      <div class="stat-row">
        <span class="stat-label">Apache 2</span>
        <span class="status-badge" style="background:rgba(0,0,0,0.4);color:${APACHE_COLOUR};border:1px solid ${APACHE_COLOUR}">
          ${APACHE_LABEL}
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-label">HTTP Check</span>
        <span class="status-badge" style="background:rgba(0,0,0,0.4);color:${HTTP_COLOUR};border:1px solid ${HTTP_COLOUR}">
          ${HTTP_LABEL}
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Server IP</span>
        <span class="stat-value">${SITE_IP}</span>
      </div>
    </div>

  </div>

  <div class="footer-note">
    ICT171 Introduction to Server Environments and Architectures — Murdoch University 2026 S1<br />
    Ashfaqul Haque Bhuiyan · Student ID 35720354 · Azure VM: Standard D2s v3 · Ubuntu 24.04 LTS
  </div>
</div>
</body>
</html>
HTML_EOF

echo "[ShiftTrack] Report written to $OUTPUT_FILE"
echo "[ShiftTrack] Done. View at: http://${SITE_IP}/shift-report.html"
