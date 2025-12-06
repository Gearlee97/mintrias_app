// engine/machine.ts
import { clamp, toFixedNumber } from "./utils";
import { MachineConfig, MachineState, ClaimResult } from "./types";
import {
  DEFAULT_SESSION_DURATION_SEC,
  DEFAULT_BASE_RATE,
  DEFAULT_DECAY_PER_CLAIM,
  DEFAULT_REPAIR_PCT,
} from "./constants";

/**
 * MachineEngine
 * - Pure logic for one machine session
 * - Methods: start, tick, claim, repair, applyLabBuffs, snapshot
 */
export class MachineEngine {
  config: Required<MachineConfig>;
  state: MachineState;

  constructor(cfg?: MachineConfig) {
    this.config = {
      id: cfg?.id ?? "machine:default",
      tier: cfg?.tier ?? "Common",
      baseRate: cfg?.baseRate ?? DEFAULT_BASE_RATE,
      durationSec: cfg?.durationSec ?? DEFAULT_SESSION_DURATION_SEC,
      decayPerClaimPct: cfg?.decayPerClaimPct ?? DEFAULT_DECAY_PER_CLAIM,
      repairPct: cfg?.repairPct ?? DEFAULT_REPAIR_PCT,
    };

    this.state = {
      running: false,
      complete: false,
      progressSec: 0,
      durationSec: this.config.durationSec,
      derivedRate: this.config.baseRate,
      healthPct: 100,
      lastStartAt: undefined,
    };
  }

  /** apply module buffs from lab (minerAdd: IGT/s, techMultiplier decimal, coolerDurationMultiplier decimal) */
  applyLabBuffs(buffs: { minerAddTotal: number; techMultiplier: number; coolerDurationMultiplier: number }) {
    const base = this.config.baseRate;
    const afterMiner = base + (buffs.minerAddTotal || 0);
    const afterTech = toFixedNumber(afterMiner * (buffs.techMultiplier || 1), 6);
    const finalDuration = Math.max(1, Math.floor(this.config.durationSec * (buffs.coolerDurationMultiplier || 1)));
    this.state.derivedRate = afterTech;
    this.state.durationSec = finalDuration;
    return { derivedRate: this.state.derivedRate, durationSec: this.state.durationSec };
  }

  start() {
    if (this.state.healthPct <= 0) throw new Error("Machine broken");
    if (this.state.running) return false;
    this.state.running = true;
    this.state.complete = false;
    this.state.progressSec = 0;
    this.state.lastStartAt = Date.now();
    return true;
  }

  tick(deltaSec: number) {
    if (!this.state.running) return;
    this.state.progressSec += deltaSec;
    if (this.state.progressSec >= this.state.durationSec) {
      this.state.progressSec = this.state.durationSec;
      this.state.running = false;
      this.state.complete = true;
    }
  }

  computeGross(): number {
    return toFixedNumber(this.state.derivedRate * this.state.durationSec, 4);
  }

  computeRepairCost(): number {
    const gross = this.computeGross();
    const missingPct = Math.max(0, 100 - this.state.healthPct) / 100; // 0..1
    const repairDecimal = (this.config.repairPct ?? DEFAULT_REPAIR_PCT) / 100; // 0.01
    const cost = Math.ceil(gross * missingPct * repairDecimal);
    return Math.max(0, cost);
  }

  claim(electricBillPct = 1): ClaimResult {
    if (!this.state.complete) throw new Error("Session not complete");
    const gross = Math.floor(this.computeGross());
    const healthPct = Math.max(0, Math.round(this.state.healthPct));
    const afterHealth = Math.floor(gross * (healthPct / 100));
    const bill = Math.floor(afterHealth * (electricBillPct / 100));
    const final = Math.max(0, afterHealth - bill);

    this.state.healthPct = clamp(this.state.healthPct - this.config.decayPerClaimPct, 0, 100);
    this.state.complete = false;
    this.state.progressSec = 0;
    this.state.running = false;
    this.state.lastStartAt = undefined;

    return {
      gross,
      bill,
      final,
      healthAfter: Math.round(this.state.healthPct),
    };
  }

  repair() {
    this.state.healthPct = 100;
    return true;
  }

  snapshot() {
    return {
      running: this.state.running,
      complete: this.state.complete,
      progressSec: this.state.progressSec,
      durationSec: this.state.durationSec,
      percent: Math.round((this.state.progressSec / this.state.durationSec) * 100),
      derivedRate: this.state.derivedRate,
      healthPct: Math.round(this.state.healthPct),
      grossEst: Math.floor(this.computeGross()),
    };
  }

  setHealth(h: number) {
    this.state.healthPct = clamp(h, 0, 100);
  }

  setDuration(sec: number) {
    this.state.durationSec = sec;
  }
  }
