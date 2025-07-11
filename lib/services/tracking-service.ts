import { shipsGoAPI } from "./shipsgo-api"
import { ShipmentService, VesselService, AlertService } from "./database"

export class TrackingService {
  // Actualizar tracking de todos los embarques activos
  static async updateAllShipments() {
    try {
      console.log("Iniciando actualización masiva de tracking...")

      // Obtener embarques en tránsito
      const { data: shipments } = await ShipmentService.getShipments({
        status: "in_transit",
        limit: 100,
      })

      if (!shipments.length) {
        console.log("No hay embarques en tránsito para actualizar")
        return
      }

      // Extraer números de contenedores
      const containerNumbers = shipments.map((s) => s.container_number)

      // Obtener tracking de ShipsGo
      const trackingData = await shipsGoAPI.trackMultipleContainers(containerNumbers)

      // Procesar cada resultado
      for (const tracking of trackingData) {
        const shipment = shipments.find((s) => s.container_number === tracking.containerNumber)
        if (!shipment) continue

        // Actualizar información del embarque
        const updates: any = {
          tracking_status: tracking.status,
          current_location: tracking.currentLocation,
          last_tracking_update: new Date().toISOString(),
        }

        // Actualizar ETA si cambió
        if (tracking.eta && tracking.eta !== shipment.eta_current) {
          updates.eta_current = tracking.eta

          // Crear alerta por cambio de ETA
          await AlertService.createAlert({
            shipment_id: shipment.id,
            alert_type: "eta_change",
            severity: "medium",
            title: `Cambio de ETA - ${shipment.container_number}`,
            message: `ETA actualizada de ${shipment.eta_current} a ${tracking.eta}`,
          })
        }

        // Detectar retrasos
        if (tracking.eta) {
          const eta = new Date(tracking.eta)
          const originalEta = shipment.eta_original ? new Date(shipment.eta_original) : null

          if (originalEta && eta > originalEta) {
            const delayHours = Math.floor((eta.getTime() - originalEta.getTime()) / (1000 * 60 * 60))

            if (delayHours > 24 && shipment.status !== "delayed") {
              updates.status = "delayed"

              await AlertService.createAlert({
                shipment_id: shipment.id,
                alert_type: "delay",
                severity: delayHours > 72 ? "critical" : "high",
                title: `Retraso Detectado - ${shipment.container_number}`,
                message: `Retraso de ${delayHours} horas detectado. ETA original: ${originalEta.toLocaleDateString()}, ETA actual: ${eta.toLocaleDateString()}`,
              })
            }
          }
        }

        // Actualizar embarque en base de datos
        await ShipmentService.updateShipment(shipment.id, updates)
      }

      console.log(`Actualización completada: ${trackingData.length} embarques procesados`)
    } catch (error) {
      console.error("Error en actualización masiva de tracking:", error)
    }
  }

  // Actualizar posiciones de barcos
  static async updateVesselPositions() {
    try {
      console.log("Actualizando posiciones de barcos...")

      // Obtener barcos activos
      const { data: vessels } = await VesselService.getActiveVessels()

      if (!vessels.length) {
        console.log("No hay barcos activos para actualizar")
        return
      }

      // Extraer IMO numbers
      const imoNumbers = vessels.filter((v) => v.imo_number).map((v) => v.imo_number!)

      if (!imoNumbers.length) {
        console.log("No hay barcos con IMO para tracking")
        return
      }

      // Obtener posiciones de ShipsGo
      const positions = await shipsGoAPI.getVesselPositions(imoNumbers)

      // Actualizar cada barco
      for (const position of positions) {
        const vessel = vessels.find((v) => v.imo_number === position.imo)
        if (!vessel) continue

        await VesselService.updateVesselPosition(vessel.id, {
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          heading: position.heading,
        })
      }

      console.log(`Posiciones actualizadas: ${positions.length} barcos`)
    } catch (error) {
      console.error("Error actualizando posiciones de barcos:", error)
    }
  }

  // Tracking individual de contenedor
  static async trackSingleContainer(containerNumber: string) {
    try {
      const tracking = await shipsGoAPI.trackContainer(containerNumber)

      if (!tracking) {
        return { success: false, message: "Contenedor no encontrado" }
      }

      // Buscar embarque en base de datos
      const { data: shipments } = await ShipmentService.searchShipments(containerNumber)

      if (shipments.length > 0) {
        const shipment = shipments[0]

        // Actualizar información
        await ShipmentService.updateShipment(shipment.id, {
          tracking_status: tracking.status,
          current_location: tracking.currentLocation,
          eta_current: tracking.eta,
          last_tracking_update: new Date().toISOString(),
        })
      }

      return { success: true, data: tracking }
    } catch (error) {
      console.error("Error en tracking individual:", error)
      return { success: false, message: "Error al obtener tracking" }
    }
  }

  // Programar actualizaciones automáticas
  static scheduleUpdates() {
    // Actualizar cada 6 horas
    setInterval(
      async () => {
        await this.updateAllShipments()
        await this.updateVesselPositions()
      },
      6 * 60 * 60 * 1000,
    ) // 6 horas en milisegundos

    console.log("Actualizaciones automáticas programadas cada 6 horas")
  }
}
