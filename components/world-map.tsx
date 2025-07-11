"use client"

import { useEffect, useRef } from "react"

export function WorldMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Aquí se integraría con una librería de mapas como Leaflet o Google Maps
    // Por ahora mostramos un placeholder responsive
  }, [])

  return (
    <div
      ref={mapRef}
      className="w-full h-[300px] lg:h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden transition-colors duration-200"
    >
      {/* Placeholder del mapa mundial responsive */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 transition-colors duration-200">
        {/* Simulación de puntos en el mapa - Responsive */}
        <div
          className="absolute top-1/4 left-1/3 w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full animate-pulse"
          title="Barco en Pacífico"
        />
        <div
          className="absolute top-1/3 left-2/3 w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"
          title="Puerto de Shanghai"
        />
        <div
          className="absolute top-2/3 right-1/4 w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded-full animate-pulse"
          title="Puerto de Buenaventura"
        />
        <div
          className="absolute top-1/2 left-1/4 w-2 h-2 lg:w-3 lg:h-3 bg-yellow-500 rounded-full animate-pulse"
          title="Barco en Atlántico"
        />

        {/* Rutas simuladas - Responsive */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 100 50 Q 150 75 200 60"
            stroke="#3b82f6"
            strokeWidth="1"
            fill="none"
            strokeDasharray="3,3"
            className="animate-pulse lg:stroke-2 lg:stroke-dasharray-5-5"
          />
          <path
            d="M 50 100 Q 125 90 175 110"
            stroke="#10b981"
            strokeWidth="1"
            fill="none"
            strokeDasharray="3,3"
            className="animate-pulse lg:stroke-2 lg:stroke-dasharray-5-5"
          />
        </svg>
      </div>

      <div className="text-center z-10 bg-white/80 dark:bg-gray-900/80 p-3 lg:p-4 rounded-lg backdrop-blur-sm transition-colors duration-200">
        <p className="text-sm font-medium text-foreground">Mapa Mundial Interactivo</p>
        <p className="text-xs text-muted-foreground mt-1">247 contenedores en tránsito • 15 barcos activos</p>
      </div>
    </div>
  )
}
