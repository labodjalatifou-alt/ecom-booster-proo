import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/SidebarProvider";
import { StoreProvider } from "@/components/StoreProvider";
import { Toaster } from 'react-hot-toast';
import RealtimeNotifications from "@/components/RealtimeNotifications";
import PWARegistration from "@/components/PWARegistration";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Ecom Booster - Pro Edition",
  description: "SaaS Dashboard for E-commerce & Shopify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased transition-colors duration-300`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <StoreProvider>
            <SidebarProvider>
              <Toaster position="top-right" />
            <RealtimeNotifications />
            <PWARegistration />

            <div className="flex min-h-screen">
              <Sidebar />
              {/* Overlay for mobile when sidebar is open */}
              <div className="flex-1 md:ml-64 flex flex-col min-w-0 transition-all duration-300">
                <Header />
                <main className="flex-1 p-4 md:p-8 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
