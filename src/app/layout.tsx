import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header"; // Asigură-te că fișierul Header.tsx există în src/components

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bella Beauty Salon",
  description: "Luxury beauty services and loyalty rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdfaf8]">
        {/* Header-ul va apărea acum pe toate paginile */}
        <Header />
        
        {/* Main conține restul paginilor (Login, Profile, Services etc.) */}
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}