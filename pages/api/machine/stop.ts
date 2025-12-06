// pages/api/machine/stop.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { applyLabToMachine, claimSession } from '../../engine/machine';
import { buildDefaultLabState } from '../../engine/lab';

/**
 * POST payload (JSON):
 * {
 *   "playerId": "player-123",
 *   "machine": { id, baseRate, durationSec, healthPct, running, progressSec, lastStartAt },
 *   "elapsedSec": 123,         // optional - best-effort if client supplies
 *   "labState": { slots: [...] } // optional
 * }
 *
 * Response:
 * {
 *   success: true,
 *   result: { gross, afterHealth, electricBill, final, repairCost },
 *   newMachineState: {...}
 * }
 *
 * NOTE: Stateless demo. In production validate player, load/persist DB.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { playerId, machine, elapsedSec, labState } = req.body;

    if (!playerId || !machine) {
      return res.status(400).json({ error: 'playerId and machine required' });
    }

    // use provided lab or default (demo)
    const lab = labState ?? buildDefaultLabState();

    // apply lab buffs
    const machineAfterLab = applyLabToMachine(machine, lab);

    // if client provided elapsedSec, try to honor it; otherwise use machine.progressSec
    const progress = typeof elapsedSec === 'number' ? elapsedSec : (machineAfterLab.progressSec ?? 0);

    // clamp progress so we don't exceed duration
    const effectiveProgress = Math.max(0, Math.min(progress, machineAfterLab.durationSec ?? 0));

    // compute claim using existing claimSession logic
    // NOTE: claimSession expects a machine object where progressSec describes the completed seconds
    const tempMachine = { ...machineAfterLab, progressSec: effectiveProgress };
    const result = claimSession(tempMachine, { electricBillPct: 1, decayPerClaim: 5 });

    // Prepare new machine state after stopping: not running, reset progress/complete flags
    const newMachineState = {
      ...machineAfterLab,
      running: false,
      progressSec: 0,
      complete: false,
      healthPct: Math.max(0, (machineAfterLab.healthPct ?? 100) - (result.repaired ? 0 : 0)),
      lastStopAt: Date.now(),
    };

    // TODO: persist to DB (player balance += result.final, update machine doc, history log, etc)

    return res.status(200).json({
      success: true,
      result,
      effectiveProgress,
      newMachineState,
      note: 'Demo stop endpoint — integrate DB persist in production',
    });
  } catch (err: any) {
    console.error('stop error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
