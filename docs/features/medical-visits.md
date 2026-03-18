# Medical Visits Management

## Overview

Medical visits (visites médicales) are mandatory health check-ups for warehouse employees in France. Employers are required to ensure employees undergo periodic medical examinations to verify their fitness for work, especially when operating equipment or handling materials. This feature tracks medical visit appointments, results, and compliance status.

## Current State

- Alerts system tracks expiring medical visits
- Category field in alerts table
- Days left indicator for upcoming visits

## Regulatory Context (France)

### Types of Medical Visits

| Type | Description | Frequency |
|------|-------------|-----------|
| Embauche | Pre-employment medical exam | Before hiring |
| Périodique | Periodic routine exam | Every 2-4 years (based on age/risk) |
| Reprise | Return to work after illness/injury | Before returning |
| Ampliation | Workplace adjustment visit | When needed |
| Spécifique | Special exposure to risks | Based on exposure |

### Key Requirements

- Medical visit must be conducted by an occupational health physician (médecin du travail)
- Certificate of aptitude must be issued after examination
- Records must be kept for at least 5 years

## Desired Features

### 1. Medical Visit Records

- [ ] Store visit information:
  - Visit type
  - Scheduled date
  - Completed date
  - Physician name
  - Medical center
  - Result/Aptitude level
  - Next visit date
- [ ] Document upload (certificate PDF)
- [ ] Notes field for additional information

### 2. Employee Medical Profile

- [ ] Complete medical history per employee
- [ ] Display current medical status (fit, unfit, restricted)
- [ ] Show next required visit date
- [ ] Track restrictions or accommodations

### 3. Scheduling & Reminders

- [ ] Configurable reminder periods (30, 60, 90 days)
- [ ] Automatic alert generation for upcoming visits
- [ ] Calendar integration (optional)
- [ ] Visit due date calculation based on:
  - Last visit date
  - Employee age
  - Risk level of position

### 4. Medical Visits Registry

- [ ] Dedicated page listing all medical visits
- [ ] Filter by:
  - Employee
  - Visit type
  - Status (scheduled, completed, overdue)
  - Result
- [ ] Sort by date
- [ ] Export functionality (CSV/PDF)

### 5. Compliance Dashboard

- [ ] Widget showing:
  - Total employees with valid medical visits
  - Visits due this month
  - Overdue visits
  - Upcoming next week

### 6. Bulk Operations

- [ ] Bulk scheduling for periodic visits
- [ ] Import visit data from external systems
- [ ] Batch export for compliance reporting

## Data Model

```typescript
interface MedicalVisit {
  id: string;
  employeeId: string;
  visitType: MedicalVisitType;
  scheduledDate: Date;
  completedDate?: Date;
  physicianName?: string;
  medicalCenter?: string;
  result?: MedicalVisitResult;
  nextVisitDate?: Date;
  documentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum MedicalVisitType {
  EMBAUCHE = "embauche",
  PERIODIQUE = "périodique",
  REPRISE = "reprise",
  AMPLIATION = "ampliation",
  SPECIFIQUE = "spécifique",
}

enum MedicalVisitResult {
  APT = "apt",
  APT_AVEC_RESTRICTION = "apt_avec_restriction",
  INAPT = "inapt",
  EN_COURS = "en_cours",
}

interface EmployeeMedicalProfile {
  employeeId: string;
  currentStatus: MedicalVisitResult;
  restrictions?: string;
  lastVisitId?: string;
  nextVisitDueDate?: Date;
  riskLevel: RiskLevel;
}

enum RiskLevel {
  NORMAL = "normal",
  ELEVATED = "elevated",
  SPECIFIC = "specific",
}
```

## UI Components

### Medical Visits Page
- Table view with columns: Employee, Visit Type, Scheduled, Completed, Result, Next Visit
- Quick actions: View details, Edit, Download certificate
- Add new visit button
- Calendar view option

### Employee Detail - Medical Tab
- Employee's medical history timeline
- Current status badge
- Upcoming appointment reminder
- Add new visit / Schedule button

### Dashboard Widget
- Compliance percentage
- Number of overdue visits
- Visits due this week/month
- Quick link to full medical page

### Alerts Configuration
- Warning: 60 days before due date
- Critical: 30 days before due date
- Overdue: Past due date

## Integration Points

### Alerts System
- Generate alert when visit is due
- Generate alert when visit is overdue
- Include employee name, due date, and link to schedule

### Employee Profile
- Display medical status prominently
- Show restriction warnings if applicable

### Documents
- Store medical certificates
- Link to employee documents

## Future Considerations

- Integration with occupational health services (SIST)
- Automated scheduling with external calendar
- Reminder email notifications
- Medical visit analytics and trends
- Audit trail for compliance reports
- Mobile app for on-site verification
