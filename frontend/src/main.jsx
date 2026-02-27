import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// App entrypoint: mount the root React tree into the Vite HTML container.
// React.StrictMode is kept to surface unsafe lifecycle patterns during development.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
