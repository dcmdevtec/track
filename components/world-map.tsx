'use client';

import dynamic from "next/dynamic";

// Carga ShipMap sin SSR
const ShipMap = dynamic(() => import("@/components/shipMap"), { ssr: false });

export default function ClientShipMap() {
  return <ShipMap />;
}
