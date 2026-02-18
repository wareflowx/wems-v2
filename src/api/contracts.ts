import { contracts, type Contract } from '@/mock-data/contracts'

// Types
export interface ContractFilters {
  search?: string
  type?: string
  status?: string
}

export interface CreateContractInput {
  employee: string
  employeeId: number
  type: string
  startDate: string
  endDate: string | null
  salary: string
  department: string
  status: string
}

export interface UpdateContractInput {
  id: number
  updates: Partial<Omit<Contract, 'id'>>
}

// API functions
export const contractsApi = {
  getAll: async (filters?: ContractFilters): Promise<Contract[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let data = [...contracts]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      data = data.filter(contract =>
        contract.employee.toLowerCase().includes(searchLower) ||
        contract.type.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.type && filters.type !== 'all') {
      data = data.filter(contract => contract.type === filters.type)
    }

    if (filters?.status && filters.status !== 'all') {
      data = data.filter(contract => contract.status === filters.status)
    }

    return data
  },

  getById: async (id: number): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const contract = contracts.find(c => c.id === id)
    if (!contract) {
      throw new Error(`Contract with id ${id} not found`)
    }
    return contract
  },

  create: async (input: CreateContractInput): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const newContract: Contract = {
      id: Math.max(...contracts.map(c => c.id), 0) + 1,
      ...input,
    }

    contracts.push(newContract)
    return newContract
  },

  update: async ({ id, updates }: UpdateContractInput): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const index = contracts.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Contract with id ${id} not found`)
    }

    contracts[index] = { ...contracts[index], ...updates }
    return contracts[index]
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = contracts.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`Contract with id ${id} not found`)
    }

    contracts.splice(index, 1)
  },
}

export { contracts as mockContracts }
