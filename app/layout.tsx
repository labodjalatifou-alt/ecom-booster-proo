import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/SidebarProvider";
import { StoreProvider } from "@/components/StoreProvider";
import { Toaster } from 'react-hot-toast';
import RealtimeNotifications from "@/components/RealtimeNotifications";
import PWARegistration from "@/components/PWARegistration";
import NativePushRegistration from "@/components/NativePushRegistration";
import LayoutWrapper from "@/components/LayoutWrapper";

import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ 
  weight: ['400', '600', '700', '800', '900'],
  subsets: ["latin"], 
  variable: "--font-poppins" 
});

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
      <head>
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased transition-colors duration-300`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <StoreProvider>
            <Providers>
              <SidebarProvider>
                <Toaster position="top-right" />
                <RealtimeNotifications />
                <PWARegistration />
                <NativePushRegistration />

                <LayoutWrapper>
                  {children}
                </LayoutWrapper>

              </SidebarProvider>
            </Providers>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
