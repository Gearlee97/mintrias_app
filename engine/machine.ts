import type { Machine, LabState } from './types';
import { computeLabBuffs } from './utils';
import { DEFAULT_SESSION_DURATION_SEC, DEFAULT_BASE_RATE, DEFAULT_DECAY_PER_CLAIM } from './constants';

/**
 * startSession — untuk memulai sesi mining
 */
export function startSession(machine: Machine, lab: LabState) {
  try {
    if (machine.running) {
      return { success: false, error: 'machine already running' };
    }

    const buffs = computeLabBuffs(lab);
    const flatAdd = buffs.flatAdd ?? 0;
    const multiplier = buffs.multiplier ?? 1;
    const extraDurationSec = buffs.extraDurationSec ?? 0;

    const baseRate = machine.baseRate ?? DEFAULT_BASE_RATE;
    const effectiveRate = (baseRate + flatAdd) * multiplier;

    const baseDuration = machine.durationSec ?? DEFAULT_SESSION_DURATION_SEC;
    const effectiveDuration = baseDuration + extraDurationSec;

    const now = Date.now();

    const newMachineState: Machine = {
      ...machine,
      running: true,
      startAt: now,
      progressSec: 0,
      effectiveRate,
      effectiveDurationSec: effectiveDuration,
      complete: false,
    };

    return { success: true, newMachineState };
  } catch (err) {
    console.error('startSession error', err);
    return { success: false, error: 'internal' };
  }
}

/**
 * stopSession — hentikan session (client call ketika mau berhenti/claim)
 * Menghitung progress berdasarkan:
 *  - jika machine.progressSec disediakan -> gunakan itu
 *  - else jika startAt & effectiveDurationSec ada -> hitung dari waktu sekarang
 *
 * Output: gross, afterHealth, electricBill, final, decay
 */
export function stopSession(machine: Machine, opts?: { electricBillPct?: number, decayPerClaim?: number }) {
  try {
    const electricBillPct = (opts?.electricBillPct ?? 1);
    const decayPerClaim = (opts?.decayPerClaim ?? DEFAULT_DECAY_PER_CLAIM);

    // determine effectiveRate & effectiveDuration
    const rate = (machine.effectiveRate ?? machine.baseRate ?? DEFAULT_BASE_RATE);
    const duration = (machine.effectiveDurationSec ?? machine.durationSec ?? DEFAULT_SESSION_DURATION_SEC);

    // compute progressSec
    let progress = 0;
    if (typeof machine.progressSec === 'number' && machine.progressSec > 0) {
      progress = Math.max(0, Math.min(duration, machine.progressSec));
    } else if (machine.startAt) {
      const elapsed = Math.floor((Date.now() - (machine.startAt || 0)) / 1000);
      progress = Math.max(0, Math.min(duration, elapsed));
    } else {
      progress = 0;
    }

    // compute gross (IGT before health & bill)
    const gross = Math.floor(rate * progress);

    // apply machine health %
    const healthPct = Math.max(0, Math.min(100, machine.healthPct ?? 100));
    const afterHealth = Math.floor(gross * (healthPct / 100));

    // electric bill
    const electricBill = Math.floor(afterHealth * (electricBillPct / 100));

    const final = Math.max(0, afterHealth - electricBill);

    // decay (health loss)
    const newHealth = Math.max(0, healthPct - decayPerClaim);

    return {
      success: true,
      gross,
      afterHealth,
      electricBill,
      final,
      decay: decayPerClaim,
      newHealth,
      progressSec: progress
    };
  } catch (err) {
    console.error('stopSession error', err);
    return { success: false, error: 'internal' };
  }
}

/**
 * helper: derive client-visible status from machine object
 */
export function computeStatus(machine: Machine) {
  const now = Date.now();
  const duration = (machine.effectiveDurationSec ?? machine.durationSec ?? DEFAULT_SESSION_DURATION_SEC);
  let progress = machine.progressSec ?? 0;
  let remaining = duration - progress;
  let complete = !!machine.complete;

  if (machine.running && machine.startAt) {
    const elapsed = Math.floor((now - machine.startAt) / 1000);
    progress = Math.max(0, Math.min(duration, elapsed));
    remaining = Math.max(0, duration - progress);
    complete = progress >= duration;
  }

  return {
    running: !!machine.running,
    progressSec: progress,
    remainingSec: remaining,
    durationSec: duration,
    complete,
    effectiveRate: machine.effectiveRate ?? machine.baseRate ?? DEFAULT_BASE_RATE,
  };
}

