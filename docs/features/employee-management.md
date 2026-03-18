# Employee Management

## Overview

Employee management is the core of WEMS. This module handles all employee-related data including personal information, employment details, organizational assignments, and status tracking. It serves as the central hub connecting all other modules (CACES, Medical, Training, Contracts, Documents, Alerts).

## Current State

- Basic employee data exists
- Employees can be viewed in the system
- Links to alerts and other modules

## Employee Data Structure

### Personal Information

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| employeeId | string | Yes | Internal employee ID |
| firstName | string | Yes | First name |
| lastName | string | Yes | Last name |
| email | string | Yes | Email address |
| phone | string | No | Phone number |
| mobilePhone | string | No | Mobile phone |
| dateOfBirth | date | Yes | Date of birth |
| placeOfBirth | string | No | Place of birth |
| nationality | string | Yes | Nationality |
| gender | enum | No | Gender (for statistics) |
| address | Address | No | Home address |
| photoUrl | string | No | Employee photo |

### Identification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| nir | string | No | French Social Security Number (NIR) |
| idCardNumber | string | No | ID card number |
| idCardExpiry | date | No | ID card expiry date |
| passportNumber | string | No | Passport number |
| passportExpiry | date | No | Passport expiry date |

### Emergency Contact

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emergencyContactName | string | No | Emergency contact name |
| emergencyContactPhone | string | No | Emergency contact phone |
| emergencyContactRelation | string | No | Relationship |

## Employment Information

### Work Assignment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | EmployeeStatus | Yes | Current employment status |
| hireDate | date | Yes | Original hire date |
| workLocation | UUID | Yes | Primary work location |
| department | UUID | Yes | Department |
| position | UUID | Yes | Job position |
| manager | UUID | No | Direct manager |
| clientId | UUID | No | 3PL: Client/Business Unit |

### Employee Status

| Status | French | Description |
|--------|--------|-------------|
| PRE_HIRE | Pré-embauche | Candidate/pending hire |
| ACTIVE | Actif | Currently working |
| INACTIVE | Inactif | Not currently working |
| ON_LEAVE | En congé | On leave/absence |
| TERMINATED | Terminée | Employment ended |

### Organizational Structure

```
Company
  └── Site/Warehouse
      └── Department
          └── Team
              └── Employee
```

- **Locations**: Physical sites (warehouses, zones)
- **Departments**: Organizational units
- **Positions**: Job titles with requirements

## Employment History

### Contract History

| Field | Type | Description |
|-------|------|-------------|
| contractId | UUID | Current/last contract |
| contractType | enum | CDI, CDD, Interim, etc. |
| startDate | date | Contract start |
| endDate | date | Contract end (if fixed-term) |

### Seniority Calculation

The system calculates total seniority:

```typescript
interface Seniority {
  totalDays: number;       // Total days employed
  continuousDays: number; // Continuous employment
  startDate: Date;        // First hire date
}
```

- Aggregates all contracts
- Accounts for breaks ( CDD → CDI conversion)
- Used for: notice periods, benefits, bonuses

## Permissions & Capabilities

### Employee Permissions

See Alerts Management for blocking logic:

```typescript
interface EmployeePermissions {
  employeeId: string;
  canOperateEquipment: boolean;
  canDriveCompanyVehicle: boolean;
  canWorkNightShift: boolean;
  canWork: boolean;
  blockedBy: string[];
  blockedAt?: Date;
}
```

### Position-Based Requirements

Each position defines required items:

```typescript
interface PositionRequirements {
  certifications: string[];  // Required CACES/certifications
  training: string[];       // Required training modules
  documents: string[];      // Required documents
}
```

The system tracks compliance against these requirements.

## Features

### 1. Employee List View

- [ ] Searchable/filterable table
- [ ] Columns: Name, ID, Position, Location, Status
- [ ] Quick actions: View, Edit, Deactivate
- [ ] Export to CSV/Excel
- [ ] Bulk operations

### 2. Employee Profile

- [ ] Personal information section
- [ ] Employment details
- [ ] Organizational assignment
- [ ] Status indicator
- [ ] Photo
- [ ] Contact information
- [ ] Emergency contacts

### 3. Employee Detail Tabs

- [ ] **Overview**: Summary cards
- [ ] **Employment**: Current position, department, location
- [ ] **CACES**: Certifications and status
- [ ] **Medical**: Medical visit history and status
- [ ] **Training**: Completed and pending training
- [ ] **Contracts**: Contract history
- [ ] **Documents**: Uploaded documents
- [ ] **Alerts**: Active alerts for employee

### 4. Employee Creation

- [ ] Multi-step wizard
- [ ] Personal information
- [ ] Employment details
- [ ] Position assignment
- [ ] Document upload
- [ ] Initial training assignment
- [ ] Contract creation

### 5. Employee Status Management

- [ ] Status transitions (Active → On Leave → Active)
- [ ] Status history
- [ ] Blocking rules (cannot deactivate with active contracts)

### 6. Compliance Dashboard per Employee

- [ ] CACES compliance status
- [ ] Medical compliance status
- [ ] Training compliance status
- [ ] Document compliance status
- [ ] Overall compliance score

### 7. Search & Filters

- [ ] Global search by name, ID
- [ ] Filter by status
- [ ] Filter by location
- [ ] Filter by department
- [ ] Filter by position

## Data Model

```typescript
interface Employee {
  id: string;
  employeeId: string;

  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  dateOfBirth: Date;
  placeOfBirth?: string;
  nationality: string;
  gender?: Gender;

  // Address
  address?: Address;

  // Photo
  photoUrl?: string;

  // Identification
  nir?: string;
  idCardNumber?: string;
  idCardExpiry?: Date;
  passportNumber?: string;
  passportExpiry?: Date;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Employment
  status: EmployeeStatus;
  hireDate: Date;
  workLocationId: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  clientId?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

enum EmployeeStatus {
  PRE_HIRE = "pre_hire",
  ACTIVE = "active",
  INACTIVE = "inactive",
  ON_LEAVE = "on_leave",
  TERMINATED = "terminated",
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface EmployeeStatusHistory {
  id: string;
  employeeId: string;
  status: EmployeeStatus;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

interface EmployeeAlert {
  employeeId: string;
  alertId: string;
}
```

## Integration Points

### CACES Module
- Link to employee's CACES certifications
- Display authorization status
- Show compliance status

### Medical Module
- Link to medical visits
- Display fitness status
- Show next visit due

### Training Module
- Link to completed training
- Show pending training
- Display certifications

### Contracts Module
- Current contract details
- Contract history
- Seniority calculation

### Documents Module
- All employee documents
- Compliance checklist
- Missing documents

### Alerts Module
- Active alerts
- Blocking status
- Resolution required

### Scheduling Module
- Work assignments
- Shift eligibility (based on permissions)
- Location assignments

## UI Components

### Employee List Page
- Search bar
- Filters sidebar
- Data table with sorting
- Pagination
- Bulk actions

### Employee Profile Page
- Header with photo and name
- Status badge
- Tab navigation
- Summary cards

### Employee Form
- Multi-step wizard
- Validation
- Auto-save

## Workflows

### New Employee Onboarding

1. Create employee record
2. Enter personal information
3. Assign position (triggers required items)
4. Create employment contract
5. Verify DPAE completed
6. Assign required training
7. Upload required documents
8. Set status to ACTIVE

### Employee Status Change

1. Select employee
2. Change status
3. Provide reason
4. System checks for blocking rules
5. Update status
6. Log history

### Employee Termination

1. End contract
2. Update status to TERMINATED
3. Archive documents
4. Calculate final seniority
5. Keep records for legal retention period

## Permissions

| Role | View | Edit | Create | Delete |
|------|------|------|--------|--------|
| Admin | All | All | Yes | Yes |
| HR | All | All | Yes | Limited |
| Manager | Team | Team | Limited | No |
| Employee | Self | Self | No | No |

## Future Considerations

- Employee self-service portal
- Mobile app access
- Document e-signature integration
- Performance reviews
- Skills matrix
- Career planning
- Multi-site support
- Employee onboarding workflow automation
