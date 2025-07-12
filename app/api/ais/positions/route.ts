import { type NextRequest, NextResponse } from "next/server"

// 👉  Endpoint: /api/ais/positions
//     Devuelve un “snapshot” con las últimas posiciones de buques.
//     Admite parámetros opcionales  ?latMin  ?lonMin  ?latMax  ?lonMax  ?limit

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Bounding-box (opcional)
    const latMin = searchParams.get("latMin") ?? "-90"
    const lonMin = searchParams.get("lonMin") ?? "-180"
    const latMax = searchParams.get("latMax") ?? "90"
    const lonMax = searchParams.get("lonMax") ?? "180"
    const limit = searchParams.get("limit") ?? "200"

    // ⚠️ Revisa la URL real en la documentación de AISStream.
    const url =
      `https://api.aisstream.io/v0/last_known_positions` +
      `?latMin=${latMin}&lonMin=${lonMin}&latMax=${latMax}&lonMax=${lonMax}&limit=${limit}`

    const res = await fetch(url, {
      headers: {
        "X-API-Key":
          process.env.AISSTREAM_API_KEY ?? // ► usa variable de entorno en prod
          "c6c4f1897fe584d2ae5556af3c1365ec1d66d3f2", //    (tu clave durante pruebas)
        Accept: "application/json",
      },
      // time-out rápido para que el dashboard no se congele
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ data })
  } catch (err) {
    console.error("AISRoute error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
