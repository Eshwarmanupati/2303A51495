# Stage 7 – Explanation & Integration

This document outlines the design decisions, patterns, and mechanisms implemented to integrate query parameter filtering, pagination, sorting, and logging middleware into the React application.

---

## 1. Folder Structure (Modified & Created)

```
Campus-Evaluation-FS/
├── logging-middleware/
│   └── logger.js              # Dedicated logger implementation
└── notification-app-fe/
    └── src/
        ├── api/
        │   ├── logging.js     # Frontend logger middleware
        │   └── notifications.js # API Fetch utility supporting query parameters & logging
        ├── hooks/
        │   └── useNotifications.js # Custom hook integrating pagination & filter queries
        ├── components/
        │   ├── NotificationCard.jsx   # Individual glassmorphism notification component
        │   └── NotificationFilter.jsx # Filtering controls component
        ├── pages/
        │   ├── NotificationsPage.jsx  # General Inbox (Paging, filters & logging)
        │   └── PriorityInboxPage.jsx  # Priority Inbox (Priority sorting & Top N selection)
        ├── App.jsx            # Unified layout with tab-based navigation
        └── index.css          # Core CSS stylesheet
```

---

## 2. Logging Integration Approach

Logging is designed to intercept key events transparently:
* **API Start**: Fires inside `fetchNotifications()` before fetching, showing URL and parameters.
* **API Success**: Fires inside `fetchNotifications()` on successful response, showing record counts.
* **API Failure**: Caught in `fetchNotifications()` catch block, logging the error string.
* **Filter Change**: Triggered in `NotificationsPage.jsx` when the user updates the active notification type.
* **Pagination Change**: Triggered in `NotificationsPage.jsx` when page numbers or limits are changed.
* **Priority Page Load**: Triggered in `PriorityInboxPage.jsx` via `useEffect` on load or limit change.

Console logs are formatted with CSS stylings (using `%c` styling) to make debugging in Chrome DevTools visually fast and clear.

---

## 3. Pagination & Filtering Strategy

* **URL State Synchronization**: Rather than keeping filters and page numbers in isolated memory states, they are synced directly to browser URL query parameters (`limit`, `page`, `notification_type`). This allows easy bookmarking, shareable states, and prevents loss of state on refreshing.
* **Query Construction**: The custom hook extracts these parameters and uses `URLSearchParams` to construct the server-side query payload.
* **Server-side Efficiency**: Filtering and paging parameters are parsed directly by the server, ensuring only active, paginated records are transferred across the network.

---

## 4. Priority Inbox Implementation

* **Data Fetching**: Fetches a larger block of notifications (`limit=100`) from the server to build a true representation of student priority updates.
* **Priority Sorting Rule**:
  1. Primary: Priority Weight (`Placement` = 3, `Result` = 2, `Event` = 1) descending.
  2. Secondary: Timestamp descending (newer notifications rank higher).
* **Top N Slicing**: After applying the stable two-key sorting, the array is sliced to the desired size ($N \in \{10, 15, 20\}$) configured via the select dropdown.

---

## 5. Error Handling

* Custom try-catch blocks parse response bodies to retrieve user-friendly error details (like `"invalid authorization token"`).
* Fallback UI alerts inform the user about missing credentials or network errors.
* Responsive "Retry" buttons trigger manual callback executions to make recovering from server drops straightforward without requiring browser refreshes.
