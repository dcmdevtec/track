
"use client";

import { useShipStream } from "../hooks/useShipStream";

export default function ShipList() {
  const ships = useShipStream();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Barcos en Tiempo Real</h2>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">MMSI</th>
            <th className="border p-2">Latitud</th>
            <th className="border p-2">Longitud</th>
            <th className="border p-2">Velocidad (SOG)</th>
            <th className="border p-2">Rumbo (COG)</th>
          </tr>
        </thead>
        <tbody>
          {ships.map((ship) => (
            <tr key={ship.MMSI}>
              <td className="border p-2">{ship.ShipName}</td>
              <td className="border p-2">{ship.MMSI}</td>
              <td className="border p-2">{ship.LAT.toFixed(4)}</td>
              <td className="border p-2">{ship.LON.toFixed(4)}</td>
              <td className="border p-2">{ship.SOG} kn</td>
              <td className="border p-2">{ship.COG}°</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
