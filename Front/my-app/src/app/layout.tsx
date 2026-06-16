import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Display serif for headings — warm, boutique character.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Readable sans for body copy and UI.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
        className={`${fraunces.variable} ${inter.variable} antialiased flex min-h-screen flex-col`}
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
