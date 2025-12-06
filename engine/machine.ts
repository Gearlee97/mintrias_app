import type { Machine, LabState } from './types';
import { computeLabBuffs } from './utils';
import { DEFAULT_SESSION_DURATION_SEC, DEFAULT_BASE_RATE } from './constants';

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
    };

    return { success: true, newMachineState };
  } catch (err) {
    console.error('startSession error', err);
    return { success: false, error: 'internal' };
  }
}
