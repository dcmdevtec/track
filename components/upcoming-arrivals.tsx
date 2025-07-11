import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ship, MapPin, Calendar, Clock } from "lucide-react"
import { ShipmentService } from "@/lib/services/database"

const statusColors = {
  in_transit: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  delayed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  on_time:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  early:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
}

const statusLabels = {
  in_transit: "En Tránsito",
  delayed: "Retrasado",
  on_time: "A Tiempo",
  early: "Adelantado",
}

function getArrivalStatus(eta: string | null, originalEta: string | null) {
  if (!eta) return "in_transit"

  const etaDate = new Date(eta)
  const now = new Date()

  if (originalEta) {
    const originalDate = new Date(originalEta)
    if (etaDate > originalDate) return "delayed"
    if (etaDate < originalDate) return "early"
  }

  return "on_time"
}

export async function UpcomingArrivals() {
  try {
    // Obtener embarques con ETA en los próximos 7 días
    const { data: shipments, error } = await ShipmentService.getShipments({
      status: "in_transit",
      limit: 10,
    })

    if (error) {
      console.error("Error fetching upcoming arrivals:", error)
      return (
        <div className="text-center py-6 lg:py-8">
          <Ship className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm lg:text-base">Error al cargar arribos</p>
        </div>
      )
    }

    // Filtrar embarques con ETA en los próximos 7 días
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const upcomingArrivals = shipments
      .filter((shipment) => {
        if (!shipment.eta_current) return false
        const eta = new Date(shipment.eta_current)
        return eta >= now && eta <= nextWeek
      })
      .sort((a, b) => {
        const etaA = new Date(a.eta_current!)
        const etaB = new Date(b.eta_current!)
        return etaA.getTime() - etaB.getTime()
      })
      .slice(0, 5)

    if (!upcomingArrivals.length) {
      return (
        <div className="text-center py-6 lg:py-8">
          <Ship className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm lg:text-base">No hay arribos programados</p>
          <p className="text-xs text-muted-foreground mt-1">en los próximos 7 días</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {upcomingArrivals.map((arrival) => {
          const status = getArrivalStatus(arrival.eta_current, arrival.eta_original)
          const eta = new Date(arrival.eta_current!)

          return (
            <div
              key={arrival.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:hover:bg-muted/30"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Ship className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm truncate">{arrival.container_number}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${statusColors[status as keyof typeof statusColors]} transition-colors duration-200`}
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Ship className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {arrival.vessels?.name || "Barco no asignado"}
                    {arrival.carriers?.name && ` (${arrival.carriers.name})`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {arrival.destination_port?.name || "Puerto no especificado"}
                    {arrival.destination_port?.country && `, ${arrival.destination_port.country}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {eta.toLocaleDateString("es-CO")} a las{" "}
                    {eta.toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {arrival.eta_original && arrival.eta_original !== arrival.eta_current && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="text-orange-600 dark:text-orange-400 truncate">
                      ETA original: {new Date(arrival.eta_original).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t gap-2">
                <span className="text-xs text-muted-foreground truncate">
                  {arrival.suppliers?.name || "Proveedor no especificado"}
                </span>
                <Button variant="ghost" size="sm" className="text-xs h-6 shrink-0">
                  Detalles
                </Button>
              </div>
            </div>
          )
        })}

        <div className="pt-2 border-t">
          <Button variant="outline" className="w-full text-sm bg-transparent">
            Ver Todos los Arribos ({upcomingArrivals.length})
          </Button>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in UpcomingArrivals component:", error)
    return (
      <div className="text-center py-6 lg:py-8">
        <Ship className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm lg:text-base">Error al cargar datos</p>
      </div>
    )
  }
}
