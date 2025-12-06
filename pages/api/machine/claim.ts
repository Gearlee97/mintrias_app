// pages/api/machine/claim.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { applyLabToMachine, claimSession } from '../../engine/machine';
import { buildDefaultLabState } from '../../engine/lab';

/**
 * Example POST payload (JSON):
 * {
 *   "playerId": "player-123",
 *   "machine": { id, baseRate, durationSec, healthPct, running, progressSec },
 *   "labState": { slots: [...] } // optional - if not provided we use defaults
 * }
 *
 * Response:
 * {
 *   success: true,
 *   result: { gross, afterHealth, electricBill, final, repairCost },
 *   newMachineState: {...}
 * }
 *
 * NOTE: This endpoint is intentionally stateless example.
 * In production: validate player, fetch machine & lab from DB, run compute, persist new machine state & player's gold balance.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { playerId, machine, labState } = req.body;

    if (!playerId || !machine) {
      return res.status(400).json({ error: 'playerId and machine required' });
    }

    // if no lab provided, create defaults (for demo)
    const lab = labState ?? buildDefaultLabState();

    // apply lab buffs
    const machineAfterLab = applyLabToMachine(machine, lab);

    // compute claim
    const result = claimSession(machineAfterLab, { electricBillPct: 1, decayPerClaim: 5 });

    // Prepare new machine state (decay health and reset progress)
    const newMachineState = {
      ...machineAfterLab,
      healthPct: Math.max(0, (machineAfterLab.healthPct ?? 100) - 5), // decay 5%
      running: false,
      progressSec: 0,
      complete: false,
      lastClaimAt: Date.now(),
    };

    // TODO: persist changes: update player gold (+result.final), update machine doc, etc.

    return res.status(200).json({
      success: true,
      result,
      newMachineState,
      note: 'Demo response — integrate DB persist in production'
    });
  } catch (err: any) {
    console.error('claim error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
