// ============================================================
// FILE: src/context/ThemeContext.jsx
// PURPOSE: Manages the dark/light mode toggle across the app.
//
// WHAT THIS DOES:
// Tracks whether the user prefers dark or light mode,
// saves that preference in localStorage (so it persists),
// and applies the "dark" CSS class to the document root.
//
// When the <html> element has class="dark", all our CSS rules
// under ".dark { ... }" become active, changing colors throughout.
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";

// Create the Theme Context
const ThemeContext = createContext(null);

// ThemeProvider wraps the app to provide theme state to all components.
export function ThemeProvider({ children }) {
  // ── STATE: Current theme ──────────────────────────────────────
  // Initialize theme from localStorage (user's saved preference)
  // or default to "light" if no preference is saved.
  const [theme, setTheme] = useState(() => {
    // Check if user has a saved theme preference
    const saved = localStorage.getItem("idora_theme");
    if (saved) return saved;

    // Check if the user's operating system prefers dark mode
    // window.matchMedia checks CSS media query results
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    // Default to light mode
    return "light";
  });

  // ── EFFECT: Apply theme class to document ─────────────────────
  // This effect runs every time the theme state changes.
  // It adds/removes the "dark" class from the <html> element.
  useEffect(() => {
    const root = document.documentElement; // This is the <html> element

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save the user's choice to localStorage for next visit
    localStorage.setItem("idora_theme", theme);
  }, [theme]); // [theme] means: re-run this effect whenever "theme" changes

  // ── TOGGLE FUNCTION ───────────────────────────────────────────
  // Switches between dark and light mode.
  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  // Provide the theme value and toggle function to all child components
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for easy access to theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
