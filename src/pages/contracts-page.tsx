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
import {
  useContracts,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
} from '@/hooks'
import { useEmployees } from '@/hooks/use-employees'
import { CreateContractDialog } from '@/components/contracts/CreateContractDialog'
import { EditContractDialog } from '@/components/contracts/EditContractDialog'
import { DeleteContractDialog } from '@/components/contracts/DeleteContractDialog'

// Transform database contract to table contract
function transformContract(
  dbContract: {
    id: number
    employeeId: number
    contractType: string
    startDate: string
    endDate: string | null
    isActive: boolean
  },
  employeeName: string
): Contract {
  const now = new Date()
  const start = new Date(dbContract.startDate)
  const end = dbContract.endDate ? new Date(dbContract.endDate) : null

  // Calculate duration in months
  let duration = 0
  if (end) {
    duration = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  }

  // Determine status
  let status: string
  if (!dbContract.isActive) {
    status = 'completed'
  } else if (end) {
    const daysUntilEnd = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilEnd < 0) {
      status = 'completed'
    } else if (daysUntilEnd <= 30) {
      status = 'ending_soon'
    } else {
      status = 'active'
    }
  } else {
    status = 'active'
  }

  return {
    id: dbContract.id,
    employee: employeeName,
    employeeId: dbContract.employeeId,
    type: dbContract.contractType,
    startDate: dbContract.startDate,
    endDate: dbContract.endDate,
    status,
    duration,
    renewable: dbContract.contractType === 'CDD' || dbContract.contractType === 'Intérim',
    renewalCount: 0,
    salary: 0,
    department: '',
  }
}

export function ContractsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  // Use TanStack Query hooks
  const { data: dbContracts = [], isLoading } = useContracts()
  const { data: employees = [] } = useEmployees()
  const createContract = useCreateContract()
  const updateContract = useUpdateContract()
  const deleteContract = useDeleteContract()

  // Create employee lookup map
  const employeeMap = useMemo(() => {
    const map = new Map<number, string>()
    employees.forEach((emp) => {
      map.set(emp.id, `${emp.firstName} ${emp.lastName}`)
    })
    return map
  }, [employees])

  // Transform database contracts to table format
  const contracts: Contract[] = useMemo(() => {
    return dbContracts.map((c) =>
      transformContract(c, employeeMap.get(c.employeeId) || 'Unknown')
    )
  }, [dbContracts, employeeMap])

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
    setCreateDialogOpen(true)
  }

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract)
    setEditDialogOpen(true)
  }

  const handleViewContract = (contract: Contract) => {
    // For now, open edit dialog in view mode
    setSelectedContract(contract)
    setEditDialogOpen(true)
  }

  const handleRenewContract = (contract: Contract) => {
    // For renewal, open edit dialog with pre-filled data
    setSelectedContract(contract)
    setEditDialogOpen(true)
  }

  const handleDeleteContract = (contract: Contract) => {
    setSelectedContract(contract)
    setDeleteDialogOpen(true)
  }

  const handleCreateContract = (data: {
    employeeId: number
    contractType: string
    startDate: string
    endDate?: string | null
  }) => {
    createContract.mutate({
      employeeId: data.employeeId,
      contractType: data.contractType,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
    })
    setCreateDialogOpen(false)
  }

  const handleUpdateContract = (data: {
    id: number
    contractType: string
    startDate: string
    endDate: string | null
    isActive: boolean
  }) => {
    updateContract.mutate({
      id: data.id,
      contractType: data.contractType,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
    })
    setEditDialogOpen(false)
    setSelectedContract(null)
  }

  const handleConfirmDelete = () => {
    if (selectedContract) {
      deleteContract.mutate(selectedContract.id)
      setDeleteDialogOpen(false)
      setSelectedContract(null)
    }
  }

  // Get selected employee name for create dialog
  const selectedEmployeeName = useMemo(() => {
    if (selectedContract) {
      return selectedContract.employee
    }
    return ''
  }, [selectedContract])

  // Get the database contract for edit dialog
  const dbContractForEdit = useMemo(() => {
    if (!selectedContract) return null
    return dbContracts.find((c) => c.id === selectedContract.id) || null
  }, [selectedContract, dbContracts])

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

      {/* Dialogs */}
      <CreateContractDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateContract}
        employees={employees}
      />
      <EditContractDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleUpdateContract}
        contract={dbContractForEdit}
      />
      <DeleteContractDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        contract={selectedContract}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
