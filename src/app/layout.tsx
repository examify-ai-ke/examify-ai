import type { Metadata, Viewport } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import { Notifications } from "@/components/ui/notifications";
import { APP_CONFIG } from "@/lib/constants";
import { QueryProvider } from "@/lib/query-provider";
import { PostHogProvider } from "@/providers/posthog-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const firaSans = Fira_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
  display: "swap",
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
      <body className={`${firaSans.variable} ${gtSuper.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        
        <ThemeProvider>
          <PostHogProvider>
            <QueryProvider>
              {children}
              <Notifications />
            </QueryProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
