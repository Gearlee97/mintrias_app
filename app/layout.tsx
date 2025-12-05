import "./globals.css";
import React from "react";
import Header from "./components/Header";;

export const metadata = {
  title: "Mintrias",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <head />
      <body className="min-h-screen bg-white text-zinc-900">
        <Header />
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
