import type { NextApiRequest, NextApiResponse } from 'next';
import { computeStatus } from '../../../engine/machine';
import { getMachine as getMachineFromService } from '../../../services/machine';

/**
 * GET or POST:
 * - POST: body { machine } -> compute status from provided object (stateless)
 * - GET: ?id=machine-1 -> load from DB (requires services/machine)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id || '');
      if (!id) return res.status(400).json({ error: 'id required' });
      const doc = await getMachineFromService(id);
      if (!doc) return res.status(404).json({ error: 'machine not found' });
      const status = computeStatus(doc);
      return res.status(200).json({ success: true, status, machine: doc });
    }

    if (req.method === 'POST') {
      const { machine } = req.body;
      if (!machine) return res.status(400).json({ error: 'machine required in body' });
      const status = computeStatus(machine);
      return res.status(200).json({ success: true, status });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('status error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
