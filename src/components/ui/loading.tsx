'use client';

import { Loader } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-[9999]">
            <div className="relative w-10 h-10">
                <Loader className="animate-spin" />
            </div>
        </div>
    );
}