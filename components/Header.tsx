import React from "react";

export default function Header() {
  return (
    <header className="w-full p-4 border-b bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-lg font-semibold">Mintrias</h1>
        <div className="text-sm text-zinc-500">Welcome</div>
      </div>
    </header>
  );
}
