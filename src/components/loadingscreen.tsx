"use client";

import { APP_NAME } from "@/config/app.config";
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-neutral-50">
      <Loader2 className="h-10 w-10 animate-spin text-neutral-900" />
    </div>
  );
}
