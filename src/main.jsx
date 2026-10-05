// ============================================================
// FILE: src/main.jsx
// PURPOSE: This is the entry point of our React application.
// It tells React to start rendering our <App /> component
// inside the <div id="root"> element in index.html.
//
// THINK OF IT LIKE THIS:
// index.html provides the empty "canvas" (the div#root),
// and main.jsx tells React to paint everything onto that canvas.
// ============================================================

// Import React – the core library that allows us to write JSX
// (HTML-like syntax in JavaScript files).
import React from "react";

// Import ReactDOM – the part of React that connects to the browser's DOM
// (the HTML document). It "renders" React components into real HTML.
import ReactDOM from "react-dom/client";

// Import our main App component that contains all other components.
import App from "./App.jsx";

// Import global CSS styles that apply to the entire application.
import "./index.css";

// ReactDOM.createRoot() creates a React "root" connected to our #root div.
// This is the modern React 18 way to start an application.
ReactDOM.createRoot(
  // Find the <div id="root"> element in index.html and use it as our container.
  document.getElementById("root")
).render(
  // React.StrictMode is a helper that:
  // 1. Warns us about potential problems in our code during development.
  // 2. Detects deprecated features we should avoid.
  // 3. Does NOT affect the production build - it only helps during development.
  <React.StrictMode>
    {/* Render our main App component, which contains the entire application */}
    <App />
  </React.StrictMode>
);
