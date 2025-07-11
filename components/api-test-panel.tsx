"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader2, Ship, Container, MapPin, Search } from "lucide-react"

export function APITestPanel() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [containerNumber, setContainerNumber] = useState("MAEU1234567")
  const [imoNumber, setImoNumber] = useState("9321483")
  const [vesselName, setVesselName] = useState("MSC Gülsün")
  const [portCode, setPortCode] = useState("COBUN")
  const [blNumber, setBlNumber] = useState("MSCU1234567")
  const [shippingLine, setShippingLine] = useState("MSC")
  const [email, setEmail] = useState("test@example.com")

  const testAPI = async (action: string, params: Record<string, string> = {}) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const searchParams = new URLSearchParams({ action, ...params })
      const response = await fetch(`/api/shipsgo/test?${searchParams}`)
      const data = await response.json()

      if (data.success) {
        setResults(data)
      } else {
        setError(data.message || "Error desconocido")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const trackWithBL = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const params = new URLSearchParams({
        blContainersRef: blNumber,
        shippingLine,
        email,
      })
      const response = await fetch(`/api/shipsgo/bl-tracking?${params}`)
      const data = await response.json()

      if (data.success) {
        setResults(data)
      } else {
        setError(data.message || "Error al rastrear con BL")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const syncTracking = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/tracking/sync", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setResults(data)
      } else {
        setError(data.message || "Error en sincronización")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Panel de Pruebas - ShipsGo API
          </CardTitle>
          <CardDescription>Prueba las funcionalidades de la API de ShipsGo en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="status">Estado</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="vessels">Barcos</TabsTrigger>
              <TabsTrigger value="ports">Puertos</TabsTrigger>
              <TabsTrigger value="sync">Sincronizar</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => testAPI("status")} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verificar Estado API
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Número de contenedor"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                />
                <Button onClick={() => testAPI("track", { container: containerNumber })} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Container className="h-4 w-4 mr-2" />}
                  Rastrear
                </Button>
              </div>
              <Button variant="outline" onClick={() => testAPI("batch-track")} disabled={loading}>
                Prueba Batch Tracking
              </Button>
              <div className="pt-4 space-y-2">
                <Input placeholder="BL / Booking" value={blNumber} onChange={(e) => setBlNumber(e.target.value)} />
                <Input placeholder="Naviera (ej. MSC)" value={shippingLine} onChange={(e) => setShippingLine(e.target.value)} />
                <Input placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button onClick={trackWithBL} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Rastrear por BL
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="vessels" className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="IMO Number" value={imoNumber} onChange={(e) => setImoNumber(e.target.value)} />
                  <Button onClick={() => testAPI("vessel", { imo: imoNumber })} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ship className="h-4 w-4 mr-2" />}
                    Buscar por IMO
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Nombre del barco" value={vesselName} onChange={(e) => setVesselName(e.target.value)} />
                  <Button onClick={() => testAPI("search", { vessel: vesselName })} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                </div>
                <Button variant="outline" onClick={() => testAPI("colombia")} disabled={loading}>
                  Barcos hacia Colombia
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ports" className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Código de puerto" value={portCode} onChange={(e) => setPortCode(e.target.value)} />
                <Button onClick={() => testAPI("port", { port: portCode })} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                  Info Puerto
                </Button>
              </div>
              <Button variant="outline" onClick={() => testAPI("near-port", { port: portCode })} disabled={loading}>
                Barcos cerca del puerto
              </Button>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Sincronizar todos los embarques activos con la API de ShipsGo
                </p>
                <Button onClick={syncTracking} disabled={loading} variant="default">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ship className="h-4 w-4 mr-2" />}
                  Sincronizar Tracking
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Card className="mt-4 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {results && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Resultados
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Éxito
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
