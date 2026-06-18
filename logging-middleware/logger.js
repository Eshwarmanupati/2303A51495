/**
 * Logging Middleware Utility
 * Implements standard logging formats for all critical application actions.
 */

export const logger = {
  /**
   * Log when an API request is initiated.
   * @param {string} url - API Endpoint URL
   * @param {Object} params - Query parameters passed to the API
   */
  logApiStart: (url, params = {}) => {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[API START] %c${timestamp} %c| Fetching from: %c${url} %c| Params:`,
      "color: #ff9800; font-weight: bold;",
      "color: #888;",
      "color: #ccc;",
      "color: #00e5ff; font-style: italic;",
      "color: #ccc;",
      params
    );
  },

  /**
   * Log when an API request successfully completes.
   * @param {string} url - API Endpoint URL
   * @param {number} count - Number of records retrieved
   */
  logApiSuccess: (url, count) => {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[API SUCCESS] %c${timestamp} %c| URL: %c${url} %c| Fetched %c${count}%c records`,
      "color: #4caf50; font-weight: bold;",
      "color: #888;",
      "color: #ccc;",
      "color: #00e5ff; font-style: italic;",
      "color: #ccc;",
      "color: #4caf50; font-weight: bold;",
      "color: #ccc;"
    );
  },

  /**
   * Log when an API request fails.
   * @param {string} url - API Endpoint URL
   * @param {string} error - Error message
   */
  logApiFailure: (url, error) => {
    const timestamp = new Date().toISOString();
    console.error(
      `%c[API FAILURE] %c${timestamp} %c| URL: %c${url} %c| Error: %c${error}`,
      "color: #f44336; font-weight: bold;",
      "color: #888;",
      "color: #ccc;",
      "color: #00e5ff; font-style: italic;",
      "color: #ccc;",
      "color: #f44336;"
    );
  },

  /**
   * Log when the user changes notifications filters.
   * @param {string} filterType - The type of filter changed
   * @param {any} fromValue - Original filter value
   * @param {any} toValue - New filter value
   */
  logFilterChange: (filterType, fromValue, toValue) => {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[FILTER CHANGE] %c${timestamp} %c| Filter: %c${filterType} %c| %c${fromValue} %c→ %c${toValue}`,
      "color: #9c27b0; font-weight: bold;",
      "color: #888;",
      "color: #ccc;",
      "color: #e040fb; font-weight: bold;",
      "color: #ccc;",
      "color: #f44336;",
      "color: #ccc;",
      "color: #4caf50;"
    );
  },

  /**
   * Log when pagination parameters (page or limit) change.
   * @param {number} page - Current page
   * @param {number} limit - Current limit (page size)
   */
  logPaginationChange: (page, limit) => {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[PAGINATION CHANGE] %c${timestamp} %c| Page: %c${page} %c| Limit: %c${limit}`,
      "color: #2196f3; font-weight: bold;",
      "color: #888;",
      "color: #ccc;",
      "color: #00e5ff; font-weight: bold;",
      "color: #ccc;",
      "color: #00e5ff; font-weight: bold;"
    );
  },

  /**
   * Log when the Priority Inbox page is loaded.
   * @param {number} topN - Bounded display limit (Top 10/15/20)
   */
  logPriorityPageLoad: (topN) => {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[PRIORITY LOAD] %c${timestamp} %c| Priority Inbox Rendered | Limit: %cTop ${topN}`,
      "color: #e91e63; font-weight: bold;",
      "color: #888;",
      "color: #ccc;",
      "color: #ff4081; font-weight: bold;"
    );
  },
};
