import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ 
  weight: ['600', '700'],
  subsets: ["latin"], 
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  weight: ['400', '500'],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hire A Box | Next-Day Moving Boxes",
  description: "Hire or buy premium moving boxes with next-day delivery across Sydney, Melbourne, Perth, and Adelaide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans text-base leading-relaxed text-[var(--color-brand-charcoal)]`}>
        {children}
      </body>
    </html>
  );
}
