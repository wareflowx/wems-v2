import { Link } from '@tanstack/react-router'
import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Edit,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeaderCard } from '@/components/ui/page-header-card'
import { MetricsSection } from '@/components/ui/metrics-section'
import { StatusBadge, DetailBadge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useState, useMemo, useEffect } from 'react'
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

export function ContractsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Mock data - tous les contrats de tous les employés
  const contracts = [
    {
      id: 1,
      employee: 'Jean Dupont',
      employeeId: 1,
      type: 'CDI',
      startDate: '2020-03-15',
      endDate: null,
      status: 'active',
      duration: 59, // mois
      renewable: false,
      renewalCount: 0,
      salary: 3500,
      department: 'Production',
    },
    {
      id: 2,
      employee: 'Marie Martin',
      employeeId: 2,
      type: 'CDD',
      startDate: '2024-09-01',
      endDate: '2025-03-01',
      status: 'active',
      duration: 6,
      renewable: true,
      renewalCount: 0,
      salary: 3200,
      department: 'Administration',
      trialPeriod: false,
    },
    {
      id: 3,
      employee: 'Pierre Bernard',
      employeeId: 3,
      type: 'Intérim',
      startDate: '2024-06-01',
      endDate: '2025-02-28',
      status: 'ending_soon',
      duration: 9,
      renewable: false,
      salary: 3800,
      department: 'Production',
      agency: 'Interim-Aglo',
    },
    {
      id: 4,
      employee: 'Sophie Petit',
      employeeId: 4,
      type: 'CDI',
      startDate: '2020-09-20',
      endDate: null,
      status: 'active',
      duration: 53,
      renewable: false,
      salary: 4200,
      department: 'RH',
    },
    {
      id: 5,
      employee: 'Luc Dubois',
      employeeId: 5,
      type: 'CDD',
      startDate: '2024-02-01',
      endDate: '2024-08-01',
      status: 'completed',
      duration: 6,
      renewable: true,
      renewalCount: 0,
      salary: 3100,
      department: 'Production',
      trialPeriod: true,
      trialEndDate: '2024-03-01',
      renewed: false,
    },
    {
      id: 6,
      employee: 'Claude Monnet',
      employeeId: 6,
      type: 'Intérim',
      startDate: '2024-11-01',
      endDate: '2025-05-01',
      status: 'trial_period',
      duration: 6,
      endDate: '2025-02-01',
      salary: 3600,
      department: 'Production',
      agency: 'Temp-World',
    },
  ]

  // KPIs
  const kpis = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    endingSoon: contracts.filter(c => c.status === 'ending_soon').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    cdi: contracts.filter(c => c.type === 'CDI').length,
    cdd: contracts.filter(c => c.type === 'CDD').length,
    interim: contracts.filter(c => c.type === 'Intérim').length,
  }

  // Get unique values for filters
  const uniqueTypes = useMemo(() => {
    const types = new Set(contracts.map(c => c.type))
    return Array.from(types)
  }, [contracts])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(contracts.map(c => c.status))
    return Array.from(statuses)
  }, [contracts])

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesSearch =
        search === '' ||
        contract.employee.toLowerCase().includes(search.toLowerCase()) ||
        contract.department?.toLowerCase().includes(search.toLowerCase())

      const matchesType = typeFilter === 'all' || contract.type === typeFilter
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [contracts, search, typeFilter, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, statusFilter, periodFilter])

  const getTypeBadge = (type: string) => {
    const colors: Record<string, "blue" | "orange" | "teal"> = {
      'CDI': 'blue',
      'CDD': 'orange',
      'Intérim': 'teal',
    }
    return <DetailBadge color={colors[type] || 'gray'}>{type}</DetailBadge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'green' as const, label: 'Actif' },
      ending_soon: { color: 'yellow' as const, label: 'Bientôt terminé' },
      completed: { color: 'gray' as const, label: 'Terminé' },
      trial_period: { color: 'blue' as const, label: 'Période essai' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    return <StatusBadge color={config.color}>{config.label}</StatusBadge>
  }

  const getDaysUntilEnd = (endDate: string | null) => {
    if (!endDate) return '-'
    const end = new Date(endDate)
    const today = new Date()
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? `${diff} jours` : 'Expiré'
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t('contracts.title')}
            description={t('contracts.description')}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t('contracts.total'),
                value: kpis.totalContracts,
                description: `${kpis.cdi} CDI, ${kpis.cdd} CDD, ${kpis.interim} Intérim`,
                icon: <FileText className="h-4 w-4" />,
              },
              {
                title: t('contracts.active'),
                value: kpis.activeContracts,
                description: `${kpis.cdi} CDI, ${kpis.cdd} CDD, ${kpis.interim} Intérim`,
                icon: <CheckCircle2 className="h-4 w-4" />,
                iconColor: 'text-green-500',
              },
              {
                title: t('contracts.endingSoon'),
                value: kpis.endingSoon,
                description: 'Contrats se terminant dans 30 jours',
                icon: <AlertTriangle className="h-4 w-4" />,
                iconColor: 'text-yellow-500',
              },
              {
                title: 'CDD/Intérim > 18 mois',
                value: 2,
                description: 'À surveiller',
                icon: <AlertTriangle className="h-4 w-4" />,
                iconColor: 'text-red-500',
              },
            ]}
          />

          <div className="flex gap-2 flex-col">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('contracts.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('contracts.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('contracts.allTypes')}</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t('contracts.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('contracts.allStatuses')}</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'active'
                        ? 'Actif'
                        : status === 'ending_soon'
                          ? 'Bientôt terminé'
                          : status === 'completed'
                            ? 'Terminé'
                            : status === 'trial_period'
                              ? 'Période essai'
                              : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="gap-2 ml-auto">
                <Plus className="h-4 w-4" />
                {t('contracts.addContract')}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">{t('employeeDetail.fullName')}</TableHead>
                    <TableHead className="px-4">Employeur</TableHead>
                    <TableHead className="px-4">{t('contracts.type')}</TableHead>
                    <TableHead className="px-4">{t('contracts.startDate')}</TableHead>
                    <TableHead className="px-4">{t('contracts.endDate')}</TableHead>
                    <TableHead className="px-4">{t('contracts.status')}</TableHead>
                    <TableHead className="px-4 text-right">
                      {t('employees.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts.length === 0 ? (
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
                    paginatedContracts.map((contract) => (
                      <TableRow key={contract.id} className="hover:bg-muted/50">
                        <TableCell className="px-4">
                          <Link
                            to={`/employees/${contract.employeeId}`}
                            className="text-gray-700 underline hover:opacity-80 transition-opacity"
                          >
                            {contract.employee}
                          </Link>
                          {contract.renewalCount > 0 && (
                            <div className="flex gap-1 mt-1">
                              <DetailBadge color="blue">{contract.renewalCount} renouvellement{contract.renewalCount > 1 ? 's' : ''}</DetailBadge>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          {contract.agency ? (
                            <DetailBadge color="orange">{contract.agency}</DetailBadge>
                          ) : (
                            <DetailBadge color="blue">WEMS</DetailBadge>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          {getTypeBadge(contract.type)}
                        </TableCell>
                        <TableCell className="px-4 text-gray-700">{contract.startDate}</TableCell>
                        <TableCell className="px-4">
                          <div className="flex flex-col">
                            <span className="text-gray-700">
                              {contract.endDate || 'CDI'}
                            </span>
                            {contract.endDate && contract.status === 'active' && (
                              <span className="text-xs text-yellow-600 font-medium">
                                {getDaysUntilEnd(contract.endDate)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4">{getStatusBadge(contract.status)}</TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Voir détails">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Éditer">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {(contract.status === 'ending_soon' ||
                              (contract.type === 'CDD' && contract.renewable)) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Renouveler"
                                className="text-green-600 hover:text-green-700"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t('common.view')} de {startIndex + 1} à{' '}
              {Math.min(endIndex, filteredContracts.length)} sur{' '}
              {filteredContracts.length} {t('contracts.contracts')}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
