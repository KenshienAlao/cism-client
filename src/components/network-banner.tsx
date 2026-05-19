"use client";

import { useEffect, useState } from "react";
import { WifiOff, AlertCircle } from "lucide-react";

export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isApiDown, setIsApiDown] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setIsApiDown(false); // Assume if physical network comes back, API might be back
    };
    
    const handleApiError = () => setIsApiDown(true);
    const handleApiSuccess = () => setIsApiDown(false);
    
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("api-network-error", handleApiError);
    window.addEventListener("api-network-success", handleApiSuccess);
    
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("api-network-error", handleApiError);
      window.removeEventListener("api-network-success", handleApiSuccess);
    };
  }, []);

  if (!isOffline && !isApiDown) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-9999 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top-full duration-300">
      {isOffline ? <WifiOff size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium tracking-wide">
        {isOffline 
          ? "You are currently offline. Please check your internet connection." 
          : "Server is currently unreachable. Reconnecting..."}
      </span>
    </div>
  );
}
