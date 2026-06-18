/**
 * API function to fetch notifications from the remote evaluation service.
 * Requires a Bearer Authorization token.
 * 
 * @param {string} authToken - The Bearer token for authorization
 * @returns {Promise<Object>} The response JSON containing notifications
 */
export async function fetchNotifications(authToken) {
  if (!authToken) {
    throw new Error("Authorization token is required to fetch notifications.");
  }

  // Ensure Bearer prefix is present
  const formattedToken = authToken.trim().startsWith("Bearer ")
    ? authToken.trim()
    : `Bearer ${authToken.trim()}`;

  const response = await fetch("http://4.224.186.213/evaluation-service/notifications", {
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
      // Fallback if response is not JSON
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Ignore parsing errors
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}
