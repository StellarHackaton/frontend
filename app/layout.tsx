import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { Providers } from "./providers";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Lunas — checkout that feels like cash",
  description:
    "Get paid in any balance. Receive exact dollars. One tap, no jargon.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Lunas", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBFAF7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${hanken.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
