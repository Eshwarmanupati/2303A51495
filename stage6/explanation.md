# Stage 6 – Explanation

## Priority Calculation Logic

Each notification type maps to a fixed **priority weight**:

| Type      | Weight | Rationale                                            |
| --------- | ------ | ---------------------------------------------------- |
| Placement | 3      | Most actionable — directly impacts a student's career |
| Result    | 2      | Important but less time-sensitive than placements      |
| Event     | 1      | General campus events — useful but low urgency         |

The weight is retrieved via a lookup object:

```js
const PRIORITY_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };
const weight = PRIORITY_WEIGHTS[notification.Type] ?? 0;
```

Unknown types default to `0`, ensuring they sink to the bottom without crashing the system.

---

## Sorting Strategy

Notifications are sorted using a **two-level comparator**:

1. **Primary key** — Priority weight (descending): higher weight → higher rank.
2. **Secondary key** — Timestamp (descending): among equal-weight items, the newer notification ranks higher.

```
compareNotifications(a, b):
    if weightA ≠ weightB  →  return weightB − weightA   // higher weight first
    else                  →  return timeB  − timeA       // newer first
```

After sorting, we take only the first **N** elements (`Array.slice(0, N)`).

---

## Time Complexity

| Operation       | Complexity         | Notes                                |
| --------------- | ------------------ | ------------------------------------ |
| Fetch from API  | O(1) network call  | Single HTTP GET                      |
| Assign weights  | O(k) total         | k = total notifications, O(1) each   |
| Sort            | **O(k log k)**     | JavaScript's Array.sort (Timsort)    |
| Slice Top N     | O(N)               | N = 10 (constant)                    |
| **Overall**     | **O(k log k)**     | Dominated by the sort step           |

For a one-time fetch of a small dataset this is perfectly acceptable.

---

## Handling Continuous Incoming Notifications

In a **production system** where notifications arrive continuously (e.g. via WebSocket, polling, or message queue), re-sorting the entire list on every arrival is wasteful:

| Approach          | Per-insertion cost | Problem                            |
| ----------------- | ------------------ | ---------------------------------- |
| Full re-sort      | O(k log k)         | Scans everything every time        |
| **Min Heap (✓)**  | **O(log N)**       | Only touches the heap of size N    |

### Recommended: Min Heap / Priority Queue (size = N)

The idea is to maintain a **min heap of fixed size N** (e.g. N = 10):

1. **Heap initialisation** — Insert the first N notifications. The root of the min heap is the *least important* item currently in the Top N.

2. **For every new notification**:
   - Compare it with the heap root (the current minimum in the Top N).
   - If the new item has **higher priority** → remove the root, insert the new item.
   - If not → discard it; it doesn't belong in the Top N.

3. **Read the Top N** — Extract all N items from the heap and sort them for display.

```
insert(notification):
    if heap.size < N:
        heap.push(notification)
    else if priority(notification) > priority(heap.peek()):
        heap.pop()              // remove the lowest-ranked item
        heap.push(notification) // insert the new, higher-ranked item
```

### Complexity comparison

| Operation                      | Full Re-sort | Min Heap (size N) |
| ------------------------------ | ------------ | ----------------- |
| Insert one new notification    | O(k log k)   | **O(log N)**      |
| Memory                         | O(k)         | **O(N)**          |
| Read Top N (already in heap)   | O(1)         | O(N log N)        |

Since **N is fixed (10)**, `O(log N)` is effectively **O(1)** — constant time insertion.

---

## Why Min Heap / Priority Queue is Recommended

1. **Efficiency** — O(log N) insertion vs O(k log k) re-sort. When k grows to thousands or millions, the difference is massive.

2. **Bounded memory** — The heap only stores N items, regardless of how many total notifications exist.

3. **Real-time friendly** — Each incoming notification is processed instantly; no batch re-sort delays.

4. **Scalable** — Works equally well whether the system processes 100 or 1,000,000 notifications per day.

5. **Simple to implement** — Most languages have a built-in priority queue / heap (Python's `heapq`, Java's `PriorityQueue`). In JavaScript, a lightweight min heap class (~30 lines) is sufficient.

**Bottom line:** For a static one-time fetch, `Array.sort()` is clean and readable. For a live, streaming notification system, a **fixed-size min heap** is the optimal data structure.
