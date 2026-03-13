import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Coverage Lens Dashboard</h1>
      <p>Blast Radius graphs and coverage analytics will be displayed here.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
