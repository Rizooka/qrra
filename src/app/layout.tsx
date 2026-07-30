import type { Metadata } from "next";
import { Unbounded, Manrope } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { SoundProvider } from "@/components/sound-provider";
import { SiteChrome } from "@/components/site-chrome";
import { SoundToggle } from "@/components/sound-toggle";
import { ClientEffects } from "@/components/client-effects";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "900"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QRRA — Смотри первым",
  description:
    "QRRA — очки и взгляд как система. Смотри первым. Не просим разрешения.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SoundProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
          <SoundToggle />
          <ClientEffects />
        </SoundProvider>
      </body>
    </html>
  );
}
