
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced React initialization and debugging
console.log("main.tsx - Initial React initialization check:", {
  version: React.version,
  isReactAvailable: !!React,
  useState: !!React.useState,
  useEffect: !!React.useEffect,
  createContext: !!React.createContext
});

// Ensure React is globally available
window.React = React;

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
          <pre style="background: #f7fafc; padding: 1rem; border-radius: 0.5rem; max-width: 90%; overflow: auto; margin-bottom: 1rem;">${event.error?.stack || event.message}</pre>
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
    console.log("Attempting to render React application");
    const rootElement = getRootElement();
    const root = createRoot(rootElement);
    
    // Before render diagnostic
    console.log("Before root.render - React hooks test:", {
      useState: typeof React.useState === 'function',
      useEffect: typeof React.useEffect === 'function',
      rootElement: !!rootElement
    });
    
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
        <pre style="background: #f7fafc; padding: 1rem; border-radius: 0.5rem; max-width: 90%; overflow: auto; margin-bottom: 1rem;">${error instanceof Error ? error.stack : String(error)}</pre>
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
