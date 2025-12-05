// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md bg-white/60 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">Resources</h2>
          <p className="mt-2 text-zinc-500 text-sm">Coins: <span className="font-semibold">120</span></p>
          <p className="text-zinc-500 text-sm">Energy: <span className="font-semibold">8/10</span></p>
        </div>

        <div className="p-4 border rounded-md bg-white/60 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">Missions</h2>
          <p className="mt-2 text-zinc-500 text-sm">No active missions. Start mining to get rewards.</p>
        </div>

        <div className="p-4 border rounded-md bg-white/60 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">Activity</h2>
          <p className="mt-2 text-zinc-500 text-sm">Last login: a few minutes ago</p>
        </div>
      </div>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-zinc-800">Quick Actions</h3>
        <div className="mt-3 flex gap-2">
          <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm">Start Mining</button>
          <button className="px-4 py-2 rounded border text-sm">Open Inventory</button>
        </div>
      </section>
    </div>
  );
}
