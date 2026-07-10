import type { Metadata } from "next";
import { Instrument_Sans, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
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
    <html lang="en" className={`${instrumentSans.variable} ${fraunces.variable}`}>
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
              fontFamily: 'var(--font-instrument)',
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
