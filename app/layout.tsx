import "./globals.css";
import React from "react";
import Sidebar from "./components/Sidebar";
// NOTE: Header dihapus supaya ga double

export const metadata = {
  title: "Mintrias",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-zinc-900">
        <div className="flex">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
