/**
 * script.js — ShiftTrack
 * ICT171 Cloud Server Project
 * Ashfaqul Haque Bhuiyan — 35720354
 * Murdoch University, 2026 S1
 *
 * This script handles:
 *   - Live clock display (navbar + datetime panel)
 *   - Clock In / Clock Out logic with timestamp recording
 *   - Elapsed shift timer
 *   - Shift history stored in localStorage
 *   - Total hours calculation
 *   - Rendering the shift history table
 *   - Individual row deletion and full history clear
 */

// ============================================================
// CONSTANTS & STATE
// ============================================================

/** localStorage key where all shifts are saved */
const STORAGE_KEY = 'shifttrack_shifts';

/**
 * activeShift holds the current open shift while the user is clocked in.
 * Shape: { worker: string, clockIn: Date }
 * It is null when no shift is active.
 */
let activeShift = null;

/** Interval ID for the elapsed-time counter (cleared on clock-out) */
let timerInterval = null;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Formats a Date object as a readable string.
 * e.g. "2026-04-11  10:45:32"
 * @param {Date} d
 * @returns {string}
 */
function formatDateTime(d) {
  const pad = n => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${date}  ${time}`;
}

/**
 * Formats a Date object to show only the date part.
 * e.g. "Saturday, 11 April 2026"
 * @param {Date} d
 * @returns {string}
 */
function formatDateOnly(d) {
  return d.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Formats a Date object to show only the time part (HH:MM:SS).
 * @param {Date} d
 * @returns {string}
 */
function formatTimeOnly(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Converts a duration in milliseconds to a human-readable string.
 * e.g. 5400000 → "1h 30m 0s"
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Formats elapsed seconds into HH:MM:SS for the live timer display.
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatElapsed(totalSeconds) {
  const pad = n => String(n).padStart(2, '0');
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ============================================================
// LOCALSTORAGE HELPERS
// ============================================================

/**
 * Loads all saved shifts from localStorage.
 * Returns an empty array if nothing is stored yet.
 * Each shift object: { worker, clockIn, clockOut, duration, durationMs }
 * @returns {Array}
 */
function loadShifts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('ShiftTrack: failed to parse localStorage', e);
    return [];
  }
}

/**
 * Saves the given shifts array to localStorage.
 * @param {Array} shifts
 */
function saveShifts(shifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}

// ============================================================
// CLOCK IN / OUT LOGIC
// ============================================================

/**
 * Handles the Clock In action.
 * Validates name input, records start time, and starts the elapsed timer.
 */
function clockIn() {
  const nameInput = document.getElementById('workerName');
  const name = nameInput.value.trim();

  // Validation — a name is required
  if (!name) {
    showMessage('Please enter a worker name before clocking in.', true);
    nameInput.focus();
    return;
  }

  // Record the clock-in time
  activeShift = { worker: name, clockIn: new Date() };

  // Update UI
  document.getElementById('clockInBtn').disabled = true;
  document.getElementById('clockOutBtn').disabled = false;
  nameInput.disabled = true;

  updateStatusIndicator(true);
  showMessage(`Clocked in at ${formatTimeOnly(activeShift.clockIn)}`);

  // Show and start the elapsed timer
  document.getElementById('activeTimer').style.display = 'flex';
  startElapsedTimer();
}

/**
 * Handles the Clock Out action.
 * Calculates duration, saves the completed shift, and resets the UI.
 */
function clockOut() {
  if (!activeShift) return;

  const clockOutTime = new Date();
  const durationMs = clockOutTime - activeShift.clockIn;

  // Build shift record
  const shift = {
    id: Date.now(),                           // unique ID used for row deletion
    worker: activeShift.worker,
    clockIn: activeShift.clockIn.toISOString(),
    clockOut: clockOutTime.toISOString(),
    duration: formatDuration(durationMs),
    durationMs: durationMs
  };

  // Persist to localStorage
  const shifts = loadShifts();
  shifts.unshift(shift);                      // newest first
  saveShifts(shifts);

  // Reset state
  activeShift = null;
  stopElapsedTimer();

  // Reset UI
  document.getElementById('clockInBtn').disabled = false;
  document.getElementById('clockOutBtn').disabled = true;
  document.getElementById('workerName').disabled = false;
  document.getElementById('activeTimer').style.display = 'none';
  document.getElementById('elapsedTime').textContent = '00:00:00';

  updateStatusIndicator(false);
  showMessage(`Clocked out. Shift duration: ${shift.duration}`);

  // Refresh the table
  renderTable();
}

// ============================================================
// ELAPSED TIMER
// ============================================================

/** Starts a 1-second interval that updates the elapsed time display. */
function startElapsedTimer() {
  const startTime = activeShift.clockIn.getTime();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('elapsedTime').textContent = formatElapsed(elapsed);
  }, 1000);
}

/** Clears the elapsed timer interval. */
function stopElapsedTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ============================================================
// STATUS INDICATOR
// ============================================================

/**
 * Updates the status text in the datetime panel.
 * @param {boolean} isClockedIn
 */
function updateStatusIndicator(isClockedIn) {
  const el = document.getElementById('shiftStatus');
  if (isClockedIn) {
    el.textContent = 'Clocked In';
    el.classList.add('clocked-in');
  } else {
    el.textContent = 'Clocked Out';
    el.classList.remove('clocked-in');
  }
}

// ============================================================
// MESSAGE DISPLAY
// ============================================================

/**
 * Displays a brief status message below the buttons.
 * @param {string} msg   — The message to display
 * @param {boolean} isError — If true, styles as an error
 */
function showMessage(msg, isError = false) {
  const el = document.getElementById('messageArea');
  el.textContent = msg;
  el.className = 'message-area' + (isError ? ' error' : '');
  // Auto-clear after 5 seconds
  setTimeout(() => { el.textContent = ''; }, 5000);
}

// ============================================================
// TABLE RENDERING
// ============================================================

/**
 * Renders the shift history table from localStorage data.
 * Also calculates and displays total hours.
 */
function renderTable() {
  const shifts = loadShifts();
  const tbody = document.getElementById('shiftTableBody');
  const empty = document.getElementById('emptyState');

  tbody.innerHTML = '';

  if (shifts.length === 0) {
    empty.style.display = 'block';
    document.getElementById('totalHours').textContent = '0h 0m';
    return;
  }

  empty.style.display = 'none';

  // Build table rows
  shifts.forEach((shift, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${shifts.length - index}</td>
      <td class="worker-cell">${escapeHtml(shift.worker)}</td>
      <td>${formatDateTime(new Date(shift.clockIn))}</td>
      <td>${formatDateTime(new Date(shift.clockOut))}</td>
      <td class="duration-cell">${shift.duration}</td>
      <td>
        <button class="btn-delete" onclick="deleteShift(${shift.id})" title="Delete this shift">
          ✕ Remove
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Calculate and display total hours
  updateTotalHours(shifts);
}

/**
 * Prevents XSS by escaping HTML special characters in user-supplied strings.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Sums all shift durations and updates the total hours badge.
 * @param {Array} shifts
 */
function updateTotalHours(shifts) {
  const totalMs = shifts.reduce((acc, s) => acc + (s.durationMs || 0), 0);
  const totalMins = Math.floor(totalMs / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  document.getElementById('totalHours').textContent = `${h}h ${m}m`;
}

// ============================================================
// DELETE / CLEAR HISTORY
// ============================================================

/**
 * Removes a single shift record by its ID.
 * @param {number} id — The shift's unique ID
 */
function deleteShift(id) {
  if (!confirm('Remove this shift record?')) return;
  const shifts = loadShifts().filter(s => s.id !== id);
  saveShifts(shifts);
  renderTable();
}

/**
 * Clears all shift records from localStorage after confirmation.
 */
function clearHistory() {
  if (!confirm('Clear all shift history? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderTable();
}

// ============================================================
// LIVE CLOCK (navbar + date/time panel)
// ============================================================

/**
 * Updates the live clock elements every second.
 * Targets #liveClock (hero), #currentDate, and #currentTime.
 */
function startLiveClock() {
  function tick() {
    const now = new Date();
    const timeStr = formatTimeOnly(now);

    // Hero display
    const heroClockEl = document.getElementById('liveClock');
    if (heroClockEl) heroClockEl.textContent = timeStr;

    // Date panel
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = formatDateOnly(now);

    // Time panel
    const timeEl = document.getElementById('currentTime');
    if (timeEl) timeEl.textContent = timeStr;
  }

  tick();                                     // run immediately on load
  setInterval(tick, 1000);                    // then every second
}

// ============================================================
// INITIALISATION
// ============================================================

/** Entry point — runs when the DOM is ready. */
document.addEventListener('DOMContentLoaded', () => {
  startLiveClock();   // start live clock
  renderTable();      // load and display any saved shifts
});
