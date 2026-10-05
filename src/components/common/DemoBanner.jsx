// ============================================================
// FILE: src/components/common/DemoBanner.jsx
// PURPOSE: Shows a prominent banner at the top of the app
// when it is running in Demo Mode (no Supabase connected).
//
// This is important for transparency - we always tell the user
// when they are viewing fake/demo data so they know nothing
// is actually being saved to a real database.
// ============================================================

import React, { useState } from "react";

// Import icons from the Lucide React icon library.
// Lucide provides clean, consistent SVG icons as React components.
import { AlertTriangle, X, Info } from "lucide-react";

/**
 * DemoBanner - Displays a warning that the app is in Demo Mode.
 * The user can dismiss (close) this banner if they want.
 */
function DemoBanner() {
  // Track whether the user has dismissed (hidden) this banner.
  const [dismissed, setDismissed] = useState(false);

  // If dismissed, render nothing (return null hides the component)
  if (dismissed) return null;

  return (
    // Banner container: amber/orange background, fixed at top of viewport
    <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">

        {/* Left side: Icon and message */}
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">
            <span className="font-bold">Demo Mode Active</span> – No real database connected.
            Data shown is sample data.
            <span className="hidden sm:inline">
              {" "}Use{" "}
              <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded text-xs">
                student@demo.com / demo123
              </code>
              {" "}or{" "}
              <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded text-xs">
                admin@demo.com / admin123
              </code>
            </span>
          </p>
        </div>

        {/* Right side: Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors flex-shrink-0"
          aria-label="Dismiss demo mode banner"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}

export default DemoBanner;
