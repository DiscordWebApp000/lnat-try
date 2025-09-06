import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/utils/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PREP AI Platform - Smart Practice with AI",
  description: "AI-powered PREP preparation platform. Text analysis, question generation, and performance evaluation to enhance your learning experience.",
  keywords: "PREP, PREP AI, AI, yapay zeka, soru üretimi, metin analizi, öğrenme platformu",
  authors: [{ name: "PREP AI Platform" }],
  creator: "PREP AI Platform",
  publisher: "PREP AI Platform",
  robots: "index, follow",
  openGraph: {
    title: "PREP AI Platform - Smart Practice with AI",
    description: "AI-powered PREP preparation platform",
    type: "website",
    locale: "tr_TR",
    siteName: "PREP AI Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "PREP AI Platform - Smart Practice with AI",
    description: "AI-powered PREP preparation platform",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
