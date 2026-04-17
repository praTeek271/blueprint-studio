import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientOnlyFullscreenButton from "./ClientOnlyFullscreenButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bluprint-Studio",
  description:
    "Bluprint-Studio is a design system for building 2D avatars -- by Prateek271",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only show fullscreen button on /avatar-studio and /blueprint-studio
  // This must be a Client Component to use hooks, so wrap the button in a client-only wrapper
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientOnlyFullscreenButton />
        {children}
      </body>
    </html>
  );
}
