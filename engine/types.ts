// engine/types.ts

export type Tier = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export interface MachineConfig {
  id?: string;
  tier?: Tier;
  baseRate?: number; // IGT/s base
  durationSec?: number;
  decayPerClaimPct?: number;
  repairPct?: number;
}

export interface MachineState {
  running: boolean;
  complete: boolean;
  progressSec: number;
  durationSec: number;
  derivedRate: number;
  healthPct: number;
  lastStartAt?: number;
}

export interface ClaimResult {
  gross: number;
  bill: number;
  final: number;
  healthAfter: number;
}

/* Lab related */

export type LabCategory = "miner" | "technician" | "cooler";

export interface LabItem {
  id: string;
  name?: string;
  tier: Tier;
  // miner: additive rate (IGT/s)
  minerAdd?: number;
  // technician: additive percent (decimal, e.g., 0.02 = +2%)
  techPct?: number;
  // cooler: duration percent (decimal, e.g., 0.10 = +10%)
  coolerDurationPct?: number;
  metadata?: Record<string, any>;
}

export interface LabSlot {
  slotIndex: number; // 0..4
  unlocked: boolean;
  item: LabItem | null;
}

export interface LabStructure {
  miner: LabSlot[];
  technician: LabSlot[];
  cooler: LabSlot[];
  unlockCosts?: {
    goldPerSlot: number[]; // index -> gold needed
    diamondPerSlot?: number[]; // optional alt cost
  };
}

export interface LabBuffs {
  minerAddTotal: number; // additive IGT/s
  techMultiplier: number; // e.g. 1.12
  coolerDurationMultiplier: number; // e.g. 1.2
  }
