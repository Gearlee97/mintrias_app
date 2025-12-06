"use client";

import React from "react";

export default function HomePage() {
  // NOTE: nanti fungsi-fungsi ini bakal dipasang ke engine (GameProvider/useGame)
  const start = () => console.log("startMining()");
  const claim = () => console.log("claimMining()");
  const repair = () => console.log("repairMachine()");
  const openLab = () => console.log("openLaboratorium()");
  const openSummon = () => console.log("openSummon()");

  return (
    <div className="min-h-screen bg-[color:var(--page-bg)] flex flex-col items-center p-4 pt-6 gap-6">
      {/* STATUS ROW (simple) */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center font-bold text-white">
            PL
          </div>
          <div>
            <div className="font-semibold text-lg">PlayerXYZ</div>
            <div className="text-sm text-gray-500">Rookie</div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="px-3 py-1 bg-white/80 rounded-lg text-sm shadow">Gold/s: <b>0.50</b></div>
          <div className="px-3 py-1 bg-white/80 rounded-lg text-sm shadow">Gold: <b>1,861</b></div>
          <div className="px-3 py-1 bg-white/80 rounded-lg text-sm shadow">Diamond: <b>0</b></div>
        </div>
      </div>

      {/* MAIN RIG BOX */}
      <div className="flex-1 w-full max-w-lg flex flex-col items-center justify-center gap-6">
        <div className="w-44 h-44 rounded-2xl bg-gradient-to-b from-[#082938] to-[#05222a] flex items-center justify-center text-white shadow-2xl">
          <div className="text-center">
            <div className="text-xl font-extrabold">NEBULA</div>
            <div className="text-sm opacity-80">Mining Rig</div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="w-full px-6">
          <button
            onClick={start}
            className="w-full py-5 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 font-extrabold shadow-lg text-white"
          >
            MINING
          </button>

          <p className="text-center text-sm text-gray-500 mt-3">
            Mining Rate: <b>0.50</b> IGT/s · Machine Output: <b>87%</b> · <span className="italic">Idle</span>
          </p>

          <div className="flex justify-center mt-4">
            <button
              onClick={repair}
              className="px-5 py-2 rounded-lg bg-slate-800 text-white font-semibold shadow"
            >
              REPAIR • Cost: 1
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="w-full max-w-lg flex gap-4 pb-6">
        <button onClick={openLab} className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium">
          Laboratorium
        </button>
        <button onClick={openSummon} className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium">
          Summon
        </button>
      </div>
    </div>
  );
            }
