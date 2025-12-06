/**
 * pages/api/machine/repair.ts
 *
 * POST payload:
 * {
 *   playerId: "player-123",
 *   machineId: "player-123-m1",    // preferred
 *   machine: { ... },              // optional if machineId not provided
 *   labState: { slots: [...] }     // optional (used to compute gross)
 * }
 *
 * Logic:
 * - compute effectiveRate & effectiveDurationSec (apply lab buffs)
 * - gross = floor(effectiveRate * effectiveDurationSec)
 * - repairCost = ceil(gross * (DEFAULT_REPAIR_PCT/100))
 * - check player.gold >= repairCost
 * - deduct player gold (atomic via addPlayerGold)
 * - set machine.healthPct = 100, update machine in DB
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { computeLabBuffs } from '../../../engine/utils';
import { DEFAULT_REPAIR_PCT, DEFAULT_BASE_RATE } from '../../../engine/constants';
import { getPlayer, addPlayerGold } from '../../../services/player';
import { getMachineById, updateMachineState } from '../../../services/machine';
import { buildDefaultLabState } from '../../../engine/lab';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { playerId, machineId, machine: machinePayload, labState } = req.body;
    if (!playerId) return res.status(400).json({ error: 'playerId required' });

    // fetch machine from DB if id provided
    let machineDoc = null;
    if (typeof machineId === 'string' && machineId.length > 0) {
      machineDoc = await getMachineById(machineId);
      if (!machineDoc && !machinePayload) {
        return res.status(404).json({ error: 'machine not found in DB and no machine payload provided' });
      }
    }

    const rawMachine = machineDoc ?? machinePayload;
    if (!rawMachine) return res.status(400).json({ error: 'machine data required (machineId or machine payload)' });

    // if already healthy
    const currentHealth = Number(rawMachine.healthPct ?? 100);
    if (currentHealth >= 100) {
      return res.status(400).json({ error: 'machine already healthy' });
    }

    // lab state (default if missing)
    const lab = labState ?? buildDefaultLabState();

    // compute buffs -> effectiveRate & duration
    const buffs = computeLabBuffs(lab);
    const flatAdd = buffs.flatAdd ?? 0;
    const multiplier = buffs.multiplier ?? 1;
    const extraDurationSec = buffs.extraDurationSec ?? 0;

    const baseRate = Number(rawMachine.baseRate ?? DEFAULT_BASE_RATE);
    const effectiveRate = (baseRate + flatAdd) * multiplier;

    const baseDuration = Number(rawMachine.durationSec ?? (4 * 60 * 60)); // fallback 4h
    const effectiveDurationSec = baseDuration + extraDurationSec;

    // gross mining potential for a full session
    const gross = Math.floor(effectiveRate * effectiveDurationSec);

    // repair percent from constants (1 => 1%)
    const repairPct = Number(DEFAULT_REPAIR_PCT || 1);
    const cost = Math.ceil(gross * (repairPct / 100));

    // fetch player to check balance
    const player = await getPlayer(playerId);
    const playerGold = Number(player?.gold ?? 0);

    if (playerGold < cost) {
      return res.status(400).json({ error: 'not enough gold', required: cost, balance: playerGold });
    }

    // Deduct gold (add negative)
    await addPlayerGold(playerId, -cost);

    // update machine health -> 100
    const targetMachineId = rawMachine.id ?? machineId ?? null;
    const newMachineState = {
      ...rawMachine,
      healthPct: 100,
      updatedAt: new Date(),
    };

    if (targetMachineId) {
      await updateMachineState(targetMachineId, newMachineState);
    }

    return res.status(200).json({
      success: true,
      cost,
      newMachineState,
      note: 'Repair paid and machine restored to 100%',
    });
  } catch (err: any) {
    console.error('repair api error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
