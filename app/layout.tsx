import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "TiLDeR – Understand More by Reading Less",
  description: "Summarize any article in seconds using AI-powered clarity, insight, and brevity.",
  openGraph: {
    title: "TiLDeR",
    description: "Understand more by reading less. Summarize articles in seconds.",
    url: "https://tilder.site",
    siteName: "TiLDeR",
    images: [
      {
        url: "/ogImage.png", 
        width: 1200,
        height: 630,
        alt: "TiLDeR – Understand more by reading less",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TiLDeR",
    description: "Summarize smarter. Get to the point faster.",
    images: ["https://tilder.site/og-image.png"],
    creator: "@ZKakler",
  },
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}