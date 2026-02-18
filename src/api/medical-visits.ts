import { medicalVisits, type MedicalVisit } from '@/mock-data/medical-visits'

// Types
export interface MedicalVisitFilters {
  search?: string
  type?: string
  status?: string
  employee?: string
}

export interface CreateMedicalVisitInput {
  employee: string
  employeeId: number
  type: string
  scheduledDate: string
}

export interface UpdateMedicalVisitInput {
  id: number
  updates: Partial<Omit<MedicalVisit, 'id'>>
}

// API functions
export const medicalVisitsApi = {
  getAll: async (filters?: MedicalVisitFilters): Promise<MedicalVisit[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let data = [...medicalVisits]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      data = data.filter(visit =>
        visit.employee.toLowerCase().includes(searchLower) ||
        visit.type.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.type && filters.type !== 'all') {
      data = data.filter(visit => visit.type === filters.type)
    }

    if (filters?.status && filters.status !== 'all') {
      data = data.filter(visit => visit.status === filters.status)
    }

    if (filters?.employee && filters.employee !== 'all') {
      data = data.filter(visit => visit.employee === filters.employee)
    }

    return data
  },

  getById: async (id: number): Promise<MedicalVisit> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const visit = medicalVisits.find(v => v.id === id)
    if (!visit) {
      throw new Error(`Medical visit with id ${id} not found`)
    }
    return visit
  },

  create: async (input: CreateMedicalVisitInput): Promise<MedicalVisit> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    // Calculate days until
    const scheduledDate = new Date(input.scheduledDate)
    const today = new Date()
    const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Determine status
    let status: string
    if (daysUntil < 0) {
      status = 'overdue'
    } else {
      status = 'scheduled'
    }

    const newVisit: MedicalVisit = {
      id: Math.max(...medicalVisits.map(v => v.id), 0) + 1,
      ...input,
      daysUntil,
      status,
    }

    medicalVisits.push(newVisit)
    return newVisit
  },

  update: async ({ id, updates }: UpdateMedicalVisitInput): Promise<MedicalVisit> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const index = medicalVisits.findIndex(v => v.id === id)
    if (index === -1) {
      throw new Error(`Medical visit with id ${id} not found`)
    }

    medicalVisits[index] = { ...medicalVisits[index], ...updates }
    return medicalVisits[index]
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = medicalVisits.findIndex(v => v.id === id)
    if (index === -1) {
      throw new Error(`Medical visit with id ${id} not found`)
    }

    medicalVisits.splice(index, 1)
  },
}

export { medicalVisits as mockMedicalVisits }
