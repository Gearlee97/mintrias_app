// app/home/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

const CONFIG = {
  sessionDurationSec: 12, // demo: ganti sesuai needs (ex: 4*60*60)
  baseRate: 0.5,
  electricBillPct: 1,
  decayPerClaim: 5,
};

type Machine = {
  tier: string;
  health: number;
  running: boolean;
  progress: number;
  duration: number;
  derivedRate: number;
  complete: boolean;
};

export default function HomePage() {
  const [gold, setGold] = useState<number>(0);
  const [diamond, setDiamond] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>("PlayerXYZ");
  const [snack, setSnack] = useState<string>("");
  const snackTimer = useRef<number | null>(null);

  const [machine, setMachine] = useState<Machine>({
    tier: "Common",
    health: 100,
    running: false,
    progress: 0,
    duration: CONFIG.sessionDurationSec,
    derivedRate: CONFIG.baseRate,
    complete: false,
  });

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(performance.now());

  // helpers
  const computeGross = () => Math.round(machine.derivedRate * machine.duration);
  const computeRepairCost = () => {
    const gross = computeGross();
    const missing = Math.max(0, 100 - machine.health);
    return Math.ceil(gross * (missing / 100));
  };
  const formatTime = (s: number) => {
    const sec = Math.max(0, Math.ceil(s));
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return mm + ":" + ss;
  };

  const showSnackbar = (text: string) => {
    setSnack(text);
    if (snackTimer.current) {
      window.clearTimeout(snackTimer.current);
    }
    snackTimer.current = window.setTimeout(() => {
      setSnack("");
      snackTimer.current = null;
    }, 1200);
  };

  // main RAF loop
  useEffect(() => {
    const tick = (now: number) => {
      const delta = (now - lastRef.current) / 1000;
      lastRef.current = now;

      if (machine.running) {
        setMachine((prev) => {
          let progress = prev.progress + delta;
          let running = prev.running;
          let complete = prev.complete;
          if (progress >= prev.duration) {
            progress = prev.duration;
            running = false;
            complete = true;
            try {
              navigator.vibrate && navigator.vibrate(80);
            } catch (e) {}
            showSnackbar("Session complete — claim ready");
          }
          return { ...prev, progress, running, complete };
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (snackTimer.current) window.clearTimeout(snackTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machine.running]);

  // demo seed (like original)
  useEffect(() => {
    const t = setTimeout(() => {
      setGold(1838);
      setMachine((m) => ({ ...m, health: 92 }));
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // UI handlers
  const handleAction = () => {
    if (machine.running) return;
    if (machine.complete) {
      const gross = computeGross();
      const afterHealth = Math.floor(gross * (machine.health / 100));
      const bill = Math.floor(afterHealth * (CONFIG.electricBillPct / 100));
      const finalVal = afterHealth - bill;
      setGold((g) => g + finalVal);
      // wallet simulation omitted, can add state
      setMachine((m) => ({
        ...m,
        health: Math.max(0, m.health - CONFIG.decayPerClaim),
        complete: false,
        progress: 0,
      }));
      showSnackbar(`Claimed ${finalVal} IGT`);
      return;
    }
    if (machine.health <= 0) {
      showSnackbar("Machine broken — repair dulu");
      return;
    }
    // start mining
    setMachine((m) => ({ ...m, running: true, progress: 0 }));
  };

  const handleRepair = () => {
    if (machine.running) {
      showSnackbar("Cannot repair during mining");
      return;
    }
    const missing = Math.max(0, 100 - machine.health);
    if (missing === 0) {
      showSnackbar("Machine already healthy");
      return;
    }
    const cost = computeRepairCost();
    if (gold < cost) {
      showSnackbar("Not enough gold");
      return;
    }
    setGold((g) => g - cost);
    setMachine((m) => ({ ...m, health: 100 }));
    showSnackbar(`Repaired • -${cost} Gold`);
  };

  // derived HUD values
  const miningRate = machine.derivedRate.toFixed(2);
  const remaining = Math.max(0, machine.duration - machine.progress);
  const pct = Math.min(100, (machine.progress / machine.duration) * 100 || 0);
  const healthPct = Math.max(0, Math.round(machine.health));

  // title based on gold (same mapping as original)
  const deriveTitle = () => {
    const g = gold;
    if (g >= 100000000) return "Cosmic Chief";
    if (g >= 50000000) return "Prime Engineer";
    if (g >= 10000000) return "Master Engineer";
    if (g >= 1000000) return "Pro Miner";
    if (g >= 500000) return "Advanced Operator";
    if (g >= 100000) return "Basic Operator";
    if (g >= 50000) return "Beginner Miner";
    return "Rookie";
  };

  return (
    <>
      <style>{`
/* ---------- THEME ---------- */
:root{
  --page-bg: #f7f9fb;
  --nebula-1: #061621;
  --nebula-2: #071b2a;
  --card-dark: #082938;
  --panel-dark: #0b3246;
  --accent-a: #1fb7ff;
  --accent-b: #0b84d6;
  --muted: #5b717b;
  --text-dark: #0b1820;
  --glass: rgba(255,255,255,0.85);
  --shadow-strong: 0 18px 50px rgba(3,20,30,0.45);
  --soft-shadow: 0 8px 20px rgba(2,16,22,0.12);
  --success: #18c985;
}
*{box-sizing:border-box}
html,body{height:100%;margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial;background:var(--page-bg);color:var(--text-dark);-webkit-font-smoothing:antialiased;overflow:hidden}
.viewport{height:100vh;max-width:420px;margin:0 auto;position:relative;display:flex;flex-direction:column;padding:12px;gap:10px}
/* background */
.viewport::before{content:"";position:absolute;inset:0;border-radius:0;background:
  radial-gradient(600px 300px at 60% 10%, rgba(11,132,214,0.06), transparent 12%),
  radial-gradient(500px 260px at 20% 80%, rgba(9,60,80,0.06), transparent 12%),
  linear-gradient(180deg, rgba(250,252,253,0.35), rgba(247,249,250,0.9));pointer-events:none;z-index:0}
.viewport::after{content:"";position:absolute;inset:0;border-radius:0;pointer-events:none;background:radial-gradient(60% 60% at 50% 45%, rgba(0,0,0,0.00), rgba(0,0,0,0.12));z-index:1}

/* header */
.header{display:flex;align-items:flex-start;gap:12px;justify-content:space-between;z-index:3}
.left-col{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.avatar{width:64px;height:64px;border-radius:14px;background:linear-gradient(135deg,var(--accent-a),var(--accent-b));display:flex;align-items:center;justify-content:center;font-weight:900;color:#01243a;font-size:18px;box-shadow:0 10px 30px rgba(11,132,214,0.12);border:2px solid rgba(255,255,255,0.85)}
.title-under{font-weight:700;font-size:13px;color:var(--muted);margin-top:6px}
.center-head{flex:1;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.player-name{font-weight:800;font-size:16px;color:var(--text-dark)}
.stats-row{display:flex;gap:8px;align-items:center;margin-top:4px}
.stat{background:rgba(255,255,255,0.95);padding:6px 10px;border-radius:10px;border:1px solid rgba(8,20,30,0.03);font-size:12px;color:var(--muted);box-shadow:var(--soft-shadow)}

/* sides */
.side-left, .side-right{position:absolute;top:140px;display:flex;flex-direction:column;gap:12px;z-index:3}
.side-left{left:12px}
.side-right{right:12px}
.side-icon{width:56px;height:56px;border-radius:12px;background:linear-gradient(180deg,var(--panel-dark),#083246);display:flex;align-items:center;justify-content:center;color:#eaf6ff;box-shadow:0 10px 30px rgba(2,20,30,0.18);border:1px solid rgba(255,255,255,0.02);cursor:pointer}
.side-icon svg{width:26px;height:26px;fill:rgba(255,255,255,0.95)}

.main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;position:relative;z-index:2}
.char-box{width:200px;height:200px;border-radius:18px;background:linear-gradient(180deg,var(--card-dark),#05222a);display:flex;align-items:center;justify-content:center;color:#eaf6ff;box-shadow:var(--shadow-strong);border:1px solid rgba(255,255,255,0.02)}
.char-title{font-size:18px;font-weight:900;letter-spacing:0.6px}
.char-sub{font-size:12px;color:rgba(230,247,255,0.85)}

.action-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;max-width:380px}
.action-btn{position:relative;width:100%;height:86px;border-radius:999px;padding:0;border:0;overflow:hidden;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;cursor:pointer;color:#012436;background:linear-gradient(90deg,var(--accent-a),var(--accent-b));box-shadow:0 18px 40px rgba(11,132,214,0.14);transition:transform .12s ease, box-shadow .12s ease}
.action-btn:active{transform:translateY(1px)}
.action-btn .label{position:relative;z-index:3}
.inner-timer{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,rgba(255,255,255,0.14), rgba(255,255,255,0.06));z-index:2;transition:width .08s linear}
.action-btn.dark{background:linear-gradient(90deg,#053243,#0a3f56);color:#eaf6ff;box-shadow:0 8px 28px rgba(2,20,30,0.45)}
.glow-ready{box-shadow:0 0 36px rgba(11,132,214,0.18), 0 18px 44px rgba(11,132,214,0.12);transform:translateY(-2px)}
.info-inline{font-size:13px;color:var(--muted);margin-top:4px;text-align:center}
.info-inline strong{color:var(--text-dark);font-weight:800}

.repair-wrap{display:flex;gap:10px;align-items:center;justify-content:center;margin-top:4px}
.repair-btn{padding:10px 16px;border-radius:12px;background:linear-gradient(180deg,#0b3246,#083043);border:1px solid rgba(255,255,255,0.03);color:#eaf6ff;font-weight:800;cursor:pointer;box-shadow:0 10px 24px rgba(2,18,28,0.25)}
.repair-btn.disabled{opacity:.6;cursor:not-allowed}

.bottom-row{width:100%;display:flex;justify-content:space-between;align-items:center;padding:6px 0;gap:12px;z-index:3}
.bottom-box{flex:1;padding:12px 0;border-radius:14px;background:linear-gradient(180deg,#0c3a4f,#072734);border:1px solid rgba(255,255,255,0.04);color:#eaf6ff;font-weight:800;font-size:15px;text-align:center;cursor:pointer;box-shadow:0 14px 40px rgba(3,18,28,0.3)}
.snackbar{position:fixed;left:50%;transform:translateX(-50%);bottom:120px;background:linear-gradient(90deg,var(--accent-a),var(--accent-b));color:#012436;padding:10px 14px;border-radius:12px;font-weight:800;font-size:14px;opacity:0;pointer-events:none;transition:opacity .18s ease,bottom .18s ease;z-index:999}
.snackbar.show{opacity:1;bottom:140px;pointer-events:auto}
@media (max-width:420px){.char-box{width:170px;height:170px}.action-btn{height:76px}.side-left,.side-right{top:150px}.avatar{width:60px;height:60px}.stats-row{gap:6px}}
`}</style>

      <div className="viewport" id="viewport">
        {/* HEADER */}
        <div className="header" style={{ zIndex: 3 }}>
          <div className="left-col">
            <div className="avatar" id="avatar">
              PL
            </div>
            <div className="title-under" id="titleUnder">
              {deriveTitle()}
            </div>
          </div>

          <div className="center-head">
            <div className="player-name" id="playerName">
              {playerName}
            </div>
            <div className="stats-row">
              <div className="stat">
                Gold/s: <span className="font-semibold">{miningRate}</span>
              </div>
              <div className="stat">
                Gold: <span className="font-semibold">{Math.floor(gold)}</span>
              </div>
              <div className="stat">
                Diamond: <span className="font-semibold">{Math.floor(diamond)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE ICONS */}
        <div className="side-left" aria-hidden="true">
          <div className="side-icon" id="sideShop" onClick={() => showSnackbar("Open Shop")}>
            <svg viewBox="0 0 24 24">
              <path d="M6 2l1.2 2h9.6L18 2H6zm0 4v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6H6zm4 3a2 2 0 1 1 4 0v1h-4V9z" />
            </svg>
          </div>

          <div className="side-icon" id="sideMarket" onClick={() => showSnackbar("Open Player Market")}>
            <svg viewBox="0 0 24 24">
              <path d="M3 3v18h18V3H3zm4 14H5v-8h2v8zm4 0H9v-5h2v5zm4 0h-2v-9h2v9z" />
            </svg>
          </div>

          <div className="side-icon" id="sideWallet" onClick={() => showSnackbar("Open Wallet")}>
            <svg viewBox="0 0 24 24">
              <path d="M2 7v10a2 2 0 0 0 2 2h16V7H2zm18 5h-2v2h2v-2z" />
            </svg>
          </div>
        </div>

        <div className="side-right" aria-hidden="true">
          <div className="side-icon" id="sideLb" onClick={() => showSnackbar("Open Leaderboard")}>
            <svg viewBox="0 0 24 24">
              <path d="M3 3h18v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4H11a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3z" />
            </svg>
          </div>

          <div className="side-icon" id="sideMission" onClick={() => showSnackbar("Open Mission")}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 4a6 6 0 1 1 0 12A6 6 0 0 1 12 6z" />
            </svg>
          </div>

          <div className="side-icon" id="sideEvent" onClick={() => showSnackbar("Open Event")}>
            <svg viewBox="0 0 24 24">
              <path d="M12 17.3l6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.76L5.82 21z" />
            </svg>
          </div>
        </div>

        {/* MAIN */}
        <div className="main" role="main" aria-live="polite">
          <div className="char-box" id="charBox">
            <div style={{ textAlign: "center" }}>
              <div className="char-title">NEBULA</div>
              <div className="char-sub">Mining Rig</div>
            </div>
          </div>

          <div className="action-wrap">
            <button
              id="actionBtn"
              className={`action-btn ${machine.running ? "dark" : ""} ${machine.complete ? "glow-ready" : ""}`}
              aria-pressed={machine.running}
              aria-live="polite"
              onClick={handleAction}
            >
              <div className="inner-timer" id="innerTimer" style={{ width: machine.running || machine.complete ? (machine.running ? `${pct}%` : "100%") : "0%" }} />
              <div className="label" id="actionLabel">
                {machine.running ? `MINING • ${formatTime(remaining)}` : machine.complete ? "CLAIM" : "MINING"}
              </div>
            </button>

            <div className="info-inline" id="infoInline">
              Mining Rate: <strong id="sessionOut">{machinesafe(machine.derivedRate).toFixed(2)}</strong> IGT/s •{" "}
              <span id="sessionState">Machine Output: {healthPct}%{machine.complete ? " • Ready to claim" : machine.running ? "" : " • Idle"}</span>
            </div>

            <div className="repair-wrap">
              <button id="repairBtn" className={`repair-btn ${machine.running ? "disabled" : ""}`} onClick={handleRepair} disabled={machine.running}>
                REPAIR • Cost: <span id="repairCost">{computeRepairCost()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* bottom two separate boxes (minimal) */}
        <div className="bottom-row">
          <button className="bottom-box" id="labBtn" onClick={() => showSnackbar("Open Laboratorium")}>
            Laboratorium
          </button>
          <button className="bottom-box" id="summonBtn" onClick={() => showSnackbar("Open Summon / Gacha")}>
            Summon
          </button>
        </div>

        <div style={{ height: 8 }} />
      </div>

      {/* snackbar */}
      <div id="snackbar" className={`snackbar ${snack ? "show" : ""}`} role="status" aria-live="polite">
        {snack}
      </div>
    </>
  );
}

/* small helper — guard against NaN in some builds */
function machinesafe(n: number) {
  if (!Number.isFinite(n)) return 0;
  return n;
    }
