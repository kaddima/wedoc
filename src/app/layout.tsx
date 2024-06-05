import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
// import db from "@/lib/supabase/db";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";
import { twMerge } from "tailwind-merge";
import { Toaster } from "@/components/ui/toaster";
import AppStateProvider from "@/lib/providers/state-provider";

const inter = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //console.log(db)
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={twMerge('bg-background', inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppStateProvider>
            {children}
            <Toaster />
          </AppStateProvider>

        </ThemeProvider>
      </body>
    </html>
  );
} 