// engine/lab/index.ts
// Lab engine: equip/unequip/unlock + compute buffs
// Assumes engine/items/index.ts exists and exports getItem(), ALL_ITEMS types.
// Replace DB stubs with real DB calls in your server actions.

import { getItem, GameItem } from "../items/index";

/**
 * Lab data model (in-memory / DB JSON shape)
 *
 * labs.data example shape:
 * {
 *   miner: [{ slotIndex: 1, unlocked: true, instanceId: 'uuid', itemId: 'miner-common-01' }, ... up to 5],
 *   technician: [...],
 *   cooler: [...]
 * }
 */

export type SlotEntry = {
  slotIndex: number;           // 1..5
  unlocked: boolean;
  instanceId?: string | null;  // inventory instance id (unique per card)
  itemId?: string | null;      // item master id (e.g. miner-epic-02)
};

export type LabData = {
  miner: SlotEntry[];
  technician: SlotEntry[];
  cooler: SlotEntry[];
  updatedAt?: string;
};

export const DEFAULT_SLOTS = 5;

/* -------------------------
   Helper: create default lab
   ------------------------- */
export function createDefaultLab(): LabData {
  const mkSlots = (): SlotEntry[] =>
    Array.from({ length: DEFAULT_SLOTS }, (_, i) => ({
      slotIndex: i + 1,
      unlocked: i === 0, // slot1 unlocked by default
      instanceId: null,
      itemId: null,
    }));

  return {
    miner: mkSlots(),
    technician: mkSlots(),
    cooler: mkSlots(),
    updatedAt: new Date().toISOString(),
  };
}

/* -------------------------
   DB STUBS - replace in production
   -------------------------
   These are placeholders showing how you'd fetch/save lab + inventory.
   Replace with real DB queries (Postgres / Mongo) in server-side code.
*/
async function dbGetLabForUser(userId: number | string): Promise<LabData | null> {
  // TODO: Replace with DB call. Example: SELECT data FROM labs WHERE user_id = $1
  return null;
}
async function dbSaveLabForUser(userId: number | string, lab: LabData): Promise<void> {
  // TODO: Replace with DB update
  return;
}
async function dbCheckInventoryHasInstance(userId: number | string, instanceId: string): Promise<boolean> {
  // TODO: check inventory_items table if user owns that instanceId
  return true;
}
async function dbGetInventoryItem(userId: number | string, instanceId: string): Promise<{ itemId: string } | null> {
  // TODO: fetch inventory item row, return itemId
  return { itemId: "miner-common-01" };
}

/* -------------------------
   Utility: getSlotRef
   ------------------------- */
function getCategoryArray(lab: LabData, category: "miner" | "technician" | "cooler"): SlotEntry[] {
  if (category === "miner") return lab.miner;
  if (category === "technician") return lab.technician;
  return lab.cooler;
}

/* -------------------------
   Action: unlockSlot
   - unlock a specific slot index (1..5)
   - returns updated lab or throws
   ------------------------- */
export async function unlockSlot(userId: number | string, category: "miner" | "technician" | "cooler", slotIndex: number): Promise<LabData> {
  // Load lab
  let lab = (await dbGetLabForUser(userId)) || createDefaultLab();

  const arr = getCategoryArray(lab, category);
  const slot = arr.find(s => s.slotIndex === slotIndex);
  if (!slot) throw new Error("Invalid slot index");
  if (slot.unlocked) return lab; // already unlocked

  // TODO: validate payment (gold or mission reward) before unlocking in server action
  slot.unlocked = true;
  lab.updatedAt = new Date().toISOString();

  await dbSaveLabForUser(userId, lab);
  return lab;
}

/* -------------------------
   Action: equipItem
   - user equips an inventory instance into a lab slot
   - validates ownership and unlocked slot
   - returns updated lab
   ------------------------- */
export async function equipItem(
  userId: number | string,
  category: "miner" | "technician" | "cooler",
  slotIndex: number,
  instanceId: string
): Promise<LabData> {
  // Validate ownership
  const owns = await dbCheckInventoryHasInstance(userId, instanceId);
  if (!owns) throw new Error("Inventory instance not found or not owned by user");

  // get inventory item to know itemId
  const inv = await dbGetInventoryItem(userId, instanceId);
  if (!inv) throw new Error("Inventory item not found");

  // Validate master item exists
  const master = getItem(inv.itemId);
  if (!master) throw new Error("Master item invalid");

  // Load lab
  let lab = (await dbGetLabForUser(userId)) || createDefaultLab();
  const arr = getCategoryArray(lab, category);
  const slot = arr.find(s => s.slotIndex === slotIndex);
  if (!slot) throw new Error("Invalid slot index");
  if (!slot.unlocked) throw new Error("Slot is locked");

  // Check category consistency: ensure the item type matches category
  const catMatch = ((): boolean => {
    if (category === "miner") return !!master.minerAdd;
    if (category === "technician") return !!master.techPct;
    return !!master.coolerDurationPct;
  })();
  if (!catMatch) throw new Error("Item type does not match slot category");

  // Equip: set instanceId & itemId
  slot.instanceId = instanceId;
  slot.itemId = inv.itemId;
  lab.updatedAt = new Date().toISOString();

  await dbSaveLabForUser(userId, lab);
  return lab;
}

/* -------------------------
   Action: unequipItem
   - remove item from slot (instance remains in inventory)
   ------------------------- */
export async function unequipItem(
  userId: number | string,
  category: "miner" | "technician" | "cooler",
  slotIndex: number
): Promise<LabData> {
  let lab = (await dbGetLabForUser(userId)) || createDefaultLab();
  const arr = getCategoryArray(lab, category);
  const slot = arr.find(s => s.slotIndex === slotIndex);
  if (!slot) throw new Error("Invalid slot index");
  if (!slot.instanceId) return lab; // nothing to unequip

  slot.instanceId = null;
  slot.itemId = null;
  lab.updatedAt = new Date().toISOString();

  await dbSaveLabForUser(userId, lab);
  return lab;
}

/* -------------------------
   computeLabBuffs()
   - reads lab data (lab param) and computes:
     * totalMinerAdd (sum minerAdd)
     * totalTechPct (sum of techPct as decimal; returned as multiplier e.g. 1 + totalTechPct)
     * totalDurationPct (sum of coolerDurationPct as decimal; returned as multiplier e.g. 1 + totalDurationPct)
   - also returns a breakdown list for auditing/UI
   ------------------------- */
export type LabBuffs = {
  totalMinerAdd: number;        // additive to base rate (sum of minerAdd)
  totalTechPct: number;         // decimal (sum) e.g. 0.025 means +2.5% multiplier
  totalDurationPct: number;     // decimal (sum) e.g. 0.12 means +12% duration
  breakdown: { slot: SlotEntry; item?: GameItem }[];
};

export function computeLabBuffs(lab: LabData): LabBuffs {
  const breakdown: { slot: SlotEntry; item?: GameItem }[] = [];

  let totalMinerAdd = 0;
  let totalTechPct = 0;
  let totalDurationPct = 0;

  const walk = (arr: SlotEntry[], category: "miner" | "technician" | "cooler") => {
    for (const slot of arr) {
      if (!slot.unlocked) continue;
      if (!slot.instanceId || !slot.itemId) {
        breakdown.push({ slot, item: undefined });
        continue;
      }
      const item = getItem(slot.itemId);
      if (!item) {
        breakdown.push({ slot, item: undefined });
        continue;
      }
      breakdown.push({ slot, item });
      if (category === "miner" && typeof item.minerAdd === "number") totalMinerAdd += item.minerAdd;
      if (category === "technician" && typeof item.techPct === "number") totalTechPct += item.techPct;
      if (category === "cooler" && typeof item.coolerDurationPct === "number") totalDurationPct += item.coolerDurationPct;
    }
  };

  walk(lab.miner, "miner");
  walk(lab.technician, "technician");
  walk(lab.cooler, "cooler");

  // normalize to safe decimals
  totalMinerAdd = Number(totalMinerAdd.toFixed(6));
  totalTechPct = Number(totalTechPct.toFixed(6));
  totalDurationPct = Number(totalDurationPct.toFixed(6));

  return { totalMinerAdd, totalTechPct, totalDurationPct, breakdown };
}

/* -------------------------
   SAMPLE server-side usage (psuedo)
   ------------------------- */
/*
import { computeLabBuffs, createDefaultLab } from '@/engine/lab';
import { getUserLabFromDB, saveUserLabToDB } from '@/server/db';

async function apiEquipHandler(req, res) {
  const userId = req.user.id;
  const { category, slotIndex, instanceId } = req.body;
  // equipItem will validate inventory ownership, slot unlock, etc
  const lab = await equipItem(userId, category, slotIndex, instanceId);

  // recompute buffs and update machine derived rate (example)
  const buffs = computeLabBuffs(lab);
  const baseRate = 0.5; // from config
  const finalDerivedRate = baseRate + buffs.totalMinerAdd;
  // apply technician multiplier: finalRate = finalDerivedRate * (1 + buffs.totalTechPct)
  // update machine state accordingly in DB...
  res.json({ lab, buffs, derivedRate: finalDerivedRate * (1 + buffs.totalTechPct) });
}
*/

export default {
  createDefaultLab,
  unlockSlot,
  equipItem,
  unequipItem,
  computeLabBuffs,
};
