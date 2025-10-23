import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Notifications } from "@/components/ui/notifications";
import { APP_CONFIG } from "@/lib/constants";
import { QueryProvider } from "@/lib/query-provider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

// GTSuper font - uncomment when you add the font file to public/fonts/
import localFont from "next/font/local";
const gtSuper = localFont({
  src: [
    {
      path: "../../public/fonts/GTSuperDisplay-Super.woff",
      weight: "400",
      style: "normal",
       
    },
  ],
  variable: "--font-gt-super",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  keywords: ["exam papers", "education", "academic", "study materials"],
  authors: [{ name: "Exampapel Team" }],
  creator: "Exampapel",
  publisher: "Exampapel",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${gtSuper.variable} font-sans`}> 
        <QueryProvider>
          {children}
          <Notifications />
        </QueryProvider>
      </body>
    </html>
  );
}
