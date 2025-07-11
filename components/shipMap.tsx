// app/ship-tracker/components/ShipMap.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useShipStream } from "../hooks/useShipStream";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// 🔧 Fix común para íconos por defecto que fallan
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Ícono personalizado para barco
const shipIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/235/235861.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function ShipMap() {
  const ships = useShipStream();

  return (
    <div className="h-[600px] w-full rounded shadow mt-6">
      <MapContainer
        center={[15, -75]}
        zoom={4}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {ships.map((ship) => (
          <Marker
            key={ship.MMSI}
            position={[ship.LAT, ship.LON]}
            icon={shipIcon}
          >
            <Popup>
              <strong>{ship.ShipName || "Sin nombre"}</strong>
              <br />
              MMSI: {ship.MMSI}
              <br />
              Velocidad: {ship.SOG} kn
              <br />
              Rumbo: {ship.COG}°
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
