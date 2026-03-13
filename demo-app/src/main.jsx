import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Network } from "@requestly/web-sdk";
import './index.css';

const STORAGE_KEY = "RQ_MOCKED_STATES";

// Helper to apply rules safely with escaped regex
const applyRules = (rules) => {
    Object.keys(rules).forEach(url => {
        // Skip invalid/empty URLs
        if (!url || url.trim() === '') return;
        
        const { status, body } = rules[url];
        
        try {
            // Escape the URL string so regex special chars are treated literally
            const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(escapedUrl);
            
            Network.intercept(pattern, (args) => {
                console.log(`🚀 Requestly: Mocking persistent request to ${args.url}`);
                return {
                    status: parseInt(status) || 500,
                    body: body || {
                        error: "Persistent Error State via Coverage Heatmap",
                        success: false
                    }
                };
            }, true);
        } catch (err) {
            console.error("Failed to construct Requestly interceptor for URL:", url, err);
        }
    });
};

// 1. Re-apply rules from LocalStorage on boot
const savedRules = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
applyRules(savedRules);

if (Object.keys(savedRules).length > 0) {
    console.log("♻️ Requestly: Restored persisted mock states", savedRules);
}

// 2. The Bridge: Listen for "FORCE_MOCK_STATE" from the Chrome Extension
window.addEventListener("message", async (event) => {
    try {
        const data = event.data;
        if (!data || typeof data !== "object") return;

        if (data.type === "FORCE_MOCK_STATE") {
            const { url, status, body } = data.payload || {};
            if (!url) return;

            console.log(`🎯 Heatmap Command: Intercepting ${url} with status ${status}`);

            // Save to LocalStorage for persistence
            const rules = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            rules[url] = { status, body };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));

            // Refresh ensures the UI hits the newly intercepted mock
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }

        // Phase 3: Handle TRIGGER_MOCK from the Extension's heatmap tooltip
        if (data.source === 'DEV_TOOL_HEATMAP' && data.type === 'TRIGGER_MOCK') {
            const { endpoint, status, path: componentPath } = data.payload || {};
            if (!endpoint) {
                console.warn('🔸 TRIGGER_MOCK received for a UI-only component (no endpoint):', componentPath);
                return;
            }

            console.log(`🎯 Heatmap Tooltip → Injecting ${status} on ${endpoint} (from ${componentPath})`);

            // Reuse existing persistence + interception logic
            const rules = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            rules[endpoint] = {
                status,
                body: { error: `Injected ${status} via Coverage Heatmap`, component: componentPath, success: false }
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));

            setTimeout(() => {
                window.location.reload();
            }, 100);
        }

        // Handle CLEAR from both the Header buttons and the Extension tooltip
        if (data.type === "CLEAR_MOCK_STATE" ||
            (data.source === 'DEV_TOOL_HEATMAP' && data.type === 'CLEAR_MOCKS')) {
            console.log("🧹 Requestly: Clearing all persistent states");
            localStorage.removeItem(STORAGE_KEY);
            Network.clearInterceptors();
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    } catch (e) {
        console.error("Requestly Integration Error:", e);
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);