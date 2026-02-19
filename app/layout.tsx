import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokerTrainer",
  description: "Duolingo-inspired poker learning app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
