// Mock alert data

export interface Alert {
  id: number
  type: string
  employee: string
  employeeId: number
  category?: string
  visitType?: string
  daysLeft?: number
  severity: string
  date: string
}

export const alerts: Alert[] = [
  {
    id: 1,
    type: 'CACES expiré',
    employee: 'Jean Dupont',
    employeeId: 1,
    category: '1A',
    severity: 'critical',
    date: '2025-03-15',
  },
  {
    id: 2,
    type: 'CACES expiré',
    employee: 'Luc Dubois',
    employeeId: 5,
    category: '5',
    severity: 'critical',
    date: '2025-02-10',
  },
  {
    id: 3,
    type: 'Visite en retard',
    employee: 'Marie Martin',
    employeeId: 2,
    visitType: 'Visite de reprise',
    severity: 'critical',
    date: '2025-02-01',
  },
  {
    id: 4,
    type: 'CACES expiration proche',
    employee: 'Pierre Bernard',
    employeeId: 3,
    category: '3',
    daysLeft: 5,
    severity: 'warning',
    date: '2025-02-15',
  },
  {
    id: 5,
    type: 'Visite planifiée',
    employee: 'Sophie Petit',
    employeeId: 4,
    visitType: 'Visite périodique',
    severity: 'info',
    date: '2025-02-20',
  },
  {
    id: 6,
    type: 'Visite planifiée',
    employee: 'Jean Dupont',
    employeeId: 1,
    visitType: 'Visite initiale',
    severity: 'info',
    date: '2025-03-01',
  },
  {
    id: 7,
    type: 'CACES expiration proche',
    employee: 'Marie Martin',
    employeeId: 2,
    category: '7',
    daysLeft: 25,
    severity: 'warning',
    date: '2025-03-01',
  },
]
