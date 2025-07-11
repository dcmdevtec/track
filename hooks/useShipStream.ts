// app/ship-tracker/hooks/useShipStream.ts
"use client";

import { useEffect, useRef, useState } from "react";

type ShipData = {
  MMSI: number;
  LAT: number;
  LON: number;
  SOG: number; // speed over ground
  COG: number; // course over ground
  ShipName: string;
};

export function useShipStream() {
  const [ships, setShips] = useState<ShipData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Determinar el protocolo y el host para conectarse a TU PROPIO PROXY
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // CONÉCTATE A LA RUTA API QUE CREASTE EN TU SERVIDOR
    const ws = new WebSocket(`${protocol}//${host}/api/websocket/ais-stream`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Cliente conectado a nuestro proxy WebSocket de Next.js.');
      // NO necesitas enviar la clave API ni los filtros desde aquí.
      // Tu servidor ya maneja la suscripción a AisStream.io.
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // La estructura de los mensajes que recibes del proxy será la misma
        // que AisStream.io envía, ya que el proxy solo los reenvía.
        const payload = message.Message?.PositionReport;
        if (payload) {
          setShips((prev) => {
            const exists = prev.find((ship) => ship.MMSI === payload.MMSI);
            if (exists) {
              return prev.map((s) =>
                s.MMSI === payload.MMSI
                  ? {
                      ...s,
                      LAT: payload.Lat,
                      LON: payload.Lon,
                      SOG: payload.Sog,
                      COG: payload.Cog,
                    }
                  : s
              );
            }
            return [
              ...prev,
              {
                MMSI: payload.MMSI,
                LAT: payload.Lat,
                LON: payload.Lon,
                SOG: payload.Sog,
                COG: payload.Cog,
                ShipName: payload.ShipName || "N/A",
              },
            ];
          });
        } else {
          console.warn("Mensaje recibido sin PositionReport o estructura inesperada:", message);
        }
      } catch (error) {
        console.error("❌ Error al parsear mensaje de WebSocket desde el proxy:", error, event.data);
      }
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket del cliente cerrado:", event);
      // Aquí puedes implementar lógica para intentar reconectar al proxy
      // si la conexión se cierra inesperadamente.
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket del cliente error:", error);
    };

    return () => {
      if (wsRef.current) {
        console.log("Cerrando WebSocket del cliente en cleanup.");
        wsRef.current.close();
      }
    };
  }, []);

  return ships;
}