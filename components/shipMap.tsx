"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useShipStream } from "@/hooks/useShipStream"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Ícono personalizado para barcos
const shipIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/235/235861.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function ShipMap() {
  const { ships, loading, error, lastUpdate, refetch } = useShipStream()

  if (loading) {
    return (
      <div className="h-[600px] w-full rounded-lg border bg-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando datos de barcos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[600px] w-full rounded-lg border bg-destructive/10 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <p className="text-destructive font-medium mb-2">Error al cargar datos de barcos</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full rounded-lg border overflow-hidden">
      {/* Header con información */}
      <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{ships.length} barcos en tiempo real</span>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Última actualización: {new Date(lastUpdate).toLocaleTimeString("es-CO")}
            </span>
          )}
        </div>
        <Button onClick={refetch} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Mapa */}
      <div className="h-[calc(100%-60px)]">
        <MapContainer
          center={[10.4, -75.5]} // Centrado en Cartagena, Colombia
          zoom={6}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {ships.map((ship) => (
            <Marker key={ship.MMSI} position={[ship.LAT, ship.LON]} icon={shipIcon}>
              <Popup>
                <div className="space-y-2 min-w-[200px]">
                  <h3 className="font-semibold text-base">{ship.ShipName}</h3>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">MMSI:</span>
                      <br />
                      {ship.MMSI}
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span>
                      <br />
                      {ship.ShipType}
                    </div>
                    <div>
                      <span className="font-medium">Velocidad:</span>
                      <br />
                      {ship.SOG.toFixed(1)} nudos
                    </div>
                    <div>
                      <span className="font-medium">Rumbo:</span>
                      <br />
                      {ship.COG.toFixed(0)}°
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Posición:</span>
                    <br />
                    {ship.LAT.toFixed(4)}, {ship.LON.toFixed(4)}
                  </div>

                  {ship.Destination && (
                    <div className="text-sm">
                      <span className="font-medium">Destino:</span>
                      <br />
                      {ship.Destination}
                    </div>
                  )}

                  {ship.Length && (
                    <div className="text-sm">
                      <span className="font-medium">Dimensiones:</span>
                      <br />
                      {ship.Length.toFixed(0)}m × {ship.Width?.toFixed(0) || "N/A"}m
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
