// engine/utils.ts
import fs from 'fs';
import path from 'path';
import { LabState, LabBuffs } from './types';
import {
  MINER_RATE,
  TECH_MULT,
  COOLER_SEC,
  MAX_FLAT_ADD,
  MAX_MULTIPLIER,
  MAX_EXTRA_DURATION_SEC,
} from './balances';

// Simple in-memory caches for JSON lookups (works server-side)
let minersMap: Record<string, any> | null = null;
let techMap: Record<string, any> | null = null;
let coolersMap: Record<string, any> | null = null;

function loadItemsOnce() {
  if (minersMap && techMap && coolersMap) return;
  const base = path.join(process.cwd(), 'engine', 'items');

  try {
    const miners = JSON.parse(fs.readFileSync(path.join(base, 'miners.json'), 'utf-8'));
    const technicians = JSON.parse(fs.readFileSync(path.join(base, 'technicians.json'), 'utf-8'));
    const coolers = JSON.parse(fs.readFileSync(path.join(base, 'coolers.json'), 'utf-8'));

    minersMap = Object.fromEntries(miners.map((i: any) => [i.id, i]));
    techMap = Object.fromEntries(technicians.map((i: any) => [i.id, i]));
    coolersMap = Object.fromEntries(coolers.map((i: any) => [i.id, i]));
  } catch (err) {
    // If file reading fails (e.g. client-side build), fallback to empty maps
    minersMap = minersMap ?? {};
    techMap = techMap ?? {};
    coolersMap = coolersMap ?? {};
  }
}

function safeIsString(v: any): v is string {
  return typeof v === 'string' && v.length > 0;
}

/**
 * computeLabBuffs
 * - uses item lookup tables (json) and fallback to balances constants
 */
export function computeLabBuffs(lab: LabState): LabBuffs {
  loadItemsOnce();

  let flatAdd = 0;
  let multiplier = 1;
  let extraDurationSec = 0;

  if (!lab || !Array.isArray(lab.slots)) {
    return { flatAdd: 0, multiplier: 1, extraDurationSec: 0 };
  }

  for (const slot of lab.slots) {
    if (!slot || slot.unlocked !== true) continue;

    // miner
    if (safeIsString(slot.miner)) {
      const item = minersMap?.[slot.miner];
      if (item && typeof item.rate === 'number') {
        flatAdd += item.rate;
      } else {
        // fallback: try parse tier from id pattern
        const t = parseTierFromId(slot.miner);
        if (t && MINER_RATE[t]) flatAdd += MINER_RATE[t];
      }
    }

    // technician
    if (safeIsString(slot.technician)) {
      const titem = techMap?.[slot.technician];
      if (titem && typeof titem.mult === 'number') {
        multiplier *= titem.mult;
      } else {
        const t = parseTierFromId(slot.technician);
        if (t && TECH_MULT[t]) multiplier *= TECH_MULT[t];
      }
    }

    // cooler
    if (safeIsString(slot.cooler)) {
      const citem = coolersMap?.[slot.cooler];
      if (citem && typeof citem.extraSec === 'number') {
        extraDurationSec += citem.extraSec;
      } else {
        const t = parseTierFromId(slot.cooler);
        if (t && COOLER_SEC[t]) extraDurationSec += COOLER_SEC[t];
      }
    }
  }

  // caps
  flatAdd = Math.min(flatAdd, MAX_FLAT_ADD);
  multiplier = Math.min(multiplier, MAX_MULTIPLIER);
  extraDurationSec = Math.min(extraDurationSec, MAX_EXTRA_DURATION_SEC);

  return { flatAdd, multiplier, extraDurationSec };
}

/** 
 * parseTierFromId
 * expects id like "miner-common-1" or "tech-rare-2"
 */
function parseTierFromId(id: string): keyof typeof MINER_RATE | null {
  if (!safeIsString(id)) return null;
  const parts = id.split('-');
  // find known tier in parts
  const tiers = ['common', 'rare', 'epic', 'legendary', 'mythic'];
  for (const p of parts) {
    if (tiers.includes(p)) return p as keyof typeof MINER_RATE;
  }
  return null;
                                 }
