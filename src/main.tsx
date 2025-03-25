
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Explicitly make React available globally to ensure hooks work properly
window.React = React;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
