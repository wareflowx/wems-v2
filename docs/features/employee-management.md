# Employee Management

## Overview

Employee management is the core of WEMS. This module handles all employee-related data including personal information, employment details, organizational assignments, and status tracking. It serves as the central hub connecting all other modules (CACES, Medical, Training, Contracts, Documents, Alerts).

> **Important:** This system is designed for French logistics/3PL companies, requiring specific compliance with DPAE, social reporting (Bilan Social), and multi-client allocation.

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
| lastName | string | Yes | Current/usage name |
| birthName | string | Yes | **Legal birth name (Nom de naissance)** - Required for DPAE |
| maidenName | string | No | Birth name (for married women) |
| email | string | Yes | Email address |
| phone | string | No | Phone number |
| mobilePhone | string | No | Mobile phone |
| dateOfBirth | date | Yes | Date of birth |
| birthCity | string | Yes | **City of birth** - Required for DPAE |
| birthDepartment | string | No | **Department of birth (e.g., 75, 92)** - Required for DPAE |
| birthCountry | string | Yes | Country of birth |
| nationality | string | Yes | Nationality |
| gender | enum | No | Gender (for statistics) |
| address | Address | No | Home address |
| photoUrl | string | No | Employee photo |

### DPAE Compliance

> The following fields are mandatory for the Déclaration Préalable à l'Embauche:

- First name (Prénom)
- Birth name (Nom de naissance)
- Date of birth (Date de naissance)
- Place of birth (Lieu de naissance) - City + Department (France) or Country
- Nationality (Nationalité)

### Identification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| nir | string | No | **French Social Security Number (NIR)** - 15 digits, requires checksum validation |
| nirAccessLevel | AccessLevel | No | **Privacy: Who can view unmasked NIR** |
| idCardNumber | string | No | ID card number |
| idCardExpiry | date | No | ID card expiry date |
| passportNumber | string | No | Passport number |
| passportExpiry | date | No | Passport expiry date |

### NIR Security (GDPR)

> The NIR is extremely sensitive. It must be protected:

- [ ] **Masked by default**: Display as `1 85 03 75 *** ** **`
- [ ] **Role-based access**: Only Payroll/Admin can unmask
- [ ] **Access logging**: Every NIR view is logged in audit trail
- [ ] **Checksum validation**: Validate last 2 digits on entry

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
| leaveSubStatus | LeaveSubStatus | No | **Specific leave type (Maladie, AT, Maternité, etc.)** |
| hireDate | date | Yes | Original hire date |
| workLocationId | UUID | Yes | Primary work location |
| departmentId | UUID | Yes | Department |
| positionId | UUID | Yes | Job position |
| managerId | UUID | No | Direct manager (functional) |
| hrManagerId | UUID | No | **HR Manager for reporting** |

### Employee Status

| Status | French | Description |
|--------|--------|-------------|
| PRE_HIRE | Pré-embauche | Candidate/pending hire |
| ACTIVE | Actif | Currently working |
| INACTIVE | Inactif | Not currently working |
| ON_LEAVE | En congé | On leave/absence |
| TERMINATED | Terminée | Employment ended |

### Leave Sub-Statuses (France-Specific)

| Sub-Status | French | Triggers Reprise Alert |
|------------|--------|----------------------|
| SICK_LEAVE | Arrêt Maladie | If >60 days |
| WORK_ACCIDENT | Accident du Travail | **Yes - Always triggers Reprise** |
| OCCUPATIONAL_DISEASE | Maladie Professionnelle | **Yes - Always triggers Reprise** |
| MATERNITY | Maternité | Yes |
| PATERNITY | Paternité | No |
| PARENTAL | Congé Parental | No |
| PAID_LEAVE | Congés Payés / RTT | No |
| SUSPENSION | Suspension de contrat | No |

> **Critical:** When status changes to ON_LEAVE with WORK_ACCIDENT or OCCUPATIONAL_DISEASE, the system automatically triggers a **Reprise** medical visit alert.

### Social/Professional Categories (CSP)

> Required for French social reporting (Bilan Social) and legal notice periods.

| Category | French | Examples | Notice Period |
|----------|--------|----------|---------------|
| OUVRIER | Ouvrier | Warehouse worker, picker | 2 weeks |
| EMPLOYE | Employé | Admin, clerk | 1 month |
| TAM | Technicien / Agent de Maîtrise | Supervisor, team lead | 1 month |
| CADRE | Cadre | Manager, engineer | 3 months |

### Shift Patterns (Work Schedule)

| Pattern | French | Description |
|---------|--------|-------------|
| STANDARD | Horaire standard | Regular 35h week |
| 2X8 | Horaire 2x8 | Two shifts (morning/afternoon) |
| 3X8 | Horaire 3x8 | Three shifts |
| WEEKEND | Week-end | Weekend workers only |
| NIGHT | Travail de nuit | Permanent night shift |

> **Impact:** If shift includes hours between 21:00-06:00, the employee requires **SIR** medical visits (not VIP) and triggers Night Work pénibilité factors.

## 3PL Multi-Client Allocation

### Client Allocation

> For third-party logistics, employees may work for multiple clients.

```typescript
interface ClientAllocation {
  clientId: string;
  clientName: string;
  percentage: number;     // e.g., 50% for Client A
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}
```

- [ ] Track multiple client allocations per employee
- [ ] Percentage-based allocation (must total 100%)
- [ ] Time-based allocation history
- [ ] Labor cost reporting per client

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
  totalDays: number;        // Total days employed
  continuousDays: number;   // Continuous employment
  calculatedStartDate: Date; // First hire date
  adjustedDays: number;    // Including adjustments
  seniorityDateOverride?: Date; // Manual adjustment (Reprise d'ancienneté)
}
```

- Aggregates all contracts
- Accounts for breaks (CDD → CDI conversion)
- Respects seniority adjustments (seniorityDateOverride)
- Used for: notice periods, benefits, bonuses, vacation days

### Seniority Adjustments (Reprise d'ancienneté)

Sometimes contracts require carrying over seniority from previous periods:

- [ ] Manual adjustment field: `seniorityAdjustmentDays`
- [ ] Reason for adjustment
- [ ] Approval workflow

## Social Reporting Fields

### RQTH (Reconnaissance Qualité Travailleur Handicapé)

| Field | Type | Description |
|-------|------|-------------|
| isRQTH | boolean | **Recognized disabled worker status** |
| rqthStartDate | Date | Date of recognition |
| rqthEndDate | Date | Date of renewal (if temporary) |

> **Impact:** Triggers special medical visit frequency (max 3 years instead of 4-5) and affects company AGEFIPH obligations.

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

## Termination (Offboarding)

### Required Documents

When an employee leaves in France, the company must provide:

1. **Certificat de Travail** - Work certificate
2. **Attestation Pôle Employment** - Unemployment certificate
3. **Reçu pour Solde de Tout Compte** - Final pay receipt

### Termination Checklist

- [ ] Generate/Upload Certificat de Travail
- [ ] Generate/Upload Attestation Pôle Emploi
- [ ] Generate/Upload Reçu pour Solde de Tout Compte
- [ ] Verify all documents are provided
- [ ] Archive employee file
- [ ] Calculate final seniority
- [ ] Delete/Archive personal documents per retention policy

## Features

### 1. Employee List View

- [ ] Searchable/filterable table
- [ ] Columns: Name, ID, Position, Location, Status, Client Allocation
- [ ] Quick actions: View, Edit, Deactivate
- [ ] Export to CSV/Excel
- [ ] Bulk operations
- [ ] **Filter by Client** (3PL)

### 2. Employee Profile

- [ ] **Compliance Traffic Light** - Quick view of 4 pillars:
  - Contract status
  - Medical status
  - CACES/Authorization status
  - Identity/Documents status
- [ ] Personal information section
- [ ] Employment details
- [ ] Organizational assignment
- [ ] Status indicator
- [ ] Photo
- [ ] Contact information
- [ ] Emergency contacts

### 3. Employee Detail Tabs

- [ ] **Overview**: Summary cards with compliance status
- [ ] **Employment**: Current position, department, location
- [ ] **Allocation**: Client allocation breakdown (3PL)
- [ ] **CACES**: Certifications and status
- [ ] **Medical**: Medical visit history and status
- [ ] **Training**: Completed and pending training
- [ ] **Contracts**: Contract history
- [ ] **Documents**: Uploaded documents
- [ ] **Alerts**: Active alerts for employee

### 4. Employee Creation

- [ ] Multi-step wizard
- [ ] Personal information (with DPAE validation)
- [ ] Employment details
- [ ] Position assignment
- [ ] Client allocation (if 3PL)
- [ ] Document upload
- [ ] Initial training assignment
- [ ] Contract creation
- [ ] **DPAE Readiness Check**

### 5. Employee Status Management

- [ ] Status transitions (Active → On Leave → Active)
- [ ] **Leave sub-status selection** (required for ON_LEAVE)
- [ ] Status history
- [ ] Blocking rules (cannot deactivate with active contracts)
- [ ] **Auto-trigger Reprise alert** for Work Accident

### 6. Compliance Dashboard per Employee

- [ ] CACES compliance status
- [ ] Medical compliance status
- [ ] Training compliance status
- [ ] Document compliance status
- [ ] Overall compliance score

### 7. Quick Actions

From employee profile, one-click access to:
- [ ] Generate Driving Authorization (Autorisation de Conduite)
- [ ] Generate Medical Convocation
- [ ] Download latest Pay Slip
- [ ] View Compliance Report

### 8. Search & Filters

- [ ] Global search by name, ID
- [ ] Filter by status
- [ ] Filter by leave sub-status
- [ ] Filter by location
- [ ] Filter by department
- [ ] Filter by position
- [ ] Filter by client (3PL)
- [ ] Filter by CSP (Cadre/Ouvrier)
- [ ] Filter by RQTH status

## Data Model

```typescript
interface Employee {
  id: string;
  employeeId: string;

  // Personal Information
  firstName: string;
  lastName: string;
  birthName: string;           // Nom de naissance (required for DPAE)
  maidenName?: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  dateOfBirth: Date;
  birthCity: string;
  birthDepartment?: string;    // For DPAE (e.g., 75, 92)
  birthCountry: string;
  nationality: string;
  gender?: Gender;

  // Address
  address?: Address;

  // Photo
  photoUrl?: string;

  // Identification
  nir?: string;               // 15 digits, sensitive
  nirAccessLevel?: AccessLevel;
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
  leaveSubStatus?: LeaveSubStatus;  // Detailed leave type
  hireDate: Date;
  workLocationId: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  hrManagerId?: string;

  // Social/Professional
  csp?: CSP;                  // Socio-professional category
  isRQTH?: boolean;           // Disabled worker status
  rqthStartDate?: Date;
  rqthEndDate?: Date;

  // Work Schedule
  shiftPatternId?: string;
  isNightWorker: boolean;      // Triggers SIR medical

  // Seniority
  seniorityDateOverride?: Date;
  seniorityAdjustmentDays?: number;

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

enum LeaveSubStatus {
  SICK_LEAVE = "sick_leave",
  WORK_ACCIDENT = "work_accident",
  OCCUPATIONAL_DISEASE = "occupational_disease",
  MATERNITY = "maternity",
  PATERNITY = "paternity",
  PARENTAL = "parental",
  PAID_LEAVE = "paid_leave",
  SUSPENSION = "suspension",
}

enum CSP {
  OUVRIER = "ouvrier",
  EMPLOYE = "employe",
  TAM = "tam",
  CADRE = "cadre",
}

enum AccessLevel {
  RESTRICTED = "restricted",
  HR = "hr",
  PAYROLL = "payroll",
  ADMIN = "admin",
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ClientAllocation {
  id: string;
  employeeId: string;
  clientId: string;
  clientName: string;
  percentage: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

interface EmployeeStatusHistory {
  id: string;
  employeeId: string;
  status: EmployeeStatus;
  leaveSubStatus?: LeaveSubStatus;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

interface NIRAccessLog {
  id: string;
  employeeId: string;
  userId: string;
  accessedAt: Date;
  ipAddress?: string;
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
- **Auto-trigger Reprise for Work Accident**

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
- Client allocation column (3PL)

### Employee Profile Page
- **Compliance Traffic Light** header component
- Header with photo and name
- Status badge with sub-status
- Tab navigation
- Summary cards

### Employee Form
- Multi-step wizard
- DPAE field validation
- NIR checksum validation
- Auto-save

### Termination Checklist Modal
- Document generation/upload
- Checklist tracking
- Completion confirmation

## Workflows

### New Employee Onboarding

1. Create employee record
2. Enter personal information **with DPAE validation**
3. Enter birth name, city, department (required for DPAE)
4. Assign position (triggers required items)
5. Assign shift pattern (may trigger Night Work)
6. Create employment contract
7. Verify DPAE completed
8. Assign required training
9. Upload required documents
10. Set status to ACTIVE

### Employee Status Change (Work Accident)

1. Change status to ON_LEAVE
2. Select sub-status: **WORK_ACCIDENT**
3. System logs Work Accident
4. **System auto-triggers Reprise medical alert**
5. Alert assigned to manager

### Employee Termination

1. End contract
2. Generate required documents:
   - Certificat de Travail
   - Attestation Pôle Emploi
   - Reçu pour Solde de Tout Compte
3. Upload signed documents
4. Update status to TERMINATED
5. Archive documents (per retention policy)
6. Calculate final seniority

## Permissions

| Role | View | Edit | NIR Access | Delete |
|------|------|------|-------------|--------|
| Admin | All | All | Full | Yes |
| HR | All | All | Limited | Limited |
| Payroll | All | Employment | Full | No |
| Manager | Team | Team | No | No |
| Employee | Self | Self | No | No |

## NIR Security Implementation

### Masking
- Default display: `1 85 03 75 *** ** **`
- Click to reveal: Requires Payroll/HR/Admin role
- Auto-hide after 30 seconds

### Access Logging
```typescript
interface NIRAccessLog {
  employeeId: string;
  userId: string;
  accessedAt: Date;
  ipAddress: string;
  reason?: string;
}
```

### Validation
- NIR checksum algorithm (Luhn validation)
- Format validation (15 digits)

## Future Considerations

- Employee self-service portal
- Mobile app access
- Document e-signature integration
- Performance reviews
- Skills matrix
- Career planning
- Multi-site support
- Employee onboarding workflow automation
- Integration with payroll systems
- DSN (Déclaration Sociale Nominative) export
