
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VANTROX | Precision. Performance. Play.",
  description:
    "Discover VANTROX. Explore our product and contact us for enquiries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
