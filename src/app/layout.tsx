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
  title: "The Office — a 3D world in a browser tab",
  description:
    "Walk around a low-poly office, talk to the people in it, and read the dashboard on the wall. Built with React Three Fiber, Rapier and ecctrl.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* The canvas owns the viewport; nothing should ever scroll behind it. */}
      <body className="h-full overflow-hidden overscroll-none">{children}</body>
    </html>
  );
}
