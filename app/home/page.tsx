"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [isMining, setIsMining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [health, setHealth] = useState(100);

  const SESSION_DURATION = 20; // detik (buat testing dulu sebelum 4 jam)
  
  useEffect(() => {
    let timer: any;

    if (isMining && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (isMining && timeLeft === 0) {
      setIsMining(false);
      // Setelah selesai, health turun
      setHealth((prev) => Math.max(prev - 5, 0));
    }

    return () => clearInterval(timer);
  }, [isMining, timeLeft]);

  const startMining = () => {
    setIsMining(true);
    setTimeLeft(SESSION_DURATION);
  };

  const repairMachine = () => {
    setHealth(100);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Avatar + Title */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-500 rounded-full"></div>

        <div>
          <h2 className="text-xl font-bold">PlayerName</h2>
          <p className="text-sm text-zinc-500">Title: New Miner</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-zinc-900 text-white p-4 rounded-lg space-y-2">
        <p>Mining Rate: <span className="font-bold">0.12 /s</span></p>
        <p>Total Gold: <span className="font-bold">124,200</span></p>
        <p>Total Diamond: <span className="font-bold">34</span></p>
      </div>

      {/* Machine Box */}
      <div className="bg-zinc-800 text-white p-5 rounded-lg space-y-4">

        {/* Machine Output */}
        <p className="text-sm">Machine Output: {health}%</p>
        <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400"
            style={{ width: `${health}%` }}
          ></div>
        </div>

        {/* Mining Button */}
        <button
          onClick={!isMining ? startMining : undefined}
          className={`w-full py-3 rounded-lg font-bold ${
            isMining ? "bg-zinc-600 cursor-not-allowed" : "bg-blue-500"
          }`}
        >
          {isMining ? `Mining… ${timeLeft}s` : "Start Mining"}
        </button>

        {/* Claim Button */}
        {!isMining && timeLeft === 0 ? (
          <button
            onClick={() => {
              // contoh logic
              console.log("Claimed!");
            }}
            className="w-full py-3 rounded-lg font-bold bg-green-500"
          >
            Claim
          </button>
        ) : null}

        {/* Repair Button */}
        <button
          onClick={repairMachine}
          className="w-full py-3 rounded-lg font-bold bg-yellow-500"
        >
          Repair Machine
        </button>
      </div>

      {/* Menu Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <MenuItem label="Shop" />
        <MenuItem label="Player Market" />
        <MenuItem label="Wallet" />
        <MenuItem label="Leaderboard" />
        <MenuItem label="Mission" />
        <MenuItem label="Event" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3">
        <MenuItem label="Laboratorium" big />
        <MenuItem label="Summon" big />
      </div>
    </div>
  );
}

function MenuItem({ label, big = false }: any) {
  return (
    <div
      className={`bg-zinc-800 text-white flex items-center justify-center rounded-lg ${
        big ? "py-6" : "py-4"
      }`}
    >
      {label}
    </div>
  );
        }
