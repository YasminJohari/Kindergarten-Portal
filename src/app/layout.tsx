import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/context/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tadika Cahaya Bintang | Parent-School Connection Portal",
  description: "Malaysian kindergarten communication, attendance, and billing portal for parents and educators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms-MY">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

