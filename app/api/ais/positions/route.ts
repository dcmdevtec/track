import { type NextRequest, NextResponse } from "next/server"

/**
 * /api/ais/positions
 * Proxy para obtener datos de barcos desde AISStream.io
 *
 * AISStream.io usa principalmente WebSockets, pero tiene algunos endpoints REST
 * para datos históricos y consultas específicas.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const limit = Number.parseInt(searchParams.get("limit") ?? "100")
  const apiKey = process.env.AISSTREAM_API_KEY ?? "c6c4f1897fe584d2ae5556af3c1365ec1d66d3f2"

  try {
    // AISStream.io no tiene un endpoint público para "last_known_positions"
    // En su lugar, usaremos datos simulados realistas o una API alternativa

    // Opción 1: Datos simulados realistas para desarrollo
    const mockShips = generateMockShipData(limit)

    return NextResponse.json({
      data: mockShips,
      source: "mock_data",
      timestamp: new Date().toISOString(),
    })

    // Opción 2: Si tienes acceso a la API premium de AISStream
    // const response = await fetch(`https://api.aisstream.io/v0/vessels`, {
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
  } catch (error) {
    console.error("AIS API Error:", error)

    // Devolver datos de fallback en caso de error
    const fallbackShips = generateMockShipData(Math.min(limit, 20))

    return NextResponse.json({
      data: fallbackShips,
      source: "fallback_data",
      error: "API temporarily unavailable",
      timestamp: new Date().toISOString(),
    })
  }
}

// Función para generar datos de barcos realistas para desarrollo
function generateMockShipData(count: number) {
  const ships = []

  // Coordenadas del Caribe y costas colombianas
  const regions = [
    { name: "Cartagena", lat: 10.4, lon: -75.5, radius: 2 },
    { name: "Barranquilla", lat: 11.0, lon: -74.8, radius: 1.5 },
    { name: "Santa Marta", lat: 11.2, lon: -74.2, radius: 1 },
    { name: "Buenaventura", lat: 3.9, lon: -77.0, radius: 1.5 },
    { name: "Canal de Panamá", lat: 9.0, lon: -79.5, radius: 3 },
  ]

  const shipTypes = ["Container Ship", "Bulk Carrier", "Tanker", "General Cargo", "Vehicle Carrier"]
  const destinations = ["COBUN", "COCTG", "COBAQ", "COSMT", "PANAMA", "MIAMI", "HOUSTON"]

  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)]
    const lat = region.lat + (Math.random() - 0.5) * region.radius
    const lon = region.lon + (Math.random() - 0.5) * region.radius

    ships.push({
      Mmsi: 200000000 + Math.floor(Math.random() * 99999999),
      Latitude: lat,
      Longitude: lon,
      Sog: Math.random() * 20, // Speed over ground
      Cog: Math.random() * 360, // Course over ground
      ShipName: `MV ${generateShipName()}`,
      ShipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
      Destination: destinations[Math.floor(Math.random() * destinations.length)],
      Timestamp: new Date().toISOString(),
      Length: 150 + Math.random() * 250,
      Width: 20 + Math.random() * 20,
      Draught: 5 + Math.random() * 10,
    })
  }

  return ships
}

function generateShipName(): string {
  const prefixes = ["EVER", "MSC", "MAERSK", "CMA", "COSCO", "HAPAG", "ONE", "YANG MING"]
  const suffixes = ["GLORY", "SPIRIT", "HARMONY", "VICTORY", "PIONEER", "EXPLORER", "NAVIGATOR", "VOYAGER"]

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]

  return `${prefix} ${suffix}`
}
