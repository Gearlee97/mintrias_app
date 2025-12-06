// engine/types.ts
export type ID = string;

export interface Machine {
  id: ID;
  baseRate: number; // IGT/s
  durationSec: number; // full session duration (seconds)
  healthPct?: number; // 0-100
  running?: boolean;
  progressSec?: number; // current progress in seconds
  complete?: boolean;
  lastClaimAt?: number; // epoch ms
  // optional metadata
  ownerId?: ID | null;
  // seed-only fields
  createdAt?: number;
}

export interface LabSlot {
  unlocked: boolean;
  miner?: string | null;       // item id or null
  technician?: string | null;  // item id
  cooler?: string | null;      // item id
}

export interface LabState {
  slots: LabSlot[];
  // seed helpers
  ownerId?: ID | null;
  createdAt?: number;
}

export interface Player {
  id: ID;
  username?: string;   // for telegram username mapping
  gold: number;
  machines?: Record<ID, Machine>;
  lab?: LabState;
  createdAt?: number;
  // future: session tokens, etc.
}
