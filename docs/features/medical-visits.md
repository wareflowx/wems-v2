# Medical Visits Management

## Overview

Medical visits (visites médicales) are mandatory health check-ups for warehouse employees in France. Employers are required to ensure employees undergo periodic medical examinations to verify their fitness for work, especially when operating equipment or handling materials. This feature tracks medical visit appointments, results, and compliance status.

> **Important:** This system reflects the current French labor law regulations (Code du Travail) as of 2024, including the 2016/2017 reforms.

## Current State

- Alerts system tracks expiring medical visits
- Category field in alerts table
- Days left indicator for upcoming visits

## Regulatory Context (France)

### Types of Medical Visits (Updated 2016/2017+)

| Type | French | Description | Frequency |
|------|--------|-------------|-----------|
| VIP Initiale | Visite d'Information et de Prévention | Pre-employment visit (replaces "Embauche") | Before hiring |
| VIP Périodique | Visite d'Information et de Prévention | Standard periodic visit | Every 5 years max |
| SIR Examen | Suivi Individuel Renforcé - Examen médical | Doctor visit for high-risk posts | Every 4 years |
| SIR Intermédiaire | Suivi Individuel Renforcé - Visite intermédiaire | Nurse visit (between doctor visits) | Every 2 years |
| Reprise | Visite de Reprise | Return to work after absence | Before returning |
| Mi-carrière | Visite de mi-carrière | Mid-career visit | During 45th birthday year |
| Pré-reprise | Visite pré-reprise | Pre-return visit | Before actual return |
| Fin de carrière | Visite de fin de carrière | End of career | Near retirement |

### SIR vs VIP: The Critical Distinction

> **Critical:** Employees holding CACES (forklift operators) are classified as "Poste à Risque" (high-risk position) and require **SIR** (Suivi Individuel Renforcé), NOT VIP.

| Follow-up Type | Max Validity | Intermediate Visit | Who |
|----------------|--------------|-------------------|-----|
| VIP | 5 years | None | Nurse or Doctor |
| SIR | 4 years | At 2 years (Nurse) | Doctor + Nurse |

### Key Requirements

- Medical visit must be conducted by an occupational health physician (médecin du travail) or qualified nurse
- Certificate of aptitude (Avis d'aptitude) must be issued after examination
- Records must be kept for at least 5 years
- Employer must prove convocation (invitation) was sent

### Reprise Visit Triggers

A "Reprise" visit is legally required after:
- Maternity leave
- Occupational disease (Maladie professionnelle) - any duration
- Work accident resulting in >30 days absence
- Non-work accident/illness resulting in >60 days absence

## Desired Features

### 1. SIR/VIP Automatic Classification

- [ ] "Poste à Risque" toggle in employee profile
- [ ] Auto-enable SIR when CACES is assigned to employee
- [ ] Automatic frequency calculation:
  - SIR: 4-year doctor visit + 2-year intermediate nurse visit
  - VIP: 5-year periodic visit
  - RQTH (Handicap): 3-year max frequency
- [ ] Track last doctor visit separately from last nurse visit
- [ ] Calculate next theoretical visit date based on type

### 2. CACES Connection (Safety Lock)

> **Critical:** Medical fitness is the "Master Key" for equipment operation.

- [ ] Link medical visit status to Autorisation de Conduite
- [ ] Auto-invalidate driving authorization when:
  - Medical visit result is "Inapt"
  - Medical certificate expires
  - Employee is marked unfit for equipment operation
- [ ] Real-time status sync between modules

### 3. Medical Visit Records

- [ ] Store visit information:
  - Visit type (VIP Initiale, VIP Périodique, SIR Examen, SIR Intermédiaire, Reprise, Mi-carrière)
  - Scheduled date
  - Completed date
  - Convocation sent date (critical for legal proof)
  - Physician name
  - Medical center / SIST
  - Result/Aptitude level
  - Next visit date
- [ ] Document upload (Avis d'aptitude / Fiche de visite)
- [ ] **GDPR Compliance:** Strictly administrative data only - no medical diagnoses

### 4. Employee Medical Profile

- [ ] Complete medical history per employee
- [ ] Display current medical status:
  - **Green:** Apt + Visit valid
  - **Orange:** Apt with restrictions OR Visit expiring <60 days
  - **Red:** Inapt OR Overdue OR Reprise required
- [ ] Show next required visit date (calculated)
- [ ] Track restrictions/accommodations with mandatory description field
- [ ] isSIR flag (forced for CACES holders)
- [ ] isHandicap flag (RQTH - impacts frequency)
- [ ] Mid-career alert (45th birthday)

### 5. Auto-Generated Alerts

- [ ] Visit due (based on SIR/VIP frequency)
- [ ] SIR intermediate visit due (2-year mark)
- [ ] Mid-career visit (employee turns 45)
- [ ] Reprise visit required (after long absence)
- [ ] Convocation not sent (before scheduled visit)
- [ ] Document missing (certificate not uploaded)

### 6. Scheduling & Reminders

- [ ] Configurable reminder periods (30, 60, 90 days)
- [ ] Automatic alert generation for upcoming visits
- [ ] Calendar integration (optional)
- [ ] Visit due date calculation based on:
  - Last visit date
  - Visit type (SIR vs VIP)
  - Employee age
  - Risk level (Poste à Risque)
  - RQTH status

### 7. Medical Visits Registry

- [ ] Dedicated page listing all medical visits
- [ ] Filter by:
  - Employee
  - Visit type
  - Status (scheduled, completed, overdue)
  - Result
  - SIR/VIP classification
- [ ] Sort by date
- [ ] Export functionality (CSV/PDF)

### 8. Compliance Dashboard

- [ ] Widget showing:
  - Total employees with valid medical visits
  - Compliance percentage
  - Visits due this month
  - Overdue visits
  - Upcoming next week
- [ ] SIST Contact Info section
- [ ] Missing Aptitude Certificates list
- [ ] Convocation Tracker

### 9. Bulk Operations

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
  convocationSentDate?: Date;      // Legal proof of invitation
  completedDate?: Date;
  physicianName?: string;          // Only for SIR Examen
  medicalCenter?: string;
  sistName?: string;                // Service de Prévention et de Santé au Travail
  result?: MedicalVisitResult;
  restrictionsDescription?: string; // Mandatory if Apt avec restriction
  nextVisitDate?: Date;
  nextVisitType?: MedicalVisitType; // Predicted next visit type
  documentUrl?: string;
  notes?: string;                   // Admin notes only - NO medical data
  createdAt: Date;
  updatedAt: Date;
}

enum MedicalVisitType {
  VIP_INITIALE = "VIP Initiale",
  VIP_PERIODIQUE = "VIP Périodique",
  SIR_EXAMEN = "SIR Examen Médical",    // Every 4 years (Doctor)
  SIR_INTERMEDIAIRE = "SIR Intermédiaire", // Every 2 years (Nurse)
  REPRISE = "Reprise",
  MI_CARRIERE = "Mi-carrière",
  PRE_REPRISE = "Pré-reprise",
  FIN_DE_CARRIERE = "Fin de carrière",
}

enum MedicalVisitResult {
  APT = "apt",
  APT_AVEC_RESTRICTION = "apt_avec_restriction",
  INAPT = "inapt",
  INAPT_TEMPORAIRE = "inapt_temporaire",
  EN_COURS = "en_cours",
  VISITE_EFFECTUEE = "visite_effectuée",
}

interface EmployeeMedicalProfile {
  employeeId: string;
  currentStatus: MedicalVisitResult;
  isSIR: boolean;                    // Forced true if has CACES
  isPosteARisque: boolean;           // High-risk position
  isHandicap: boolean;              // RQTH status
  restrictions?: string;
  lastDoctorVisitId?: string;        // Specifically the MD visit (SIR Examen)
  lastNurseVisitId?: string;         // Specifically the Nurse visit
  lastVisitId?: string;
  nextVisitDueDate?: Date;
  nextVisitType?: MedicalVisitType;
  midCareerVisitDue?: Date;         // Calendar year of 45th birthday
  createdAt: Date;
  updatedAt: Date;
}

enum RiskLevel {
  NORMAL = "normal",         // VIP - every 5 years
  ELEVATED = "elevated",     // SIR - every 4 years + 2-year intermediate
}
```

## GDPR & Privacy Compliance

> **Critical:** Employers are strictly forbidden from knowing medical reasons for visits.

### What Can Be Stored (Administrative)
- Visit date and type
- Aptitude result (Apt/Inapt/Avec restriction)
- Workplace restrictions/accommodations
- Next visit date
- Certificate/document

### What MUST NOT Be Stored (Medical)
- Diagnoses
- Medical conditions
- Test results (blood pressure, vision, etc.)
- Treatment information
- Any personal medical data

### Implementation
- [ ] Clear labeling on upload: "Administrative/Aptitude documents only"
- [ ] Access control to restrict medical data viewing
- [ ] Audit log for document access

## UI Components

### Medical Visits Page
- Table view with columns: Employee, Visit Type, Convocation, Scheduled, Completed, Result, Next Visit
- Color-coded status (Green/Orange/Red)
- Quick actions: View details, Edit, Download certificate
- Add new visit button
- Calendar view option
- Filter by SIR/VIP status

### Employee Detail - Medical Tab
- Employee's medical history timeline
- Current status badge (traffic light)
- SIR/VIP classification display
- Prerequisites checklist (for CACES)
- Upcoming appointment reminder
- Add new visit / Schedule button

### Dashboard Widget
- Compliance percentage
- Number of overdue visits
- Visits due this week/month
- SIR vs VIP breakdown
- Quick link to full medical page

### Alerts Configuration
- Planning: 180 days before due date
- Warning: 60 days before due date
- Critical: 30 days before due date
- SIR Intermediate: 2 years after last doctor visit
- Mid-Career: During 45th birthday year
- Overdue: Past due date
- Convocation Missing: Before scheduled visit if not sent

## Integration Points

### Alerts System
- Generate alert when visit is due
- Generate alert when visit is overdue
- Generate alert for SIR intermediate (2-year mark)
- Generate alert for Mi-carrière (age 45)
- Generate alert for Reprise (after long absence)
- Include employee name, due date, and link to schedule

### CACES Module
- **Critical Integration:** Sync medical status to Autorisation de Conduite
- Auto-invalidate authorization if medical expires or Inapt
- Display medical validity date in CACES view
- Warning if medical expires before CACES

### Employee Profile
- Display medical status prominently (traffic light)
- Show restriction warnings if applicable
- Force SIR if CACES assigned

### Documents
- Store Avis d'aptitude (certificate of fitness)
- Store Fiche de visite (visit record)
- Track convocation proof

### Absence/Leave Module (Future)
- Auto-detect long-term absence return
- Trigger Reprise visit alert automatically

## Future Considerations

- Integration with SIST (occupational health services) via API
- Automated scheduling with external calendar
- Reminder email notifications
- Medical visit analytics and trends
- Audit trail for compliance reports
- Mobile app for on-site verification
- Integration with leave management for auto-Reprise triggers
