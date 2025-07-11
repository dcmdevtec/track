import { NextResponse } from "next/server"
import { shipsGoAPI } from "@/lib/services/shipsgo-api"
import { ShipmentService, AlertService } from "@/lib/services/database"

export async function POST() {
  try {
    console.log("Iniciando sincronización con ShipsGo API...")

    // Obtener embarques en tránsito
    const { data: shipments, error } = await ShipmentService.getShipments({
      status: "in_transit",
      limit: 50,
    })

    if (error) {
      throw new Error(`Error fetching shipments: ${error.message}`)
    }

    if (!shipments.length) {
      return NextResponse.json({
        success: true,
        message: "No hay embarques en tránsito para sincronizar",
        processed: 0,
      })
    }

    console.log(`Encontrados ${shipments.length} embarques para sincronizar`)

    // Extraer números de contenedores
    const containerNumbers = shipments.map((s) => s.container_number)

    // Obtener tracking de ShipsGo
    const trackingResults = await shipsGoAPI.trackMultipleContainers(containerNumbers)

    console.log(`Recibidos ${trackingResults.length} resultados de tracking`)

    let processed = 0
    let errors = 0
    let alerts = 0

    // Procesar cada resultado
    for (const tracking of trackingResults) {
      try {
        const shipment = shipments.find((s) => s.container_number === tracking.containerNumber)
        if (!shipment) {
          console.log(`No se encontró embarque para contenedor: ${tracking.containerNumber}`)
          continue
        }

        // Preparar actualizaciones
        const updates: any = {
          tracking_status: tracking.status.description,
          current_location: tracking.status.location,
          last_tracking_update: new Date().toISOString(),
        }

        // Verificar cambio de ETA
        if (tracking.schedule.eta && tracking.schedule.eta !== shipment.eta_current) {
          const oldEta = shipment.eta_current
          updates.eta_current = tracking.schedule.eta

          // Crear alerta por cambio de ETA
          await AlertService.createAlert({
            shipment_id: shipment.id,
            alert_type: "eta_change",
            severity: "medium",
            title: `Cambio de ETA - ${shipment.container_number}`,
            message: `ETA actualizada de ${oldEta || "N/A"} a ${tracking.schedule.eta}`,
          })
          alerts++
        }

        // Detectar retrasos
        if (tracking.schedule.eta && shipment.eta_original) {
          const newEta = new Date(tracking.schedule.eta)
          const originalEta = new Date(shipment.eta_original)
          const delayHours = Math.floor((newEta.getTime() - originalEta.getTime()) / (1000 * 60 * 60))

          if (delayHours > 24 && !["delayed", "critical"].includes(shipment.status)) {
            updates.status = delayHours > 72 ? "critical" : "delayed"

            await AlertService.createAlert({
              shipment_id: shipment.id,
              alert_type: "delay",
              severity: delayHours > 72 ? "critical" : "high",
              title: `Retraso ${delayHours > 72 ? "Crítico" : "Detectado"} - ${shipment.container_number}`,
              message: `Retraso de ${delayHours} horas detectado. ETA original: ${originalEta.toLocaleDateString()}, ETA actual: ${newEta.toLocaleDateString()}`,
            })
            alerts++
          }
        }

        // Verificar arribo
        if (tracking.schedule.ata && !shipment.ata) {
          updates.ata = tracking.schedule.ata
          updates.status = "arrived"

          await AlertService.createAlert({
            shipment_id: shipment.id,
            alert_type: "arrival",
            severity: "low",
            title: `Arribo Confirmado - ${shipment.container_number}`,
            message: `Contenedor arribó el ${new Date(tracking.schedule.ata).toLocaleDateString("es-CO")}`,
          })
          alerts++
        }

        // Actualizar embarque
        await ShipmentService.updateShipment(shipment.id, updates)
        processed++

        console.log(`Procesado: ${shipment.container_number}`)
      } catch (error) {
        console.error(`Error procesando ${tracking.containerNumber}:`, error)
        errors++
      }
    }

    const result = {
      success: true,
      message: `Sincronización completada`,
      stats: {
        total: shipments.length,
        processed,
        errors,
        alerts,
        timestamp: new Date().toISOString(),
      },
    }

    console.log("Resultado de sincronización:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error en sincronización:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
