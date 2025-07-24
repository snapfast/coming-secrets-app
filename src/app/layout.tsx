import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel_Decorative } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-cinzel-decorative",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Comings",
  description: "Send time-locked messages that can only be opened on a specific date",
  icons: {
    icon: '/icon-garden-dig.svg',
  },
  openGraph: {
    title: "Comings Secrets",
    description: "Send time-locked messages that can only be opened on a specific date",
    url: "https://comingss.netlify.app",
    siteName: "Comings Secrets",
    images: [
      {
        url: "/icon-garden-dig.svg",
        width: 96,
        height: 96,
        alt: "Coming Secrets - Send time-locked messages that unlock on a specific date",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coming Secrets",
    description: "Send time-locked messages that can only be opened on a specific date",
    images: ["/og-image.svg"],
  },
  metadataBase: new URL("https://comingss.netlify.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzelDecorative.variable} antialiased`}
      >
        {/* Google Analytics - REQUIRED: Loads GA script globally and automatically tracks all page views across the app */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-53FQVZMTS5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-53FQVZMTS5');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
