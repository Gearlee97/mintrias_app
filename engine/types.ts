export interface Machine {
  id: string;
  baseRate?: number;
  durationSec?: number;
  healthPct?: number;
  running?: boolean;
  progressSec?: number;
  lastClaimAt?: number | null;

  startAt?: number | null;
  effectiveRate?: number;
  effectiveDurationSec?: number;
  complete?: boolean;
}

export interface LabState {
  slots: any[];
}
