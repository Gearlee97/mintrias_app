import { NextApiRequest, NextApiResponse } from 'next';
import { getMachineById, updateMachine } from '../../../services/machine';
import { DEFAULT_REPAIR_PCT } from '../../../engine/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { machineId } = req.body;
    if (!machineId) {
      return res.status(400).json({ error: 'machineId is required' });
    }

    const machine = await getMachineById(machineId);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const newHealth = Math.min(100, machine.healthPct + DEFAULT_REPAIR_PCT);

    const updated = await updateMachine(machineId, {
      healthPct: newHealth,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      ok: true,
      repairedTo: newHealth,
      machine: updated,
    });
  } catch (err: any) {
    console.error('Repair error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
