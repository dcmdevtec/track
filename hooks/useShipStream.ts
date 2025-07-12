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
}

const useShipStream = () => {
  const [ships, setShips] = useState<Ship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShipData = async () => {
    try {
      setError(null)
      const res = await fetch("/api/ais/positions?limit=150")
      if (!res.ok) throw new Error(`API ${res.status}`)
      const { data } = await res.json()

      const processed = (Array.isArray(data) ? data : [])
        .map((s: any) => ({
          MMSI: Number(s.Mmsi ?? s.mmsi ?? 0),
          LAT: Number(s.Latitude ?? s.lat ?? s.Lat ?? 0),
          LON: Number(s.Longitude ?? s.lon ?? s.Lon ?? 0),
          SOG: Number(s.Sog ?? s.sog ?? 0),
          COG: Number(s.Cog ?? s.cog ?? 0),
          ShipName: String(s.ShipName ?? s.shipName ?? `Ship ${s.Mmsi}`),
          ShipType: s.ShipType ?? "",
          Destination: s.Destination ?? "",
        }))
        .filter((d) => d.LAT && d.LON)

      setShips(processed)
      setLoading(false)
    } catch (e) {
      console.error("useShipStream:", e)
      setError("No se pudieron obtener los datos de AISStream")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShipData()

    const intervalId = setInterval(() => {
      fetchShipData()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [])

  return { ships, loading, error }
}

export default useShipStream
