import React, { useEffect, useState, useRef } from "react";

// MachineDashboard.tsx
// Single-file React component (Tailwind) that provides:
// - Start / Claim buttons
// - Progress bar + elapsed / duration / ETA
// - Auto-polling (2s default) for /api/machine/status
// - Simple optimistic UI + error handling

type Machine = {
  id: string;
  running?: boolean;
  startedAt?: string | null;
  progressSec?: number;
  durationSec?: number;
  baseRate?: number;
  effectiveRate?: number;
};

type StatusResponse = {
  success: boolean;
  status?: {
    running: boolean;
    elapsed: number;
    progressSec: number;
    duration: number;
    complete: boolean;
    effectiveRate: number;
  };
  machine?: Machine;
  error?: string;
};

const defaultMachineId = "test123"; // change if needed

export default function MachineDashboard({ machineId = defaultMachineId }: { machineId?: string }) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [status, setStatus] = useState<StatusResponse["status"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const pollInterval = 2000; // ms

  useEffect(() => {
    // initial fetch and start polling
    fetchStatus();
    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineId]);

  function addLog(line: string) {
    setLog((s) => [new Date().toLocaleTimeString() + " — " + line, ...(s || [])].slice(0, 50));
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchStatus, pollInterval);
  }

  function stopPolling() {
    if (!pollRef.current) return;
    clearInterval(pollRef.current);
    pollRef.current = null;
  }

  async function fetchStatus() {
    try {
      const res = await fetch(`/api/machine/status?id=${encodeURIComponent(machineId)}`);
      const json: StatusResponse = await res.json();
      if (!json.success) {
        setLastError(json.error || "unknown");
        addLog(`status error: ${json.error ?? "unknown"}`);
        return;
      }
      if (json.machine) setMachine(json.machine);
      if (json.status) setStatus(json.status);
    } catch (err: any) {
      setLastError(err?.message ?? String(err));
      addLog("fetch status failed: " + (err?.message ?? String(err)));
    }
  }

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch(`/api/machine/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: machineId }),
      });
      const json = await res.json();
      if (!json.success) {
        setLastError(json.error || "start failed");
        addLog("start failed: " + (json.error ?? "unknown"));
      } else {
        addLog("start ok");
        // optimistic refresh
        fetchStatus();
      }
    } catch (err: any) {
      setLastError(err?.message ?? String(err));
      addLog("start request error: " + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/machine/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: machineId }),
      });
      const json = await res.json();
      if (!json.success) {
        setLastError(json.error || "claim failed");
        addLog("claim failed: " + (json.error ?? "unknown"));
      } else {
        addLog("claim ok: reward=" + JSON.stringify(json.rewards ?? json.reward ?? {}));
        // refresh after claim
        fetchStatus();
      }
    } catch (err: any) {
      setLastError(err?.message ?? String(err));
      addLog("claim request error: " + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }

  const percent = (() => {
    if (!status || !status.duration) return 0;
    const p = Math.floor(((status.progressSec ?? 0) / status.duration) * 100);
    return Math.max(0, Math.min(100, p));
  })();

  const eta = (() => {
    if (!status || !status.duration) return null;
    const remaining = Math.max(0, status.duration - (status.progressSec ?? 0));
    const ts = new Date(Date.now() + remaining * 1000);
    return ts.toLocaleTimeString();
  })();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Machine • {machineId}</h2>
        <div className="text-sm text-slate-500">Auto-poll every {pollInterval / 1000}s</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm font-medium">Progress</div>
            <div className="text-sm text-slate-500">{percent}%</div>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded overflow-hidden">
            <div
              className="h-3 rounded bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 mb-4">
          <div>
            <div className="text-xs text-slate-400">Elapsed</div>
            <div className="font-mono">{status ? `${status.elapsed}s` : "—"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Duration</div>
            <div className="font-mono">{status ? `${status.duration}s` : (machine?.durationSec ?? "—")}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">ETA</div>
            <div className="font-mono">{eta ?? "—"}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStart}
            disabled={loading || (status?.running ?? machine?.running ?? false)}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            Start
          </button>

          <button
            onClick={handleClaim}
            disabled={loading || !(status?.complete ?? false)}
            className="px-4 py-2 rounded bg-amber-500 text-black disabled:opacity-50"
          >
            Claim
          </button>

          <button
            onClick={() => fetchStatus()}
            className="px-3 py-2 rounded border text-sm"
          >
            Refresh
          </button>

          <div className="ml-auto text-xs text-slate-500">Running: {String(status?.running ?? machine?.running ?? false)}</div>
        </div>

        {lastError && (
          <div className="mt-3 text-sm text-red-600">Error: {lastError}</div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Machine raw</div>
        <pre className="bg-black text-white p-3 rounded text-xs overflow-auto max-h-44">{JSON.stringify(machine, null, 2)}</pre>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Logs</div>
        <div className="bg-slate-50 border rounded p-2 text-xs max-h-40 overflow-auto">
          {log.length === 0 ? (
            <div className="text-slate-400">No logs yet. Interact with Start / Claim.</div>
          ) : (
            log.map((l, i) => <div key={i} className="pb-1 border-b last:border-b-0">{l}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
