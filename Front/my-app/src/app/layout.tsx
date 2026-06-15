import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoundNest",
  description: "Musical Instruments Store",
};

//componets
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            success: {
              className: "bg-green-500 text-white",
              iconTheme: {
                primary: "#ffffff",
                secondary: "#16a34a",
              },
            },
            error: {
              className: "bg-red-500 text-white",
              iconTheme: {
                primary: "#ffffff",
                secondary: "#dc2626",
              },
            },
          }}
        />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-grow">{children}</div>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
