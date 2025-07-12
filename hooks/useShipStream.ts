"use client"

import { useEffect, useState } from "react"

type ShipData = {
  MMSI: number
  LAT: number
  LON: number
  SOG: number // speed over ground
  COG: number // course over ground
  ShipName: string
  ShipType?: string
  Destination?: string
  ETA?: string
}

export function useShipStream() {
  const [ships, setShips] = useState<ShipData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const fetchShipData = async () => {
      try {
        setError(null)

        // Usar la API REST de AISStream para obtener datos de barcos
        const response = await fetch("https://api.aisstream.io/v0/last_known_positions", {
          method: "GET",
          headers: {
            "X-API-Key": "c6c4f1897fe584d2ae5556af3c1365ec1d66d3f2",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("AISStream data received:", data)

        // Procesar los datos según la estructura de respuesta de AISStream
        if (data && Array.isArray(data)) {
          const processedShips: ShipData[] = data
            .slice(0, 100)
            .map((ship: any) => ({
              MMSI: ship.Mmsi || ship.mmsi || 0,
              LAT: ship.Latitude || ship.lat || ship.Lat || 0,
              LON: ship.Longitude || ship.lon || ship.Lon || 0,
              SOG: ship.Sog || ship.sog || ship.SOG || 0,
              COG: ship.Cog || ship.cog || ship.COG || 0,
              ShipName: ship.ShipName || ship.shipName || ship.VesselName || `Ship ${ship.Mmsi || ship.mmsi}`,
              ShipType: ship.ShipType || ship.shipType || "Unknown",
              Destination: ship.Destination || ship.destination || "",
              ETA: ship.ETA || ship.eta || "",
            }))
            .filter((ship) => ship.LAT !== 0 && ship.LON !== 0) // Filtrar coordenadas válidas

          setShips(processedShips)
          console.log(`Processed ${processedShips.length} ships`)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching ship data:", error)
        setError(error instanceof Error ? error.message : "Unknown error")
        setLoading(false)

        // Datos de prueba si falla la API
        setShips([
          {
            MMSI: 123456789,
            LAT: 10.4806,
            LON: -75.5133,
            SOG: 12.5,
            COG: 180,
            ShipName: "Test Ship 1",
            ShipType: "Cargo",
            Destination: "CARTAGENA",
          },
          {
            MMSI: 987654321,
            LAT: 11.0041,
            LON: -74.807,
            SOG: 8.3,
            COG: 90,
            ShipName: "Test Ship 2",
            ShipType: "Container",
            Destination: "BARRANQUILLA",
          },
        ])
      }
    }

    // Fetch inicial
    fetchShipData()

    // Actualizar cada 30 segundos
    intervalId = setInterval(fetchShipData, 30000)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  return { ships, loading, error }
}
