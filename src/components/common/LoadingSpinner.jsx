// ============================================================
// FILE: src/components/common/LoadingSpinner.jsx
// PURPOSE: A reusable loading spinner component shown while
// data is being fetched from the database or during auth checks.
//
// REUSABLE COMPONENTS:
// In React, we write components once and reuse them everywhere.
// This spinner can be used on any page simply by importing it.
// ============================================================

// Import React (needed for JSX)
import React from "react";

/**
 * LoadingSpinner component.
 * Shows a spinning animation while waiting for data.
 *
 * Props:
 * - size: "sm" | "md" | "lg" - Controls the spinner size
 * - text: Optional text to show below the spinner
 * - fullScreen: If true, centers the spinner in the full viewport
 */
function LoadingSpinner({ size = "md", text = "", fullScreen = false }) {
  // Map size names to Tailwind CSS dimension classes
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  // The spinner element: a circle with a colored top border that rotates
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      {/* The actual spinning circle */}
      <div
        className={`
          ${sizeClasses[size]}
          border-blue-200
          border-t-blue-600
          rounded-full
          animate-spin
        `}
        // aria-label tells screen readers what this element is
        aria-label="Loading..."
        role="status"
      />

      {/* Optional loading text below the spinner */}
      {text && (
        <p className="text-sm text-[var(--text-secondary)] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  // If fullScreen is true, center the spinner in the entire viewport
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        {spinner}
      </div>
    );
  }

  // Otherwise, just return the spinner inline
  return spinner;
}

export default LoadingSpinner;
