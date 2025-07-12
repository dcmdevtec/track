// app/ship-tracker/components/ShipMap.tsx
"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useShipStream } from "../hooks/useShipStream"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix común para íconos por defecto que fallan
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Ícono personalizado para barco
const shipIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/235/235861.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function ShipMap() {
  const { ships, loading, error } = useShipStream()

  console.log("ShipMap render:", { shipsCount: ships.length, loading, error })

  if (loading) {
    return (
      <div className="h-[600px] w-full rounded shadow mt-6 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de barcos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[600px] w-full rounded shadow mt-6 flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar datos de barcos:</p>
          <p className="text-red-500 text-sm">{error}</p>
          <p className="text-gray-600 text-sm mt-2">Mostrando datos de prueba</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full rounded shadow mt-6">
      <div className="mb-2 p-2 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">Mostrando {ships.length} barcos en tiempo real</p>
      </div>

      <MapContainer
        center={[15, -75]} // Centrado en el Caribe
        zoom={4}
        scrollWheelZoom
        style={{ height: "calc(100% - 40px)", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {ships.map((ship) => (
          <Marker key={ship.MMSI} position={[ship.LAT, ship.LON]} icon={shipIcon}>
            <Popup>
              <div className="p-2">
                <strong>{ship.ShipName || "Sin nombre"}</strong>
                <br />
                <strong>MMSI:</strong> {ship.MMSI}
                <br />
                <strong>Posición:</strong> {ship.LAT.toFixed(4)}, {ship.LON.toFixed(4)}
                <br />
                <strong>Velocidad:</strong> {ship.SOG} nudos
                <br />
                <strong>Rumbo:</strong> {ship.COG}°
                {ship.ShipType && (
                  <>
                    <br />
                    <strong>Tipo:</strong> {ship.ShipType}
                  </>
                )}
                {ship.Destination && (
                  <>
                    <br />
                    <strong>Destino:</strong> {ship.Destination}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
