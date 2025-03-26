
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is globally available
window.React = React;

// Add comprehensive error handling for React initialization
console.log("Initial React check:", {
  version: React.version,
  isReactAvailable: !!React,
  useState: !!React.useState,
  useEffect: !!React.useEffect,
  createContext: !!React.createContext
});

// Global error handler for uncaught errors
const handleGlobalError = (event: ErrorEvent) => {
  console.error("Global error caught:", event.error);
  event.preventDefault();
  
  // Render error UI
  const rootElement = document.getElementById("root");
  if (rootElement) {
    try {
      rootElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <h1 style="color: #e53e3e; margin-bottom: 1rem;">Application Error</h1>
          <p style="margin-bottom: 1rem;">There was a problem loading the application. Please refresh the page.</p>
          <button 
            style="padding: 0.5rem 1rem; background-color: #4299e1; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
            onclick="window.location.reload()"
          >
            Refresh Page
          </button>
        </div>
      `;
    } catch (renderError) {
      console.error("Failed to render error UI:", renderError);
    }
  }
};

// Add event listener for uncaught errors
window.addEventListener('error', handleGlobalError);

// Get or create root element
const getRootElement = () => {
  let rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.warn("Root element not found, creating a fallback");
    const fallbackRoot = document.createElement("div");
    fallbackRoot.id = "root";
    document.body.appendChild(fallbackRoot);
    rootElement = fallbackRoot;
  }
  
  return rootElement;
};

// Verify React is loaded before rendering
if (!React || !React.createElement || !React.useState) {
  console.error("React is not properly loaded", { React });
  const rootElement = getRootElement();
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-center; height: 100vh; font-family: sans-serif;">
      <h1 style="color: #e53e3e; margin-bottom: 1rem;">React Loading Error</h1>
      <p style="margin-bottom: 1rem;">React library failed to load properly. Please refresh the page or try again later.</p>
      <button 
        style="padding: 0.5rem 1rem; background-color: #4299e1; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
        onclick="window.location.reload()"
      >
        Refresh Page
      </button>
    </div>
  `;
} else {
  try {
    const rootElement = getRootElement();
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("Application successfully rendered");
  } catch (error) {
    console.error("Critical rendering error:", error);
    
    // Render a minimal error UI
    const rootElement = getRootElement();
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-center; height: 100vh; font-family: sans-serif;">
        <h1 style="color: #e53e3e; margin-bottom: 1rem;">Failed to Start Application</h1>
        <p style="margin-bottom: 1rem;">The application could not be loaded. Please refresh the page or try again later.</p>
        <button 
          style="padding: 0.5rem 1rem; background-color: #4299e1; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
          onclick="window.location.reload()"
        >
          Refresh Page
        </button>
      </div>
    `;
  }
}
