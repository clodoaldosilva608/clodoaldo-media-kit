import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { CountdownBanner } from "@/components/site/countdown-banner";
import { PixelLoader } from "@/components/site/pixel-loader";
import { CookieConsent } from "@/components/site/cookie-consent";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Clodoaldo Silva — Media Kit 2026 | Serviços, E-books e Parcerias",
  description:
    "Media Kit oficial de Clodoaldo Silva com parcerias, Ghost Services, produtos digitais e contratação online em poucos passos.",
  keywords: [
    "Clodoaldo Silva",
    "media kit",
    "influenciador digital",
    "parcerias",
    "ghost services",
    "e-books",
    "marketing de influência",
  ],
  authors: [{ name: "Clodoaldo Silva" }],
  openGraph: {
    title: "Clodoaldo Silva — Media Kit 2026 | Serviços, E-books e Parcerias",
    description:
      "Media Kit oficial de Clodoaldo Silva com parcerias, Ghost Services, produtos digitais e contratação online em poucos passos.",
    siteName: "Clodoaldo Silva",
    type: "website",
    locale: "pt_BR",
    images: ["/assets/og-clodoaldo-silva-v2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clodoaldo Silva — Media Kit 2026",
    description:
      "Media Kit oficial de Clodoaldo Silva com parcerias, Ghost Services, produtos digitais e contratação online.",
    images: ["/assets/og-clodoaldo-silva-v2.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/assets/clodoaldo-logo.png",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <PixelLoader />
        <CountdownBanner />
        {children}
        <WhatsAppButton />
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
