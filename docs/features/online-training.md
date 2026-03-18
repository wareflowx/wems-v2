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
- Employees must acknowledge completing training

## Training Categories

### Safety & Compliance

| Category | Description | Renewal Frequency |
|----------|-------------|-------------------|
| Secourisme | First aid | 7 years (recyclage) |
| Incendie | Fire safety | Annual |
| CACES Recyclage | Equipment renewal | 5 years |
| Gestes et Postures | Ergonomics | Periodic |
| Échafaudage | Scaffolding safety | 3-4 years |
| HACCP | Food safety | Periodic |
| Risques Chimiques | Chemical hazards | Periodic |
| Électricité | Electrical safety | Periodic |

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

### 2. Training Assignment

- [ ] Assign training to individual employees
- [ ] Assign training to groups/departments
- [ ] Bulk assignment capabilities
- [ ] Due date setting
- [ ] Priority levels (high, medium, low)
- [ ] Training year/period tracking

### 3. Completion Tracking

- [ ] Track completion status: Not Started, In Progress, Completed
- [ ] Completion date
- [ ] Score/grade (if applicable)
- [ ] Certificate generation
- [ ] Document upload capability
- [ ] Acknowledgment tracking
- [ ] Time spent tracking

### 4. Expiration & Renewal

- [ ] Configurable renewal periods per training
- [ ] Automatic alert generation before expiration
- [ ] Training expiration tracking
- [ ] Renewal workflow
- [ ] Recycle tracking (for expired certifications)

### 5. Employee Training Profile

- [ ] Complete training history per employee
- [ ] Current certifications list
- [ ] Upcoming/pending training
- [ ] Overdue training
- [ ] Export training record

### 6. Training Registry

- [ ] Dedicated page listing all training records
- [ ] Filter by:
  - Employee
  - Training module
  - Category
  - Status (not started, in progress, completed, expired)
  - Due date
- [ ] Sort by various fields
- [ ] Export functionality (CSV/PDF)

### 7. Compliance Dashboard

- [ ] Widget showing:
  - Total employees compliant
  - Training due this month
  - Overdue training
  - Completion rates
- [ ] Department/team breakdown
- [ ] Compliance percentage

### 8. Reporting & Analytics

- [ ] Completion rate reports
- [ ] Overdue training reports
- [ ] Department compliance comparison
- [ ] Training effectiveness (if scores available)
- [ ] Time-based trends

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
  renewalPeriodMonths?: number;
  prerequisites?: string[]; // other training module IDs
  targetAudience: TargetAudience[];
  contentUrl?: string;
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
}

enum TargetAudience {
  ALL = "all",
  HANDLERS = "handlers",
  DRIVERS = "drivers",
  SUPERVISORS = "supervisors",
  ADMIN = "admin",
}

interface EmployeeTraining {
  id: string;
  employeeId: string;
  trainingModuleId: string;
  status: TrainingStatus;
  assignedDate: Date;
  dueDate?: Date;
  startedDate?: Date;
  completedDate?: Date;
  score?: number;
  certificateUrl?: string;
  acknowledgmentDate?: Date;
  timeSpentMinutes?: number;
  renewalDate?: Date;
  documentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum TrainingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  EXPIRED = "expired",
  OVERDUE = "overdue",
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
- Generate alert before expiration (30, 60, 90 days)
- Include employee name, training name, due date

### CACES Module
- Link CACES recyclable training to certification
- Track CACES renewal training specifically

### Medical Visits Module
- Link mandatory safety training completion

### Employee Profile
- Display current certifications prominently
- Show pending/overdue training
- Training history access

### Documents
- Store certificates
- Store completion proofs

## UI Components

### Training Catalog Page
- Grid/list view of available training
- Category filters
- Search functionality
- Add/Edit training (admin)
- Bulk import/export

### Training Registry Page
- Table view with columns: Employee, Training, Status, Due Date, Completed Date
- Quick actions: View, Edit, Mark Complete
- Filter by status, category, employee
- Export functionality

### Employee Detail - Training Tab
- Employee's training history
- Current certifications
- Pending training
- Add training button
- Certificate download

### Dashboard Widget
- Compliance percentage
- Number of overdue training
- Training due this week/month
- Completion rate
- Quick link to full training page

### Alerts Configuration
- Warning: 60 days before expiration
- Critical: 30 days before expiration
- Due: On due date
- Overdue: Past due date

## Training Workflows

### New Employee Onboarding
1. Assign onboarding training package
2. Set completion deadline (e.g., 30 days)
3. Track progress
4. Generate completion certificate

### Mandatory Annual Training
1. Assign to all applicable employees
2. Set due date (e.g., end of year)
3. Track completion
4. Generate compliance report

### Renewal Process
1. Alert at configured interval
2. Assign renewal training
3. Track completion
4. Update certification dates

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
