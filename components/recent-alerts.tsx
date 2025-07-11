import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

// Actualizar para recibir alertas reales como props
interface RecentAlertsProps {
  alerts: any[]
}

function getSeverityColor(severity: string) {
  const colors = {
    low: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    medium:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    high: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
    critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  }
  return colors[severity as keyof typeof colors] || colors.medium
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  if (!alerts.length) {
    return (
      <div className="text-center py-6 lg:py-8">
        <AlertTriangle className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm lg:text-base">No hay alertas activas</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:hover:bg-muted/30"
        >
          <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)} transition-colors duration-200`}>
            <AlertTriangle className="h-3 w-3" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-sm font-medium truncate">{alert.title}</p>
              <Badge variant="outline" className="text-xs">
                {alert.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{alert.message}</p>
            <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString("es-CO")}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs shrink-0">
            Ver
          </Button>
        </div>
      ))}

      <div className="pt-2 border-t">
        <Button variant="outline" className="w-full text-sm bg-transparent">
          Ver Todas las Alertas
        </Button>
      </div>
    </div>
  )
}
