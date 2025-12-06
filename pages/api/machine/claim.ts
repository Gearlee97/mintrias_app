import type { NextApiRequest, NextApiResponse } from 'next';
import { applyLabToMachine, claimSession } from '../../../engine/machine';
import { buildDefaultLabState } from '../../../engine/lab';
import { getDb } from '../../../lib/mongodb';
import { updateMachine, getMachineById, addGold } from '../../../services/machine'; // note: addGold actually in player service; we will call player update inline

// small helper: update player gold
async function creditPlayer(playerId: string, amount: number) {
  const db = await getDb();
  await db.collection('players').updateOne(
    { id: playerId },
    { $inc: { gold: amount }, $set: { updatedAt: new Date() } },
    { upsert: true }
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { playerId, machine: machinePayload, labState } = req.body;
    if (!playerId || !machinePayload) {
      return res.status(400).json({ error: 'playerId and machine required' });
    }

    // fetch machine from DB (ensure authoritative)
    const db = await getDb();
    const machine = await db.collection('machines').findOne({ id: machinePayload.id });

    if (!machine) {
      return res.status(404).json({ error: 'machine not found' });
    }

    const lab = labState ?? buildDefaultLabState();
    const machineAfterLab = applyLabToMachine(machine, lab);

    const result = claimSession(machineAfterLab, { electricBillPct: 1, decayPerClaim: 5 });

    const newMachineState = {
      ...machineAfterLab,
      healthPct: Math.max(0, (machineAfterLab.healthPct ?? 100) - 5),
      running: false,
      progressSec: 0,
      complete: false,
      lastClaimAt: Date.now(),
      updatedAt: new Date()
    };

    // persist machine changes
    await db.collection('machines').updateOne({ id: machineAfterLab.id }, { $set: newMachineState });

    // credit player gold (result.final assumed numeric)
    if (result?.final && typeof result.final === 'number' && result.final > 0) {
      await creditPlayer(playerId, result.final);
    }

    return res.status(200).json({
      success: true,
      result,
      newMachineState
    });
  } catch (err: any) {
    console.error('claim error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
