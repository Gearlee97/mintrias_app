// app/inventory/page.tsx
export default function InventoryPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-zinc-900">Inventory</h1>

      <p className="mt-4 text-zinc-600">Your items will appear here. For now, this is a placeholder.</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 border rounded flex flex-col items-center">
          <div className="w-12 h-12 bg-zinc-100 rounded mb-2" />
          <div className="text-sm font-medium">Pickaxe</div>
          <div className="text-xs text-zinc-500">Level 1</div>
        </div>

        <div className="p-3 border rounded flex flex-col items-center">
          <div className="w-12 h-12 bg-zinc-100 rounded mb-2" />
          <div className="text-sm font-medium">Backpack</div>
          <div className="text-xs text-zinc-500">Capacity +4</div>
        </div>

        {/* Add more placeholder slots */}
      </div>
    </div>
  );
}
