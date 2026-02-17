import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { PageHeaderCard } from '@/components/ui/page-header-card'
import { MetricsSection } from '@/components/ui/metrics-section'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { ContractTable, type Contract } from '@/components/contracts/contract-table'

export function ContractsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Mock data - tous les contrats de tous les employés
  const contracts: Contract[] = [
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
