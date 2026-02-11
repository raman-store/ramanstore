import "./globals.css";
import type { Metadata } from "next";
import { Header } from "./ui/Header";
import { Footer } from "./ui/Footer";

export const metadata: Metadata = {
  title: "RamanStore – Artificial Jewellery",
  description: "Premium artificial jewellery for every occasion. Pan India delivery."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
