// engine/types.ts
export type Tier = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface LabSlot {
  id: string; // slot id, ex: "slot-1"
  miner?: string; // miner item id
  technician?: string; // tech item id
  cooler?: string; // cooler item id
  unlocked: boolean;
}

export interface LabState {
  slots: LabSlot[]; // 5 slots
}

export interface MachineState {
  id: string;
  baseRate: number; // IGT/s base
  durationSec: number; // session duration in seconds
  healthPct: number; // 0-100
  running: boolean;
  progressSec: number;
  lastClaimAt?: number;
  // derived:
  derivedRate?: number;
  complete?: boolean;
}

export interface ClaimResult {
  gross: number;
  afterHealth: number;
  electricBill: number;
  final: number;
  repairCost: number;
}
