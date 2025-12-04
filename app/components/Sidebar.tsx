import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r p-4 hidden md:block">
      <nav>
        <ul className="space-y-2 text-sm">
          <li>Overview</li>
          <li>Projects</li>
          <li>Settings</li>
        </ul>
      </nav>
    </aside>
  );
}
