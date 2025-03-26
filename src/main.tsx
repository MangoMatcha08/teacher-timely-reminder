
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Make sure React is properly recognized in the global scope
window.React = React;

// Add error handling for the initial render
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Failed to find root element");
  // Create a root element if it doesn't exist
  const fallbackRoot = document.createElement("div");
  fallbackRoot.id = "root";
  document.body.appendChild(fallbackRoot);
}

try {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render application:", error);
  
  // Render a minimal error UI
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
      <h1 style="color: #e53e3e; margin-bottom: 1rem;">Application Failed to Load</h1>
      <p style="margin-bottom: 1rem;">There was a problem loading the application. Please refresh the page.</p>
      <button 
        style="padding: 0.5rem 1rem; background-color: #4299e1; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
        onclick="window.location.reload()"
      >
        Refresh Page
      </button>
    </div>
  `;
  
  document.body.innerHTML = "";
  document.body.appendChild(errorDiv);
}
