# Employment Contracts Management

## Overview

Employment contracts (Contrats de travail) are fundamental to managing warehouse employees. This feature enables tracking of all contract types, their status, renewal dates, and legal compliance in accordance with French Labor Law (Code du Travail).

## Current State

- Alerts system tracks expiring contracts
- Category field in alerts table
- Days left indicator for upcoming expirations

## Regulatory Context (France)

### Types of Employment Contracts

| Contract Type | French | Description | Duration |
|--------------|--------|-------------|----------|
| CDI | Contrat à Durée Indéterminée | Permanent contract | Unlimited |
| CDD | Contrat à Durée Déterminée | Fixed-term contract | Max 18 months |
| Intérim | Contrat d'Intérim | Temporary/temp work | Per mission |
| CTT | Contrat de Travail Temporaire | Temp contract (new term) | Per mission |
| Stage | Convention de Stage | Internship | Max 6 months |
| Alternance | Contrat d'Alternance | Apprenticeship/Training | Based on course |
| Apprentissage | Contrat d'Apprentissage | Apprenticeship | Based on diploma |
| Professionnalisation | Contrat de Professionnalisation | Professionalization | Max 36 months |

### CDD Specific Rules

| Purpose | French | Max Duration | Renewals |
|---------|--------|--------------|----------|
| Replacement | Remplacement | Duration of absence | 1 renewal |
| Extra work | Excédent temporaire | 18 months | 2 renewals |
| Seasonal | Saisonnier | 8 months | - |
| Usage | Contrat d'usage | Unlimited | - |

### Key Requirements

- Written contract required for all non-CDI contracts
- Contract must include: start date, duration, job description, compensation
- Probation period: CDI (2-4 months), CDD (varies)
- Notice period required for termination
- Records must be kept for duration of employment + 5 years

## Contract Terms & Conditions

### Probation Period (Période d'Essai)

| Contract Type | Max Duration | Renewal |
|--------------|--------------|---------|
| CDI | 4 months | Once (2+2 months) |
| CDD < 6 months | 1 month | Cannot be renewed |
| CDD > 6 months | 2 months | Once |
| Intérim | Per mission | Based on umbrella |

### Working Time

| Type | French | Hours/Week |
|------|--------|------------|
| Temps Plein | Full-time | 35 hours |
| Temps Partiel | Part-time | < 35 hours |
| Forfait Jours | Day package | 218 days/year |
| Forfait Heures | Hour package | Per contract |

### Contract Clauses

| Clause | French | Description |
|--------|--------|-------------|
| Non-compete | Clause de non-concurrence | Restrict employment with competitors |
| Non-solicitation | Clause de non-sollicitation | Cannot poach clients/colleagues |
| Exclusivity | Clause d'exclusivité | Temp worker cannot work elsewhere |
| Mobility | Clause de mobilité | Geographic relocation |
| Confidentiality | Clause de confidentialité | Protect company data |

## Desired Features

### 1. Contract Types Management

- [ ] Support for all French contract types
- [ ] Predefined contract templates
- [ ] Custom contract creation
- [ ] Contract type descriptions and requirements
- [ ] Legal requirements per type

### 2. Contract Records

- [ ] Store contract details:
  - Contract type
  - Start date
  - End date (for fixed-term)
  - Probation period
  - Working time (full/part-time)
  - Job position
  - Work location
  - Compensation (salary)
  - Collective agreement
  - Special clauses
- [ ] Document upload (signed contract)
- [ ] Amendment tracking

### 3. Contract Status Tracking

- [ ] Active contracts
- [ ] Contracts nearing end
- [ ] Expired contracts
- [ ] Contracts in probation
- [ ] Contracts under renewal

### 4. Renewal Management

- [ ] Automatic renewal alerts
- [ ] Renewal workflow
- [ ] CDI conversion tracking (CDD → CDI)
- [ ] Contract amendment tracking
- [ ] Renewal history

### 5. Probation Tracking

- [ ] Probation start/end dates
- [ ] Probation evaluation dates
- [ ] Probation completion status
- [ ] Probation extension tracking

### 6. Employee Contract Profile

- [ ] Complete contract history per employee
- [ ] Current contract details
- [ ] Previous contracts
- [ ] Contract evolution timeline
- [ ] Export contract records

### 7. Contract Registry

- [ ] Dedicated page listing all contracts
- [ ] Filter by:
  - Employee
  - Contract type
  - Status (active, expired, pending)
  - Work location
  - End date
- [ ] Sort by various fields
- [ ] Export functionality (CSV/PDF)

### 8. Compliance Dashboard

- [ ] Widget showing:
  - Total active contracts
  - Contracts expiring this month
  - Contracts in probation
  - CDD conversion eligible
- [ ] Department/team breakdown
- [ ] Contract type distribution

### 9. Temporary Staff (Intérimaires) Management

- [ ] Track temp worker assignments
- [ ] Mission start/end dates
- [ ] End-of-mission reports
- [ ] Temp agency management
- [ ] Renewal tracking per mission

## Data Model

```typescript
interface EmploymentContract {
  id: string;
  employeeId: string;
  contractType: ContractType;
  status: ContractStatus;

  // Dates
  startDate: Date;
  endDate?: Date;              // For fixed-term contracts
  probationEndDate?: Date;
  noticeDate?: Date;          // Contractual notice period

  // Work Details
  workingTime: WorkingTimeType;
  weeklyHours?: number;
  jobPosition: string;
  workLocation: string;
  department?: string;

  // Compensation
  salary?: number;
  salaryType: 'hourly' | 'monthly' | 'annual';
  collectiveAgreement?: string;

  // Additional
  contractTemplateId?: string;
  documentUrl?: string;
  amendments: ContractAmendment[];

  // Probation
  probationPeriodDays?: number;
  probationEvaluationDate?: Date;
  probationExtended?: boolean;

  // Temporary Work
  tempAgencyId?: string;
  missionNumber?: string;

  // Tracking
  isRenewable: boolean;
  renewalCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

enum ContractType {
  CDI = "CDI",
  CDD = "CDD",
  INTERIM = "Intérim",
  CTT = "CTT",
  STAGE = "Stage",
  ALTERNANCE = "Alternance",
  APPRENTISSAGE = "Apprentissage",
  PROFESSIONNALISATION = "Professionnalisation",
}

enum ContractStatus {
  DRAFT = "draft",
  PENDING = "pending",
  ACTIVE = "active",
  PROBATION = "probation",
  EXPIRED = "expired",
  TERMINATED = "terminated",
  RENEWED = "renewed",
}

enum WorkingTimeType {
  TEMPS_PLEIN = "temps_plein",
  TEMPS_PARTIEL = "temps_partiel",
  FORFAIT_JOURS = "forfait_jours",
  FORFAIT_HEURES = "forfait_heures",
}

interface ContractAmendment {
  id: string;
  contractId: string;
  type: AmendmentType;
  description: string;
  effectiveDate: Date;
  documentUrl?: string;
  createdAt: Date;
}

enum AmendmentType {
  SALARY = "salary",
  HOURS = "hours",
  POSITION = "position",
  LOCATION = "location",
  DURATION = "duration",
  OTHER = "other",
}

interface TempAgency {
  id: string;
  name: string;
  address?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  siret?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TempAssignment {
  id: string;
  contractId: string;          // The interim contract
  tempAgencyId: string;
  missionStartDate: Date;
  missionEndDate: Date;
  missionReason: string;      // Reason for temporary work
  workstation?: string;
  supervisorName?: string;
  endOfMissionReport?: string;
  renewalCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Integration Points

### Alerts System
- Generate alert when contract is nearing end (30, 60, 90 days)
- Generate alert when contract expires
- Generate alert for probation evaluation
- Generate alert for CDD → CDI conversion eligibility
- Include employee name, contract type, end date

### CACES Module
- Contract type may require specific CACES
- Track which certifications needed per contract type

### Medical Visits Module
- Link to employment fitness requirements
- Contract may require specific medical clearance

### Employee Profile
- Display current contract status
- Show contract history
- Contract type affects benefits/rights

### Documents
- Store signed contracts
- Store amendments
- Store end-of-mission reports

## UI Components

### Contracts Page
- Table view with columns: Employee, Contract Type, Start Date, End Date, Status, Work Location
- Quick actions: View, Edit, Download contract, Generate renewal
- Filter by status, type, location
- Export functionality

### Employee Detail - Contract Tab
- Current contract details
- Contract history timeline
- Amendment history
- Document access

### Temporary Work Page
- List of all interim assignments
- Agency information
- Mission tracking
- End-of-mission reports

### Dashboard Widget
- Contracts expiring soon
- Active contracts count
- CDD conversion eligible
- Probation evaluations due
- Quick link to full contracts page

### Alerts Configuration
- Warning: 60 days before end
- Critical: 30 days before end
- Expired: Past end date
- Probation: 1 week before evaluation

## Contract Workflows

### New Employee Contract
1. Select contract type
2. Fill contract details
3. Upload signed document
4. Set probation period
5. Set renewal reminders (if applicable)
6. Link to employee profile

### Contract Renewal
1. Alert at configured interval
2. Review contract terms
3. Create amendment or new contract
4. Update status
5. Generate new document

### CDD to CDI Conversion
1. Alert when CDD is near end
2. Check eligibility
3. Create new CDI contract
4. Archive old contract
5. Update employee status

### Temporary Assignment
1. Create interim contract
2. Record temp agency
3. Track mission dates
4. Monitor end-of-mission
5. Generate report if needed

## Legal Compliance

### Required Contract Elements (Article L1242-12)

- [ ] Full names of parties
- [ ] Start date
- [ ] Contract type
- [ ] Job position/duties
- [ ] Work location
- [ ] Working hours
- [ ] Compensation
- [ ] Paid leave entitlement
- [ ] Notice periods
- [ ] Collective agreement reference

### Document Retention

- Active contracts: Duration of employment
- Expired contracts: 5 years minimum
- End-of-mission reports: 5 years

## Future Considerations

- Contract template editor
- Digital signature integration
- Automatic contract generation
- Integration with payroll systems
- Multi-site contract management
- Contract analytics and reporting
- Legal compliance checks
- Contract cost tracking
