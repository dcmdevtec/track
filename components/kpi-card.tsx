import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description: string
}

export function KPICard({ title, value, change, changeType, icon: Icon, description }: KPICardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md dark:hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              changeType === "positive" && "text-green-600 border-green-600 dark:text-green-400 dark:border-green-400",
              changeType === "negative" && "text-red-600 border-red-600 dark:text-red-400 dark:border-red-400",
              changeType === "neutral" && "text-gray-600 border-gray-600 dark:text-gray-400 dark:border-gray-400",
            )}
          >
            {change}
          </Badge>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
