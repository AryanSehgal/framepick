import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Framepick — An image picker, considered",
  description:
    "A reusable React image picker by Aryan Sehgal. Select, validate, and preview images privately in your browser.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
