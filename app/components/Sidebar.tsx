// app/components/Sidebar.tsx
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r p-4 hidden md:block">
      <nav>
        <ul className="space-y-3 text-sm">
          <li>
            <Link href="/dashboard" className="hover:text-blue-600">
              Overview
            </Link>
          </li>

          <li>
            <Link href="/inventory" className="hover:text-blue-600">
              Inventory
            </Link>
          </li>

          <li>
            <Link href="/home" className="hover:text-blue-500">
              Home
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
