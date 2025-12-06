// engine/types.ts
export type Tier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type ItemRef = {
  id: string; // e.g. "miner-common-1"
  tier: Tier;
  // other fields (name, description...) optional in DB
};

export type LabSlot = {
  slotId: number; // 1..5
  unlocked: boolean;
  miner?: string | null;       // item id string (or undefined)
  technician?: string | null;  // item id string
  cooler?: string | null;      // item id string
};

export type LabState = {
  slots: LabSlot[];
};

// Buff result
export type LabBuffs = {
  flatAdd: number; // IGT/s
  multiplier: number; // multiplier
  extraDurationSec: number;
};
