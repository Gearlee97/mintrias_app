// engine/balances.ts
// Centralized numeric configs for lab/item balancing.
// Tweak values here during playtesting.

export const MINER_RATE = {
  common: 0.05,
  rare: 0.10,
  epic: 0.20,
  legendary: 0.35,
  mythic: 0.60,
} as const;

export const TECH_MULT = {
  common: 1.05,
  rare: 1.10,
  epic: 1.15,
  legendary: 1.20,
  mythic: 1.30,
} as const;

export const COOLER_SEC = {
  common: 60 * 10,
  rare: 60 * 20,
  epic: 60 * 45,
  legendary: 60 * 90,
  mythic: 60 * 180,
} as const;

// stacking caps (optional safety)
export const MAX_FLAT_ADD = 5.0; // IGT/s cap to avoid runaway
export const MAX_MULTIPLIER = 3.0; // max multiplier cap (×3)
export const MAX_EXTRA_DURATION_SEC = 60 * 60 * 24; // 1 day cap
