"use client"

interface ShipmentStatusChartProps {
  stats: {
    inTransit: number
    arrived: number
    delayed: number
    critical: number
  }
}

export function ShipmentStatusChart({ stats }: ShipmentStatusChartProps) {
  const data = [
    { status: "En Tránsito", count: stats.inTransit, color: "bg-blue-500" },
    { status: "Arribados", count: stats.arrived, color: "bg-green-500" },
    { status: "Retrasados", count: stats.delayed, color: "bg-yellow-500" },
    { status: "Críticos", count: stats.critical, color: "bg-red-500" },
  ]

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.status} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.status}</span>
            <span className="text-muted-foreground">
              {item.count} ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${item.color}`}
              style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}

      <div className="pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground">Total Embarques</div>
        </div>
      </div>
    </div>
  )
}
