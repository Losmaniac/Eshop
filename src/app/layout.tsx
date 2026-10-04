import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { settings } from "@/content/settings";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
// One static weight for headings keeps the font download small. It is not
// preloaded so it does not compete with the hero image.
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: "500",
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${settings.shopName} – ${settings.tagline}`, template: `%s | ${settings.shopName}` },
  description: settings.description,
  openGraph: { type: "website", locale: "cs_CZ", siteName: settings.shopName },
};

export const viewport: Viewport = { themeColor: "#f7f5f2" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#obsah"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Přeskočit na obsah
        </a>
        <CartProvider>
          <DemoBanner />
          <Header />
          <main id="obsah" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
