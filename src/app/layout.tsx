import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.css";

// Providers
import QueryProvider from "@/provider/query-provider";
import { ThemeProvider } from "@/provider/theme-provider";
import { ConfirmationProvider } from "@/context/confirmation.context";
import { SidebarProvider } from "@/context/sidebar.context";

// Layout Components
import { SearchBar } from "@/components/searchbar";
import { BottomNav } from "@/components/bottomnav";
import { ContentWrapper } from "@/components/layout/content-wrapper";
import Confirmation from "@/components/confirmation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "CISM Client",
  description: "CISM Client Dashboard",
};

const THEME_SCRIPT = `
  (function() {
    try {
      var saved = localStorage.getItem('theme');
      var cls = saved === 'dark' ? 'dark'
        : saved === 'light' ? 'light'
        : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(cls);
    } catch(e) {}
  })();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get("sidebar-collapsed")?.value === "true";

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300 overflow-x-hidden">
        <SpeedInsights />
        <QueryProvider>
          <ThemeProvider>
            <ConfirmationProvider>
              <SidebarProvider defaultCollapsed={defaultCollapsed}>
                
                <Suspense fallback={null}>
                  <SearchBar />
                </Suspense>

                <ContentWrapper>
                  {children}
                </ContentWrapper>

                <BottomNav />
                <Confirmation />

              </SidebarProvider>
            </ConfirmationProvider>
          </ThemeProvider>
        </QueryProvider>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#f97316",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              borderRadius: "16px",
            },
          }}
        />
      </body>
    </html>
  );
}
