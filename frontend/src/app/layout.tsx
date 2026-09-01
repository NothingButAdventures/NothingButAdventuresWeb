import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AffiliateTracker from "@/components/AffiliateTracker";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nothing but adventures",
  description: "Discover and book amazing travel experiences",
  verification: {
    google: "6gk02xeLzWHmKVoKx9M8p313tDSL1-LmZgkAVYfp1SM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <ScrollToTop />
        <AffiliateTracker />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
