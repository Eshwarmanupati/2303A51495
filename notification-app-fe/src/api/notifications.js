import { logger } from "./logging";

/**
 * API function to fetch notifications from the remote evaluation service.
 * Supports query parameters for server-side filtering and pagination.
 * 
 * @param {string} authToken - The Bearer token for authorization
 * @param {Object} params - Query parameters
 * @param {number} [params.limit] - Max items to return
 * @param {number} [params.page] - Current page number (1-indexed)
 * @param {string} [params.notification_type] - Filter by type (Event | Result | Placement)
 * @returns {Promise<Object>} The response JSON containing notifications
 */
export async function fetchNotifications(authToken, params = {}) {
  if (!authToken) {
    throw new Error("Authorization token is required to fetch notifications.");
  }

  // Construct URL with optional query parameters
  const baseUrl = "http://4.224.186.213/evaluation-service/notifications";
  const url = new URL(baseUrl);

  // Apply query parameters if they are provided
  if (params.limit) {
    url.searchParams.append("limit", params.limit.toString());
  }
  if (params.page) {
    url.searchParams.append("page", params.page.toString());
  }
  // Only append type if it is a specific supported type (not "All")
  if (params.notification_type && params.notification_type !== "All") {
    url.searchParams.append("notification_type", params.notification_type);
  }

  // Ensure Bearer prefix is present
  const formattedToken = authToken.trim().startsWith("Bearer ")
    ? authToken.trim()
    : `Bearer ${authToken.trim()}`;

  // Log API start using the logger middleware
  const logParams = { ...params };
  logger.logApiStart(url.toString(), logParams);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": formattedToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {
          // Ignore fallback errors
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const listCount = (data.notifications ?? []).length;

    // Log API success using the logger middleware
    logger.logApiSuccess(url.toString(), listCount);

    return data;
  } catch (error) {
    // Log API failure using the logger middleware
    logger.logApiFailure(url.toString(), error.message || error.toString());
    throw error;
  }
}
