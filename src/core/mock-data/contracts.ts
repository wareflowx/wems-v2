// Mock contract data

export interface Contract {
  id: number
  employee: string
  employeeId: number
  type: string
  startDate: string
  endDate: string | null
  salary: string
  department: string
  status: string
}

export const contracts: Contract[] = [
  {
    id: 1,
    employee: 'Jean Dupont',
    employeeId: 1,
    type: 'CDI',
    startDate: '2020-03-15',
    endDate: null,
    salary: '45 000 €',
    department: 'Production',
    status: 'Actif',
  },
  {
    id: 2,
    employee: 'Marie Martin',
    employeeId: 2,
    type: 'CDI',
    startDate: '2019-06-10',
    endDate: null,
    salary: '42 000 €',
    department: 'Administration',
    status: 'Actif',
  },
  {
    id: 3,
    employee: 'Pierre Bernard',
    employeeId: 3,
    type: 'CDD',
    startDate: '2023-01-20',
    endDate: '2025-01-20',
    salary: '38 000 €',
    department: 'Production',
    status: 'Actif',
  },
  {
    id: 4,
    employee: 'Sophie Petit',
    employeeId: 4,
    type: 'CDI',
    startDate: '2018-09-05',
    endDate: null,
    salary: '55 000 €',
    department: 'RH',
    status: 'Actif',
  },
  {
    id: 5,
    employee: 'Luc Dubois',
    employeeId: 5,
    type: 'Alternance',
    startDate: '2024-02-01',
    endDate: '2026-02-01',
    salary: '18 000 €',
    department: 'Commercial',
    status: 'En période d\'essai',
  },
  {
    id: 6,
    employee: 'Catherine Rousseau',
    employeeId: 6,
    type: 'Intérim',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    salary: '40 000 €',
    department: 'Production',
    status: 'Actif',
  },
]
