import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Pilgrym — Sri Lanka's Trusted Umrah & Hajj Marketplace",
    template: "%s | Pilgrym",
  },
  description:
    "Find and book verified Umrah and Hajj travel packages from trusted Sri Lankan agencies. Compare packages, read reviews, and book securely.",
  keywords: ["Umrah", "Hajj", "Sri Lanka", "travel packages", "pilgrimage", "Makkah", "Madinah"],
  openGraph: {
    siteName: "Pilgrym",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
