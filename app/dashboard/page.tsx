"use client";

import { useState } from "react";

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-12 h-12 rounded-xl bg-zinc-900/90 text-white flex items-center justify-center shadow-lg">
      {children}
    </button>
  );
}

export default function DashboardPage() {
  // simple UI state for demo
  const [gold, setGold] = useState<number>(1838);
  const [goldPerSec] = useState<number>(0.5);
  const [diamond] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(8);
  const [machineHealth, setMachineHealth] = useState<number>(92);
  const [readyToClaim, setReadyToClaim] = useState<boolean>(true);

  function handleClaim() {
    if (!readyToClaim) return;
    const earned = 10; // demo fixed reward
    setGold((g) => g + earned);
    setReadyToClaim(false);
    // simulate cooldown / next ready after a bit
    setTimeout(() => setReadyToClaim(true), 2000);
  }

  function handleRepair() {
    if (gold <= 0) return;
    setGold((g) => g - 1);
    setMachineHealth((h) => Math.min(100, h + 8));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 text-zinc-900 p-4 font-sans">
      {/* Top bar */}
      <header className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg bg-sky-400 flex items-center justify-center text-2xl font-bold text-white shadow">
          AV
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold">PlayerXYZ</h2>

            <div className="bg-white/80 px-3 py-1 rounded-xl text-sm shadow-sm">
              Gold/s: <span className="font-semibold">{goldPerSec.toFixed(2)}</span>
            </div>
            <div className="bg-white/80 px-3 py-1 rounded-xl text-sm shadow-sm">
              Gold: <span className="font-semibold">{gold}</span>
            </div>
            <div className="bg-white/80 px-3 py-1 rounded-xl text-sm shadow-sm">
              Diamond: <span className="font-semibold">{diamond}</span>
            </div>
          </div>

          <div className="text-sm text-zinc-500 mt-1">Rookie</div>
        </div>
      </header>

      {/* Body: two columns feel (side icons + center card) */}
      <main className="mt-6 flex flex-col items-center">
        <div className="w-full max-w-md flex items-start gap-4">
          {/* left icons */}
          <div className="flex flex-col gap-4 items-center">
            <IconBtn>📦</IconBtn>
            <IconBtn>📊</IconBtn>
            <IconBtn>⬛</IconBtn>
          </div>

          {/* center card */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl bg-zinc-900/95 text-white flex flex-col items-center justify-center shadow-2xl">
              <div className="text-2xl font-bold tracking-wide">NEBULA</div>
              <div className="text-sm text-zinc-200 mt-1">Mining Rig</div>
            </div>

            <button
              onClick={handleClaim}
              className="mt-6 w-full max-w-[420px] bg-gradient-to-r from-sky-400 to-blue-500 text-black/90 font-extrabold py-4 rounded-full shadow-xl text-lg"
            >
              CLAIM
            </button>

            <div className="mt-4 text-sm text-zinc-600">
              <span className="font-semibold">Mining Rate:</span> {goldPerSec.toFixed(2)} IGT/s ·{" "}
              <span className="font-semibold">Machine Output:</span> {machineHealth}% ·{" "}
              <span className="font-semibold">{readyToClaim ? "Ready to claim" : "Cooling..."}</span>
            </div>

            <button
              onClick={handleRepair}
              className="mt-6 rounded-full bg-zinc-900/95 text-white px-5 py-3 shadow-lg"
            >
              REPAIR • Cost: 1
            </button>
          </div>

          {/* right icons */}
          <div className="flex flex-col gap-4 items-center">
            <IconBtn>🕶️</IconBtn>
            <IconBtn>◯</IconBtn>
            <IconBtn>⭐</IconBtn>
          </div>
        </div>

        {/* Quick actions bottom */}
        <div className="mt-8 w-full max-w-md flex gap-4 justify-between">
          <button className="flex-1 bg-zinc-900/95 text-white py-3 rounded-xl shadow-lg font-semibold">
            Laboratorium
          </button>
          <button className="flex-1 bg-zinc-900/95 text-white py-3 rounded-xl shadow-lg font-semibold">
            Summon
          </button>
        </div>
      </main>
    </div>
  );
              }
