// ============================================================
// FILE: src/components/common/StatusBadge.jsx
// PURPOSE: A reusable badge component that visually represents
// the status of an ID card request.
//
// WHAT IS A BADGE?
// A badge is a small colored label used to show status at a glance.
// For example: a green "Completed" badge or a yellow "Under Review" badge.
//
// This component takes a "status" prop and automatically picks
// the right color, icon, and label to display.
// ============================================================

import React from "react";

// Import the STATUS_CONFIG object that maps each status to its display info.
import { STATUS_CONFIG } from "../../lib/demoData";

/**
 * StatusBadge - Displays a color-coded badge for request status.
 *
 * Props:
 * - status: The status string (e.g., "submitted", "approved", "rejected")
 * - size: "sm" | "md" - Controls badge size
 */
function StatusBadge({ status, size = "md" }) {
  // Look up the configuration for this status in our STATUS_CONFIG object.
  // If the status isn't found, use a default configuration.
  const config = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    badgeClass: "badge-submitted",
  };

  // Size-specific text class
  const textClass = size === "sm" ? "text-xs" : "text-xs";

  return (
    // Apply both the base "badge" class and the status-specific class.
    // The badge class provides the pill shape, and the status class provides color.
    <span className={`badge ${config.badgeClass} ${textClass}`}>
      {/* Status label text */}
      {config.label}
    </span>
  );
}

export default StatusBadge;
