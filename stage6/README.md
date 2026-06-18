# Stage 6 – Priority Inbox

> Top N Most Important Notifications using Priority Weights

## Project Overview

This solution fetches campus notifications from a remote API and displays the **Top 10** most important ones in a priority inbox. Notifications are ranked by type (Placement > Result > Event) and, within the same type, by recency (newer first).

## Priority Weights

| Type        | Weight |
| ----------- | ------ |
| Placement   | 3      |
| Result      | 2      |
| Event       | 1      |

## Installation

```bash
# No external dependencies needed — uses native Node.js fetch
cd stage6
```

> **Requires Node.js v18+** (for native `fetch` support).

## Dependencies

- **None** — zero external packages. Uses Node.js built-in `fetch` API.

## How to Run

```bash
AUTH_TOKEN=<your_bearer_token> node solution.js
```

Replace `<your_bearer_token>` with the actual JWT / auth token provided for the assessment API.

## Expected Output

```
📡 Fetching notifications from API...

✅ Received 25 notifications.

🏆 Top 10 Priority Inbox:

┌─────────┬──────┬─────────────┬──────────┬──────────────────────────────┬───────────────────────┬──────────────────────────────────────┐
│ (index) │ Rank │ Type        │ Priority │ Message                      │ Timestamp             │ ID                                   │
├─────────┼──────┼─────────────┼──────────┼──────────────────────────────┼───────────────────────┼──────────────────────────────────────┤
│ 0       │ 1    │ 'Placement' │ 3        │ 'Google hiring ...'          │ '2026-04-22 17:49:42' │ 'abc-123-...'                        │
│ 1       │ 2    │ 'Placement' │ 3        │ 'Amazon hiring ...'          │ '2026-04-20 10:00:00' │ 'def-456-...'                        │
│ ...     │ ...  │ ...         │ ...      │ ...                          │ ...                   │ ...                                  │
└─────────┴──────┴─────────────┴──────────┴──────────────────────────────┴───────────────────────┴──────────────────────────────────────┘

📌 Priority Weights: Placement=3 | Result=2 | Event=1
📌 Tie-breaker     : Newer timestamp ranks higher
```

## File Structure

```
stage6/
├── solution.js      # Main script — fetches, sorts, displays
├── README.md        # This file
└── explanation.md   # Algorithm & complexity analysis
```
