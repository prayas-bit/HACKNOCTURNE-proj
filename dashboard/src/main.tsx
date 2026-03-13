import React from "react";
import ReactDOM from "react-dom/client";
import BlastRadiusPanel from "./components/BlastRadiusPanel";

function App() {
  return (
    <div>
      <BlastRadiusPanel serverUrl="http://localhost:3000" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
