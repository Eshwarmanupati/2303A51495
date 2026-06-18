/**
 * ============================================================
 *  Stage 6 – Priority Inbox (Top N Important Notifications)
 * ============================================================
 *
 *  Affordmed Campus Hiring Full Stack Assessment
 *  Roll Number : 2303A51495
 *
 *  This script:
 *    1. Fetches notifications from the evaluation API.
 *    2. Assigns priority weights (Placement=3, Result=2, Event=1).
 *    3. Sorts by priority weight (desc) then timestamp (desc).
 *    4. Displays the Top 10 notifications using console.table().
 * ============================================================
 */

// ── Configuration ──────────────────────────────────────────────

/** API endpoint for fetching notifications */
const API_URL =
  "http://4.224.186.213/evaluation-service/notifications";

/**
 * Authorization token read from the environment variable.
 * Run the script as:
 *   AUTH_TOKEN=<your_token> node solution.js
 */
const AUTH_TOKEN = process.env.AUTH_TOKEN;

/** How many top notifications to display */
const TOP_N = 10;

// ── Priority Weights ───────────────────────────────────────────

/**
 * Higher weight  →  higher importance.
 * Placement > Result > Event
 */
const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ── Helper Functions ───────────────────────────────────────────

/**
 * Returns the numeric priority weight for a given notification type.
 * Defaults to 0 for any unrecognised type so unknown types sink
 * to the bottom rather than crashing the sort.
 *
 * @param {string} type - Notification type (Placement | Result | Event)
 * @returns {number} Priority weight
 */
function getPriorityWeight(type) {
  return PRIORITY_WEIGHTS[type] ?? 0;
}

/**
 * Comparator function for sorting notifications.
 *
 * Sorting rules (applied in order):
 *   1. Priority weight – descending  (higher weight first)
 *   2. Timestamp       – descending  (newer first)
 *
 * @param {Object} a - First notification
 * @param {Object} b - Second notification
 * @returns {number}  Negative if a should come first
 */
function compareNotifications(a, b) {
  const weightA = getPriorityWeight(a.Type);
  const weightB = getPriorityWeight(b.Type);

  // Primary sort: by priority weight (descending)
  if (weightA !== weightB) {
    return weightB - weightA;
  }

  // Secondary sort: by timestamp (descending — newer first)
  const timeA = new Date(a.Timestamp).getTime();
  const timeB = new Date(b.Timestamp).getTime();
  return timeB - timeA;
}

// ── Core Logic ─────────────────────────────────────────────────

/**
 * Fetches notifications from the API with proper error handling.
 *
 * @returns {Promise<Array>} Array of notification objects
 * @throws {Error} On network failure or non-200 response
 */
async function fetchNotifications() {
  // Validate that the auth token is available
  if (!AUTH_TOKEN) {
    throw new Error(
      "AUTH_TOKEN is not set. Run with: AUTH_TOKEN=<your_token> node solution.js"
    );
  }

  console.log("📡 Fetching notifications from API...\n");

  // Make the GET request with the Authorization header
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  // Handle non-success HTTP status codes
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "No response body");
    throw new Error(
      `API returned HTTP ${response.status} (${response.statusText}): ${errorBody}`
    );
  }

  // Parse the JSON response
  const data = await response.json();

  // Validate the response structure
  if (!data || !Array.isArray(data.notifications)) {
    throw new Error(
      "Unexpected API response format — expected { notifications: [...] }"
    );
  }

  return data.notifications;
}

/**
 * Sorts notifications by priority and returns the Top N.
 *
 * @param {Array} notifications - Raw notifications from the API
 * @param {number} n            - Number of top notifications to return
 * @returns {Array}             Sorted & sliced array of top notifications
 */
function getTopNotifications(notifications, n) {
  // Sort using the comparator (priority weight desc, then timestamp desc)
  const sorted = [...notifications].sort(compareNotifications);

  // Return only the top N
  return sorted.slice(0, n);
}

/**
 * Formats a notification for clean console.table() display.
 *
 * @param {Object} notification - A single notification object
 * @param {number} rank         - 1-based rank
 * @returns {Object} Formatted row
 */
function formatForDisplay(notification, rank) {
  return {
    Rank: rank,
    Type: notification.Type,
    Priority: getPriorityWeight(notification.Type),
    Message: notification.Message,
    Timestamp: notification.Timestamp,
    ID: notification.ID,
  };
}

// ── Main Execution ─────────────────────────────────────────────

/**
 * Entry point: fetches, sorts, and displays the priority inbox.
 */
async function main() {
  try {
    // Step 1 — Fetch notifications from the remote API
    const notifications = await fetchNotifications();
    console.log(`✅ Received ${notifications.length} notifications.\n`);

    // Step 2 — Sort and pick Top N
    const topN = getTopNotifications(notifications, TOP_N);

    // Step 3 — Format for display
    const displayRows = topN.map((n, i) => formatForDisplay(n, i + 1));

    // Step 4 — Render the priority inbox
    console.log(`🏆 Top ${TOP_N} Priority Inbox:\n`);
    console.table(displayRows);

    // Summary footer
    console.log("\n📌 Priority Weights: Placement=3 | Result=2 | Event=1");
    console.log("📌 Tie-breaker     : Newer timestamp ranks higher\n");
  } catch (error) {
    // Graceful error handling with actionable message
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
