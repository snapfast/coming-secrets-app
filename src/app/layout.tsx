import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel_Decorative } from "next/font/google";
import "./globals.css";

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
  title: "Coming Secrets",
  description: "Send time-locked messages that can only be opened on a specific date",
  icons: {
    icon: '/icon-garden-dig.svg',
  },
  openGraph: {
    title: "Coming Secrets",
    description: "Send time-locked messages that can only be opened on a specific date",
    url: "https://comingss.netlify.app",
    siteName: "Coming Secrets",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
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
        {children}
      </body>
    </html>
  );
}
