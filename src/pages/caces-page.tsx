import { Search, Filter, Plus, ShieldAlert, Sparkles, SearchX, Download, Edit, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
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
import { Link } from '@tanstack/react-router'
import { AddCacesDialog } from '@/components/caces/AddCacesDialog'
import { EditCacesDialog } from '@/components/caces/EditCacesDialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCaces, useCreateCaces, useUpdateCaces, useDeleteCaces } from '@/hooks'
import { PageHeaderSkeleton } from '@/components/ui/table-skeleton'

export function CacesPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCaces, setEditingCaces] = useState<any>(null)
  const [sortColumn, setSortColumn] = useState<string>('employee')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use TanStack Query hooks
  const { data: caces = [], isLoading } = useCaces()
  const createCaces = useCreateCaces()
  const updateCaces = useUpdateCaces()
  const deleteCaces = useDeleteCaces()

  // KPIs - calculated dynamically
  const kpis = useMemo(() => ({
    totalCaces: caces.length,
    expiredCaces: caces.filter(c => c.status === 'expired').length,
    warningCaces: caces.filter(c => c.status === 'warning').length,
    validCaces: caces.filter(c => c.status === 'valid').length,
  }), [caces])

  // Get unique categories, statuses and employees
  const uniqueCategories = useMemo(() => {
    const categories = new Set(caces.map(c => c.category))
    return Array.from(categories)
  }, [caces])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(caces.map(c => c.status))
    return Array.from(statuses)
  }, [caces])

  const uniqueEmployees = useMemo(() => {
    const employees = new Set(caces.map(c => c.employee))
    return Array.from(employees)
  }, [caces])

  // Filter CACES
  const filteredCaces = useMemo(() => {
    return caces.filter((cace) => {
      const matchesSearch =
        search === '' ||
        cace.employee.toLowerCase().includes(search.toLowerCase()) ||
        cace.category.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || cace.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || cace.status === statusFilter
      const matchesEmployee = employeeFilter === 'all' || cace.employee === employeeFilter

      return matchesSearch && matchesCategory && matchesStatus && matchesEmployee
    })
  }, [caces, search, categoryFilter, statusFilter, employeeFilter])

  // Sort CACES
  const sortedCaces = useMemo(() => {
    const sorted = [...filteredCaces].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof typeof a]
      let bValue: any = b[sortColumn as keyof typeof b]

      if (sortColumn === 'daysLeft') {
        aValue = a.daysLeft
        bValue = b.daysLeft
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredCaces, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedCaces.length / itemsPerPage)
  const paginatedCaces = sortedCaces.slice(
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
  }, [search, categoryFilter, statusFilter, employeeFilter])

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    const badgeContent = () => {
      switch (status) {
        case 'expired':
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/15 border border-red-500/25 text-red-700">
              {t('caces.expired')}
            </span>
          )
        case 'warning':
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-600/15 border border-yellow-600/25 text-yellow-700">
              {t('caces.expiringSoon')}
            </span>
          )
        default:
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-600/15 border border-green-600/25 text-green-700">
              {t('caces.valid')}
            </span>
          )
      }
    }

    const tooltipContent = () => {
      switch (status) {
        case 'expired':
          return t('caces.tooltip.statusExpired')
        case 'warning':
          return t('caces.tooltip.statusExpiringSoon')
        default:
          return t('caces.tooltip.statusValid')
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger>{badgeContent()}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{tooltipContent()}</p></TooltipContent>
      </Tooltip>
    )
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      '1A': 'bg-blue-500',
      '1B': 'bg-indigo-500',
      '3': 'bg-purple-500',
      '5': 'bg-pink-500',
      '7': 'bg-teal-500',
    }
    const dotColor = categoryColors[category] || 'bg-gray-500'

    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        CACES {category}
      </span>
    )

    const tooltipKey = `caces.tooltip.category${category.toLowerCase()}`

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{t(tooltipKey)}</p></TooltipContent>
      </Tooltip>
    )
  }

  const getDaysBadge = (daysLeft: number) => {
    let dotColor: string
    let text: string

    if (daysLeft < 0) {
      dotColor = 'bg-red-500'
      text = `${Math.abs(daysLeft)} ${t('caces.daysOverdue')}`
    } else if (daysLeft <= 30) {
      dotColor = 'bg-yellow-600'
      text = `${daysLeft} ${t('caces.daysLeft')}`
    } else {
      dotColor = 'bg-green-600'
      text = `${daysLeft} ${t('caces.daysLeft')}`
    }

    const tooltipContent = () => {
      if (daysLeft < 0) {
        return t('caces.tooltip.daysOverdue')
      }
      return t('caces.tooltip.daysLeft')
    }

    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {text}
      </span>
    )

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs"><p>{tooltipContent()}</p></TooltipContent>
      </Tooltip>
    )
  }

  const handleAddCaces = (data: any) => {
    createCaces.mutate(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false)
      }
    })
  }

  const handleEditCaces = (data: any) => {
    updateCaces.mutate({ id: editingCaces.id, ...data }, {
      onSuccess: () => {
        setEditingCaces(null)
      }
    })
  }

  const handleDeleteCaces = (id: number) => {
    deleteCaces.mutate(id, {
      onSuccess: () => {
        // Dialog will be closed by the component calling this
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <PageHeaderSkeleton showMetrics metricsCount={4} />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t('caces.title')}
            description={t('caces.description')}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t('caces.totalCaces'),
                value: kpis.totalCaces,
                description: `${kpis.validCaces} ${t('caces.valid')}`,
                icon: <ShieldAlert className="h-4 w-4" />
              },
              {
                title: t('caces.expired'),
                value: kpis.expiredCaces,
                description: `${((kpis.expiredCaces / kpis.totalCaces) * 100).toFixed(0)}${t('common.ofTotal')}`,
                icon: <ShieldAlert className="h-4 w-4" />,
                iconColor: 'text-red-500'
              },
              {
                title: t('caces.expiringSoon'),
                value: kpis.warningCaces,
                description: `${((kpis.warningCaces / kpis.totalCaces) * 100).toFixed(0)}${t('common.ofTotal')}`,
                icon: <Filter className="h-4 w-4" />,
                iconColor: 'text-yellow-500'
              },
              {
                title: t('caces.valid'),
                value: kpis.validCaces,
                description: `${((kpis.validCaces / kpis.totalCaces) * 100).toFixed(0)}${t('common.ofTotal')}`,
                icon: <ShieldAlert className="h-4 w-4" />,
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
                  placeholder={t('caces.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('caces.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('caces.allCategories')}</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('caces.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('caces.allStatuses')}</SelectItem>
                  <SelectItem value="expired">{t('caces.expired')}</SelectItem>
                  <SelectItem value="warning">{t('caces.expiringSoon')}</SelectItem>
                  <SelectItem value="valid">{t('caces.valid')}</SelectItem>
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
              <Button className="gap-2 ml-auto" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />{t('caces.addCaces')}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card overflow-x-auto">
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
                        {t('caces.employee')}
                        {getSortIcon('employee')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        {t('caces.category')}
                        {getSortIcon('category')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('dateObtained')}
                    >
                      <div className="flex items-center gap-1">
                        {t('caces.issueDate')}
                        {getSortIcon('dateObtained')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('expirationDate')}
                    >
                      <div className="flex items-center gap-1">
                        {t('caces.expiryDate')}
                        {getSortIcon('expirationDate')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4 h-8 hover:bg-muted font-medium"
                      onClick={() => handleSort('daysLeft')}
                    >
                      <div className="flex items-center gap-1">
                        {t('dashboard.days')}
                        {getSortIcon('daysLeft')}
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
                        {t('caces.status')}
                        {getSortIcon('status')}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">{t('caces.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCaces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64">
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
                  paginatedCaces.map((cacesItem) => (
                    <TableRow key={cacesItem.id} className="hover:bg-muted/50">
                      <TableCell className="px-4">
                        <Link
                          to={`/employees_/${cacesItem.employeeId}`}
                          className="text-gray-700 underline hover:opacity-80 transition-opacity"
                        >
                          {cacesItem.employee}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4">{getCategoryBadge(cacesItem.category)}</TableCell>
                      <TableCell className="px-4 text-gray-700">{cacesItem.dateObtained}</TableCell>
                      <TableCell className="px-4 text-gray-700">{cacesItem.expirationDate}</TableCell>
                      <TableCell className="px-4">{getDaysBadge(cacesItem.daysLeft)}</TableCell>
                      <TableCell className="px-4">{getStatusBadge(cacesItem.status)}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditingCaces(cacesItem)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
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
                {t('caces.showing', {
                  from: ((currentPage - 1) * itemsPerPage) + 1,
                  to: Math.min(currentPage * itemsPerPage, sortedCaces.length),
                  total: sortedCaces.length
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
      <AddCacesDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddCaces}
      />
      <EditCacesDialog
        open={editingCaces !== null}
        onOpenChange={(open) => !open && setEditingCaces(null)}
        onUpdate={handleEditCaces}
        caces={editingCaces}
      />
    </>
  )
}
