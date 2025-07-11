import { NextResponse } from "next/server"
import { TrackingService } from "@/lib/services/tracking-service"

export async function POST() {
  try {
    // Actualizar tracking de embarques
    await TrackingService.updateAllShipments()

    // Actualizar posiciones de barcos
    await TrackingService.updateVesselPositions()

    return NextResponse.json({
      success: true,
      message: "Tracking actualizado correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en actualización de tracking:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar tracking" }, { status: 500 })
  }
}
