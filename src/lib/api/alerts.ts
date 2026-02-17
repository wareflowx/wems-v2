import { alerts, type Alert } from '@/mock-data/alerts'

// Types
export interface AlertFilters {
  search?: string
  severity?: string
  type?: string
}

// API functions (alerts are read-only)
export const alertsApi = {
  getAll: async (filters?: AlertFilters): Promise<Alert[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let data = [...alerts]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      data = data.filter(alert =>
        alert.employee.toLowerCase().includes(searchLower) ||
        alert.type.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.severity && filters.severity !== 'all') {
      data = data.filter(alert => alert.severity === filters.severity)
    }

    if (filters?.type && filters.type !== 'all') {
      data = data.filter(alert => alert.type === filters.type)
    }

    // Sort by date descending by default
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return data
  },

  getById: async (id: number): Promise<Alert> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const alert = alerts.find(a => a.id === id)
    if (!alert) {
      throw new Error(`Alert with id ${id} not found`)
    }
    return alert
  },
}

export { alerts as mockAlerts }
