// Mock CACES certification data

export interface Caces {
  id: number
  employee: string
  employeeId: number
  category: string
  dateObtained: string
  expirationDate: string
  daysLeft: number
  status: string
  document?: string
}

export const caces: Caces[] = [
  {
    id: 1,
    employee: 'Jean Dupont',
    employeeId: 1,
    category: '1A',
    dateObtained: '2020-03-15',
    expirationDate: '2025-03-15',
    daysLeft: -10,
    status: 'expired',
  },
  {
    id: 2,
    employee: 'Marie Martin',
    employeeId: 2,
    category: '3',
    dateObtained: '2023-06-10',
    expirationDate: '2028-06-10',
    daysLeft: 856,
    status: 'valid',
  },
  {
    id: 3,
    employee: 'Pierre Bernard',
    employeeId: 3,
    category: '5',
    dateObtained: '2019-11-20',
    expirationDate: '2025-02-10',
    daysLeft: 5,
    status: 'warning',
  },
  {
    id: 4,
    employee: 'Sophie Petit',
    employeeId: 4,
    category: '7',
    dateObtained: '2022-01-05',
    expirationDate: '2027-01-05',
    daysLeft: 335,
    status: 'valid',
  },
  {
    id: 5,
    employee: 'Luc Dubois',
    employeeId: 5,
    category: '1B',
    dateObtained: '2024-02-01',
    expirationDate: '2029-02-01',
    daysLeft: 1093,
    status: 'valid',
  },
]
