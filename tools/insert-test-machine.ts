import { createOrReplaceMachine } from '../services/machine';

async function main() {
  const doc = {
    id: 'test123',
    baseRate: 0.5,
    durationSec: 3600,
    progressSec: 0,
    healthPct: 100,
    running: false,
    startAt: null,
  };

  const res = await createOrReplaceMachine(doc);
  console.log("DONE:", res);
}

main().catch(console.error);
