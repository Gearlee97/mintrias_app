import type { NextApiRequest, NextApiResponse } from 'next';
import { applyLabToMachine, claimSession } from '../../engine/machine';
import { buildDefaultLabState } from '../../engine/lab';
import { getMachineById, upsertMachine } from '../../services/machine';
import { getPlayerById, changePlayerGold } from '../../services/player';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { playerId, machineId, labState } = req.body;

    if (!playerId || !machineId) return res.status(400).json({ error: 'playerId and machineId required' });

    // fetch player & machine from DB
    const player = await getPlayerById(playerId);
    const machine = await getMachineById(machineId);

    if (!player) return res.status(404).json({ error: 'player not found' });
    if (!machine) return res.status(404).json({ error: 'machine not found' });
    if (machine.ownerId !== playerId) return res.status(403).json({ error: 'not owner' });

    const lab = labState ?? buildDefaultLabState();
    const machineAfterLab = applyLabToMachine(machine, lab);

    // compute claim (use engine logic)
    const result = claimSession(machineAfterLab, { electricBillPct: 1, decayPerClaim: 5 });

    // prepare new machine state
    const newMachineState = {
      ...machineAfterLab,
      healthPct: Math.max(0, (machineAfterLab.healthPct ?? 100) - 5),
      running: false,
      progressSec: 0,
      complete: false,
      lastClaimAt: Date.now(),
    };

    // persist: add gold to player and update machine
    await changePlayerGold(playerId, Math.round(result.final));
    await upsertMachine(newMachineState);

    return res.status(200).json({
      success: true,
      result,
      newMachineState,
      note: 'Persisted to DB (players.gold updated, machine updated)'
    });
  } catch (err: any) {
    console.error('claim error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
