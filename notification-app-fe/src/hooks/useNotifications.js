import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";

// Priority weights: Placement = 3, Result = 2, Event = 1
const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Helper function to get the priority score of a notification type.
 * Unknown types default to 0.
 * 
 * @param {string} type - Notification Type
 * @returns {number} Priority Score
 */
export function getPriorityScore(type) {
  return PRIORITY_WEIGHTS[type] ?? 0;
}

/**
 * Custom React Hook to fetch and manage notifications.
 * Automatically handles sorting by priority score and timestamp.
 * 
 * @param {string} authToken - The Bearer Authorization Token
 * @returns {Object} Fetch state and refetch callback
 */
export function useNotifications(authToken) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!authToken) {
      setNotifications([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchNotifications(authToken);
      const rawList = data.notifications ?? [];

      // Sort notifications by Priority Weight (descending) and then Timestamp (descending)
      const sortedList = [...rawList].sort((a, b) => {
        const scoreA = getPriorityScore(a.Type);
        const scoreB = getPriorityScore(b.Type);

        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Descending order of priority
        }

        // Secondary sort: timestamp descending (newer notifications rank higher)
        const timeA = new Date(a.Timestamp).getTime();
        const timeB = new Date(b.Timestamp).getTime();
        return timeB - timeA;
      });

      setNotifications(sortedList);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    error,
    refetch: loadNotifications,
  };
}
