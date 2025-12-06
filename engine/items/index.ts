// engine/items/index.ts

import miners from "./miners.json";
import technicians from "./technicians.json";
import coolers from "./coolers.json";

export type ItemCategory = "miner" | "technician" | "cooler";

export interface GameItem {
  id: string;
  name: string;
  tier: string;
  rarity: string;
  desc: string;

  // effects (opsional per kategori)
  minerAdd?: number;
  techPct?: number;
  coolerDurationPct?: number;

  // new! — TGE bonus
  airdropAllocPercent: number;
}

/** Merge semua item jadi satu list besar */
export const ALL_ITEMS: GameItem[] = [
  ...miners,
  ...technicians,
  ...coolers,
];

/** Mengambil item by ID */
export function getItem(id: string): GameItem | undefined {
  return ALL_ITEMS.find((it) => it.id === id);
}

/** Mengambil semua item berdasarkan kategori */
export function getItemsByCategory(cat: ItemCategory): GameItem[] {
  if (cat === "miner") return miners;
  if (cat === "technician") return technicians;
  if (cat === "cooler") return coolers;
  return [];
}

/**
 * Optional: filter by tier (Common / Rare / Epic / Legendary / Mythic)
 */
export function getItemsByTier(tier: string): GameItem[] {
  return ALL_ITEMS.filter((it) => it.tier.toLowerCase() === tier.toLowerCase());
}

/** Cek apakah item valid */
export function isValidItem(id: string): boolean {
  return ALL_ITEMS.some((it) => it.id === id);
}
