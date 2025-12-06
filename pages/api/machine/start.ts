import type { NextApiRequest, NextApiResponse } from 'next';
import { applyLabToMachine } from '../../../engine/machine';
import { buildDefaultLabState } from '../../../engine/lab';
import { updateMachineState } from '../../../services/machine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { playerId, machine, labState } = req.body;
    if (!playerId || !machine) return res.status(400).json({ error: 'playerId and machine required' });

    const lab = labState ?? buildDefaultLabState();
    const machineAfterLab = applyLabToMachine(machine, lab);

    const runningState = {
      ...machineAfterLab,
      running: true,
      startedAt: Date.now(),
      lastHeartbeat: Date.now(),
    };

    await updateMachineState(machine.id ?? machineIdFrom(machine), runningState);

    return res.status(200).json({ success: true, machine: runningState, note: 'Session started and persisted.' });
  } catch (err: any) {
    console.error('start error', err);
    return res.status(500).json({ error: 'internal' });
  }
}

function machineIdFrom(m: any) {
  return m?.id ?? `machine-${Math.random().toString(36).slice(2,9)}`;
}
