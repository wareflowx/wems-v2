import {
  departments,
  jobTitles,
  contractTypes,
} from '@/mock-data/reference'

// Types
export type ReferenceDataType = 'departments' | 'jobTitles' | 'contractTypes'

// API functions for reference data
export const referenceApi = {
  // Departments
  getDepartments: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...departments]
  },

  addDepartment: async (name: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    if (!departments.includes(name)) {
      departments.push(name)
    }
    return name
  },

  updateDepartment: async (oldName: string, newName: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = departments.findIndex(d => d === oldName)
    if (index === -1) {
      throw new Error(`Department "${oldName}" not found`)
    }
    departments[index] = newName
    return newName
  },

  deleteDepartment: async (name: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = departments.findIndex(d => d === name)
    if (index === -1) {
      throw new Error(`Department "${name}" not found`)
    }
    departments.splice(index, 1)
  },

  // Job Titles
  getJobTitles: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...jobTitles]
  },

  addJobTitle: async (title: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    if (!jobTitles.includes(title)) {
      jobTitles.push(title)
    }
    return title
  },

  updateJobTitle: async (oldTitle: string, newTitle: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = jobTitles.findIndex(j => j === oldTitle)
    if (index === -1) {
      throw new Error(`Job title "${oldTitle}" not found`)
    }
    jobTitles[index] = newTitle
    return newTitle
  },

  deleteJobTitle: async (title: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = jobTitles.findIndex(j => j === title)
    if (index === -1) {
      throw new Error(`Job title "${title}" not found`)
    }
    jobTitles.splice(index, 1)
  },

  // Contract Types
  getContractTypes: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...contractTypes]
  },

  addContractType: async (type: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    if (!contractTypes.includes(type)) {
      contractTypes.push(type)
    }
    return type
  },

  updateContractType: async (oldType: string, newType: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = contractTypes.findIndex(c => c === oldType)
    if (index === -1) {
      throw new Error(`Contract type "${oldType}" not found`)
    }
    contractTypes[index] = newType
    return newType
  },

  deleteContractType: async (type: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = contractTypes.findIndex(c => c === type)
    if (index === -1) {
      throw new Error(`Contract type "${type}" not found`)
    }
    contractTypes.splice(index, 1)
  },
}

export { departments as mockDepartments, jobTitles as mockJobTitles, contractTypes as mockContractTypes }
