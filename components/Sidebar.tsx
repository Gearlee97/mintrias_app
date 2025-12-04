import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen p-4 border-r bg-white/30">
      <nav className="flex flex-col gap-3">
        <a className="font-medium">Dashboard</a>
        <a>Analytics</a>
        <a>Wallet</a>
      </nav>
    </aside>
  );
}
