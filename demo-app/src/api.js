// src/api.js

export const fetchStats = async () => {
    let response;
    
    try {
        // Dummy URL: Using a local relative path to avoid CORS errors in the console
        // If Requestly is modifying it, this fetch will return a custom Response.
        // If Requestly is cleared, this local path will 404 and throw a Network Error.
        response = await fetch('/api/v1/stats');
    } catch (networkError) {
        // 1. Network Error: The dummy URL doesn't exist, and no interception happened.
        // This is the "Normal" state.
        console.log("ℹ️ Requestly: Normal Mode (Network fallback). Using local mock data.");
        return MOCK_STATS_DATA;
    }

    // 2. We got a response. This means Requestly successfully intercepted the call!
    if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
            const body = await response.json();
            if (body.error) msg = body.error;
        } catch(e) {}
        
        throw new Error(msg); // This triggers the explicit error UI in Dashboard
    }

    try {
        return await response.json();
    } catch (e) {
        return MOCK_STATS_DATA; // Fallback for weird edge cases
    }
};

export const MOCK_STATS_DATA = [
  { title: 'Total Revenue', value: '$45,231.89', trend: '+20.1%', isPositive: true, colorClass: 'bg-emerald-500' },
  { title: 'Active Users', value: '+2,350', trend: '+15.2%', isPositive: true, colorClass: 'bg-blue-500' },
  { title: 'Sales', value: '+12,234', trend: '-4.1%', isPositive: false, colorClass: 'bg-indigo-500' },
  { title: 'Active Now', value: '573', trend: '+201', isPositive: true, colorClass: 'bg-purple-500' }
];