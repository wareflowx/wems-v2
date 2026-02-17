import { Link } from '@tanstack/react-router'
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Edit,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge, DetailBadge } from '@/components/ui/badge'
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

export interface Contract {
  id: number
  employee: string
  employeeId: number
  type: string
  startDate: string
  endDate: string | null
  status: string
  duration: number
  renewable: boolean
  renewalCount: number
  salary: number
  department: string
  agency?: string
  trialPeriod?: boolean
  trialEndDate?: string
  renewed?: boolean
}

interface ContractTableProps {
  contracts: Contract[]
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  currentPage: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  onAddContract: () => void
  onEdit?: (contract: Contract) => void
  onView?: (contract: Contract) => void
  onRenew?: (contract: Contract) => void
}

export function ContractTable({
  contracts,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  onAddContract,
  onEdit,
  onView,
  onRenew,
}: ContractTableProps) {
  const { t } = useTranslation()

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(contracts.map((c) => c.type)))
  const uniqueStatuses = Array.from(new Set(contracts.map((c) => c.status)))

  // Filter contracts
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      search === '' ||
      contract.employee.toLowerCase().includes(search.toLowerCase()) ||
      contract.department?.toLowerCase().includes(search.toLowerCase())

    const matchesType = typeFilter === 'all' || contract.type === typeFilter
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex)

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
    <div className="flex gap-2 flex-col">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('contracts.search')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
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
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
        <Button className="gap-2 ml-auto" onClick={onAddContract}>
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
                      {onView && (
                        <Button variant="ghost" size="icon" title="Voir détails" onClick={() => onView(contract)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="ghost" size="icon" title="Éditer" onClick={() => onEdit(contract)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onRenew && (contract.status === 'ending_soon' ||
                        (contract.type === 'CDD' && contract.renewable)) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Renouveler"
                          onClick={() => onRenew(contract)}
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
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
