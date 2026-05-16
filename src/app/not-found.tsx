"use client"

import Link from "next/link";
import { Compass } from "lucide-react";
import * as motion from "framer-motion/client";

export default function NotFound() {
    return (
        <div className="fixed inset-0 z-9999 bg-background text-foreground flex items-center justify-center p-4 font-sans selection:bg-orange-500 selection:text-white">
            <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-card border border-border p-5 md:p-6 max-w-sm w-full text-center rounded-lg"
            >
                <div className="w-12 h-12 bg-secondary text-orange-500 flex items-center justify-center mx-auto mb-4 rounded-md">
                    <Compass className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-orange-500 uppercase block mb-1">
                    Error 404
                </span>
                
                <h1 className="text-lg font-bold text-foreground mb-1 tracking-tight">
                    Page not found
                </h1>
                <p className="text-sm text-secondary-foreground mb-5 max-w-[280px] mx-auto leading-normal">
                    The link is broken or the page has been moved.
                </p>
                
                <Link 
                    href="/"
                    className="inline-flex w-full items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm rounded-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                >
                    Return Home
                </Link>
            </motion.div>   
        </div>
    );
}