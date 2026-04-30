import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Legal Sentinel | AI Contract Guardian",
  description: "Protecting freelancers and businesses from predatory contracts with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${outfit.variable} ${playfair.variable} min-h-full bg-[#0A0A0A] text-paper antialiased font-outfit`}>
        {children}
      </body>
    </html>
  );
}
