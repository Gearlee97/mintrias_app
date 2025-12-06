// engine/lab.ts
import {
  LabStructure,
  LabSlot,
  LabItem,
  LabBuffs,
  LabCategory,
  Tier,
} from "./types";

/**
 * Lab module
 * - slot numbering internal 0..4 -> user-facing 1..5
 * - default: slot 1 (index 0) unlocked and auto-equipped with Common modules
 * - unlockCosts: index-based
 */

const DEFAULT_UNLOCK_GOLD = [0, 200000, 500000, 1000000, 2000000];
const DEFAULT_UNLOCK_DIAMOND = [0, 10, 25, 50, 100];

export function createEmptySlots(): LabSlot[] {
  const slots: LabSlot[] = [];
  for (let i = 0; i < 5; i++) {
    slots.push({
      slotIndex: i,
      unlocked: i === 0 ? true : false, // only slot 1 unlocked by default
      item: null,
    });
  }
  return slots;
}

export function createDefaultLab(): LabStructure {
  const lab: LabStructure = {
    miner: createEmptySlots(),
    technician: createEmptySlots(),
    cooler: createEmptySlots(),
    unlockCosts: {
      goldPerSlot: DEFAULT_UNLOCK_GOLD,
      diamondPerSlot: DEFAULT_UNLOCK_DIAMOND,
    },
  };

  // Auto-equip Common modules on slot 1 (index 0) for each category
  lab.miner[0].item = makeLabItemSample("miner-common-01", "Common");
  lab.technician[0].item = makeLabItemSample("tech-common-01", "Common");
  lab.cooler[0].item = makeLabItemSample("cooler-common-01", "Common");

  return lab;
}

/** unlock slot (mutates lab). Caller must deduct currency. */
export function unlockSlot(
  lab: LabStructure,
  category: LabCategory,
  slotIndex: number
): { ok: boolean; reason?: string; cost?: { gold?: number; diamond?: number } } {
  const slots = lab[category];
  if (!slots) return { ok: false, reason: "invalid_category" };
  if (slotIndex < 0 || slotIndex >= slots.length) return { ok: false, reason: "invalid_slot" };
  const target = slots[slotIndex];
  if (target.unlocked) return { ok: false, reason: "already_unlocked" };

  const goldCost = lab.unlockCosts?.goldPerSlot?.[slotIndex] ?? null;
  const diamondCost = lab.unlockCosts?.diamondPerSlot?.[slotIndex] ?? null;

  target.unlocked = true;
  return { ok: true, cost: { gold: goldCost ?? undefined, diamond: diamondCost ?? undefined } };
}

/** equip item (mutates lab). Caller should ensure item validity + ownership */
export function equipItem(lab: LabStructure, category: LabCategory, slotIndex: number, item: LabItem) {
  const slots = lab[category];
  if (!slots) return { ok: false, reason: "invalid_category" };
  if (slotIndex < 0 || slotIndex >= slots.length) return { ok: false, reason: "invalid_slot" };
  const target = slots[slotIndex];
  if (!target.unlocked) return { ok: false, reason: "slot_locked" };
  target.item = item;
  return { ok: true };
}

export function unequipItem(lab: LabStructure, category: LabCategory, slotIndex: number) {
  const slots = lab[category];
  if (!slots) return { ok: false, reason: "invalid_category" };
  if (slotIndex < 0 || slotIndex >= slots.length) return { ok: false, reason: "invalid_slot" };
  const target = slots[slotIndex];
  if (!target.unlocked) return { ok: false, reason: "slot_locked" };
  target.item = null;
  return { ok: true };
}

/** compute buffs from current lab (pure) */
export function computeLabBuffs(lab: LabStructure): LabBuffs {
  let minerAddTotal = 0;
  let techPctTotal = 0;
  let coolerPctTotal = 0;

  for (const s of lab.miner) {
    if (s.unlocked && s.item) minerAddTotal += s.item.minerAdd ?? 0;
  }
  for (const s of lab.technician) {
    if (s.unlocked && s.item) techPctTotal += s.item.techPct ?? 0;
  }
  for (const s of lab.cooler) {
    if (s.unlocked && s.item) coolerPctTotal += s.item.coolerDurationPct ?? 0;
  }

  return {
    minerAddTotal,
    techMultiplier: 1 + techPctTotal,
    coolerDurationMultiplier: 1 + coolerPctTotal,
  };
}

/** sample item factory */
export function makeLabItemSample(id: string, tier: Tier, opts?: Partial<LabItem>): LabItem {
  const presets: Record<Tier, Partial<LabItem>> = {
    Common: { minerAdd: 0.05, techPct: 0.005, coolerDurationPct: 0.02 },
    Rare: { minerAdd: 0.12, techPct: 0.01, coolerDurationPct: 0.04 },
    Epic: { minerAdd: 0.35, techPct: 0.02, coolerDurationPct: 0.07 },
    Legendary: { minerAdd: 0.8, techPct: 0.035, coolerDurationPct: 0.12 },
    Mythic: { minerAdd: 1.6, techPct: 0.06, coolerDurationPct: 0.2 },
  };

  return {
    id,
    name: `${tier} Module`,
    tier,
    minerAdd: presets[tier].minerAdd ?? 0,
    techPct: presets[tier].techPct ?? 0,
    coolerDurationPct: presets[tier].coolerDurationPct ?? 0,
    ...opts,
  };
}
