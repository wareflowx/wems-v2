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
- **Motif de Recours** (legal reason) is MANDATORY for all CDD/Interim
- DPAE (Déclaration Préalable à l'Embauche) required BEFORE employee starts
- Written contract must be given within 2 days of starting
- Records must be kept for duration of employment + 5 years

## Contract Terms & Conditions

### Motif de Recours (Legal Reason for CDD/Interim)

> **CRITICAL:** A CDD or Interim contract without a valid legal reason is NULL and can be reclassified as CDI.

| Motif | French | Description |
|-------|--------|-------------|
| REMPLACEMENT | Remplacement d'un salarié | Must link to specific absent employee |
| ACCROISSEMENT | Accroissement temporaire d'activité | Peak season, Black Friday, etc. |
| SAISONNIER | Travail saisonnier | Agricultural or seasonal work |
| USAGE | Contrat d'usage | Repeated needs (long-term temp) |
| URGENCE | Travaux urgents sécurité | Emergency safety work |

### Délai de Carence (Waiting Period)

> **CRITICAL:** Cannot chain CDD/Interim on same workstation without waiting period.

| Previous Contract Duration | Waiting Period (1/3 of duration) |
|--------------------------|----------------------------------|
| 1 month | 10 days |
| 3 months | 1 month |
| 6 months | 2 months |
| 12 months | 4 months |

- [ ] **Carence Calculator** - Auto-calculate based on previous contract
- [ ] **Block/Warn** if trying to create new contract during carence period
- [ ] Check applies to SAME workstation

### Probation Period (Période d'Essai)

| Contract Type | Max Duration | Renewal |
|--------------|--------------|---------|
| CDI | 4 months | Once (2+2 months) |
| CDD < 6 months | 1 month | Cannot be renewed |
| CDD > 6 months | 2 months | Once |
| Intérim | Per mission | Based on umbrella |

### Probation Notice (Délai de Prévenance)

> Employer must give notice to terminate probation:

| Seniority | Notice Period |
|-----------|---------------|
| < 8 days | 24 hours |
| 8 days - 1 month | 48 hours |
| 1 - 3 months | 2 weeks |
| > 3 months | 1 month |

- [ ] **Alert triggers X days BEFORE end** of probation
- [ ] Calculates based on seniority to ensure notice can be given

### Working Time

| Type | French | Hours/Week |
|------|--------|------------|
| Temps Plein | Full-time | 35 hours |
| Temps Partiel | Part-time | < 35 hours |
| Forfait Jours | Day package | 218 days/year |
| Forfait Heures | Hour package | Per contract |

### Working Schedule (Logistics-Specific)

> Critical for warehouse operations:

| Schedule Type | French | Description |
|---------------|--------|-------------|
| Fixe | Horaire fixe | Same hours every day |
| Variable | Horaire variable | Hours change weekly |
| Posté | Travail en équipe | Shift work (2x8, 3x8) |

### Night Work (Travail de Nuit)

- Hours between 21:00 and 06:00
- Triggers specific legal protections
- Requires medical surveillance
- [ ] Toggle for night work
- [ ] Link to specific medical requirements

### Pénibilité (Hardship Factors - C2P)

> Warehouse tasks may expose employees to hardship factors:

| Factor | French | Description |
|--------|--------|-------------|
| Manutention manuelle | Manual handling | Carrying >10kg regularly |
| Gestes répétitifs | Repetitive movements | >15 actions/minute |
| Postures douloureuses | Painful postures | Kneeling, crouching |
| Vibrations | Vibrations | Heavy machinery |
| Températures extrêmes | Extreme temperatures | Cold storage, heat |
| bruit | Noise | >80 dB |

- [ ] Track pénibilité factors per contract
- [ ] Link to C2P (Compte Professionnel de Prévention)
- [ ] Impact on retirement points

### Convention Collective (CCN)

> Warehouse contracts governed by specific collective agreements:

| CCN | Name | Application |
|-----|------|-------------|
| CCN 3001 | Transport et Logistique | Most warehouses |
| CCN 3105 | Commerce de Gros | Wholesale |
| CCN 3044 | Activités de manutention | Stevedoring |

- [ ] **Coefficient** tracking (e.g., 138M, 150M)
- [ ] **Salary grid** compliance check
- [ ] Notice periods per CCN
- [ ] Specific probation periods per CCN

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
- [ ] Predefined contract templates per CCN
- [ ] Custom contract creation
- [ ] Contract type descriptions and legal requirements
- [ ] **Mandatory Motif de Recours** for CDD/Interim

### 2. DPAE Tracker

> **CRITICAL:** DPAE (Déclaration Préalable à l'Embauche) is mandatory before employee starts.

- [ ] DPAE submission tracking
- [ ] **Block employee activation** if DPAE not confirmed
- [ ] DPAE date must be before or on start date
- [ ] URSSAF declaration confirmation

### 3. Délai de Carence Calculator

- [ ] Auto-calculate waiting period from previous contract
- [ ] Check against previous contracts on SAME workstation
- [ ] Block or warn if carence not respected
- [ ] Display remaining days until carence ends

### 4. Contract Records

- [ ] Store contract details:
  - Contract type
  - **Motif de Recours** (mandatory for CDD/Interim)
  - **Replaced Employee ID** (if motif is Remplacement)
  - Start date
  - End date (for fixed-term)
  - **Coefficient** (CCN salary grid)
  - Probation period
  - **Working Schedule** (fixe, variable, posté)
  - **Night Work** toggle
  - **Pénibilité** factors
  - Working time (full/part-time)
  - Job position
  - Work location
  - Compensation (salary)
  - Collective agreement
  - Special clauses
- [ ] Document upload (signed contract)
- [ ] Amendment tracking
- [ ] **DPAE confirmation checkbox**

### 5. Probation Tracking with Notice Period

- [ ] Probation start/end dates
- [ ] **Calculate Délai de Prévenance** based on seniority
- [ ] Alert X days BEFORE end (not on last day)
- [ ] Probation evaluation dates
- [ ] Probation completion status
- [ ] Probation extension tracking

### 6. Contract Status Tracking

- [ ] Active contracts
- [ ] Contracts nearing end
- [ ] Expired contracts
- [ ] Contracts in probation
- [ ] Contracts under renewal
- [ ] **DPAE pending** status

### 7. Renewal Management

- [ ] Automatic renewal alerts
- [ ] Renewal workflow
- [ ] **Successive contracts tracking** - is this renewal or new?
- [ ] CDI conversion tracking (CDD → CDI)
- [ ] Contract amendment tracking
- [ ] Renewal history
- [ ] **CDD to CDI reclassification risk check**

### 8. Employee Contract Profile

- [ ] Complete contract history per employee
- [ ] Current contract details
- [ ] **Succession timeline** (Mission 1 → Mission 2 → CDD → CDI)
- [ ] Total seniority calculation
- [ ] Previous contracts
- [ ] Contract evolution timeline
- [ ] Export contract records

### 9. Contract Registry

- [ ] Dedicated page listing all contracts
- [ ] Filter by:
  - Employee
  - Contract type
  - Status (active, expired, pending)
  - Work location
  - End date
  - Motif de Recours
- [ ] Sort by various fields
- [ ] Export functionality (CSV/PDF)

### 10. Compliance Dashboard

- [ ] Widget showing:
  - Total active contracts
  - Contracts expiring this month
  - Contracts in probation
  - CDD conversion eligible
  - **DPAE pending**
  - **Carence violations**
- [ ] Department/team breakdown
- [ ] Contract type distribution
- [ ] **"Pyramid" view** - CDD/Interim vs CDI ratio

### 11. Temporary Staff (Intérimaires) Management

- [ ] Track temp worker assignments
- [ ] Mission start/end dates
- [ ] **Motif de Recours** for each mission
- [ ] End-of-mission reports
- [ ] Temp agency management
- [ ] Renewal tracking per mission
- [ ] **Carence check** between missions

## Data Model

```typescript
interface EmploymentContract {
  id: string;
  employeeId: string;
  contractType: ContractType;
  status: ContractStatus;

  // French Legal Requirements
  motifRecours?: MotifRecours;           // MANDATORY for CDD/Interim
  replacedEmployeeId?: string;          // If motif is REMPLACEMENT
  coefficient?: string;                  // CCN salary grid (e.g., "150M")
  collectiveAgreement?: string;          // CCN reference

  // DPAE (CRITICAL)
  dpaeSubmittedDate?: Date;
  dpaeConfirmed: boolean;               // Must be true to activate

  // Dates
  startDate: Date;
  endDate?: Date;                        // For fixed-term contracts
  probationEndDate?: Date;
  noticeDate?: Date;                     // Contractual notice period

  // Working Schedule (Logistics)
  workingScheduleType: WorkingScheduleType;
  weeklyHours?: number;
  isNightWork: boolean;                  // 21:00 - 06:00

  // Pénibilité (C2P)
  penibiliteFactors: PenibiliteFactor[];

  // Work Details
  workingTime: WorkingTimeType;
  jobPosition: string;
  workLocation: string;
  workstation?: string;                  // Specific station (for carence)
  department?: string;

  // Compensation
  salary?: number;
  salaryType: 'hourly' | 'monthly' | 'annual';

  // Additional
  contractTemplateId?: string;
  documentUrl?: string;
  amendments: ContractAmendment[];

  // Succession tracking
  isSuccessive: boolean;                 // Is this chained to previous?
  previousContractId?: string;
  délaiDeCarenceEndDate?: Date;          // Calculated automatically

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

enum MotifRecours {
  REMPLACEMENT = "Remplacement d'un salarié absent",
  ACCROISSEMENT = "Accroissement temporaire d'activité",
  SAISONNIER = "Travail saisonnier",
  USAGE = "Contrat d'usage",
  URGENCE = "Travaux urgents par mesure de sécurité",
}

enum ContractStatus {
  DRAFT = "draft",
  DPAE_PENDING = "dpae_pending",         // Waiting for DPAE
  PENDING = "pending",
  ACTIVE = "active",
  PROBATION = "probation",
  EXPIRED = "expired",
  TERMINATED = "terminated",
  RENEWED = "renewed",
}

enum WorkingScheduleType {
  FIXE = "fixe",
  VARIABLE = "variable",
  POSTE = "posté",                       // 2x8, 3x8 shifts
}

enum WorkingTimeType {
  TEMPS_PLEIN = "temps_plein",
  TEMPS_PARTIEL = "temps_partiel",
  FORFAIT_JOURS = "forfait_jours",
  FORFAIT_HEURES = "forfait_heures",
}

enum PenibiliteFactor {
  MANUAL_HANDLING = "manutention_manuelle",
  REPETITIVE_MOVEMENTS = "gestes_répétitifs",
  PAINFUL_POSTURES = "postures_douloureuses",
  VIBRATIONS = "vibrations",
  EXTREME_TEMPERATURES = "températures_extrêmes",
  NOISE = "bruit",
  CHEMICAL = "produits_chimiques",
  NIGHT_WORK = "travail_de_nuit",
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
  SCHEDULE = "schedule",
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
  contractId: string;                    // The interim contract
  tempAgencyId: string;
  missionStartDate: Date;
  missionEndDate: Date;
  missionReason: MotifRecours;           // Use MotifRecours enum
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
- Generate alert for **probation end with notice period**
- Generate alert for CDD → CDI conversion eligibility
- **Generate alert for DPAE pending**
- **Generate alert for Délai de Carence violation risk**
- Include employee name, contract type, end date

### CACES Module
- Contract type may require specific CACES
- Track which certifications needed per contract type

### Medical Visits Module
- Link to employment fitness requirements
- Contract may require specific medical clearance
- **Night work** triggers additional medical surveillance

### Employee Profile
- Display current contract status
- Display **DPAE status**
- Show contract history with timeline
- Contract type affects benefits/rights
- Show **succession history**

### Documents
- Store signed contracts
- Store amendments
- Store end-of-mission reports
- **Auto-expiry** for sensitive documents after 5 years

## UI Components

### Contracts Page
- Table view with columns: Employee, Contract Type, Motif, Start Date, End Date, Status, DPAE, Work Location
- Quick actions: View, Edit, Download contract, Generate renewal
- Filter by status, type, location, motif
- **Carence warning indicators**
- Export functionality

### Employee Detail - Contract Tab
- Current contract details with DPAE status
- Contract history timeline
- **Succession visualization** (Interim → CDD → CDI)
- Amendment history
- Document access

### Contract Creation Wizard
- Step 1: Select contract type
- Step 2: **Select Motif de Recours** (if CDD/Interim)
- Step 3: Enter dates and details
- Step 4: **Carence check** - warn if applicable
- Step 5: **DPAE confirmation**
- Step 6: Upload document

### Temporary Work Page
- List of all interim assignments
- Agency information
- Mission tracking with **Motif**
- End-of-mission reports
- **Carence status** per mission

### Dashboard Widget
- Contracts expiring soon
- Active contracts count
- CDD conversion eligible
- **DPAE pending count**
- Probation evaluations due
- **Carence violations**
- **"Pyramid" view** - contract type distribution
- Quick link to full contracts page

### Alerts Configuration
- DPAE: On start date if not confirmed
- Warning: 60 days before end
- Critical: 30 days before end
- Expired: Past end date
- Probation: Based on seniority notice period (not last day)

## Contract Workflows

### New Employee Contract
1. Select contract type
2. **Select Motif de Recours** (if CDD/Interim)
3. Fill contract details
4. **Carence check** against previous contracts
5. **Submit DPAE to URSSAF**
6. **Confirm DPAE** in system (blocking until done)
7. Upload signed document
8. Set probation period with notice calculation
9. Set renewal reminders (if applicable)
10. Link to employee profile

### Contract Renewal
1. Alert at configured interval
2. **Check Carence** - can we renew?
3. Review contract terms
4. Create amendment or new contract
5. Update status
6. Generate new document

### CDD to CDI Conversion
1. Alert when CDD is near end
2. Check eligibility
3. Create new CDI contract
4. Archive old contract
5. Update employee status

### Temporary Assignment
1. **Check Carence** - can we assign?
2. Create interim contract
3. Select **Motif de Recours**
4. Record temp agency
5. Track mission dates
6. Monitor end-of-mission
7. Generate report if needed

## Legal Compliance

### Required Contract Elements (Article L1242-12)

- [ ] Full names of parties
- [ ] Start date
- [ ] **Motif de Recours** (for CDD/Interim)
- [ ] Contract type
- [ ] Job position/duties
- [ ] Work location + workstation
- [ ] Working hours + schedule type
- [ ] Compensation + coefficient
- [ ] Paid leave entitlement
- [ ] Notice periods
- [ ] **Collective agreement + coefficient**

### DPAE Requirements

- [ ] Submit to URSSAF BEFORE employee starts
- [ ] Keep confirmation for inspection
- [ ] **Block activation** if not confirmed

### Document Retention

- Active contracts: Duration of employment
- Expired contracts: 5 years minimum
- End-of-mission reports: 5 years
- DPAE confirmations: 5 years

## GDPR & Document Deletion

> Some documents must be deleted after retention period:

- [ ] Identity documents: Delete after employment ends
- [ ] End-of-mission reports: Auto-archive after 5 years
- [ ] Deletion reminders for expired documents

## Future Considerations

- Contract template editor with CCN templates
- Digital signature integration
- Automatic contract generation
- Integration with payroll systems
- Multi-site contract management
- Contract analytics and reporting
- Legal compliance checks
- Contract cost tracking
- Integration with URSSAF API
