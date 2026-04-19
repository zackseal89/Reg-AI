import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RegWatch - MNL Advocates",
  description: "Regulatory intelligence platform by MNL Advocates LLP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#f5f3ef',
              color: '#1a2744',
              border: '1px solid rgba(26,39,68,0.12)',
              borderRadius: '4px',
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              padding: '14px 16px',
              boxShadow: '0 8px 24px rgba(10,16,33,0.12)',
            },
          }}
        />
      </body>
    </html>
  );
}
