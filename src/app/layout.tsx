import type { Metadata } from "next";
import { Geist, Geist_Mono, Bungee } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Venboo - Car Rental & Airport Transfer Service | Morocco",
  description: "Premium car rental and airport transfer service in Morocco. Book luxury vehicles, economy cars, and reliable airport transfers from Mohammed V Airport.",
  keywords: "car rental Morocco, airport transfer, Mohammed V Airport, Casablanca car rental, vehicle rental, transport booking",
  openGraph: {
    title: "Venboo - Premium Car Rental & Transport in Morocco",
    description: "Book premium cars and reliable airport transfers across Morocco with Venboo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
