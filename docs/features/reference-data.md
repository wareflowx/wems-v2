# Reference Data Management

## Overview

Reference data (Données de référence) are the foundational lookup tables and configuration values that support the core functionality of WEMS. This document outlines the essential reference data entities needed for warehouse employee management, including locations, positions, categories, and system configuration.

> **Important:** This system serves French 3PL and logistics companies, requiring specific compliance with CCN (Convention Collective), C2P (pénibilité), and French labor law.

## Current State

- Basic reference data exists in the database
- Categories for alerts are being added
- Work locations are tracked

## Reference Data Categories

### 1. Locations (Lieux de travail)

Physical locations where employees work within the warehouse/logistics facility.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Location name (e.g., "Zone A", "Shipping Bay") |
| code | string | Short code (e.g., "ZA", "SHP") |
| type | LocationType | Type of location |
| parentId | UUID | Parent location (for hierarchical structure) |
| clientId | UUID | **3PL: Client/Business Unit** |
| address | string | Full address if off-site |
| isActive | boolean | Whether location is active |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

#### Location Types

| Type | French | Description |
|------|--------|-------------|
| WAREHOUSE | Entrepôt | Main storage facility |
| ZONE | Zone | Specific area within warehouse |
| OFFICE | Bureau | Administrative area |
| YARD | Cour | Outdoor loading/unloading area |
| COLD_STORAGE | Chambre froide | Cold storage section |
| SHIPPING | Expédition | Shipping area |
| RECEIVING | Réception | Receiving area |

### 2. Clients / Business Units (3PL)

For third-party logistics, track which client each zone/employee is dedicated to.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Client name |
| code | string | Short code |
| isActive | boolean | Whether client is active |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### 3. Departments (Départements)

Organizational units within the company.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Department name |
| code | string | Short code |
| managerId | UUID | Department manager employee |
| parentId | UUID | Parent department |
| locationId | UUID | Primary location |
| isActive | boolean | Whether department is active |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### 4. Job Positions (Postes)

Employee job titles and positions with French labor compliance fields.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Position name |
| nameEn | string | English name |
| code | string | Short code |
| category | PositionCategory | Position category |
| coefficientId | UUID | **Link to Salary Grid (CCN)** |
| isExecutive | boolean | **Cadre / Non-Cadre status** |
| isPosteARisque | boolean | **Triggers mandatory SIR medical** |
| description | string | Job description |
| departmentId | UUID | Associated department |
| requiredCertifications | string[] | Required certifications |
| requiredTraining | string[] | Required training modules |
| requiredDocuments | string[] | Required document types |
| hardshipFactors | string[] | **C2P: Pénibilité factors** |
| maxWorkHoursWeekly | number | Standard hours (35 or 39) |
| isActive | boolean | Whether position is active |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

#### Position Categories

| Category | French | Examples |
|----------|--------|----------|
| HANDLER | Manutentionnaire | Warehouse worker, picker |
| DRIVER | Cariste | Forklift operator |
| RECEIVER | Réceptionnaire | Receiving clerk |
| SHIPPER | Expéditionniste | Shipping clerk |
| SUPERVISOR | Superviseur | Floor supervisor |
| MANAGER | Chef d'équipe | Team leader |
| ADMIN | Administratif | Office staff |
| MAINTENANCE | Maintenance | Maintenance technician |

### 5. Salary Coefficients (Grille de Salaire)

> **Critical:** Each position must be linked to a coefficient that determines the legal minimum salary under the CCN.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| ccnId | UUID | Link to Collective Agreement |
| code | string | Coefficient code (e.g., "138M", "150M") |
| level | string | Level (e.g., "Echelon 1") |
| echelon | number | Echelon number |
| minimumSalary | number | Monthly minimum |
| seniorityBonusPercent | number | Seniority bonus % per year |
| isActive | boolean | Whether coefficient is active |

### 6. Hardship Factors (Facteurs de Pénibilité - C2P)

> **Critical:** For French C2P (Compte Professionnel de Prévention), track exposure to hardship factors.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Factor code |
| name | string | French name |
| nameEn | string | English name |
| description | string | Description |
| category | PenibiliteCategory | Category |
| pointsPerYear | number | C2P points per year of exposure |
| isActive | boolean | Whether factor is active |

#### Hardship Categories

| Category | French | Examples |
|----------|--------|----------|
| WORK_SCHEDULE | Travail en équipes | Shift work |
| NIGHT_WORK | Travail de nuit | Night hours |
| REPETITIVE | Gestes répétitifs | >15 actions/minute |
| MANUAL_HANDLING | Manutention manuelle | Carrying >10kg |
| POSTURES | Postures douloureuses | Kneeling, crouching |
| VIBRATIONS | Vibrations | Heavy machinery |
| TEMPERATURES | Températures extremes | Cold storage |
| NOISE | Bruit | >80 dB |
| CHEMICAL | Produits chimiques | Hazardous materials |
| LOAD | Charges lourdes | Regular heavy lifting |

### 7. Professional Certifications (Certifications Professionnelles)

> **Expanded:** Beyond CACES - includes electrical, driving, safety certifications.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| type | CertificationType | Type (CACES, ELECTRIC, SAFETY, DRIVING) |
| recommendation | string | R489, R486, B0, B1V, etc. |
| category | string | Category number/letter (e.g., "3", "1A") |
| name | string | French name |
| nameEn | string | English name |
| description | string | Description |
| validForMonths | number | Validity period in months |
| requiresMedical | boolean | Requires medical clearance |
| requiresTraining | boolean | Requires prior training |
| isActive | boolean | Whether certification is active |

#### Certification Types

| Type | French | Examples |
|------|--------|----------|
| CACES | CACES | R489, R486, R482, R485 |
| ELECTRIC | Habilitation électrique | B0, B1V, B2V, BC |
| SAFETY | Sécurité | SST, Incendie |
| DRIVING | Permis | FIMO, FCO, Permis B |

### 8. Alert Types (Types d'alertes)

Categories of alerts generated by the system.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Alert code (e.g., "CACES_EXPIRY") |
| name | string | Alert name |
| nameEn | string | English name |
| category | AlertCategory | Alert category |
| severity | Severity | Severity level |
| entityType | string | Related entity (CACES, Medical, Contract) |
| defaultReminderDays | number | Default reminder days |
| isActive | boolean | Whether alert type is active |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

#### Alert Categories

| Category | French | Description |
|----------|--------|-------------|
| CACES | CACES | Equipment certification alerts |
| MEDICAL | Médical | Medical visit alerts |
| TRAINING | Formation | Training completion alerts |
| CONTRACT | Contrat | Contract expiration alerts |
| DOCUMENT | Document | Document expiration alerts |
| COMPLIANCE | Conformité | General compliance alerts |

#### Severity Levels

| Severity | French | Color | Description |
|----------|--------|-------|-------------|
| CRITICAL | Critique | Red | Immediate action required |
| WARNING | Avertissement | Orange | Action needed soon |
| INFO | Information | Blue | Informational |

### 9. Contract Types

Employment contract types supported by the system.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Contract code |
| name | string | French name |
| nameEn | string | English name |
| isPermanent | boolean | Is permanent (CDI) |
| maxDurationMonths | number | Maximum duration |
| requiresMotif | boolean | Requires legal reason |
| defaultProbationDays | number | Default probation period |
| isActive | boolean | Whether type is active |

### 10. Motif de Recours

Legal reasons for CDD/Interim contracts with carence calculation.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Motif code |
| name | string | French name |
| description | string | Description |
| carenceMultiplier | number | **1/3 or 1/2 of duration** |
| isActive | boolean | Whether motif is active |

### 11. Document Types

Types of documents that can be stored with DPAE requirements.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Document type code |
| name | string | French name |
| nameEn | string | English name |
| category | DocumentCategory | Category |
| retentionMonths | number | Retention period |
| expires | boolean | Does document expire |
| isRequired | boolean | Is mandatory for employees |
| isPreHireRequirement | boolean | **Required for DPAE** |
| isPII | boolean | Contains personally identifiable info |
| requiresDualApproval | boolean | Requires dual approval |
| autoDeleteMonths | number | Auto-delete after departure |
| isActive | boolean | Whether type is active |

### 12. Training Categories

Categories for training modules.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Category code |
| name | string | French name |
| nameEn | string | English name |
| description | string | Description |
| color | string | Display color |
| isActive | boolean | Whether category is active |

### 13. Medical Visit Types

Types of medical visits in France.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | Visit type code |
| name | string | French name |
| nameEn | string | English name |
| validForMonths | number | Validity period |
| isSIR | boolean | Requires SIR (high-risk) |
| requiresDoctor | boolean | Requires doctor visit |
| isActive | boolean | Whether type is active |

### 14. Collective Agreements

French collective agreements (CCN).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| code | string | CCN code (e.g., "3001") |
| name | string | Full name |
| shortName | string | Short name |
| isActive | boolean | Whether agreement is active |

### 15. System Configuration

Global system settings and configuration.

| Field | Type | Description |
|-------|------|-------------|
| key | string | Configuration key |
| value | string | Configuration value |
| type | ConfigType | Value type |
| description | string | Description |
| isEditable | boolean | Whether editable via UI |
| updatedAt | Date | Last update timestamp |

#### Required Configuration Keys

| Key | Description | Default |
|-----|-------------|---------|
| defaultLanguage | Default language | fr |
| dateFormat | Date format | DD/MM/YYYY |
| companyName | Company name | - |
| companyAddress | Company address | - |
| siret | Company SIRET | - |
| alertCriticalDays | Days before critical alert | 30 |
| alertWarningDays | Days before warning alert | 60 |
| alertInfoDays | Days before info alert | 90 |
| **standardWeeklyHours** | Standard legal hours | **35** |
| **nightWorkStart** | Start of night shift | **21:00** |
| **nightWorkEnd** | End of night shift | **06:00** |
| **dpaeLeadTime** | Hours before hire to send DPAE | **48** |

## Cross-Reference Logic

### Position → Certifications/Training/Documents

> **Gap Analysis Matrix:** Define what is required for each position.

- [ ] Position defines required certifications
- [ ] Position defines required training modules
- [ ] Position defines required document types

### Medical ↔ Position

> **Logic:** If Position `isPosteARisque: true`, restrict Medical Visit Type to `isSIR: true`.

- [ ] Auto-enforce SIR for risky positions
- [ ] Warning if non-SIR visit assigned to risky position

### Contract ↔ Motif de Recours

> **Logic:** CDI = No motif required. CDD/Interim = Motif required.

- [ ] Hide Motif dropdown for CDI
- [ ] Require Motif for CDD/Interim

### Contract ↔ Coefficient

> **Logic:** Contract must be linked to position with valid coefficient.

- [ ] Auto-link coefficient from position
- [ ] Warning if salary below minimum

## Desired Features

### 1. Reference Data Management UI

- [ ] Admin page to manage all reference data
- [ ] CRUD operations for each entity
- [ ] Import/Export functionality (JSON/CSV)
- [ ] Version history for changes
- [ ] Audit trail

### 2. Gap Analysis Matrix

- [ ] View Position vs Required Certifications
- [ ] View Position vs Required Training
- [ ] View Position vs Required Documents
- [ ] Toggle required items per position

### 3. Salary Grid Bulk Update

- [ ] Bulk update minimum salaries
- [ ] Flag employees below new minimum
- [ ] Generate compliance report

### 4. Hierarchical Structures

- [ ] Location hierarchy (Company → Site → Zone → Area)
- [ ] Department hierarchy
- [ ] Position hierarchy

### 5. Validation Rules

- [ ] Prevent deletion of referenced entities
- [ ] Warn on deactivation if in use
- [ ] Require at least one active option for dropdowns
- [ ] Cross-reference validation

### 6. Localization

- [ ] Support French and English names
- [ ] Easy to add more languages

### 7. Soft Deletes

- [ ] Soft delete with archive
- [ ] Restore functionality
- [ ] Keep history of changes

## Data Model

```typescript
// Client / Business Unit (3PL)
interface Client {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Location
interface Location {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  parentId?: string;
  clientId?: string;  // 3PL: Client/Business Unit
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum LocationType {
  WAREHOUSE = "warehouse",
  ZONE = "zone",
  OFFICE = "office",
  YARD = "yard",
  COLD_STORAGE = "cold_storage",
  SHIPPING = "shipping",
  RECEIVING = "receiving",
}

// Salary Coefficient (CCN)
interface SalaryCoefficient {
  id: string;
  ccnId: string;
  code: string;          // e.g., "138M", "150M"
  level: string;
  echelon: number;
  minimumSalary: number;
  seniorityBonusPercent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Hardship Factors (C2P)
interface HardshipFactor {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  description?: string;
  category: PenibiliteCategory;
  pointsPerYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum PenibiliteCategory {
  WORK_SCHEDULE = "work_schedule",
  NIGHT_WORK = "night_work",
  REPETITIVE = "repetitive",
  MANUAL_HANDLING = "manual_handling",
  POSTURES = "postures",
  VIBRATIONS = "vibrations",
  TEMPERATURES = "temperatures",
  NOISE = "noise",
  CHEMICAL = "chemical",
  LOAD = "load",
}

// Job Position
interface Position {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  category: PositionCategory;
  coefficientId?: string;      // Link to Salary Grid
  isExecutive: boolean;       // Cadre / Non-Cadre
  isPosteARisque: boolean;     // Triggers mandatory SIR
  description?: string;
  departmentId?: string;
  requiredCertifications: string[];
  requiredTraining: string[];
  requiredDocuments: string[];
  hardshipFactors: string[];   // C2P factors
  maxWorkHoursWeekly: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum PositionCategory {
  HANDLER = "handler",
  DRIVER = "driver",
  RECEIVER = "receiver",
  SHIPPER = "shipper",
  SUPERVISOR = "supervisor",
  MANAGER = "manager",
  ADMIN = "admin",
  MAINTENANCE = "maintenance",
}

// Professional Certification
interface ProfessionalCertification {
  id: string;
  type: CertificationType;
  recommendation: string;
  category: string;
  name: string;
  nameEn: string;
  description?: string;
  validForMonths: number;
  requiresMedical: boolean;
  requiresTraining: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum CertificationType {
  CACES = "caces",
  ELECTRIC = "electric",
  SAFETY = "safety",
  DRIVING = "driving",
}

// Alert Type
interface AlertType {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  category: AlertCategory;
  severity: Severity;
  entityType: string;
  defaultReminderDays: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum AlertCategory {
  CACES = "caces",
  MEDICAL = "medical",
  TRAINING = "training",
  CONTRACT = "contract",
  DOCUMENT = "document",
  COMPLIANCE = "compliance",
}

enum Severity {
  CRITICAL = "critical",
  WARNING = "warning",
  INFO = "info",
}

// Contract Type
interface ContractType {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  isPermanent: boolean;
  maxDurationMonths?: number;
  requiresMotif: boolean;
  defaultProbationDays: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Motif de Recours (with carence)
interface MotifRecours {
  id: string;
  code: string;
  name: string;
  description?: string;
  carenceMultiplier: number;   // 0.33 or 0.5
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Document Type
interface DocumentType {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  category: DocumentCategory;
  retentionMonths?: number;
  expires: boolean;
  isRequired: boolean;
  isPreHireRequirement: boolean;  // Required for DPAE
  isPII: boolean;
  requiresDualApproval: boolean;
  autoDeleteMonths?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum DocumentCategory {
  IDENTITY = "identity",
  ADMINISTRATIVE = "administrative",
  WORK = "work",
  TRAINING = "training",
  MEDICAL = "medical",
  COMPLIANCE = "compliance",
}

// Training Category
interface TrainingCategory {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Medical Visit Type
interface MedicalVisitType {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  validForMonths: number;
  isSIR: boolean;
  requiresDoctor: boolean;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Collective Agreement (CCN)
interface CollectiveAgreement {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// System Configuration
interface SystemConfig {
  key: string;
  value: string;
  type: ConfigType;
  description?: string;
  isEditable: boolean;
  updatedAt: Date;
}

enum ConfigType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  JSON = "json",
}

// Reference Data Audit
interface ReferenceDataAudit {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  oldValue?: string;
  newValue?: string;
  userId: string;
  timestamp: Date;
}
```

## Integration Points

### Alerts System
- Uses AlertTypes for alert generation
- Links to entity types for alert context

### Employee Module
- Uses Positions for job assignments (with coefficient, pénibilité)
- Uses Departments for organization
- Uses Locations (with client filter for 3PL)

### CACES/Professional Certifications Module
- Uses ProfessionalCertifications for all types

### Medical Module
- Uses MedicalVisitTypes for visit categories
- Enforces SIR for `isPosteARisque` positions

### Training Module
- Uses TrainingCategories for organization

### Contracts Module
- Uses ContractTypes for employment types
- Uses CollectiveAgreements for CCN
- Uses MotifRecours for legal reasons (with carence)
- Links coefficient from position

### Documents Module
- Uses DocumentTypes for categorization
- Enforces `isPreHireRequirement` for DPAE

## UI Components

### Reference Data Admin Page
- Tabbed interface for each entity type
- List view with search and filters
- Add/Edit/Delete operations
- Import/Export buttons
- Version history access

### Gap Analysis Matrix
- Grid view: Position vs Certifications/Training/Documents
- Toggle checkboxes to define requirements
- Export matrix

### Salary Grid Manager
- List all coefficients per CCN
- Bulk update minimum salaries
- Flag employees below threshold

### Hierarchy Viewer
- Visual tree for locations (with client grouping)
- Visual tree for departments
- Drag-and-drop reordering

### Bulk Operations
- Bulk import from CSV/JSON
- Bulk export
- Bulk activate/deactivate

## Governance

### Change Management
- [ ] All changes require audit trail
- [ ] Soft deletes preserve history
- [ ] Export before major changes
- [ ] Cross-reference validation

### Data Quality
- [ ] Required fields validation
- [ ] Unique constraints
- [ ] Foreign key integrity
- [ ] Orphan detection
- [ ] Minimum one active option for dropdowns

## Future Enhancements

- API for external integrations
- Multi-company support
- Custom fields for reference entities
- Workflow for approval of changes
- Scheduled imports from external systems
- Integration with payroll systems
