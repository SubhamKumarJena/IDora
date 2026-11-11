import React from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function DemoBanner() {
  const { isDemoMode, configError } = useAuth();
  if (!isDemoMode && !configError) return null;
  return (
    <div role="alert" className="bg-amber-50 border-b border-amber-300 dark:bg-amber-900/30 dark:border-amber-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-2 text-sm">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>{configError
          ? `Authentication unavailable: ${configError} Registration and login are disabled.`
          : "Explicit Demo Mode: sample data only. No accounts are created and nothing is saved to Supabase."}</p>
      </div>
    </div>
  );
}

export default DemoBanner;
