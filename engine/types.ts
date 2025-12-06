// engine/types.ts
export type Tier = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface MachineConfig {
  id?: string;
  tier?: Tier;
  baseRate?: number;        // IGT/s base
  durationSec?: number;     // session duration in seconds
  decayPerClaimPct?: number; // % health lost per claim
  repairPct?: number;       // pct used to derive repair cost (if used)
}

export interface MachineState {
  running: boolean;
  complete: boolean;
  progressSec: number;
  durationSec: number;
  derivedRate: number; // final rate after modules
  healthPct: number;   // 0-100
  lastStartAt?: number; // epoch ms (optional)
}

export interface ClaimResult {
  gross: number;    // before bill
  bill: number;     // electric / fees
  final: number;    // to user
  healthAfter: number;
}
