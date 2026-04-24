import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavSidebar from "@/components/NavSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LaMicro Revenue Intelligence",
  description: "Internal CRM health and webshop performance dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-50 text-neutral-900`}>
        <NavSidebar />
        {/* Main content — offset for sidebar on desktop, bottom tab on mobile */}
        <main className="lg:pl-60 pb-16 lg:pb-0 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
