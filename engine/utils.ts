// engine/utils.ts
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const toFixedNumber = (v: number, decimals = 2) =>
  Number(v.toFixed(decimals));

export function secondsToHMS(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
                                                                      }
