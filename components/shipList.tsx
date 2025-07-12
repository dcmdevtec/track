"use client"

import { useShipStream } from "../hooks/useShipStream"

export default function ShipList() {
  const { ships, loading, error } = useShipStream()

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Barcos en Tiempo Real</h2>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando datos de barcos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Barcos en Tiempo Real</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">Error: {error}</p>
          <p className="text-sm text-gray-600 mt-1">Mostrando datos de prueba</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Barcos en Tiempo Real ({ships.length})</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">MMSI</th>
              <th className="border p-2">Latitud</th>
              <th className="border p-2">Longitud</th>
              <th className="border p-2">Velocidad (SOG)</th>
              <th className="border p-2">Rumbo (COG)</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Destino</th>
            </tr>
          </thead>
          <tbody>
            {ships.map((ship) => (
              <tr key={ship.MMSI} className="hover:bg-gray-50">
                <td className="border p-2">{ship.ShipName}</td>
                <td className="border p-2">{ship.MMSI}</td>
                <td className="border p-2">{ship.LAT.toFixed(4)}</td>
                <td className="border p-2">{ship.LON.toFixed(4)}</td>
                <td className="border p-2">{ship.SOG} kn</td>
                <td className="border p-2">{ship.COG}°</td>
                <td className="border p-2">{ship.ShipType || "N/A"}</td>
                <td className="border p-2">{ship.Destination || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ships.length === 0 && <div className="text-center p-8 text-gray-500">No hay datos de barcos disponibles</div>}
    </div>
  )
}
