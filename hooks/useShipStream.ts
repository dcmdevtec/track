"use client"

import { useState, useEffect } from "react"

interface Ship {
  MMSI: number
  LAT: number
  LON: number
  SOG: number
  COG: number
  ShipName: string
  ShipType: string
  Destination: string
  Timestamp?: string
  Length?: number
  Width?: number
  Draught?: number
}

export const useShipStream = () => {
  const [ships, setShips] = useState<Ship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchShipData = async () => {
    try {
      setError(null)

      const res = await fetch("/api/ais/positions?limit=150", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Verificar si la respuesta es JSON válida
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta no es JSON válido")
      }

      const body = await res.json()

      if (!res.ok) {
        throw new Error(body.error ?? `Error del servidor: ${res.status}`)
      }

      // Procesar los datos recibidos
      const processed = (Array.isArray(body.data) ? body.data : [])
        .map((s: any) => ({
          MMSI: Number(s.Mmsi ?? s.mmsi ?? s.MMSI ?? 0),
          LAT: Number(s.Latitude ?? s.lat ?? s.Lat ?? s.LAT ?? 0),
          LON: Number(s.Longitude ?? s.lon ?? s.Lon ?? s.LON ?? 0),
          SOG: Number(s.Sog ?? s.sog ?? s.SOG ?? 0),
          COG: Number(s.Cog ?? s.cog ?? s.COG ?? 0),
          ShipName: String(s.ShipName ?? s.shipName ?? s.VesselName ?? `Ship ${s.Mmsi ?? s.mmsi}`),
          ShipType: s.ShipType ?? s.shipType ?? s.VesselType ?? "Unknown",
          Destination: s.Destination ?? s.destination ?? "",
          Timestamp: s.Timestamp ?? s.timestamp,
          Length: s.Length ?? s.length,
          Width: s.Width ?? s.width,
          Draught: s.Draught ?? s.draught,
        }))
        .filter((d:any) => d.LAT !== 0 && d.LON !== 0 && d.MMSI !== 0)

      setShips(processed)
      setLastUpdate(body.timestamp || new Date().toISOString())
      setLoading(false)

      console.log(`✅ Datos actualizados: ${processed.length} barcos cargados`)
    } catch (e: any) {
      console.error("❌ Error en useShipStream:", e)
      setError(`Error al cargar datos: ${e?.message ?? "Error desconocido"}`)
      setLoading(false)

      // No establecer datos de fallback aquí, dejar que el componente maneje el error
    }
  }

  useEffect(() => {
    // Carga inicial
    fetchShipData()

    // Actualizar cada 30 segundos
    const intervalId = setInterval(() => {
      fetchShipData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  return {
    ships,
    loading,
    error,
    lastUpdate,
    refetch: fetchShipData,
  }
}
