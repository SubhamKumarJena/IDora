// ============================================================
// FILE: src/components/common/EmptyState.jsx
// PURPOSE: Shows a friendly empty state illustration when
// there is no data to display (e.g., no requests submitted yet).
//
// GOOD UI PRACTICE:
// Never show an empty page or blank table. Always tell the user
// what to do next with a helpful message and action button.
// This is called an "Empty State" pattern.
// ============================================================

import React from "react";
import { FileText } from "lucide-react";

/**
 * EmptyState - Displays when there is no data to show.
 *
 * Props:
 * - icon: React element - Icon to display (default: FileText)
 * - title: string - Main heading
 * - description: string - Explanatory text
 * - actionLabel: string - Button text
 * - onAction: function - What happens when button is clicked
 */
function EmptyState({
  icon,
  title = "No Data Found",
  description = "There is nothing to display here yet.",
  actionLabel,
  onAction,
}) {
  return (
    // Center everything both horizontally and vertically
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon container with subtle background circle */}
      <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
        {/* Show custom icon or default FileText icon */}
        {icon || <FileText className="w-10 h-10 text-blue-300" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
        {description}
      </p>

      {/* Optional action button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
