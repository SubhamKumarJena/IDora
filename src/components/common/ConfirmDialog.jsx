// ============================================================
// FILE: src/components/common/ConfirmDialog.jsx
// PURPOSE: A modal confirmation dialog that appears before
// critical actions (like approving/rejecting a request).
//
// WHAT IS A MODAL DIALOG?
// A modal is a popup window that appears on top of the current page.
// It "blocks" the rest of the page until the user responds.
// We use it to prevent accidental actions.
// ============================================================

import React from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

/**
 * ConfirmDialog - Shows a confirmation modal before critical actions.
 *
 * Props:
 * - isOpen: boolean - Whether to show the dialog
 * - onClose: function - Called when user clicks "Cancel" or backdrop
 * - onConfirm: function - Called when user clicks "Confirm"
 * - title: string - The dialog title
 * - message: string - The description/question
 * - confirmText: string - Text for confirm button (default: "Confirm")
 * - cancelText: string - Text for cancel button (default: "Cancel")
 * - type: "danger" | "warning" | "success" - Visual style
 * - loading: boolean - Shows loading state on confirm button
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  loading = false,
}) {
  // Don't render anything if the dialog is not open
  if (!isOpen) return null;

  // Define styles based on the dialog type
  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      buttonClass: "bg-red-600 hover:bg-red-700 text-white",
      iconBg: "bg-red-100 dark:bg-red-900/30",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      buttonClass: "btn-primary",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    // Backdrop: Semi-transparent overlay behind the modal
    // Clicking the backdrop closes the dialog
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Dark overlay background */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal content - stop click propagation so clicking the modal
          itself doesn't close it (only the backdrop does) */}
      <div
        className="relative w-full max-w-md card p-6 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (X) in top right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dialog content */}
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon in colored circle */}
          <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
            {config.icon}
          </div>

          {/* Title and message */}
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            {/* Cancel button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors font-medium text-sm disabled:opacity-50"
            >
              {cancelText}
            </button>

            {/* Confirm button */}
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${config.buttonClass} disabled:opacity-50`}
            >
              {/* Show "Loading..." when action is in progress */}
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
