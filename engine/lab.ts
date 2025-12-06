// engine/lab.ts
import { LabState, LabSlot } from './types';

/**
 * buildDefaultLabState
 * default: 5 slots; slot 1 unlocked; others locked.
 * new user: slot1 unlocked with common items (free miner/tech/cooler common)
 */
export function buildDefaultLabState(): LabState {
  const slots: LabSlot[] = [];
  for (let i = 1; i <= 5; i++) {
    const unlocked = i === 1; // only slot1 unlocked
    const slot: LabSlot = {
      id: `slot-${i}`,
      unlocked,
      miner: unlocked ? 'miner-common-1' : undefined,
      technician: unlocked ? 'tech-common-1' : undefined,
      cooler: unlocked ? 'cooler-common-1' : undefined,
    };
    slots.push(slot);
  }
  return { slots };
}
