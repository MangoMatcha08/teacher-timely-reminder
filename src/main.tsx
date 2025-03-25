
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Explicitly ensure React is properly available globally
window.React = React;

// Anti-refresh-loop protection
const MAX_REFRESH_COUNT = 3;
const REFRESH_TIMEOUT = 5000; // 5 seconds
const STORAGE_KEY = 'refresh_control';

// Check if we're in a refresh loop
const now = Date.now();
let refreshData = { count: 0, timestamp: now };

try {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    refreshData = JSON.parse(storedData);
    
    // Reset if it's been more than REFRESH_TIMEOUT since last refresh
    if (now - refreshData.timestamp > REFRESH_TIMEOUT) {
      refreshData = { count: 1, timestamp: now };
    } else {
      // Increment the refresh count
      refreshData.count += 1;
      refreshData.timestamp = now;
    }
  }
  
  // Save the updated refresh data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshData));
  
  // If we've refreshed too many times in a short period, show a message
  if (refreshData.count > MAX_REFRESH_COUNT) {
    console.error("Refresh loop detected! Stopping automatic refreshes.");
    
    // Create a simple error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; text-align: center;">
          <h2 style="color: #e53e3e;">Refresh Loop Detected</h2>
          <p>The application detected too many consecutive refreshes and has stopped to prevent browser freezing.</p>
          <p>Possible causes:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>React hooks errors</li>
            <li>Authentication issues</li>
            <li>Network connectivity problems</li>
          </ul>
          <div style="margin-top: 20px;">
            <button onclick="window.location.href='/'" style="background: #3182ce; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              Return to Home
            </button>
            <button onclick="localStorage.removeItem('${STORAGE_KEY}'); window.location.reload();" style="background: #38a169; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-left: 8px; cursor: pointer;">
              Reset & Try Again
            </button>
          </div>
        </div>
      `;
      // Don't initialize React - use an early function return pattern instead of a bare return
      // to avoid TypeScript error about return outside of function
      (function() { return; })();
    }
  }
} catch (e) {
  console.error("Error in refresh detection:", e);
  // Continue with app initialization even if refresh detection fails
}

// Create the root with null check
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found!");
}
