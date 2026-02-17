import { caces, type Caces } from '@/mock-data/caces'

// Types
export interface CacesFilters {
  search?: string
  category?: string
  status?: string
  employee?: string
}

export interface CreateCacesInput {
  employee: string
  employeeId: number
  category: string
  dateObtained: string
  expirationDate: string
  document?: string
}

export interface UpdateCacesInput {
  id: number
  updates: Partial<Omit<Caces, 'id'>>
}

// API functions
export const cacesApi = {
  getAll: async (filters?: CacesFilters): Promise<Caces[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let data = [...caces]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      data = data.filter(c =>
        c.employee.toLowerCase().includes(searchLower) ||
        c.category.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.category && filters.category !== 'all') {
      data = data.filter(c => c.category === filters.category)
    }

    if (filters?.status && filters.status !== 'all') {
      data = data.filter(c => c.status === filters.status)
    }

    if (filters?.employee && filters.employee !== 'all') {
      data = data.filter(c => c.employee === filters.employee)
    }

    return data
  },

  getById: async (id: number): Promise<Caces> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const cacesCert = caces.find(c => c.id === id)
    if (!cacesCert) {
      throw new Error(`CACES certification with id ${id} not found`)
    }
    return cacesCert
  },

  create: async (input: CreateCacesInput): Promise<Caces> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    // Calculate days left
    const expirationDate = new Date(input.expirationDate)
    const today = new Date()
    const daysLeft = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Determine status
    let status: string
    if (daysLeft < 0) {
      status = 'expired'
    } else if (daysLeft <= 30) {
      status = 'warning'
    } else {
      status = 'valid'
    }

    const newCaces: Caces = {
      id: Math.max(...caces.map(c => c.id), 0) + 1,
      ...input,
      daysLeft,
      status,
    }

    caces.push(newCaces)
    return newCaces
  },

  update: async ({ id, updates }: UpdateCacesInput): Promise<Caces> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const index = caces.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`CACES certification with id ${id} not found`)
    }

    // Recalculate daysLeft and status if dates changed
    let updatedData = { ...caces[index], ...updates }
    if (updates.expirationDate) {
      const expirationDate = new Date(updates.expirationDate)
      const today = new Date()
      const daysLeft = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLeft < 0) {
        updatedData = { ...updatedData, daysLeft, status: 'expired' }
      } else if (daysLeft <= 30) {
        updatedData = { ...updatedData, daysLeft, status: 'warning' }
      } else {
        updatedData = { ...updatedData, daysLeft, status: 'valid' }
      }
    }

    caces[index] = updatedData
    return caces[index]
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = caces.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error(`CACES certification with id ${id} not found`)
    }

    caces.splice(index, 1)
  },
}

export { caces as mockCaces }
