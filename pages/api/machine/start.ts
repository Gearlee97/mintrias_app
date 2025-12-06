import type { NextApiRequest, NextApiResponse } from 'next';
import { startSession } from '../../../engine/machine';
import { buildDefaultLabState } from '../../../engine/lab';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { playerId, machine, labState } = req.body;

    if (!playerId || !machine) {
      return res.status(400).json({ error: 'playerId and machine required' });
    }

    const lab = labState ?? buildDefaultLabState();

    const started = startSession(machine, lab);

    if (!started.success) {
      return res.status(400).json({ success: false, error: started.error });
    }

    return res.status(200).json({
      success: true,
      newMachineState: started.newMachineState,
      note: 'Demo stateless: persist ke DB kalau production'
    });
  } catch (err) {
    console.error('start error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
