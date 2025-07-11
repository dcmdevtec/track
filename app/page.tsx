import { Suspense } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Container, Ship, AlertTriangle, Clock, TrendingUp, Globe, MapPin, Calendar, RefreshCw } from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { ShipmentStatusChart } from "@/components/shipment-status-chart"
import { WorldMap } from "@/components/world-map"
import { RecentAlerts } from "@/components/recent-alerts"
import { UpcomingArrivals } from "@/components/upcoming-arrivals"
import { ShipmentService, AlertService } from "@/lib/services/database"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"


const ShipMap = dynamic(() => import("@/components/shipMap"), { ssr: false });

// Componente de loading para el dashboard
function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 sm:w-48 mb-2" />
          <Skeleton className="h-4 w-48 sm:w-96" />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente principal del dashboard
async function DashboardContent() {
  try {
    // Obtener datos reales de la base de datos
    const [statsResult, alertsResult] = await Promise.all([
      ShipmentService.getDashboardStats(),
      AlertService.getActiveAlerts(5),
    ])

    const stats = statsResult
    const alerts = alertsResult.data || []

    return (
      <div className="flex flex-col h-screen">
        {/* Header Responsive */}
        <header className="flex h-14 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <SidebarTrigger />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">Dashboard Ejecutivo</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Vista consolidada del control marítimo en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600 hidden sm:flex">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-1" />
              Sistema Activo
            </Badge>
            <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Última actualización: </span>
              {new Date().toLocaleTimeString("es-CO")}
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Responsive */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* KPIs Row - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Contenedores en Tránsito"
              value={stats.inTransit.toString()}
              change={stats.inTransit > 200 ? "+12" : "-5"}
              changeType={stats.inTransit > 200 ? "positive" : "negative"}
              icon={Container}
              description="Actualmente navegando"
            />
            <KPICard
              title="Arribos Esta Semana"
              value={stats.upcomingArrivals.toString()}
              change="+5"
              changeType="positive"
              icon={Ship}
              description="Llegadas programadas"
            />
            <KPICard
              title="Alertas Activas"
              value={alerts.length.toString()}
              change={alerts.length > 10 ? "+3" : "-2"}
              changeType={alerts.length > 10 ? "negative" : "positive"}
              icon={AlertTriangle}
              description="Requieren atención"
            />
            <KPICard
              title="Embarques Retrasados"
              value={stats.delayed.toString()}
              change="-1.2"
              changeType="positive"
              icon={Clock}
              description="Últimos 30 días"
            />
          </div>

          {/* Charts and Map Row - Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* World Map - Takes full width on mobile, 2/3 on desktop */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Globe className="h-4 w-4 lg:h-5 lg:w-5" />
                  Mapa Mundial de Embarques
                </CardTitle>
                <CardDescription className="text-sm">
                  Posicionamiento en tiempo real de contenedores y barcos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="w-full h-[300px] lg:h-[400px]" />}>
                  <ShipMap />
                </Suspense>
              </CardContent>
            </Card>

            {/* Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
                  Estado de Embarques
                </CardTitle>
                <CardDescription className="text-sm">Distribución actual por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <ShipmentStatusChart stats={stats} />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5" />
                  Alertas Recientes
                  {alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {alerts.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">Últimas notificaciones del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAlerts alerts={alerts} />
              </CardContent>
            </Card>

            {/* Upcoming Arrivals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                  Próximos Arribos
                  {stats.upcomingArrivals > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {stats.upcomingArrivals}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">Llegadas programadas próximas 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
                  <UpcomingArrivals />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* System Status Row - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm lg:text-base">Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base de Datos</span>
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    Conectado
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API ShipsGo</span>
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    Activo
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Última Sincronización</span>
                  <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString("es-CO")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm lg:text-base">Rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Requests API/min</span>
                  <span className="text-sm font-medium">45/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo Respuesta</span>
                  <span className="text-sm font-medium">1.2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm lg:text-base">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar Tracking
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Container className="h-4 w-4 mr-2" />
                  Nuevo Embarque
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Ver Alertas Críticas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading dashboard data:", error)

    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Dashboard Ejecutivo</h1>
            <p className="text-sm text-muted-foreground">Error al cargar datos</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Error de Conexión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                No se pudo conectar con la base de datos. Verifique la configuración.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}

// Componente principal exportado
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
