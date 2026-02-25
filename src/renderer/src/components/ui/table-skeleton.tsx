import { Skeleton } from './skeleton'
import { Card } from './card'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
}

export function TableSkeleton({ rows = 5, columns = 4, showHeader = true }: TableSkeletonProps) {
  return (
    <Card className="w-full">
      <div className="w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          {showHeader && (
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="[&_tr:last-child]:border-0">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="p-4 align-middle">
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

interface PageHeaderSkeletonProps {
  showMetrics?: boolean
  metricsCount?: number
}

export function PageHeaderSkeleton({ showMetrics = true, metricsCount = 4 }: PageHeaderSkeletonProps) {
  return (
    <div className="min-h-full space-y-3">
      {/* Header Card */}
      <div className="p-4 bg-background shadow-sm rounded-md border">
        <div className="flex items-start gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      {showMetrics && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: metricsCount }).map((_, i) => (
            <div key={i} className="p-4 bg-background shadow-sm rounded-md border">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Filters Section */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 flex-1 min-w-[200px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Table */}
      <TableSkeleton />
    </div>
  )
}
