// ShipsGo API Integration - Configuración con API Key real
// API Key: 2be409e9adb456d6ff22de03569fd331

interface ShipsGoConfig {
  apiKey: string
  baseUrl: string
  rateLimitPerMinute: number
}

interface ShipsGoVessel {
  imo: string
  mmsi: string
  vesselName: string
  callSign: string
  vesselType: string
  flag: string
  dwt: number
  grt: number
  latitude: number
  longitude: number
  speed: number
  course: number
  heading: number
  navStatus: string
  destination: string
  eta: string
  draught: number
  timestamp: string
  source: string
}

interface ShipsGoContainer {
  containerNumber: string
  blNumber: string
  bookingNumber: string
  vessel: {
    name: string
    imo: string
    voyage: string
  }
  carrier: {
    name: string
    code: string
  }
  route: {
    pol: {
      name: string
      code: string
      country: string
    }
    pod: {
      name: string
      code: string
      country: string
    }
  }
  schedule: {
    etd: string
    eta: string
    atd?: string
    ata?: string
  }
  status: {
    code: string
    description: string
    location: string
    timestamp: string
  }
  events: ShipsGoEvent[]
}

interface ShipsGoEvent {
  eventCode: string
  eventType: string
  eventName: string
  location: string
  vessel?: string
  voyage?: string
  timestamp: string
  isEstimated: boolean
}

interface ShipsGoSchedule {
  carrier: string
  service: string
  vessel: string
  voyage: string
  pol: string
  pod: string
  etd: string
  eta: string
  transitTime: number
}

class ShipsGoAPI {
  private config: ShipsGoConfig
  private requestCount = 0
  private lastResetTime: number = Date.now()

  constructor() {
    this.config = {
      apiKey: "3aaead4a6dd9195d0507fe10cf3fbc6c",
      baseUrl: "https://api.shipsgo.com/v2",
      rateLimitPerMinute: 100,
    }
  }

  // Control de rate limiting
  private async checkRateLimit(): Promise<void> {
    const now = Date.now()
    const oneMinute = 60 * 1000

    if (now - this.lastResetTime > oneMinute) {
      this.requestCount = 0
      this.lastResetTime = now
    }

    if (this.requestCount >= this.config.rateLimitPerMinute) {
      const waitTime = oneMinute - (now - this.lastResetTime)
      console.log(`Rate limit alcanzado, esperando ${waitTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.requestCount = 0
      this.lastResetTime = Date.now()
    }

    this.requestCount++
  }

  // Método base para hacer requests
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    await this.checkRateLimit()

    const url = `${this.config.baseUrl}${endpoint}`

    console.log(`ShipsGo API Request: ${url}`)

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "IndustriasCannon-MaritimeControl/1.0",
        ...options.headers,
      },
    })

    console.log(`ShipsGo API Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`ShipsGo API Error ${response.status}: ${errorText}`)
      throw new Error(`ShipsGo API Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`ShipsGo API Response:`, data)
    return data
  }

  // 1. Tracking de contenedor individual
  async trackContainer(containerNumber: string): Promise<ShipsGoContainer | null> {
    try {
      console.log(`Tracking container: ${containerNumber}`)
      const data = await this.makeRequest(`/tracking/container/${containerNumber}`)
      return data.data || data.container || data || null
    } catch (error) {
      console.error(`Error tracking container ${containerNumber}:`, error)
      return null
    }
  }

  // 2. Tracking múltiple de contenedores (batch)
  async trackMultipleContainers(containerNumbers: string[]): Promise<ShipsGoContainer[]> {
    try {
      console.log(`Tracking multiple containers:`, containerNumbers)

      // ShipsGo permite hasta 50 contenedores por batch
      const batches = []
      for (let i = 0; i < containerNumbers.length; i += 50) {
        batches.push(containerNumbers.slice(i, i + 50))
      }

      const results: ShipsGoContainer[] = []

      for (const batch of batches) {
        const data = await this.makeRequest("/tracking/containers/batch", {
          method: "POST",
          body: JSON.stringify({ containers: batch }),
        })

        if (data.data) {
          results.push(...data.data)
        } else if (data.containers) {
          results.push(...data.containers)
        } else if (Array.isArray(data)) {
          results.push(...data)
        }
      }

      return results
    } catch (error) {
      console.error("Error tracking multiple containers:", error)
      return []
    }
  }

  // 3. Obtener información de barco por IMO
  async getVesselByIMO(imo: string): Promise<ShipsGoVessel | null> {
    try {
      console.log(`Getting vessel by IMO: ${imo}`)
      const data = await this.makeRequest(`/vessels/imo/${imo}`)
      return data.data || data.vessel || data || null
    } catch (error) {
      console.error(`Error fetching vessel ${imo}:`, error)
      return null
    }
  }

  // 4. Buscar barcos por nombre
  async searchVessels(vesselName: string): Promise<ShipsGoVessel[]> {
    try {
      console.log(`Searching vessels: ${vesselName}`)
      const data = await this.makeRequest(`/vessels/search?name=${encodeURIComponent(vesselName)}`)
      return data.data || data.vessels || []
    } catch (error) {
      console.error(`Error searching vessels:`, error)
      return []
    }
  }

  // 5. Obtener barcos en una ruta específica
  async getVesselsOnRoute(originPort: string, destinationPort: string): Promise<ShipsGoVessel[]> {
    try {
      console.log(`Getting vessels on route: ${originPort} -> ${destinationPort}`)
      const data = await this.makeRequest(`/vessels/route?origin=${originPort}&destination=${destinationPort}`)
      return data.data || data.vessels || []
    } catch (error) {
      console.error("Error fetching vessels on route:", error)
      return []
    }
  }

  // 6. Obtener barcos cerca de un puerto
  async getVesselsNearPort(portCode: string, radiusKm = 50): Promise<ShipsGoVessel[]> {
    try {
      console.log(`Getting vessels near port: ${portCode} (${radiusKm}km)`)
      const data = await this.makeRequest(`/vessels/near-port/${portCode}?radius=${radiusKm}`)
      return data.data || data.vessels || []
    } catch (error) {
      console.error(`Error fetching vessels near port ${portCode}:`, error)
      return []
    }
  }

  // 7. Obtener schedule de una naviera
  async getCarrierSchedule(
    carrierCode: string,
    originPort: string,
    destinationPort: string,
  ): Promise<ShipsGoSchedule[]> {
    try {
      console.log(`Getting carrier schedule: ${carrierCode} from ${originPort} to ${destinationPort}`)
      const data = await this.makeRequest(
        `/schedules/${carrierCode}?origin=${originPort}&destination=${destinationPort}`,
      )
      return data.data || data.schedules || []
    } catch (error) {
      console.error("Error fetching carrier schedule:", error)
      return []
    }
  }

  // 8. Obtener información de puerto
  async getPortInfo(portCode: string): Promise<any> {
    try {
      console.log(`Getting port info: ${portCode}`)
      const data = await this.makeRequest(`/ports/${portCode}`)
      return data.data || data.port || null
    } catch (error) {
      console.error(`Error fetching port ${portCode}:`, error)
      return null
    }
  }

  // 9. Obtener posiciones de barcos en tiempo real (múltiples IMOs)
  async getVesselPositions(imos: string[]): Promise<ShipsGoVessel[]> {
    try {
      console.log(`Getting vessel positions for IMOs:`, imos)
      const data = await this.makeRequest("/vessels/positions", {
        method: "POST",
        body: JSON.stringify({ imos }),
      })
      return data.data || data.vessels || []
    } catch (error) {
      console.error("Error fetching vessel positions:", error)
      return []
    }
  }

  // 10. Verificar estado de la API
  async getAPIStatus(): Promise<{ status: string; timestamp: string; rateLimit: any }> {
    try {
      const data = await this.makeRequest("/status")
      return {
        status: "active",
        timestamp: new Date().toISOString(),
        rateLimit: {
          remaining: this.config.rateLimitPerMinute - this.requestCount,
          resetTime: new Date(this.lastResetTime + 60000).toISOString(),
        },
      }
    } catch (error) {
      console.error("Error checking API status:", error)
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        rateLimit: {
          remaining: 0,
          resetTime: new Date().toISOString(),
        },
      }
    }
  }

  // 11. Obtener barcos con destino a puertos colombianos
  async getVesselsToColombianPorts(): Promise<ShipsGoVessel[]> {
    try {
      const colombianPorts = ["COBUN", "COCTG", "COBAQ", "COSMT"]
      const allVessels: ShipsGoVessel[] = []

      for (const portCode of colombianPorts) {
        const vessels = await this.getVesselsNearPort(portCode, 200) // 200km radius
        allVessels.push(...vessels)
      }

      // Eliminar duplicados por IMO
      const uniqueVessels = allVessels.filter(
        (vessel, index, self) => index === self.findIndex((v) => v.imo === vessel.imo),
      )

      return uniqueVessels
    } catch (error) {
      console.error("Error getting vessels to Colombian ports:", error)
      return []
    }
  }

  // 12. Obtener estadísticas de uso de la API
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      rateLimitRemaining: this.config.rateLimitPerMinute - this.requestCount,
      lastResetTime: this.lastResetTime,
      nextResetTime: this.lastResetTime + 60000,
    }
  }
  // 13. Crear seguimiento por BL/Booking
async createTrackingWithBL(params: {
  blContainersRef: string
  shippingLine: string
  containerNumber?: string
  emailAddress?: string
  referenceNo?: string
  tags?: string
}): Promise<{ requestId: string } | null> {
  try {
    await this.checkRateLimit()

    const formData = new URLSearchParams()
    formData.append("authCode", this.config.apiKey)
    formData.append("blContainersRef", params.blContainersRef)
    formData.append("shippingLine", params.shippingLine)

    if (params.containerNumber) formData.append("containerNumber", params.containerNumber)
    if (params.emailAddress) formData.append("emailAddress", params.emailAddress)
    if (params.referenceNo) formData.append("referenceNo", params.referenceNo)
    if (params.tags) formData.append("tags", params.tags)

    const response = await fetch("https://shipsgo.com/api/v1.1/ContainerService/PostCustomContainerFormWithBl", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`Tracking creation error ${response.status}:`, text)
      throw new Error(text)
    }

    const data = await response.json()
    console.log("Tracking created:", data)

    return data
  } catch (error) {
    console.error("Error creating tracking:", error)
    return null
  }
}

  // 14. Obtener estado de seguimiento con el requestId
async getTrackingStatusByRequestId(requestId: string): Promise<any> {
  try {
    await this.checkRateLimit()

    const url = `https://shipsgo.com/api/v1.1/ContainerService/GetContainerInfo?authCode=${this.config.apiKey}&requestId=${requestId}&mapPoint=true`

    const response = await fetch(url)

    if (!response.ok) {
      const text = await response.text()
      console.error(`Tracking info error ${response.status}:`, text)
      throw new Error(text)
    }

    const data = await response.json()
    console.log("Tracking info:", data)

    return data
  } catch (error) {
    console.error("Error fetching tracking info:", error)
    return null
  }
}

}


export const shipsGoAPI = new ShipsGoAPI()
export type { ShipsGoVessel, ShipsGoContainer, ShipsGoEvent, ShipsGoSchedule }
