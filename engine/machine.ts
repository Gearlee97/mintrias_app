// engine/machine.ts
import { MachineState, ClaimResult } from './types';
import { LabState, LabSlot } from './types';
import { computeLabBuffs } from './utils';

/**
 * applyLabToMachine: compute derived rate and duration based on lab
 */
export function applyLabToMachine(machine: MachineState, lab: LabState): MachineState {
  const { flatAdd, multiplier, extraDurationSec } = computeLabBuffs(lab);
  const derivedRate = +( (machine.baseRate + flatAdd) * multiplier ).toFixed(4);
  const duration = Math.max(30, machine.durationSec + extraDurationSec); // safety min 30s
  return { ...machine, derivedRate, durationSec: duration };
}

/**
 * computeGross: total produced in one session (derivedRate * duration)
 */
export function computeGrossProduction(machine: MachineState): number {
  const rate = machine.derivedRate ?? machine.baseRate;
  const duration = machine.durationSec;
  // careful rounding: keep 4 decimals, but final gold is floored at claim time
  return +(rate * duration);
}

/**
 * computeRepairCost: as user requested, repair cost is percentage of session gross
 * They said "Rerepair cost itu persentase nya 1% dari total hasil mining per sesi masing-masing user"
 * So repairCost = ceil(gross * 1%)
 */
export function computeRepairCost(machine: MachineState): number {
  const gross = computeGrossProduction(machine);
  const pct = 0.01; // 1%
  return Math.ceil(gross * pct);
}

/**
 * claimSession: calculates final gold after health, bill, etc.
 * - afterHealth = floor(gross * (healthPct/100))
 * - electric bill = 1% (configurable) of afterHealth
 * - final = afterHealth - electricBill
 * - machine health decays by DECAY_PER_CLAIM (e.g., 5)
 */
export function claimSession(machine: MachineState, opts?: { electricBillPct?: number; decayPerClaim?: number; }) : ClaimResult {
  const electricBillPct = opts?.electricBillPct ?? 1; // 1%
  const decayPerClaim = opts?.decayPerClaim ?? 5; // health loss per claim - handled by caller update
  const gross = Math.floor( computeGrossProduction(machine) );
  const afterHealth = Math.floor( gross * ( (machine.healthPct ?? 100) / 100 ) );
  const bill = Math.floor( afterHealth * (electricBillPct / 100) );
  const final = Math.max(0, afterHealth - bill);
  const repairCost = computeRepairCost(machine);
  return { gross, afterHealth, electricBill: bill, final, repairCost };
}
