import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"

type Tables = Database["public"]["Tables"]
type Shipment = Tables["shipments"]["Row"]
type ShipmentInsert = Tables["shipments"]["Insert"]
type ShipmentUpdate = Tables["shipments"]["Update"]
type Alert = Tables["alerts"]["Row"]
type Vessel = Tables["vessels"]["Row"]

// Servicios para Embarques
export class ShipmentService {
  // Obtener todos los embarques con relaciones
  static async getShipments(filters?: {
    status?: string
    carrier_id?: number
    supplier_id?: number
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from("shipments")
      .select(`
        *,
        carriers(name, code),
        suppliers(name, code),
        vessels(name, imo_number),
        origin_port:ports!origin_port_id(name, code, country),
        destination_port:ports!destination_port_id(name, code, country)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }
    if (filters?.carrier_id) {
      query = query.eq("carrier_id", filters.carrier_id)
    }
    if (filters?.supplier_id) {
      query = query.eq("supplier_id", filters.supplier_id)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching shipments:", error)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  }

  // Obtener embarque por ID
  static async getShipmentById(id: number) {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        *,
        carriers(name, code),
        suppliers(name, code),
        vessels(name, imo_number),
        origin_port:ports!origin_port_id(name, code, country),
        destination_port:ports!destination_port_id(name, code, country)
      `)
      .eq("id", id)
      .single()

    return { data, error }
  }

  // Crear nuevo embarque
  static async createShipment(shipment: ShipmentInsert) {
    const { data, error } = await supabase.from("shipments").insert(shipment).select().single()

    return { data, error }
  }

  // Actualizar embarque
  static async updateShipment(id: number, updates: ShipmentUpdate) {
    const { data, error } = await supabase
      .from("shipments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  }

  // Obtener estadísticas del dashboard
  static async getDashboardStats() {
    const { data: shipments, error } = await supabase
      .from("shipments")
      .select("status, eta_current")
      .eq("is_active", true)

    if (error) {
      console.error("Error fetching dashboard stats:", error)
      return {
        inTransit: 0,
        arrived: 0,
        delayed: 0,
        critical: 0,
        upcomingArrivals: 0,
      }
    }

    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const stats = shipments.reduce(
      (acc, shipment) => {
        switch (shipment.status) {
          case "in_transit":
            acc.inTransit++
            break
          case "arrived":
            acc.arrived++
            break
          case "delayed":
            acc.delayed++
            break
          case "critical":
            acc.critical++
            break
        }

        // Contar arribos próximos
        if (shipment.eta_current) {
          const eta = new Date(shipment.eta_current)
          if (eta >= now && eta <= nextWeek) {
            acc.upcomingArrivals++
          }
        }

        return acc
      },
      {
        inTransit: 0,
        arrived: 0,
        delayed: 0,
        critical: 0,
        upcomingArrivals: 0,
      },
    )

    return stats
  }

  // Buscar embarques
  static async searchShipments(query: string) {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        *,
        carriers(name, code),
        suppliers(name, code)
      `)
      .or(`bl_number.ilike.%${query}%,container_number.ilike.%${query}%`)
      .eq("is_active", true)
      .limit(10)

    return { data: data || [], error }
  }
}

// Servicios para Alertas
export class AlertService {
  // Obtener alertas activas
  static async getActiveAlerts(limit = 10) {
    const { data, error } = await supabase
      .from("alerts")
      .select(`
        *,
        shipments(bl_number, container_number)
      `)
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })
      .limit(limit)

    return { data: data || [], error }
  }

  // Crear nueva alerta
  static async createAlert(alert: Tables["alerts"]["Insert"]) {
    const { data, error } = await supabase.from("alerts").insert(alert).select().single()

    return { data, error }
  }

  // Marcar alerta como leída
  static async markAlertAsRead(id: number) {
    const { data, error } = await supabase.from("alerts").update({ is_read: true }).eq("id", id).select().single()

    return { data, error }
  }

  // Resolver alerta
  static async resolveAlert(id: number, resolvedBy: number) {
    const { data, error } = await supabase
      .from("alerts")
      .update({
        is_resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  }
}

// Servicios para Barcos
export class VesselService {
  // Obtener todos los barcos activos
  static async getActiveVessels() {
    const { data, error } = await supabase
      .from("vessels")
      .select(`
        *,
        carriers(name, code)
      `)
      .not("current_latitude", "is", null)
      .not("current_longitude", "is", null)
      .order("last_position_update", { ascending: false })

    return { data: data || [], error }
  }

  // Actualizar posición de barco
  static async updateVesselPosition(
    id: number,
    position: {
      latitude: number
      longitude: number
      speed?: number
      heading?: number
    },
  ) {
    const { data, error } = await supabase
      .from("vessels")
      .update({
        current_latitude: position.latitude,
        current_longitude: position.longitude,
        current_speed: position.speed,
        current_heading: position.heading,
        last_position_update: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  }
}

// Servicios generales
export class GeneralService {
  // Obtener navieras
  static async getCarriers() {
    const { data, error } = await supabase.from("carriers").select("*").eq("is_active", true).order("name")

    return { data: data || [], error }
  }

  // Obtener puertos
  static async getPorts() {
    const { data, error } = await supabase.from("ports").select("*").eq("is_active", true).order("name")

    return { data: data || [], error }
  }

  // Obtener proveedores
  static async getSuppliers() {
    const { data, error } = await supabase.from("suppliers").select("*").eq("is_active", true).order("name")

    return { data: data || [], error }
  }
}
