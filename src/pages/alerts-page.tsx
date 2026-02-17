import { Search, Filter, Plus, Sparkles, Bell, ShieldAlert, AlertTriangle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SearchX, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeaderCard } from '@/components/ui/page-header-card'
import { MetricsSection } from '@/components/ui/metrics-section'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { useAlerts } from '@/lib/hooks'
import { PageHeaderSkeleton } from '@/components/ui/table-skeleton'

interface Alert {
  id: number
  type: string
  employee: string
  employeeId: number
  category?: string
  visitType?: string
  daysLeft?: number
  severity: string
  date: string
}

export function AlertsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use TanStack Query hook for alerts
  const { data: alerts = [], isLoading } = useAlerts({ search, severity: severityFilter, type: typeFilter })

  // Get unique severities and types from current data
  const uniqueSeverities = useMemo(() => {
    const severities = new Set(alerts.map(a => a.severity))
    return Array.from(severities)
  }, [alerts])

  const uniqueTypes = useMemo(() => {
    const types = new Set(alerts.map(a => a.type))
    return Array.from(types)
  }, [alerts])

  // Client-side sorting
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortColumn) {
        case 'employee':
          aVal = a.employee.toLowerCase()
          bVal = b.employee.toLowerCase()
          break
        case 'type':
          aVal = a.type.toLowerCase()
          bVal = b.type.toLowerCase()
          break
        case 'severity':
          const severityOrder = { critical: 3, warning: 2, info: 1 }
          aVal = severityOrder[a.severity as keyof typeof severityOrder] || 0
          bVal = severityOrder[b.severity as keyof typeof severityOrder] || 0
          break
        case 'date':
          aVal = new Date(a.date).getTime()
          bVal = new Date(b.date).getTime()
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [alerts, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage)
  const paginatedAlerts = sortedAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [search, severityFilter, typeFilter])

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // KPIs
  const kpis = {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    warningAlerts: alerts.filter(a => a.severity === 'warning').length,
    infoAlerts: alerts.filter(a => a.severity === 'info').length,
  }

  const getSeverityBadge = (severity: string) => {
    let colors: string
    let label: string
    let tooltip: string

    switch (severity) {
      case 'critical':
        colors = 'bg-red-500/15 border border-red-500/25 text-red-700'
        label = t('alerts.critical')
        tooltip = t('alerts.tooltip.critical')
        break
      case 'warning':
        colors = 'bg-yellow-600/15 border border-yellow-600/25 text-yellow-700'
        label = t('alerts.warning')
        tooltip = t('alerts.tooltip.warning')
        break
      case 'info':
        colors = 'bg-blue-500/15 border border-blue-500/25 text-blue-700'
        label = t('alerts.info')
        tooltip = t('alerts.tooltip.info')
        break
      default:
        colors = 'bg-gray-500/15 border border-gray-500/25 text-gray-700'
        label = severity
        tooltip = severity
    }

    const badge = (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors}`}>
        {label}
      </span>
    )

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{tooltip}</p></TooltipContent>
      </Tooltip>
    )
  }

  const getTypeBadge = (type: string) => {
    let dotColor: string

    if (type.includes('CACES')) {
      dotColor = 'bg-purple-600'
    } else if (type.includes('Visite')) {
      dotColor = 'bg-green-600'
    } else {
      dotColor = 'bg-gray-600'
    }

    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {type}
      </span>
    )

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{type}</p></TooltipContent>
      </Tooltip>
    )
  }

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <PageHeaderSkeleton showMetrics metricsCount={4} />
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="min-h-full space-y-3">
            {/* Header */}
            <PageHeaderCard
              icon={<Sparkles className="h-4 w-4 text-gray-600" />}
              title={t('alerts.title')}
              description={t('alerts.description')}
            />

            {/* Key Metrics */}
            <MetricsSection
              kpis={[
                {
                  title: t('alerts.all'),
                  value: kpis.totalAlerts,
                  description: t('alerts.totalAlerts'),
                  icon: <Bell className="h-4 w-4" />
                },
                {
                  title: t('alerts.critical'),
                  value: kpis.criticalAlerts,
                  description: `${((kpis.criticalAlerts / kpis.totalAlerts) * 100).toFixed(0)}${t('common.ofTotal')}`,
                  icon: <ShieldAlert className="h-4 w-4" />,
                  iconColor: 'text-red-500'
                },
                {
                  title: t('alerts.warning'),
                  value: kpis.warningAlerts,
                  description: `${((kpis.warningAlerts / kpis.totalAlerts) * 100).toFixed(0)}${t('common.ofTotal')}`,
                  icon: <AlertTriangle className="h-4 w-4" />,
                  iconColor: 'text-yellow-500'
                },
                {
                  title: t('alerts.info'),
                  value: kpis.infoAlerts,
                  description: `${((kpis.infoAlerts / kpis.totalAlerts) * 100).toFixed(0)}${t('common.ofTotal')}`,
                  icon: <Bell className="h-4 w-4" />,
                  iconColor: 'text-blue-500'
                }
              ]}
            />

            <div className="flex gap-2 flex-col">
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-card"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[180px] bg-card">
                    <SelectValue placeholder={t('alerts.severity')} />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('alerts.allSeverities')}</SelectItem>
                  <SelectItem value="critical">{t('alerts.critical')}</SelectItem>
                  <SelectItem value="warning">{t('alerts.warning')}</SelectItem>
                  <SelectItem value="info">{t('alerts.info')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('alerts.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('alerts.allTypes')}</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-4 h-8 hover:bg-muted font-medium"
                        onClick={() => handleSort('employee')}
                      >
                        <div className="flex items-center gap-1">
                          {t('alerts.employee')}
                          {getSortIcon('employee')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-4 h-8 hover:bg-muted font-medium"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center gap-1">
                          {t('alerts.type')}
                          {getSortIcon('type')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-4 h-8 hover:bg-muted font-medium"
                        onClick={() => handleSort('severity')}
                      >
                        <div className="flex items-center gap-1">
                          {t('alerts.severity')}
                          {getSortIcon('severity')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-4 h-8 hover:bg-muted font-medium"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          {t('alerts.date')}
                          {getSortIcon('date')}
                        </div>
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64">
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <SearchX className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="text-lg font-medium">{t('common.noData')}</p>
                          <p className="text-sm mt-2 max-w-md text-center">
                            {t('dashboard.noDataFound')}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAlerts.map((alert) => (
                      <TableRow key={alert.id} className="hover:bg-muted/50">
                        <TableCell className="px-4 font-medium">
                          <span className="text-gray-700">{alert.employee}</span>
                        </TableCell>
                        <TableCell className="px-4">{getTypeBadge(alert.type)}</TableCell>
                        <TableCell className="px-4">{getSeverityBadge(alert.severity)}</TableCell>
                        <TableCell className="px-4 text-gray-700">{alert.date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('alerts.showing', {
                    from: ((currentPage - 1) * itemsPerPage) + 1,
                    to: Math.min(currentPage * itemsPerPage, sortedAlerts.length),
                    total: sortedAlerts.length
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
    </TooltipProvider>
  )
}
