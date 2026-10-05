// ============================================================
// FILE: vite.config.js
// PURPOSE: This is the configuration file for Vite, our build tool.
// Vite is what compiles and serves our React application during
// development and builds it for production deployment.
// ============================================================

// Import the defineConfig helper from Vite.
// This gives us autocomplete and type checking in our config.
import { defineConfig } from "vite";

// Import the React plugin for Vite.
// This plugin allows Vite to understand and process JSX (React) syntax.
import react from "@vitejs/plugin-react";

// Import the Tailwind CSS plugin for Vite.
// This integrates Tailwind CSS directly into the Vite build process.
import tailwindcss from "@tailwindcss/vite";

// Export the Vite configuration object.
// defineConfig() just wraps the config object for better IDE support.
export default defineConfig({
  plugins: [
    // Enable React support (JSX transformation, Fast Refresh, etc.)
    react(),

    // Enable Tailwind CSS processing in our project.
    // Tailwind will scan our files and generate the necessary CSS classes.
    tailwindcss(),
  ],
});
