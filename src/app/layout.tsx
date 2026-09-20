import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EverFound.com",
  description: "Keep in touch with your friends and classmates — modernized classic address book",
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
