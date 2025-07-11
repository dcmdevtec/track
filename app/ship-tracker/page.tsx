
"use client"

import dynamic from "next/dynamic";
import ShipList from "@/components/shipList";
import { SidebarTrigger } from "@/components/ui/sidebar";


const ShipMap = dynamic(() => import("@/components/shipMap"), { ssr: false });


export default function ShipTrackerPage() {
  return (
  
     
      <div className="flex flex-col h-screen">
      <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Pruebas de API</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Panel de pruebas para ShipsGo API</p>
        </div>
        
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
       <ShipList />
        <ShipMap />
      </div>
    </div>
  
  );
}
