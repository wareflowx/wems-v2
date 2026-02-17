// Mock medical visit data

export interface MedicalVisit {
  id: number
  employee: string
  employeeId: number
  type: string
  scheduledDate: string
  status: string
  daysUntil?: number
  actualDate?: string
  fitnessStatus?: string
}

export const medicalVisits: MedicalVisit[] = [
  {
    id: 1,
    employee: 'Jean Dupont',
    employeeId: 1,
    type: 'Visite périodique',
    scheduledDate: '2025-02-15',
    status: 'scheduled',
    daysUntil: 3,
  },
  {
    id: 2,
    employee: 'Marie Martin',
    employeeId: 2,
    type: 'Visite de reprise',
    scheduledDate: '2025-02-01',
    status: 'overdue',
    daysUntil: -10,
  },
  {
    id: 3,
    employee: 'Pierre Bernard',
    employeeId: 3,
    type: 'Visite initiale',
    scheduledDate: '2025-03-20',
    status: 'scheduled',
    daysUntil: 36,
  },
  {
    id: 4,
    employee: 'Sophie Petit',
    employeeId: 4,
    type: 'Visite périodique',
    scheduledDate: '2025-02-10',
    status: 'completed',
    actualDate: '2025-02-10',
    fitnessStatus: 'Apt',
  },
]
