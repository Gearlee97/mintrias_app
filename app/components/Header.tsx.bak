// app/components/Header.tsx
"use client";
import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b bg-transparent p-4 z-40">
      <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-4">
        {/* left: avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1fb7ff] to-[#0b84d6] flex items-center justify-center font-bold text-sm text-[#012436] shadow-sm">
            PL
          </div>
          <div>
            <div className="font-semibold text-sm text-zinc-900">PlayerXYZ</div>
            <div className="text-xs text-zinc-500">Rookie</div>
          </div>
        </div>

        {/* center (optional empty to keep spacing) */}
        <div className="flex-1" />

        {/* right: small stats badges */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="bg-white/90 px-3 py-1 rounded-xl text-xs border text-zinc-600">Gold/s: <span className="font-semibold">0.50</span></div>
          <div className="bg-white/90 px-3 py-1 rounded-xl text-xs border text-zinc-600">Gold: <span className="font-semibold">0</span></div>
          <div className="bg-white/90 px-3 py-1 rounded-xl text-xs border text-zinc-600">Diamond: <span className="font-semibold">0</span></div>
        </div>

        {/* small menu for mobile */}
        <nav className="sm:hidden ml-2">
          <button aria-label="open-menu" className="p-2 text-zinc-600">☰</button>
        </nav>
      </div>
    </header>
  );
      }
