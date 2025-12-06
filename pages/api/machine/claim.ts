import type { NextApiRequest, NextApiResponse } from 'next';
import { applyLabToMachine, claimSession } from '../../../engine/machine';
import { buildDefaultLabState } from '../../../engine/lab';
import { addPlayerBalance } from '../../../services/player';
import { updateMachineState } from '../../../services/machine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { playerId, machine, labState } = req.body;
    if (!playerId || !machine) return res.status(400).json({ error: 'playerId and machine required' });

    const lab = labState ?? buildDefaultLabState();
    const machineAfterLab = applyLabToMachine(machine, lab);

    // compute claim
    const result = claimSession(machineAfterLab, { electricBillPct: 1, decayPerClaim: 5 });

    // new machine state (apply decay etc)
    const newMachineState = {
      ...machineAfterLab,
      healthPct: Math.max(0, (machineAfterLab.healthPct ?? 100) - 5),
      running: false,
      progressSec: 0,
      complete: false,
      lastClaimAt: Date.now(),
    };

    // PERSIST: update player balance & machine state
    // addPlayerBalance: upserts player and increments gold
    await addPlayerBalance(playerId, result.final);

    // update machine doc
    await updateMachineState(machine.id ?? machineIdFrom(machine), newMachineState);

    return res.status(200).json({
      success: true,
      result,
      newMachineState,
      note: 'Persisted to DB (players + machines).'
    });
  } catch (err: any) {
    console.error('claim error', err);
    return res.status(500).json({ error: 'internal' });
  }
}

// helper in case machine.id isn't provided
function machineIdFrom(m: any) {
  return m?.id ?? `machine-${Math.random().toString(36).slice(2,9)}`;
}
