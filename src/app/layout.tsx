import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MianScan - Website Performance, SEO & Accessibility Analyzer",
  description: "Analyze any website URL and get clear, actionable insights about performance, SEO, and accessibility. Website health made simple.",
  keywords: ["website analyzer", "SEO audit", "performance test", "accessibility check", "website health"],
  authors: [{ name: "MultiMian" }],
  openGraph: {
    title: "MianScan - Website Health Made Simple",
    description: "Scan your website in seconds and get actionable insights to improve performance, SEO, and accessibility.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="mianscan-theme"
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
