import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/provider/query-provider";
import { ConfirmationProvider } from "@/context/confirmation.context";
import Confirmation from "@/components/confirmation";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "CISM Client",
  description: "CISM Client",
};

import { SearchBar } from "@/components/searchbar";
import { BottomNav } from "@/components/bottomnav";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <ConfirmationProvider>
            <Suspense>
              <SearchBar />
            </Suspense>
            {children}
            <BottomNav />
            <Confirmation />
          </ConfirmationProvider>
        </QueryProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#f97316',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: '16px',
            },
          }}
        />
      </body>
    </html>
  );
}
