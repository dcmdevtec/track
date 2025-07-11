import { NextResponse } from "next/server"
import { shipsGoAPI } from "@/lib/services/shipsgo-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const container = searchParams.get("container")
  const action = searchParams.get("action") || "status"
  const imo = searchParams.get("imo")
  const vessel = searchParams.get("vessel")
  const port = searchParams.get("port")

  try {
    console.log(`ShipsGo API Test - Action: ${action}`)

    switch (action) {
      case "status":
        const apiStats = await shipsGoAPI.getAPIStatus()
        const usageStats = shipsGoAPI.getUsageStats()
        return NextResponse.json({
          success: true,
          data: {
            api: apiStats,
            usage: usageStats,
            timestamp: new Date().toISOString(),
          },
        })

      case "track":
        if (!container) {
          return NextResponse.json({ success: false, message: "Container number required" }, { status: 400 })
        }

        console.log(`Testing container tracking: ${container}`)
        const tracking = await shipsGoAPI.trackContainer(container)
        return NextResponse.json({
          success: true,
          data: tracking,
          message: tracking ? "Container found" : "Container not found",
        })

      case "vessel":
        if (!imo) {
          return NextResponse.json({ success: false, message: "IMO number required" }, { status: 400 })
        }

        console.log(`Testing vessel lookup: ${imo}`)
        const vesselInfo = await shipsGoAPI.getVesselByIMO(imo)
        return NextResponse.json({
          success: true,
          data: vesselInfo,
          message: vesselInfo ? "Vessel found" : "Vessel not found",
        })

      case "search":
        if (!vessel) {
          return NextResponse.json({ success: false, message: "Vessel name required" }, { status: 400 })
        }

        console.log(`Testing vessel search: ${vessel}`)
        const searchResults = await shipsGoAPI.searchVessels(vessel)
        return NextResponse.json({
          success: true,
          data: searchResults,
          count: searchResults.length,
        })

      case "port":
        if (!port) {
          return NextResponse.json({ success: false, message: "Port code required" }, { status: 400 })
        }

        console.log(`Testing port info: ${port}`)
        const portInfo = await shipsGoAPI.getPortInfo(port)
        return NextResponse.json({
          success: true,
          data: portInfo,
          message: portInfo ? "Port found" : "Port not found",
        })

      case "near-port":
        if (!port) {
          return NextResponse.json({ success: false, message: "Port code required" }, { status: 400 })
        }

        console.log(`Testing vessels near port: ${port}`)
        const nearbyVessels = await shipsGoAPI.getVesselsNearPort(port, 100)
        return NextResponse.json({
          success: true,
          data: nearbyVessels,
          count: nearbyVessels.length,
        })

      case "colombia":
        console.log("Testing vessels to Colombian ports")
        const colombianVessels = await shipsGoAPI.getVesselsToColombianPorts()
        return NextResponse.json({
          success: true,
          data: colombianVessels,
          count: colombianVessels.length,
        })

      case "batch-track":
        const containers = ["MAEU1234567", "MSCU9876543", "CMDU5555555"]
        console.log(`Testing batch tracking:`, containers)
        const batchResults = await shipsGoAPI.trackMultipleContainers(containers)
        return NextResponse.json({
          success: true,
          data: batchResults,
          count: batchResults.length,
        })

      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("ShipsGo API test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
