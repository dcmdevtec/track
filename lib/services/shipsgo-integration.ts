import { shipsGoAPI, type ShipsGoContainer, type ShipsGoVessel } from "./shipsgo-api"
import { ShipmentService, VesselService, AlertService } from "./database"
import { supabase } from "@/lib/supabase/client"

export class ShipsGoIntegration {
  // Sincronizar un embarque específico con ShipsGo
  static async syncShipment(shipmentId: number) {
    try {
      const { data: shipment } = await ShipmentService.getShipmentById(shipmentId)
      if (!shipment) {
        throw new Error("Embarque no encontrado")
      }

      // Obtener tracking de ShipsGo
      const tracking = await shipsGoAPI.trackContainer(shipment.container_number)
      if (!tracking) {
        console.log(`No se encontró tracking para ${shipment.container_number}`)
        return { success: false, message: "Tracking no disponible" }
      }

      // Preparar actualizaciones
      const updates: any = {
        tracking_status: tracking.status.description,
        current_location: tracking.status.location,
        last_tracking_update: new Date().toISOString(),
      }

      // Actualizar ETA si cambió
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
      }

      // Detectar retrasos
      if (tracking.schedule.eta && shipment.eta_original) {
        const newEta = new Date(tracking.schedule.eta)
        const originalEta = new Date(shipment.eta_original)
        const delayHours = Math.floor((newEta.getTime() - originalEta.getTime()) / (1000 * 60 * 60))

        if (delayHours > 24 && shipment.status !== "delayed") {
          updates.status = delayHours > 72 ? "critical" : "delayed"

          await AlertService.createAlert({
            shipment_id: shipment.id,
            alert_type: "delay",
            severity: delayHours > 72 ? "critical" : "high",
            title: `Retraso ${delayHours > 72 ? "Crítico" : "Detectado"} - ${shipment.container_number}`,
            message: `Retraso de ${delayHours} horas. ETA original: ${originalEta.toLocaleDateString()}, ETA actual: ${newEta.toLocaleDateString()}`,
          })
        }
      }

      // Actualizar información del barco si está disponible
      if (tracking.vessel.imo) {
        const vesselInfo = await shipsGoAPI.getVesselByIMO(tracking.vessel.imo)
        if (vesselInfo) {
          // Buscar o crear barco en la base de datos
          const { data: existingVessel } = await supabase
            .from("vessels")
            .select("id")
            .eq("imo_number", tracking.vessel.imo)
            .single()

          if (existingVessel) {
            // Actualizar posición del barco
            await VesselService.updateVesselPosition(existingVessel.id, {
              latitude: vesselInfo.latitude,
              longitude: vesselInfo.longitude,
              speed: vesselInfo.speed,
              heading: vesselInfo.heading,
            })
          } else {
            // Crear nuevo barco
            await supabase.from("vessels").insert({
              name: tracking.vessel.name,
              imo_number: tracking.vessel.imo,
              current_latitude: vesselInfo.latitude,
              current_longitude: vesselInfo.longitude,
              current_speed: vesselInfo.speed,
              current_heading: vesselInfo.heading,
              last_position_update: new Date().toISOString(),
            })
          }
        }
      }

      // Actualizar embarque
      await ShipmentService.updateShipment(shipment.id, updates)

      // Registrar eventos de tracking
      if (tracking.events && tracking.events.length > 0) {
        for (const event of tracking.events.slice(0, 5)) {
          // Solo los últimos 5 eventos
          await supabase.from("shipment_events").insert({
            shipment_id: shipment.id,
            event_type: event.eventType,
            event_date: event.timestamp,
            location: event.location,
            description: event.eventName,
            source: "shipsgo_api",
            raw_data: event,
          })
        }
      }

      return { success: true, data: tracking }
    } catch (error) {
      console.error(`Error sincronizando embarque ${shipmentId}:`, error)
      return { success: false, message: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  // Sincronización masiva de embarques activos
  static async syncAllActiveShipments() {
    try {
      console.log("Iniciando sincronización masiva con ShipsGo...")

      const { data: shipments } = await ShipmentService.getShipments({
        status: "in_transit",
        limit: 50, // Procesar en lotes de 50
      })

      if (!shipments.length) {
        console.log("No hay embarques activos para sincronizar")
        return { success: true, processed: 0 }
      }

      const containerNumbers = shipments.map((s) => s.container_number)
      const trackingResults = await shipsGoAPI.trackMultipleContainers(containerNumbers)

      let processed = 0
      let errors = 0

      for (const tracking of trackingResults) {
        try {
          const shipment = shipments.find((s) => s.container_number === tracking.containerNumber)
          if (!shipment) continue

          await this.syncShipmentData(shipment, tracking)
          processed++
        } catch (error) {
          console.error(`Error procesando ${tracking.containerNumber}:`, error)
          errors++
        }
      }

      console.log(`Sincronización completada: ${processed} procesados, ${errors} errores`)
      return { success: true, processed, errors }
    } catch (error) {
      console.error("Error en sincronización masiva:", error)
      return { success: false, message: error instanceof Error ? error.message : "Error desconocido" }
    }
  }

  // Método auxiliar para sincronizar datos de un embarque
  private static async syncShipmentData(shipment: any, tracking: ShipsGoContainer) {
    const updates: any = {
      tracking_status: tracking.status.description,
      current_location: tracking.status.location,
      last_tracking_update: new Date().toISOString(),
    }

    // Actualizar ETA
    if (tracking.schedule.eta !== shipment.eta_current) {
      updates.eta_current = tracking.schedule.eta
    }

    // Actualizar ATD si está disponible
    if (tracking.schedule.atd && !shipment.etd_actual) {
      updates.etd_actual = tracking.schedule.atd
    }

    // Actualizar ATA si llegó
    if (tracking.schedule.ata && !shipment.ata) {
      updates.ata = tracking.schedule.ata
      updates.status = "arrived"

      // Crear alerta de arribo
      await AlertService.createAlert({
        shipment_id: shipment.id,
        alert_type: "arrival",
        severity: "low",
        title: `Arribo Confirmado - ${shipment.container_number}`,
        message: `Contenedor arribó el ${new Date(tracking.schedule.ata).toLocaleDateString("es-CO")}`,
      })
    }

    await ShipmentService.updateShipment(shipment.id, updates)
  }

  // Obtener estadísticas de la API
  static async getAPIStats() {
    try {
      const status = await shipsGoAPI.getAPIStatus()
      return {
        status: status.status,
        lastUpdate: status.timestamp,
        rateLimit: status.rateLimit,
        isHealthy: status.status === "active",
      }
    } catch (error) {
      return {
        status: "error",
        lastUpdate: new Date().toISOString(),
        rateLimit: { remaining: 0, resetTime: new Date().toISOString() },
        isHealthy: false,
      }
    }
  }

  // Buscar barcos en ruta a Colombia
  static async getVesselsToColombianPorts() {
    try {
      const colombianPorts = ["COBUN", "COCTG", "COBAQ", "COSMT"] // Códigos de puertos colombianos

      const allVessels: ShipsGoVessel[] = []

      for (const portCode of colombianPorts) {
        const vessels = await shipsGoAPI.getVesselsNearPort(portCode, 100) // 100km radius
        allVessels.push(...vessels)
      }

      // Eliminar duplicados por IMO
      const uniqueVessels = allVessels.filter(
        (vessel, index, self) => index === self.findIndex((v) => v.imo === vessel.imo),
      )

      return uniqueVessels
    } catch (error) {
      console.error("Error obteniendo barcos hacia Colombia:", error)
      return []
    }
  }
}
