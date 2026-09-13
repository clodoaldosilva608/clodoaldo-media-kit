import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { CountdownBanner } from "@/components/site/countdown-banner";
import { PixelLoader } from "@/components/site/pixel-loader";
import { CookieConsent } from "@/components/site/cookie-consent";
import { PageViewTracker } from "@/components/site/page-view-tracker";
import { personSchema, organizationSchema, serializeSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Clodoaldo Silva — Criador e Desenvolvedor Digital | Apps, Serviços e Parcerias",
  description:
    "Ecossistema digital de Clodoaldo Silva: desenvolvimento de apps, serviços de conteúdo, e-books e parcerias. Transformando ideias em resultados reais desde 2016.",
  keywords: [
    "Clodoaldo Silva",
    "criador digital",
    "desenvolvedor",
    "apps",
    "marketing digital",
    "e-books",
    "ecossistema digital",
  ],
  authors: [{ name: "Clodoaldo Silva" }],
  alternates: { canonical: "https://clodoaldo.vercel.app" },
  openGraph: {
    title: "Clodoaldo Silva — Criador e Desenvolvedor Digital",
    description:
      "Ecossistema digital de Clodoaldo Silva: apps, serviços de conteúdo, e-books e parcerias.",
    siteName: "Clodoaldo Silva",
    type: "website",
    locale: "pt_BR",
    url: "https://clodoaldo.vercel.app",
    images: ["/assets/og-clodoaldo-silva-v2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clodoaldo Silva — Criador e Desenvolvedor Digital",
    description:
      "Ecossistema digital: apps, serviços de conteúdo, e-books e parcerias.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Theme init — runs before paint to prevent flash of wrong theme.
            Default is dark; applying `light` class on <html> switches to light. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('cs-theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();",
          }}
        />
        {/* JSON-LD: Person + Organization (SEO semântico) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeSchema(personSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeSchema(organizationSchema()) }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <PixelLoader />
        <PageViewTracker />
        <CountdownBanner />
        {children}
        <WhatsAppButton />
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
