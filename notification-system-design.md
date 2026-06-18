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