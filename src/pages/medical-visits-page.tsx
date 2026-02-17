import { Link } from '@tanstack/react-router'
import { Search, Filter, Plus, Calendar, User, FileText, CheckCircle2, Clock, AlertTriangle, Sparkles, Stethoscope, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SearchX, Edit, Trash2, Eye, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeaderCard } from '@/components/ui/page-header-card'
import { MetricsSection } from '@/components/ui/metrics-section'
import { useTranslation } from 'react-i18next'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState, useMemo } from 'react'
import { AddMedicalVisitDialog } from '@/components/medical-visits/AddMedicalVisitDialog'
import { DeleteMedicalVisitDialog } from '@/components/medical-visits/DeleteMedicalVisitDialog'

interface MedicalVisit {
  id: number
  employee: string
  employeeId: number
  type: string
  scheduledDate: string
  status: string
  daysUntil?: number
  actualDate?: string
  fitnessStatus?: string
}

export function MedicalVisitsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('employee')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | undefined>(undefined)
  const itemsPerPage = 10

  const visits: MedicalVisit[] = [
    { id: 1, employee: 'Jean Dupont', employeeId: 1, type: 'Visite périodique', scheduledDate: '2025-02-15', status: 'scheduled', daysUntil: 3 },
    { id: 2, employee: 'Marie Martin', employeeId: 2, type: 'Visite de reprise', scheduledDate: '2025-02-01', status: 'overdue', daysUntil: -10 },
    { id: 3, employee: 'Pierre Bernard', employeeId: 3, type: 'Visite initiale', scheduledDate: '2025-03-20', status: 'scheduled', daysUntil: 36 },
    { id: 4, employee: 'Sophie Petit', employeeId: 4, type: 'Visite périodique', scheduledDate: '2025-02-10', status: 'completed', actualDate: '2025-02-10', fitnessStatus: 'Apt' },
  ]

  // Get unique types, statuses and employees
  const uniqueTypes = useMemo(() => {
    const types = new Set(visits.map(v => v.type))
    return Array.from(types)
  }, [visits])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(visits.map(v => v.status))
    return Array.from(statuses)
  }, [visits])

  const uniqueEmployees = useMemo(() => {
    const employees = new Set(visits.map(v => v.employee))
    return Array.from(employees)
  }, [visits])

  // Filter visits
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const matchesSearch =
        search === '' ||
        visit.employee.toLowerCase().includes(search.toLowerCase()) ||
        visit.type.toLowerCase().includes(search.toLowerCase())

      const matchesType = typeFilter === 'all' || visit.type === typeFilter
      const matchesStatus = statusFilter === 'all' || visit.status === statusFilter
      const matchesEmployee = employeeFilter === 'all' || visit.employee === employeeFilter

      return matchesSearch && matchesType && matchesStatus && matchesEmployee
    })
  }, [visits, search, typeFilter, statusFilter, employeeFilter])

  // Sort visits
  const sortedVisits = useMemo(() => {
    const sorted = [...filteredVisits].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof typeof a]
      let bValue: any = b[sortColumn as keyof typeof b]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredVisits, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedVisits.length / itemsPerPage)
  const paginatedVisits = sortedVisits.slice(
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
  }, [search, typeFilter, statusFilter, employeeFilter])

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // KPIs
  const kpis = {
    totalVisits: visits.length,
    overdueVisits: visits.filter(v => v.status === 'overdue').length,
    upcomingVisits: visits.filter(v => v.status === 'scheduled').length,
    completedVisits: visits.filter(v => v.status === 'completed').length,
  }

  const getStatusBadge = (status: string, daysUntil?: number) => {
    const statusMap = {
      scheduled: {
        label: t('medicalVisits.scheduled'),
        variant: 'default' as const,
        color: 'bg-blue-600/10 border border-blue-600/20 text-blue-700',
        tooltip: t('medicalVisits.tooltip.statusScheduled')
      },
      overdue: {
        label: t('medicalVisits.overdue'),
        variant: 'destructive' as const,
        color: 'bg-red-600/10 border border-red-600/20 text-red-700',
        tooltip: t('medicalVisits.tooltip.statusOverdue')
      },
      completed: {
        label: t('medicalVisits.completed'),
        variant: 'secondary' as const,
        color: 'bg-green-600/10 border border-green-600/20 text-green-700',
        tooltip: t('medicalVisits.tooltip.statusCompleted')
      },
      cancelled: {
        label: t('medicalVisits.cancelled'),
        variant: 'outline' as const,
        color: 'bg-gray-600/10 border border-gray-600/20 text-gray-700',
        tooltip: t('medicalVisits.tooltip.statusCancelled')
      }
    }
    const { label, color, tooltip } = statusMap[status as keyof typeof statusMap] || statusMap.scheduled

    return (
      <Tooltip>
        <TooltipTrigger>{badgeContent(label, color)}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{tooltip}</p></TooltipContent>
      </Tooltip>
    )
  }

  const badgeContent = (label: string, color: string) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${color}`}>{label}</span>
  )

  const getTypeBadge = (type: string) => {
    const typeMap = {
      'Visite périodique': {
        label: t('medicalVisits.periodicVisit'),
        dotColor: 'bg-purple-600',
        tooltip: t('medicalVisits.tooltip.periodicVisit')
      },
      'Visite de reprise': {
        label: t('medicalVisits.returnVisit'),
        dotColor: 'bg-orange-600',
        tooltip: t('medicalVisits.tooltip.returnVisit')
      },
      'Visite initiale': {
        label: t('medicalVisits.initialVisit'),
        dotColor: 'bg-teal-600',
        tooltip: t('medicalVisits.tooltip.initialVisit')
      }
    }
    const config = typeMap[type as keyof typeof typeMap] || {
      label: type,
      dotColor: 'bg-gray-600',
      tooltip: type
    }

    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
        {config.label}
      </span>
    )

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{config.tooltip}</p></TooltipContent>
      </Tooltip>
    )
  }

  const handleDelete = (visit: MedicalVisit) => {
    setSelectedVisit(visit)
    setDeleteDialogOpen(true)
  }

  const handleEdit = (visit: MedicalVisit) => {
    // TODO: Implement edit functionality
    console.log('Edit visit:', visit)
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t('medicalVisits.title')}
            description="Planifiez et suivez les visites médicales obligatoires de vos employés"
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t('medicalVisits.total'),
                value: kpis.totalVisits,
                description: 'Total visites',
                icon: <FileText className="h-4 w-4" />
              },
              {
                title: t('medicalVisits.overdue'),
                value: kpis.overdueVisits,
                description: `${((kpis.overdueVisits / kpis.totalVisits) * 100).toFixed(0)}% du total`,
                icon: <AlertTriangle className="h-4 w-4" />,
                iconColor: 'text-red-500'
              },
              {
                title: t('medicalVisits.upcoming'),
                value: kpis.upcomingVisits,
                description: `${((kpis.upcomingVisits / kpis.totalVisits) * 100).toFixed(0)}% du total`,
                icon: <Calendar className="h-4 w-4" />,
                iconColor: 'text-blue-500'
              },
              {
                title: t('medicalVisits.completed'),
                value: kpis.completedVisits,
                description: `${((kpis.completedVisits / kpis.totalVisits) * 100).toFixed(0)}% du total`,
                icon: <CheckCircle2 className="h-4 w-4" />,
                iconColor: 'text-green-500'
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue placeholder={t('medicalVisits.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue placeholder={t('medicalVisits.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="scheduled">{t('medicalVisits.scheduled')}</SelectItem>
                <SelectItem value="overdue">{t('medicalVisits.overdue')}</SelectItem>
                <SelectItem value="completed">{t('medicalVisits.completed')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue placeholder={t('caces.employee')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.allEmployees')}</SelectItem>
                {uniqueEmployees.map((employee) => (
                  <SelectItem key={employee} value={employee}>
                    {employee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="gap-2 ml-auto" onClick={() => setAddDialogOpen(true)}><Plus className="h-4 w-4" />{t('medicalVisits.newVisit')}</Button>
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
                        {t('medicalVisits.employee')}
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
                        {t('medicalVisits.type')}
                        {getSortIcon('type')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('scheduledDate')}
                    >
                      <div className="flex items-center gap-1">
                        {t('medicalVisits.scheduledDate')}
                        {getSortIcon('scheduledDate')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        {t('medicalVisits.status')}
                        {getSortIcon('status')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64">
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
                  paginatedVisits.map((visit) => (
                    <TableRow key={visit.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link
                          to={`/employees_/${visit.employeeId}`}
                          className="text-gray-700 underline hover:opacity-80 transition-opacity"
                        >
                          {visit.employee}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4">{getTypeBadge(visit.type)}</TableCell>
                      <TableCell className="text-gray-700">{visit.scheduledDate}</TableCell>
                      <TableCell className="px-4">{getStatusBadge(visit.status, visit.daysUntil)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(visit)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(visit)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
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
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, sortedVisits.length)} sur {sortedVisits.length}
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

      {/* Dialogs */}
      <AddMedicalVisitDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onConfirm={() => {
          // TODO: Implement backend logic
          console.log('Adding medical visit')
        }}
      />
      <DeleteMedicalVisitDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          // TODO: Implement backend logic
          console.log('Deleting medical visit:', selectedVisit?.id)
        }}
        visit={selectedVisit}
      />
    </TooltipProvider>
  )
}
