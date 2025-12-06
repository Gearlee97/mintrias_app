// engine/utils.ts
import { LabState } from './types';

/**
 * computeLabBuffs
 * - menerima lab state (slots + items)
 * - kembalikan multiplier dan flat add untuk rate + duration adjustments
 *
 * For now we simulate simple buff rules:
 * - miner items => flat add to rate (IGT/s)
 * - technician items => percent multiplier (e.g. +10% => 1.10)
 * - cooler items => extra seconds to duration
 *
 * Items are represented by IDs; in prod these would map to DB item records.
 */
export function computeLabBuffs(lab: LabState) {
  let flatAdd = 0; // IGT/s
  let multiplier = 1; // %
  let extraDurationSec = 0; // seconds

  for (const slot of lab.slots) {
    if (!slot.unlocked) continue;
    // NOTE: this is placeholder mapping. Replace mapping with DB lookup later.
    if (slot.miner) {
      // e.g. miner-common-1 => +0.05, miner-rare-1 => +0.1, epic => +0.2
      if (slot.miner.includes('common')) flatAdd += 0.05;
      else if (slot.miner.includes('rare')) flatAdd += 0.10;
      else if (slot.miner.includes('epic')) flatAdd += 0.20;
      else if (slot.miner.includes('legendary')) flatAdd += 0.35;
      else if (slot.miner.includes('mythic')) flatAdd += 0.6;
    }
    if (slot.technician) {
      // tech-common => +5%, rare => +10% ...
      if (slot.technician.includes('common')) multiplier *= 1.05;
      else if (slot.technician.includes('rare')) multiplier *= 1.10;
      else if (slot.technician.includes('epic')) multiplier *= 1.15;
      else if (slot.technician.includes('legendary')) multiplier *= 1.20;
      else if (slot.technician.includes('mythic')) multiplier *= 1.30;
    }
    if (slot.cooler) {
      // cooler-common => +10m, etc (seconds)
      if (slot.cooler.includes('common')) extraDurationSec += 60 * 10;
      else if (slot.cooler.includes('rare')) extraDurationSec += 60 * 20;
      else if (slot.cooler.includes('epic')) extraDurationSec += 60 * 45;
      else if (slot.cooler.includes('legendary')) extraDurationSec += 60 * 90;
      else if (slot.cooler.includes('mythic')) extraDurationSec += 60 * 180;
    }
  }

  return { flatAdd, multiplier, extraDurationSec };
}
