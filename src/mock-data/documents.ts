// Mock document data

export interface Document {
  id: number
  name: string
  type: string
  employee: string
  employeeId: number
  uploadDate: string
  size: string
  category: string
}

export const documents: Document[] = [
  {
    id: 1,
    name: 'Contrat_CDID_Dupont.pdf',
    type: 'Contrat',
    employee: 'Jean Dupont',
    employeeId: 1,
    uploadDate: '2024-01-15',
    size: '2.4 MB',
    category: 'pdf',
  },
  {
    id: 2,
    name: 'CACES_1A_Certificat.pdf',
    type: 'CACES',
    employee: 'Marie Martin',
    employeeId: 2,
    uploadDate: '2023-11-20',
    size: '1.8 MB',
    category: 'pdf',
  },
  {
    id: 3,
    name: 'Visite_Medicale_Initial.pdf',
    type: 'Visite médicale',
    employee: 'Pierre Bernard',
    employeeId: 3,
    uploadDate: '2024-01-10',
    size: '945 KB',
    category: 'pdf',
  },
  {
    id: 4,
    name: 'Photo_Identification.jpg',
    type: 'Identification',
    employee: 'Sophie Petit',
    employeeId: 4,
    uploadDate: '2023-09-15',
    size: '2.1 MB',
    category: 'image',
  },
]
