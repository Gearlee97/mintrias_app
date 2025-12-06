/**
 * pages/api/machine/claim.ts
 * - Loads machine from DB (if machineId provided) or uses supplied machine object
 * - Applies lab buffs (computeLabBuffs)
 * - Calls engine.stopSession() to compute mining payout
 * - Persists: addPlayerGold + updateMachineState
 *
 * Expected POST body:
 * {
 *   playerId: "player-123",
 *   machineId: "player-123-m1",   // optional but preferred
 *   machine: { ... }              // optional (used if machineId not provided)
 *   labState: { slots: [...] }    // optional
 * }
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { computeLabBuffs } from '../../../engine/utils';
import { stopSession } from '../../../engine/machine';
import { ensurePlayer, addPlayerGold } from '../../../services/player';
import { getMachineById, updateMachineState } from '../../../services/machine';
import { buildDefaultLabState } from '../../../engine/lab';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { playerId, machineId, machine: machinePayload, labState } = req.body;

    if (!playerId) return res.status(400).json({ error: 'playerId required' });

    // ensure player exists (upsert)
    await ensurePlayer(playerId);

    // fetch machine from DB if id provided
    let machineDoc = null;
    if (typeof machineId === 'string' && machineId.length > 0) {
      machineDoc = await getMachineById(machineId);
      if (!machineDoc && !machinePayload) {
        return res.status(404).json({ error: 'machine not found in DB and no machine payload provided' });
      }
    }

    // final machine source: DB doc (if found) else payload
    const rawMachine = machineDoc ?? machinePayload;
    if (!rawMachine) return res.status(400).json({ error: 'machine data required (either machineId or machine payload)' });

    // lab state (use default if not provided)
    const lab = labState ?? buildDefaultLabState();

    // apply buffs (compute effectiveRate & effectiveDurationSec)
    const buffs = computeLabBuffs(lab);
    const flatAdd = buffs.flatAdd ?? 0;
    const multiplier = buffs.multiplier ?? 1;
    const extraDurationSec = buffs.extraDurationSec ?? 0;

    const baseRate = (rawMachine.baseRate ?? 0.5);
    const effectiveRate = (baseRate + flatAdd) * multiplier;

    const baseDuration = (rawMachine.durationSec ?? (4 * 60 * 60));
    const effectiveDurationSec = baseDuration + extraDurationSec;

    const machineAfterLab = {
      ...rawMachine,
      effectiveRate,
      effectiveDurationSec,
    };

    // compute stop/claim using engine
    const result = stopSession(machineAfterLab, { electricBillPct: 1, decayPerClaim: 5 });

    if (!result || result.success === false) {
      return res.status(500).json({ error: 'failed to compute claim' });
    }

    // Prepare new machine state to persist
    const newMachineState = {
      ...machineAfterLab,
      running: false,
      progressSec: 0,
      complete: false,
      healthPct: Math.max(0, (machineAfterLab.healthPct ?? 100) - (result.decay ?? 0)),
      lastClaimAt: Date.now(),
      updatedAt: new Date(),
    };

    // Persist: add gold to player and update machine doc (if machine has id)
    const payout = Number(result.final ?? 0);

    if (payout > 0) {
      await addPlayerGold(playerId, payout);
    }

    // If machine had an id (from DB or payload), persist it
    const targetMachineId = machineAfterLab.id ?? machineId ?? null;
    if (targetMachineId) {
      await updateMachineState(targetMachineId, newMachineState);
    }

    return res.status(200).json({
      success: true,
      payout,
      result,
      newMachineState,
      note: 'Claim computed and persisted (players + machines).'
    });
  } catch (err: any) {
    console.error('claim api error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
