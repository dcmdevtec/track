import { NextResponse } from "next/server"
import { TrackingService } from "@/lib/services/tracking-service"

export async function GET(request: Request, { params }: { params: { container: string } }) {
  try {
    const result = await TrackingService.trackSingleContainer(params.container)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("Error en tracking de contenedor:", error)
    return NextResponse.json({ success: false, message: "Error al obtener tracking" }, { status: 500 })
  }
}
