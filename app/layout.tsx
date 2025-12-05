import "./globals.css";
import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "Mintrias",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900 flex flex-col">
        <Header />

        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
