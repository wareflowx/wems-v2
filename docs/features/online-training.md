# Online Training Management

## Overview

Online training (Formations en ligne / E-learning) is a critical component of employee development and compliance in warehouse environments. This feature enables tracking of mandatory and optional training modules, completion status, certifications, and renewal requirements.

## Current State

- Alerts system tracks expiring training certifications
- Category field in alerts table
- Days left indicator for upcoming expirations

## Regulatory Context (France)

### Types of Training

| Type | French | Description | Mandatory |
|------|--------|-------------|-----------|
| Safety | Sécurité | Workplace safety, equipment handling | Yes |
| Compliance | Conformité | Legal and regulatory requirements | Yes |
| Technical | Technique | Equipment-specific skills | Varies |
| Soft Skills | Compétences | Communication, teamwork | No |
| Onboarding | Intégration | New employee orientation | Yes |

### Key Requirements

- Employers must document all training provided
- Mandatory safety training must be renewed periodically
- Training records must be kept for duration of employment + 5 years
- Employees must acknowledge completing training (émargement)
- "Accueil Sécurité" is a legal obligation for every new arrival (Article L4141-2)

## Training Categories

### Safety & Compliance

| Category | French | Description | Renewal Frequency |
|----------|--------|-------------|-------------------|
| SST | Sauveteur Secouriste du Travail | First aid | **2 years (MAC)** |
| Incendie | Formation Incendie | Fire safety | Annual |
| CACES Recyclage | Recyclage CACES | Equipment renewal | 5 years |
| Gestes et Postures | Gestes et Postures | Ergonomics | Periodic |
| Échafaudage | Échafaudage | Scaffolding safety | 3-4 years |
| HACCP | HACCP | Food safety | Periodic |
| Risques Chimiques | Risques Chimiques | Chemical hazards | Periodic |
| **Habilitation Électrique** | **Habilitation Électrique** | **Electrical safety (for maintenance/battery charging)** | **3 years** |
| **Accueil Sécurité** | **Accueil Sécurité** | **Safety induction (mandatory for ALL new arrivals)** | **Once** |

### Logistics & Operations

| Category | Description | Renewal Frequency |
|----------|-------------|-------------------|
| Conduite Engin | Equipment operation | Per CACES |
| Manutention | Material handling | Periodic |
| Stockage | Warehouse operations | Periodic |
| Expédition | Shipping/fulfillment | Periodic |
| Réception | Receiving operations | Periodic |
| Inventaire | Inventory management | Periodic |

### Company-Specific

| Category | Description |
|----------|-------------|
| Charte | Company charter/policies |
| IT | Systems training |
| Hygiene | Workplace hygiene |
| Quality | Quality procedures |
| Environment | Environmental awareness |

## Desired Features

### 1. Training Catalog

- [ ] Predefined training modules by category
- [ ] Custom training creation
- [ ] Training descriptions in French and English
- [ ] Duration estimates
- [ ] Prerequisites (other training must be completed first)
- [ ] Target audience (all employees, drivers, handlers, etc.)
- [ ] Mandatory vs optional flag
- [ ] Renewal period configuration
- [ ] **"Accueil Sécurité" as blocking prerequisite** - Employee cannot be marked "Active" without completion

### 2. Job Profiles (Skill Matrix)

> **Critical Feature:** Instead of manually assigning modules, use job profiles.

- [ ] Create **"Job Profiles"** (e.g., Order Picker, Forklift Driver, Receiver)
- [ ] Define training bundles per profile
- [ ] Auto-assign training when employee is assigned to profile
- [ ] Update profile training requirements
- [ ] Profile templates

**Example Job Profiles:**

| Profile | Required Training Bundle |
|---------|-------------------------|
| Magasinier | Accueil Sécurité + Gestes et Postures + Manutention de base |
| Cariste | CACES R489 Cat 3 + CACES Sécurité + Échafaudage (if needed) |
| Réceptionnaire | Réception + Stockage + Gestion des palettes |
| Chef d'équipe | + Leadership + Management sécurité |

### 3. Skill Leveling

- [ ] Track competency levels beyond completion:
  - **1: Learner** - In training/not yet assessed
  - **2: Autonomous** - Completed and validated
  - **3: Expert/Trainer** - Can train others
- [ ] Manager can promote to higher level
- [ ] Level requirements configurable per training

### 4. Training Assignment

- [ ] Assign training to individual employees
- [ ] Assign training by Job Profile
- [ ] Assign training to groups/departments
- [ ] Bulk assignment capabilities
- [ ] Due date setting
- [ ] Priority levels (high, medium, low)
- [ ] Training year/period tracking

### 5. Completion Tracking

- [ ] Track completion status: Not Started, In Progress, Completed
- [ ] Completion date
- [ ] Score/grade (if applicable)
- [ ] Certificate generation
- [ ] Document upload capability
- [ ] Acknowledgment tracking (émargement)
- [ ] Time spent tracking
- [ ] **Digital Signature (Émargement)** - Timestamped proof of completion

### 6. Hybrid Training Workflow (Manager Validation)

> Many warehouse trainings are hybrid: Online theory + Practical validation

- [ ] **Phase 1:** E-learning component
- [ ] **Phase 2:** Practical check by supervisor
- [ ] **Manager Validation step:** Manager logs in and confirms employee performed correctly
- [ ] Training only "Complete" after manager validation
- [ ] Manager notes field
- [ ] Validation deadline

### 7. External Training Import (Temp Workers)

> Warehouses rely on temp agencies (Adecco, Manpower, etc.)

- [ ] Quick upload for external certificates
- [ ] Import existing valid certifications
- [ ] Bypass online module but keep expiration alert
- [ ] Source tracking (which agency provided)
- [ ] Validity verification

### 8. Expiration & Renewal

- [ ] Configurable renewal periods per training
- [ ] Automatic alert generation before expiration:
  - **SST:** 4-6 months before (harder to schedule)
  - Standard: 60 days before
  - Critical: 30 days before
- [ ] Training expiration tracking
- [ ] Renewal workflow
- [ ] Recycle tracking (for expired certifications)

### 9. Employee Training Profile

- [ ] Complete training history per employee
- [ ] Current certifications list
- [ ] Upcoming/pending training
- [ ] Overdue training
- [ ] **Visual Badges** for critical certifications (SST, Fire, CACES)
- [ ] Skill levels displayed
- [ ] Export training record

### 10. Training Registry

- [ ] Dedicated page listing all training records
- [ ] Filter by:
  - Employee
  - Training module
  - Category
  - Status (not started, in progress, completed, expired)
  - Due date
  - Job Profile
- [ ] Sort by various fields
- [ ] Export functionality (CSV/PDF)

### 11. Compliance Dashboard

- [ ] Widget showing:
  - Total employees compliant
  - Training due this month
  - Overdue training
  - Completion rates
- [ ] Department/team breakdown
- [ ] Compliance percentage
- [ ] **Mobile-first view for managers** (tablet/phone)

### 12. Reporting & Analytics

- [ ] Completion rate reports
- [ ] Overdue training reports
- [ ] Department compliance comparison
- [ ] Training effectiveness (if scores available)
- [ ] Time-based trends
- [ ] BPF (Bilan Pédagogique et Financier) support

## Data Model

```typescript
interface TrainingModule {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: TrainingCategory;
  subcategory?: string;
  duration: number; // minutes
  isMandatory: boolean;
  isBlocking: boolean; // Must complete to be "Active" (e.g., Accueil Sécurité)
  renewalPeriodMonths?: number;
  prerequisites?: string[]; // other training module IDs
  targetAudience: TargetAudience[];
  contentUrl?: string;

  // French reporting
  isQualifying: boolean;        // Is it a "formation qualifiante"?
  isCertifying: boolean;        // Does it result in a state diploma/CACES?
  trainingCode?: string;        // Official CPF or internal code
  costPerParticipant?: number;  // For budget tracking/OPCO reimbursement
  externalProviderId?: string;  // Link to Training Center

  // Hybrid training
  requiresManagerValidation: boolean; // Has practical component
  validationInstructions?: string;    // What manager should check

  createdAt: Date;
  updatedAt: Date;
}

enum TrainingCategory {
  SAFETY = "safety",
  COMPLIANCE = "compliance",
  TECHNICAL = "technical",
  SOFT_SKILLS = "soft_skills",
  ONBOARDING = "onboarding",
  COMPANY = "company",
  IT = "it",
  ELECTRICAL = "electrical", // Habilitation Électrique
}

enum TargetAudience {
  ALL = "all",
  HANDLERS = "handlers",
  DRIVERS = "drivers",
  SUPERVISORS = "supervisors",
  ADMIN = "admin",
  MAINTENANCE = "maintenance",
}

interface EmployeeTraining {
  id: string;
  employeeId: string;
  trainingModuleId: string;
  status: TrainingStatus;
  skillLevel: SkillLevel; // 1: Learner, 2: Autonomous, 3: Expert
  assignedDate: Date;
  dueDate?: Date;
  startedDate?: Date;
  completedDate?: Date;
  score?: number;

  // French reporting
  actualDurationMinutes: number; // How long they ACTUALLY spent
  evaluationType: EvaluationType;
  signatureToken?: string;       // Proof of digital émargement
  isInternal: boolean;          // Internal or external training

  // Manager validation
  managerValidationRequired: boolean;
  managerValidatedDate?: Date;
  managerValidatedBy?: string;
  managerNotes?: string;

  certificateUrl?: string;
  acknowledgmentDate?: Date;
  renewalDate?: Date;
  documentUrl?: string;
  notes?: string;

  // External import (temp workers)
  isExternalImport: boolean;
  externalSource?: string; // Agency name
  originalCertificateUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

enum SkillLevel {
  LEARNER = 1,
  AUTONOMOUS = 2,
  EXPERT = 3,
}

enum EvaluationType {
  QUIZ = "quiz",
  PRACTICAL = "practical",
  ATTENDANCE = "attendance",
  HYBRID = "hybrid",
}

enum TrainingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  AWAITING_VALIDATION = "awaiting_validation", // After e-learning, waiting for manager
  COMPLETED = "completed",
  EXPIRED = "expired",
  OVERDUE = "overdue",
}

interface JobProfile {
  id: string;
  name: string;
  description?: string;
  requiredTrainingIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingSession {
  id: string;
  trainingModuleId: string;
  trainerName?: string;
  scheduledDate: Date;
  scheduledEndDate: Date;
  location?: string;
  maxParticipants?: number;
  registeredEmployees: string[];
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

enum SessionStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
```

## Integration Points

### Alerts System
- Generate alert when training is due
- Generate alert when training is overdue
- Generate alert before expiration:
  - SST: 4-6 months before (MAC)
  - Standard: 60 days before
  - Critical: 30 days before
- Include employee name, training name, due date

### CACES Module
- Link CACES recyclable training to certification
- Track CACES renewal training specifically
- **BLOCK renewal** if required safety training not completed
- Sync training completion status

### Medical Visits Module
- Link mandatory safety training completion
- Display medical status alongside training status

### Employee Profile
- Display current certifications prominently
- Show pending/overdue training
- Training history access
- **Visual Badges** for critical certifications

### Documents
- Store certificates
- Store completion proofs (émargement)
- Store external certificates (temp workers)

## UI Components

### Training Catalog Page
- Grid/list view of available training
- Category filters
- Search functionality
- Add/Edit training (admin)
- Bulk import/export
- Job Profile assignment

### Training Registry Page
- Table view with columns: Employee, Training, Status, Skill Level, Due Date, Completed Date
- Quick actions: View, Edit, Mark Complete, Validate (manager)
- Filter by status, category, employee, job profile
- Export functionality

### Employee Detail - Training Tab
- Employee's training history
- Current certifications with badges
- Skill levels displayed
- Pending training
- Add training button
- Certificate download

### Dashboard Widget
- Compliance percentage
- Number of overdue training
- Training due this week/month
- Completion rate
- Quick link to full training page
- **Mobile-optimized for managers**

### Kiosk Mode
- Quick login (badge/QR code scan)
- Large touch-friendly buttons
- Minimal navigation
- For shared terminal use

### Alerts Configuration
- SST: 120-180 days before expiration
- Warning: 60 days before expiration
- Critical: 30 days before expiration
- Due: On due date
- Overdue: Past due date

## Training Workflows

### New Employee Onboarding
1. Assign Job Profile (e.g., "Order Picker")
2. System auto-assigns training bundle
3. **"Accueil Sécurité" is blocking** - Employee cannot be "Active" without it
4. Set completion deadline (e.g., 30 days)
5. Track progress
6. Manager validation for practical components
7. Generate completion certificate

### Hybrid Training (E-learning + Practical)
1. Employee completes online module
2. Status changes to "Awaiting Validation"
3. Manager receives notification
4. Manager reviews and validates (or rejects)
5. Training marked "Complete"
6. Certificate generated

### Mandatory Annual Training
1. Assign to all applicable employees
2. Set due date (e.g., end of year)
3. Track completion
4. Generate compliance report

### Renewal Process (Recyclage)
1. Alert at configured interval (SST: 4-6 months)
2. Assign renewal training
3. Track completion
4. Update certification dates

### External Certificate Import (Temp Workers)
1. Quick upload of external certificate
2. System validates dates
3. Import without requiring online module
4. Keep expiration tracking active
5. Alert when renewal needed

## CACES Integration

- [ ] Link CACES safety training to certification
- [ ] **BLOCK Autorisation de Conduite** if required training not completed
- [ ] Display training status in CACES view
- [ ] Warning if training expires before CACES

## GDPR & Legal Compliance

### Émargement (Attendance Sheet)
- Digital signature with timestamp
- Unique user ID tied to completion
- Audit-proof for Inspection du Travail

### BPF Support
- Track actual duration per employee
- Cost per participant
- External provider details
- Export for OPCO reporting

## Future Considerations

- Integration with LMS (Learning Management System)
- SCORM content support
- Video training hosting
- Quiz/assessment builder
- Certificate templates
- Mobile app for training
- Gamification elements
- Manager approval workflow
- Budget tracking per training
- External trainer management
- Integration with temp agency portals
