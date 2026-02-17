import { employees, type Employee } from '@/mock-data/employees'

// Types
export interface EmployeeFilters {
  search?: string
  department?: string
  status?: string
}

export interface CreateEmployeeInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  contract: string
  job: string
  department: string
  location: string
  status: string
  hireDate: string
}

export interface UpdateEmployeeInput {
  id: number
  updates: Partial<Omit<Employee, 'id'>>
}

// API functions simulating server calls
export const employeesApi = {
  // READ - Get all employees with optional filters
  getAll: async (filters?: EmployeeFilters): Promise<Employee[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    let data = [...employees]

    // Server-side filtering
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      data = data.filter(emp =>
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.department && filters.department !== 'all') {
      data = data.filter(emp => emp.department === filters.department)
    }

    if (filters?.status && filters.status !== 'all') {
      data = data.filter(emp => emp.status === filters.status)
    }

    return data
  },

  // READ - Get employee by ID
  getById: async (id: number): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const employee = employees.find(emp => emp.id === id)
    if (!employee) {
      throw new Error(`Employee with id ${id} not found`)
    }
    return employee
  },

  // CREATE - Add new employee
  create: async (input: CreateEmployeeInput): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const newEmployee: Employee = {
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      ...input,
    }

    employees.push(newEmployee)
    return newEmployee
  },

  // UPDATE - Modify existing employee
  update: async ({ id, updates }: UpdateEmployeeInput): Promise<Employee> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const index = employees.findIndex(emp => emp.id === id)
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`)
    }

    employees[index] = { ...employees[index], ...updates }
    return employees[index]
  },

  // DELETE - Remove employee
  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = employees.findIndex(emp => emp.id === id)
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`)
    }

    employees.splice(index, 1)
  },
}

// Export mock data for direct access (for hooks that need it)
export { employees as mockEmployees }
