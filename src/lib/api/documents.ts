import { documents, type Document } from '@/mock-data/documents'

// Types
export interface DocumentFilters {
  search?: string
  type?: string
  category?: string
  employee?: string
}

export interface CreateDocumentInput {
  name: string
  type: string
  employee: string
  employeeId: number
  uploadDate: string
  size: string
  category: string
}

export interface UpdateDocumentInput {
  id: number
  updates: Partial<Omit<Document, 'id'>>
}

// API functions
export const documentsApi = {
  getAll: async (filters?: DocumentFilters): Promise<Document[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    let data = [...documents]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      data = data.filter(doc =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.employee.toLowerCase().includes(searchLower) ||
        doc.type.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.type && filters.type !== 'all') {
      data = data.filter(doc => doc.type === filters.type)
    }

    if (filters?.category && filters.category !== 'all') {
      data = data.filter(doc => doc.category === filters.category)
    }

    if (filters?.employee && filters.employee !== 'all') {
      data = data.filter(doc => doc.employee === filters.employee)
    }

    return data
  },

  getById: async (id: number): Promise<Document> => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const document = documents.find(d => d.id === id)
    if (!document) {
      throw new Error(`Document with id ${id} not found`)
    }
    return document
  },

  create: async (input: CreateDocumentInput): Promise<Document> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const newDocument: Document = {
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      ...input,
    }

    documents.push(newDocument)
    return newDocument
  },

  update: async ({ id, updates }: UpdateDocumentInput): Promise<Document> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const index = documents.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error(`Document with id ${id} not found`)
    }

    documents[index] = { ...documents[index], ...updates }
    return documents[index]
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = documents.findIndex(d => d.id === id)
    if (index === -1) {
      throw new Error(`Document with id ${id} not found`)
    }

    documents.splice(index, 1)
  },
}

export { documents as mockDocuments }
