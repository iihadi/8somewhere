import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app"
  ),
  title: {
    default: "8somewhere — restaurant reviews",
    template: "%s — 8somewhere",
  },
  description:
    "Every restaurant I've eaten at, written up honestly. London, Paris, New York and wherever else.",
  openGraph: {
    type: "website",
    title: "8somewhere — restaurant reviews",
    description: "Every restaurant I've eaten at, written up honestly.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
