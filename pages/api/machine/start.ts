import type { NextApiRequest, NextApiResponse } from 'next';
import { ensurePlayer } from '../../../services/player';
import { getMachineById, updateMachineState } from '../../../services/machine';
import { computeLabBuffs } from '../../../engine/utils';
import { buildDefaultLabState } from '../../../engine/lab';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') 
    return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { playerId, machineId, labState } = req.body;

    if (!playerId || !machineId)
      return res.status(400).json({ error: 'playerId & machineId required' });

    await ensurePlayer(playerId);

    const machine = await getMachineById(machineId);
    if (!machine)
      return res.status(404).json({ error: 'machine not found' });

    // Cannot start if running
    if (machine.running)
      return res.status(400).json({ error: 'Machine already running' });

    // Cannot start if health = 0
    if ((machine.healthPct ?? 100) <= 0)
      return res.status(400).json({ error: 'Machine broken — repair first' });

    // LAB BUFFS
    const lab = labState ?? buildDefaultLabState();
    const buffs = computeLabBuffs(lab);

    const effectiveRate = (machine.baseRate + buffs.flatAdd) * buffs.multiplier;
    const effectiveDurationSec = machine.durationSec + buffs.extraDurationSec;

    const now = Date.now();

    const newState = {
      ...machine,
      running: true,
      progressSec: 0,
      effectiveRate,
      effectiveDurationSec,
      startedAt: now,
      nextReadyAt: now + effectiveDurationSec * 1000,
      updatedAt: new Date(),
    };

    await updateMachineState(machineId, newState);

    return res.status(200).json({
      success: true,
      message: "Session started",
      newMachineState: newState
    });
  } catch (err: any) {
    console.error("start session error", err);
    return res.status(500).json({ error: 'internal' });
  }
}
