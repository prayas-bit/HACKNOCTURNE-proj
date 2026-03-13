import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Requestly SDK Initialization could go here
console.log("Initializing Demo App...");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
