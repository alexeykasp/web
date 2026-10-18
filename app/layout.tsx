import type { Metadata } from "next";
import "./globals.css";
import Cursor from "./components/Cursor";

export const metadata: Metadata = {
  title: "alexeykasp",
  description: "BIO",
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    noarchive: true,
  },
  other: {
    "yandex-verification": "2b4f7678d9a7b236",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
          <body className="antialiased">
        <Cursor />
        {children}
      </body>
    </html>
  );
}
