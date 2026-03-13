// stateMap.js — Maps components to their API endpoints and error categories

export const STATE_MAP = {
  "src/components/Dashboard.jsx": {
    endpoint: "/api/v1/stats",
    type: "DATA_FEED",
  },
  "src/components/StatCard.jsx": {
    endpoint: "/api/v1/stats",
    type: "DATA_FEED",
  },
  "src/components/Header.jsx": {
    endpoint: null,
    type: "UI_SHELL",
  },
  "src/components/Sidebar.jsx": {
    endpoint: null,
    type: "UI_SHELL",
  },
  "src/components/Button.jsx": {
    endpoint: null,
    type: "INTERACTION",
  },
  "src/components/RevenueChart.jsx": {
    endpoint: null,
    type: "UI_SHELL",
  },
  "src/components/RecentActivity.jsx": {
    endpoint: null,
    type: "UI_SHELL",
  },
  "src/components/SystemStatus.jsx": {
    endpoint: "/api/v1/system-status",
    type: "DATA_FEED",
  },
};

// Error codes grouped by component type — only relevant codes are shown in the tooltip
export const ERROR_GROUPS = {
  DATA_FEED: [
    { code: 500, label: "Server Crash" },
    { code: 404, label: "API Missing" },
    { code: 204, label: "No Data Found" },
    { code: 429, label: "Rate Limited" },
  ],
  TRANSACTION: [
    { code: 402, label: "Payment Required" },
    { code: 403, label: "Card Declined" },
    { code: 500, label: "Server Crash" },
  ],
  UI_SHELL: [],
  INTERACTION: [],
};
