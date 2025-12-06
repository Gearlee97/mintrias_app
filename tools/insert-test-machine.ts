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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const res = await createOrReplaceMachine(doc);
    console.log('OK inserted/updated:', res?.id ?? res);
    console.log('result:', JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

main().catch(console.error);
