import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TopStatusBar } from "@/components/top-status-bar";
import { PageTransition } from "@/components/page-transition";
import { ThemeProvider } from "@/components/theme-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mordecai Dashboard 🪶",
  description: "Your raven is watching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="flex h-screen overflow-hidden gradient-bg">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopStatusBar />
              <main className="flex-1 overflow-y-auto relative">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
