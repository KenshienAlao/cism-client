import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/auth.context";
import { ConfirmationProvider } from "@/context/confirmation.context";
import Confirmation from "@/components/confirmation";

export const metadata: Metadata = {
  title: "CISM Client",
  description: "CISM Client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>
          <ConfirmationProvider>
            {children}
            <Confirmation />
          </ConfirmationProvider>
        </AuthProvider>
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#000',
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
