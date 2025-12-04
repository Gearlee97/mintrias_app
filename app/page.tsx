import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-blue-600">Mintrias Dashboard</h2>
          <p className="mt-2 text-sm text-gray-500">Your app is running successfully 🚀</p>
        </div>
      </main>
    </div>
  );
}
