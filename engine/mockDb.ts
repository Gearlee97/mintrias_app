/**
 * engine/mockDb.ts
 * Minimal in-memory "DB" untuk development/local testing.
 * Reset setiap restart server. Nanti ganti ke MongoDB saat siap.
 */

type AnyObj = Record<string, any>;

const machines: Record<string, AnyObj> = {};
const players: Record<string, AnyObj> = {};

// Machines
export function saveMachine(id: string, data: AnyObj) {
  machines[id] = data;
}

export function getMachine(id: string) {
  return machines[id] ?? null;
}

export function listMachines() {
  return Object.values(machines);
}

export function deleteMachine(id: string) {
  delete machines[id];
}

// Players
export function savePlayer(id: string, data: AnyObj) {
  players[id] = data;
}

export function getPlayer(id: string) {
  return players[id] ?? null;
}

export function listPlayers() {
  return Object.values(players);
}

export function deletePlayer(id: string) {
  delete players[id];
}

// helper: seed convenience (dev only)
export function seedMachine(id: string, data: AnyObj) {
  machines[id] = { ...data };
}

export function clearAll() {
  for (const k of Object.keys(machines)) delete machines[k];
  for (const k of Object.keys(players)) delete players[k];
}
