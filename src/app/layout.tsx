import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Green Loop - Circular Fashion Platform",
  description: "Sustainable fashion marketplace for buying, selling, and renting pre-loved clothing",
  keywords: ["fashion", "sustainability", "circular economy", "marketplace", "green"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1093884420538-ka17a3efctfkv117f1lqotu4uusgokn9.apps.googleusercontent.com';
  
  // Debug: Log client ID (remove after testing)
  if (typeof window === 'undefined') {
    console.log('🔑 Google Client ID:', googleClientId ? '✅ Loaded' : '❌ Missing');
  }
  
  if (!googleClientId) {
    console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set!');
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}