# Notification System Design~

> Campus Notification System — Placements, Results, Events

---

# Stage 1: API Design

## Core Actions

| Action               | Description                               |
|----------------------|-------------------------------------------|
| Create notification  | Admin sends a notification to a student   |
| Get all notifications| Student views their notification list     |
| Get single notification | Student views one notification detail  |
| Mark as read         | Student marks a notification as read      |
| Delete notification  | Student removes a notification            |

## Notification Schema

```json
{
  "id": "a3f1b2c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
  "studentId": 1042,
  "notificationType": "Placement",
  "message": "AMD is hiring Software Engineers",
  "isRead": false,
  "createdAt": "2026-06-18T10:00:00Z"
}
```

## Request Headers

| Header          | Value                | Purpose                      |
|-----------------|----------------------|------------------------------|
| `Content-Type`  | `application/json`   | Request/response format      |
| `Authorization` | `Bearer <jwt_token>` | Identifies the logged-in user|

## API Endpoints

### GET /notifications

Fetch all notifications for the logged-in student.

**Request:**
```
GET /api/notifications?notificationType=Placement&isRead=false
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": "uuid-1", "studentId": 1042, "notificationType": "Placement",
      "message": "AMD is hiring Software Engineers", "isRead": false,
      "createdAt": "2026-06-18T10:00:00Z" },
    { "id": "uuid-2", "studentId": 1042, "notificationType": "Placement",
      "message": "Google internship applications are open", "isRead": false,
      "createdAt": "2026-06-17T14:30:00Z" }
  ]
}
```

### GET /notifications/{id}

Fetch a single notification by ID.

**Request:**
```
GET /api/notifications/uuid-1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid-1", "studentId": 1042, "notificationType": "Placement",
    "message": "AMD is hiring Software Engineers", "isRead": false,
    "createdAt": "2026-06-18T10:00:00Z" }
}
```

**Response (404):**
```json
{ "success": false, "error": "Notification not found" }
```

### POST /notifications

Admin creates a notification for a student.

**Request:**
```json
{
  "studentId": 1042,
  "notificationType": "Placement",
  "message": "AMD is hiring Software Engineers"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid-1", "studentId": 1042, "notificationType": "Placement",
    "message": "AMD is hiring Software Engineers", "isRead": false,
    "createdAt": "2026-06-18T10:00:00Z" }
}
```

**Response (400):**
```json
{ "success": false, "error": "studentId, notificationType and message are required" }
```

### PATCH /notifications/{id}/read

Mark a notification as read. No request body needed.

**Request:**
```
PATCH /api/notifications/uuid-1/read
Authorization: Bearer <token>
```

**Response (200):**
```json
{ "success": true, "data": { "id": "uuid-1", "isRead": true } }
```

### DELETE /notifications/{id}

**Response (200):**
```json
{ "success": true, "message": "Notification deleted successfully" }
```

**Response (404):**
```json
{ "success": false, "error": "Notification not found" }
```

## Real-Time Notifications

Instead of the frontend polling the server every few seconds, we use **WebSockets**. When a student logs in, the React app opens a WebSocket connection to the server. When the admin creates a new notification via `POST /notifications`, the server pushes it to the connected student instantly through the WebSocket. If the connection drops, the client reconnects after 3 seconds. This approach eliminates unnecessary API calls and gives students instant updates.

---

*End of Stage 1*

---


# Stage 2: Database Design

## Database Choice

I'm using **PostgreSQL** because the data is relational (students → notifications is a one-to-many relationship), we need filtering and sorting (`WHERE`, `ORDER BY`), and Postgres has native UUID support for notification IDs. SQL is also something most of us are comfortable with from our DBMS course.

## Database Schema

### Students Table

| Column     | Type         | Constraints      |
|------------|--------------|------------------|
| id         | SERIAL       | PRIMARY KEY      |
| name       | VARCHAR(100) | NOT NULL         |
| email      | VARCHAR(150) | NOT NULL, UNIQUE |
| department | VARCHAR(50)  | NOT NULL         |
| created_at | TIMESTAMP    | DEFAULT NOW()    |

### Notifications Table

| Column            | Type        | Constraints                              |
|-------------------|-------------|------------------------------------------|
| id                | UUID        | PRIMARY KEY, DEFAULT gen_random_uuid()   |
| student_id        | INTEGER     | NOT NULL, FK → students(id)             |
| notification_type | VARCHAR(20) | NOT NULL, CHECK (Placement/Result/Event) |
| message           | TEXT        | NOT NULL                                 |
| is_read           | BOOLEAN     | DEFAULT FALSE                            |
| created_at        | TIMESTAMP   | DEFAULT NOW()                            |

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL
        CHECK (notification_type IN ('Placement', 'Result', 'Event')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Problems at Scale

- **Large notification volume:** 5000 students × 10 notifications/day = 50K rows/day. Over a year, that's 18M+ rows.
- **Slow reads:** Without indexes, every query scans all 18M rows to find one student's notifications.
- **Storage growth:** Old notifications nobody reads are still sitting in the table, making it bloated.

## Solutions

- **Indexing:** Create composite indexes on frequently queried columns so Postgres can find rows without scanning everything.
- **Pagination:** Return 20 notifications per page using `LIMIT` and `OFFSET` instead of dumping all results at once.
- **Archiving:** Move notifications older than 6 months to an `archived_notifications` table to keep the main table lean.

## SQL Queries

### Create Notification
```sql
INSERT INTO notifications (student_id, notification_type, message)
VALUES (1042, 'Placement', 'AMD is hiring Software Engineers')
RETURNING *;
```

### Get All Notifications
```sql
SELECT * FROM notifications
WHERE student_id = 1042
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Get Notification By ID
```sql
SELECT * FROM notifications WHERE id = 'uuid-1';
```

### Mark As Read
```sql
UPDATE notifications SET is_read = TRUE WHERE id = 'uuid-1';
```

### Delete Notification
```sql
DELETE FROM notifications WHERE id = 'uuid-1';
```

---

*End of Stage 2*

---

# Stage 3: Query Optimization

## Query Analysis

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

The query is logically correct — it fetches unread notifications for a student, sorted oldest first. But with 50,000 students and 5,000,000 notifications, it becomes a performance problem.

## Why It Is Slow

1. **Full table scan:** Without an index on `student_id`, Postgres reads all 5M rows to find the ones for student 1042.
2. **Extra filtering cost:** After scanning, it filters for `is_read = false` — wasted work on already-read notifications.
3. **In-memory sorting:** `ORDER BY created_at ASC` forces Postgres to sort the filtered results. With a large result set, this spills to disk.
4. **`SELECT *` overhead:** Fetches all columns including `message` (TEXT), even when the frontend may not need it.

## Recommended Optimization

### Composite Index

```sql
CREATE INDEX idx_student_unread_date
ON notifications(student_id, is_read, created_at ASC);
```

Postgres reads the index left to right: jumps to `student_id = 1042`, then filters `is_read = false`, and the rows are already sorted by `created_at` — no extra sort needed.

### Optimized Query

```sql
SELECT id, student_id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at ASC;
```

Replaced `SELECT *` with specific columns.

## Computational Cost

| Metric        | Before (no index) | After (composite index) |
|---------------|-------------------|-------------------------|
| Scan type     | Sequential scan   | Index scan              |
| Rows scanned  | 5,000,000         | ~50-100 (student's unread) |
| Sort required | Yes (in memory)   | No (index provides order)|
| Time complexity | O(n)            | O(log n)                |

## Should We Index Every Column?

No. Each index slows down writes (INSERT/UPDATE/DELETE must update every index), uses extra disk space, and the query planner may ignore indexes it doesn't find useful. Only index columns that appear in `WHERE`, `JOIN`, or `ORDER BY` of frequent queries.

## Placement Notifications Query

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

Supporting index:
```sql
CREATE INDEX idx_type_date ON notifications(notification_type, created_at);
```

## Conclusion

The original query works correctly but doesn't scale. A single composite index on `(student_id, is_read, created_at)` reduces scan from 5M rows to ~100 rows and eliminates the need for in-memory sorting. The key insight is to match the index columns to the query's WHERE + ORDER BY pattern.

---

*End of Stage 3*

