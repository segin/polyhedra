import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polyhedra",
  description: "Web-based 3D modeling",
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
