import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { PageHeaderCard } from '@/components/ui/page-header-card'
import { MetricsSection } from '@/components/ui/metrics-section'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useMemo } from 'react'
import { ContractTable, type Contract } from '@/components/contracts/contract-table'
import { useContracts } from '@/hooks'

export function ContractsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use TanStack Query hook for contracts
  const { data: contracts = [], isLoading } = useContracts()

  // KPIs - calculated dynamically
  const kpis = useMemo(() => ({
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    endingSoon: contracts.filter(c => c.status === 'ending_soon').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    cdi: contracts.filter(c => c.type === 'CDI').length,
    cdd: contracts.filter(c => c.type === 'CDD').length,
    interim: contracts.filter(c => c.type === 'Intérim').length,
  }), [contracts])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, statusFilter])

  const handleAddContract = () => {
    // TODO: Open add contract dialog
    console.log('Add contract')
  }

  const handleEditContract = (contract: Contract) => {
    // TODO: Open edit contract dialog
    console.log('Edit contract:', contract)
  }

  const handleViewContract = (contract: Contract) => {
    // TODO: Open view contract dialog
    console.log('View contract:', contract)
  }

  const handleRenewContract = (contract: Contract) => {
    // TODO: Open renew contract dialog
    console.log('Renew contract:', contract)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t('contracts.title')}
            description={t('contracts.description')}
          />
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
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

        {/* Contracts Table */}
        <ContractTable
          contracts={contracts}
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onAddContract={handleAddContract}
          onEdit={handleEditContract}
          onView={handleViewContract}
          onRenew={handleRenewContract}
        />
      </div>
    </div>
  )
}
