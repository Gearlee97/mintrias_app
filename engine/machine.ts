// engine/machine.ts
import { clamp, toFixedNumber } from './utils';
import {
  MachineConfig,
  MachineState,
  ClaimResult
} from './types';
import {
  DEFAULT_SESSION_DURATION_SEC,
  DEFAULT_BASE_RATE,
  DEFAULT_DECAY_PER_CLAIM,
  DEFAULT_REPAIR_PCT
} from './constants';

/**
 * MachineEngine
 * - Pure logic for one machine session
 * - Stateless-ish: holds internal state but no DOM
 * - Methods: start, tick, claim, repair, snapshot
 */
export class MachineEngine {
  config: Required<MachineConfig>;
  state: MachineState;

  constructor(cfg?: MachineConfig) {
    this.config = {
      id: cfg?.id ?? 'machine:default',
      tier: cfg?.tier ?? 'Common',
      baseRate: cfg?.baseRate ?? DEFAULT_BASE_RATE,
      durationSec: cfg?.durationSec ?? DEFAULT_SESSION_DURATION_SEC,
      decayPerClaimPct: cfg?.decayPerClaimPct ?? DEFAULT_DECAY_PER_CLAIM,
      repairPct: cfg?.repairPct ?? DEFAULT_REPAIR_PCT
    };

    this.state = {
      running: false,
      complete: false,
      progressSec: 0,
      durationSec: this.config.durationSec,
      derivedRate: this.config.baseRate,
      healthPct: 100,
      lastStartAt: undefined
    };
  }

  /** apply module buffs from lab (simple API) */
  applyDerivedRate(additive = 0, multiplier = 1) {
    const base = this.config.baseRate;
    this.state.derivedRate = toFixedNumber((base + additive) * multiplier, 4);
    return this.state.derivedRate;
  }

  /** start a session (if not broken) */
  start() {
    if (this.state.healthPct <= 0) throw new Error('Machine broken');
    if (this.state.running) return false;
    this.state.running = true;
    this.state.complete = false;
    this.state.progressSec = 0;
    this.state.lastStartAt = Date.now();
    return true;
  }

  /** tick: call periodically with delta seconds */
  tick(deltaSec: number) {
    if (!this.state.running) return;
    this.state.progressSec += deltaSec;
    if (this.state.progressSec >= this.state.durationSec) {
      this.state.progressSec = this.state.durationSec;
      this.state.running = false;
      this.state.complete = true;
    }
  }

  /** returns gross total for the session (derivedRate * duration) */
  computeGross(): number {
    return toFixedNumber(this.state.derivedRate * this.state.durationSec, 4);
  }

  /** compute repair cost as percentage of gross * missingHealth% */
  computeRepairCost(): number {
    const gross = this.computeGross();
    const missingPct = Math.max(0, 100 - this.state.healthPct) / 100;
    // repairPct in constants is percent-of-gross used to compute repair base
    const base = (DEFAULT_REPAIR_PCT / 100) * gross;
    const cost = Math.ceil(base * (missingPct * 100)); // scale
    return Math.max(0, cost);
  }

  /**
   * Claim session:
   * - apply health decay
   * - apply electric bill (pct)
   * - return ClaimResult
   */
  claim(electricBillPct = 1): ClaimResult {
    if (!this.state.complete) throw new Error('Session not complete');
    const gross = Math.floor(this.computeGross());
    const healthPct = Math.max(0, Math.round(this.state.healthPct));
    const afterHealth = Math.floor(gross * (healthPct / 100));
    const bill = Math.floor(afterHealth * (electricBillPct / 100));
    const final = Math.max(0, afterHealth - bill);

    // apply health decay
    this.state.healthPct = clamp(this.state.healthPct - this.config.decayPerClaimPct, 0, 100);
    // reset session state
    this.state.complete = false;
    this.state.progressSec = 0;
    this.state.running = false;
    this.state.lastStartAt = undefined;

    return {
      gross,
      bill,
      final,
      healthAfter: Math.round(this.state.healthPct)
    };
  }

  /** repair machine (cost is charged externally) */
  repair() {
    this.state.healthPct = 100;
    return true;
  }

  /** quick snapshot for UI */
  snapshot() {
    return {
      running: this.state.running,
      complete: this.state.complete,
      progressSec: this.state.progressSec,
      durationSec: this.state.durationSec,
      percent: Math.round((this.state.progressSec / this.state.durationSec) * 100),
      derivedRate: this.state.derivedRate,
      healthPct: Math.round(this.state.healthPct),
      grossEst: Math.floor(this.computeGross())
    };
  }

  /** debug helper: set health */
  setHealth(h: number) {
    this.state.healthPct = clamp(h, 0, 100);
  }

  /** debug helper: set duration (useful for dev) */
  setDuration(sec: number) {
    this.state.durationSec = sec;
  }
  }
