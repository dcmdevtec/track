import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Verificar si es una solicitud de upgrade a WebSocket
  const upgrade = request.headers.get("upgrade")

  if (upgrade !== "websocket") {
    return new NextResponse("Expected Upgrade: websocket", { status: 426 })
  }

  return new NextResponse("WebSocket upgrade handled by server", { status: 101 })
}

// Para manejar WebSocket en Next.js App Router, necesitamos usar un enfoque diferente
export async function POST(request: NextRequest) {
  try {
    // Endpoint para obtener datos de barcos desde AISStream
    const response = await fetch("https://stream.aisstream.io/v0/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        APIKey: "c6c4f1897fe584d2ae5556af3c1365ec1d66d3f2",
        BoundingBoxes: [
          [
            [-90, -180],
            [90, 180],
          ],
        ], // Todo el mundo
        FilterMessageTypes: ["PositionReport"],
        FiltersShipAndCargo: {
          maximum_dimension_a: { min: 50 }, // Solo barcos grandes
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`AISStream API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("AISStream API error:", error)
    return NextResponse.json({ error: "Failed to fetch ship data" }, { status: 500 })
  }
}
