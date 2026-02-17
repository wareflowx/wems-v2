// Mock employee data

export interface Employee {
  id: number
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

export const employees: Employee[] = [
  {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '06 12 34 56 78',
    contract: 'CDI',
    job: 'Technicien',
    department: 'Production',
    location: 'Paris',
    status: 'Actif',
    hireDate: '2020-03-15',
  },
  {
    id: 2,
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@email.com',
    phone: '06 98 76 54 32',
    contract: 'CDI',
    job: 'Comptable',
    department: 'Administration',
    location: 'Lyon',
    status: 'Actif',
    hireDate: '2019-06-10',
  },
  {
    id: 3,
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre.bernard@email.com',
    phone: '06 11 22 33 44',
    contract: 'CDD',
    job: 'Opérateur',
    department: 'Production',
    location: 'Marseille',
    status: 'En congé',
    hireDate: '2023-01-20',
  },
  {
    id: 4,
    firstName: 'Sophie',
    lastName: 'Petit',
    email: 'sophie.petit@email.com',
    phone: '06 55 66 77 88',
    contract: 'CDI',
    job: 'Responsable RH',
    department: 'RH',
    location: 'Paris',
    status: 'Actif',
    hireDate: '2018-09-05',
  },
  {
    id: 5,
    firstName: 'Luc',
    lastName: 'Dubois',
    email: 'luc.dubois@email.com',
    phone: '06 99 88 77 66',
    contract: 'Alternance',
    job: 'Commercial',
    department: 'Commercial',
    location: 'Lille',
    status: 'Actif',
    hireDate: '2024-02-01',
  },
]
