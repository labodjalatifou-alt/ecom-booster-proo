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
        <meta name="shopify-api-key" content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" async></script>
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
            </Providers>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
