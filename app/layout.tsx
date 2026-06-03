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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pod-ia.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "POD IA — Tu idea, impresa",
    template: "%s | POD IA",
  },
  description:
    "Describe tu idea. Nuestra IA la convierte en un diseño único. Lo imprimimos en camisetas, hoodies, tazas y más. Te lo enviamos a casa.",
  openGraph: {
    title: "POD IA — Tu idea, impresa",
    description:
      "Describe tu idea. La IA la diseña. Lo imprimimos y te lo enviamos.",
    url: siteUrl,
    siteName: "POD IA",
    locale: "es_MX",
    type: "website",
    images: [{ url: `${siteUrl}/images/og.svg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "POD IA — Tu idea, impresa",
    description:
      "Describe tu idea. La IA la diseña. Lo imprimimos y te lo enviamos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
