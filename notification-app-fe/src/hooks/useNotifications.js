import { useState, useEffect, useCallback, useRef } from "react";
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
 * Supports query parameters for limit, page, and notification_type.
 * 
 * @param {string} authToken - The Bearer Authorization Token
 * @param {Object} params - Query parameters for filtering and pagination
 * @param {number} params.limit - Max items to retrieve per page
 * @param {number} params.page - Current page number
 * @param {string} params.notification_type - Notification Type filter (All | Event | Result | Placement)
 * @returns {Object} Fetch state and refetch callback
 */
export function useNotifications(authToken, params = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Total notifications count (useful if server returns total count, otherwise length of dataset)
  const [total, setTotal] = useState(0);

  // Destructure params to track changes in useEffect
  const { limit, page, notification_type } = params;

  // Use a ref to track the previous values of parameters to avoid unnecessary double fetches
  const prevParamsRef = useRef({ limit, page, notification_type, authToken });

  const loadNotifications = useCallback(async () => {
    if (!authToken) {
      setNotifications([]);
      setTotal(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchParams = {};
      if (limit) fetchParams.limit = limit;
      if (page) fetchParams.page = page;
      if (notification_type) fetchParams.notification_type = notification_type;

      const data = await fetchNotifications(authToken, fetchParams);
      const rawList = data.notifications ?? [];
      
      setNotifications(rawList);
      
      // If the API returns a total count, use it. Otherwise, estimate or use array length.
      setTotal(data.total ?? rawList.length);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [authToken, limit, page, notification_type]);

  useEffect(() => {
    // Check if the actual dependencies changed to prevent redundant fetches
    const prev = prevParamsRef.current;
    if (
      prev.limit !== limit ||
      prev.page !== page ||
      prev.notification_type !== notification_type ||
      prev.authToken !== authToken
    ) {
      prevParamsRef.current = { limit, page, notification_type, authToken };
      loadNotifications();
    }
  }, [authToken, limit, page, notification_type, loadNotifications]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, []);

  return {
    notifications,
    total,
    loading,
    error,
    refetch: loadNotifications,
  };
}
