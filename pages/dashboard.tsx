import dynamic from "next/dynamic";
import React from "react";

const MachineDashboard = dynamic(() => import("../components/MachineDashboard"), { ssr: false });

export default function DashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <MachineDashboard machineId="test123" />
    </div>
  );
}
