# Absence & Leave Management

## Overview

The Absence & Leave Management module tracks employee absences, time off, and leave types in accordance with French labor law. It integrates with the Alerts system to trigger medical visits (Reprise) after certain absences and connects to Scheduling to manage shift coverage.

> **Important:** This module complies with the latest French labor law updates, including the 2024 CP accrual during sick leave law and updated Reprise thresholds.

## Current State

- Employee status can be changed to ON_LEAVE
- Basic leave sub-statuses exist

## Leave Types (France)

### Paid Leave (Congés Payés)

| Type | French | Description |
|------|--------|-------------|
| Annual Leave | Congés annuels | Standard paid vacation |
| RTT | Réduction du Temps de Travail | Time off in lieu of overtime |
| Days off | Jours fériés | French public holidays |

### Unpaid Leave (Congés Sans Solde)

| Type | French | Description |
|------|--------|-------------|
| Personal Leave | Congé personnel | Unpaid personal days |
| Sabbatical | Congé sabbatique | Extended unpaid leave |

### Family Leave (Congés Familiaux)

| Type | French | Description | Duration |
|------|--------|-------------|-----------|
| Maternity | Congé maternité | Pregnancy leave | 16 weeks |
| Paternity | Congé paternité | Birth leave | 25 days |
| Parental | Congé parental | Childcare leave | Up to 1 year (renewable) |
| Marriage | Congé mariage | Wedding leave | 4 days |
| Death | Congé décès | Bereavement | 1-5 days |

### Sick Leave (Arrêt Maladie)

> **Important:** Distinguish between work-related and non-work-related for Reprise thresholds.

| Type | French | Description | Reprise Required |
|------|--------|-------------|------------------|
| Common illness | Maladie courante | Standard sick leave | After 60 days |
| Work accident | Accident du travail | AT (in warehouse/mission) | **After 30 days** |
| Accident trajet | Accident de trajet | Home-work accident | After 60 days |
| Occupational disease | Maladie professionnelle | Work-related illness | **Always (0 days)** |
| Congé pathologique | Pregnancy-related sick leave | During pregnancy | Always |

### Therapeutic Part-Time (Mi-temps Thérapeutique)

> For employees returning from long-term absence with modified duties.

| Type | French | Description |
|------|--------|-------------|
| Mi-temps Thérapeutique | Therapeutic part-time | Reduced hours upon medical advice |

### Other Absences

| Type | French | Description |
|------|--------|-------------|
| Training | Formation | Professional training |
| Jury duty | Jury d'assises | Court service |
| Union duties | Mandat syndical | Union representation |
| Suspension | Suspension | Disciplinary suspension |

## Leave Entitlements

### Annual Leave Calculation

- **Base:** 30 days per year (5 weeks)
- **Acquisition:** 2.5 days per month worked
- **Calculation method:** Civil (Mon-Sun) or Professional (Mon-Sat)

### CP Accrual During Sick Leave (2024 Law)

> **Critical Update (April 2024):** Employees now accrue paid leave while on sick leave.

| Absence Type | Accrual Rate | Annual Cap |
|-------------|--------------|------------|
| Non-professional illness | 2 days/month | 24 days |
| Work Accident (AT) | 2.5 days/month | 30 days |
| Occupational Disease | 2.5 days/month | 30 days |

### RTT (Réduction du Temps de Travail)

- Earned when working beyond 35h/week
- Typically 8-12 days per year

### Public Holidays (Jours Fériés)

> Reference data for French public holidays. Some regions (Alsace-Moselle) have additional holidays.

| Date | Holiday | Alsace-Moselle |
|------|---------|----------------|
| Jan 1 | Jour de l'an | Yes |
| Easter Monday | Lundi de Pâques | Yes |
| May 1 | Fête du Travail | Yes |
| May 8 | Victoire 1945 | Yes |
| Ascension | Ascension | Yes |
| Whit Monday | Lundi de Pentecôte | Yes |
| July 14 | Fête nationale | Yes |
| Aug 15 | Assomption | Yes |
| Nov 1 | Toussaint | Yes |
| Nov 11 | Armistice 1918 | Yes |
| Dec 25 | Noël | Yes |
| Dec 26 | Saint-Étienne | Yes (only) |

- [ ] Public holiday calendar by region
- [ ] Exclude from CP deduction when falls during leave

## Medical Reprise (Return-to-Work) Triggers

> **Critical:** Updated thresholds based on latest French labor law (Loi Santé au Travail).

### Reprise Thresholds

| Absence Type | Reprise Required After | Alert Trigger |
|-------------|------------------------|---------------|
| **Work Accident (AT)** | **30 days** | Day 30 |
| **Accident Trajet** | 60 days | Day 60 |
| **Non-professional Sick Leave** | **60 days** | Day 60 |
| **Occupational Disease** | **Always (0 days)** | Immediate |
| **Maternity Leave** | **Always (0 days)** | Immediate |
| **Pre-reprise Request** | >30 days absence | Upon request |

### Pre-reprise Visit

Employees on absence >30 days can request a visit before their return to prepare workplace adjustments.

## Features

### 1. Leave Request

- [ ] Employee submits leave request
- [ ] Select leave type
- [ ] Select dates
- [ ] Automatic working days calculation
- [ ] Public holiday exclusion
- [ ] Add notes
- [ ] Submit for approval

### 2. Leave Approval

- [ ] Manager receives request
- [ ] **Coverage warning** if team understaffed
- [ ] Approve or reject
- [ ] Add comments
- [ ] Notify employee

### 3. Leave Calendar

- [ ] Visual calendar view
- [ ] Team absences
- [ ] Department absences
- [ ] **Absence heatmap** - identify peaks
- [ ] Color-coded by type
- [ ] Public holidays displayed

### 4. Leave Balance

- [ ] Track remaining days
- [ ] Show accrued days (including sick leave accrual)
- [ ] Show used days
- [ ] Project end-of-year balance
- [ ] **Carry-over (Reliquat)** tracking
- [ ] Expiration date (May 31 or Dec 31)

### 5. Absence Tracking

- [ ] Track sick leave
- [ ] Track work accidents (AT)
- [ ] Track accident trajet (different legal weight)
- [ ] Track occupational diseases
- [ ] Generate reports

### 6. Medical Reprise Integration

> When employee returns from certain absences, trigger medical visit alert

- [ ] **Work Accident (AT):** Triggers after **30 days**
- [ ] **Accident Trajet:** Triggers after 60 days
- [ ] **Occupational Disease:** Triggers **immediately (0 days)**
- [ ] **Non-professional Sick Leave:** Triggers after **60 days**
- [ ] **Maternity:** Triggers **immediately (0 days)**
- [ ] **Pre-reprise:** Trigger if requested

### 7. Scheduling Integration

- [ ] Block shifts during leave
- [ ] Show availability on schedule
- [ ] Notify for coverage needed
- [ ] Coverage warnings in approval

### 8. Fractionnement (Leave Splitting)

> Extra days for taking main leave outside May-October.

- [ ] Calculate fractionnement days based on leave history
- [ ] Auto-add to balance in November
- [ ] Report fractionnement usage

### 9. Therapeutic Part-Time (Mi-temps)

- [ ] Track reduced hours status
- [ ] Link to medical aptitude with restrictions
- [ ] Schedule modified shifts
- [ ] Track duration and end date

### 10. Reprise Checklist

> When manager marks employee as returned from AT/MP:

- [ ] Require checkbox: "Medical certificate received or Reprise visit scheduled"
- [ ] Block status change until acknowledged
- [ ] Log acknowledgment for audit

## Data Model

```typescript
interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  workingDays: number;         // Excludes public holidays/weekends
  status: LeaveStatus;
  reason?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum LeaveType {
  PAID_LEAVE = "paid_leave",           // Congés payés
  RTT = "rtt",                         // RTT
  SICK_LEAVE = "sick_leave",           // Arrêt maladie (non-professional)
  WORK_ACCIDENT = "work_accident",     // Accident du travail (30-day threshold)
  ACCIDENT_TRAJET = "accident_trajet", // Home-work accident (60-day threshold)
  OCCUPATIONAL_DISEASE = "occupational_disease", // Maladie professionnelle (always)
  CONGE_PATHOLOGIQUE = "conge_pathologique", // Pregnancy sick leave
  THERAPEUTIC_PART_TIME = "mi_temps_therapeutique", // Therapeutic part-time
  MATERNITY = "maternity",
  PATERNITY = "paternity",
  PARENTAL = "parental",
  MARRIAGE = "marriage",
  DEATH = "death",
  TRAINING = "training",
  JURY_DUTY = "jury_duty",
  UNION = "union_duties",
  SUSPENSION = "suspension",
  UNPAID = "unpaid_leave",
  OTHER = "other",
}

enum LeaveStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

interface LeaveBalance {
  employeeId: string;
  year: number;

  // Paid Leave
  paidLeaveDays: number;       // Congés payés (total)
  paidLeaveUsed: number;
  paidLeaveRemaining: number;
  carriedOverDays: number;     // Reliquat from previous year
  expirationDate: Date;       // May 31 or Dec 31

  // RTT
  rttDays: number;
  rttUsed: number;
  rttRemaining: number;

  // Accrual (2024 law)
  accruedDuringSickLeave: number;  // Days accrued while on sick leave
}

interface AbsenceRecord {
  id: string;
  employeeId: string;
  absenceType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;

  // For Reprise Logic
  isProfessional: boolean;     // True for AT and Occupational Disease
  isAT: boolean;             // True for WORK_ACCIDENT (30-day threshold)
  isTrajet: boolean;         // True for ACCIDENT_TRAJET (60-day threshold)
  requiresReprise: boolean;  // Calculated based on type and duration
  repriseAlertTriggered: boolean;

  // Medical
  accidentNumber?: string;    // AT declaration number
  medicalCertificateUrl?: string;
  initialCertificateDate?: Date;
  prolongationCertificateDates?: Date[];
  finalCertificateDate?: Date;

  // Pre-reprise
  isPreRepriseRequested: boolean;
  preRepriseDate?: Date;

  // Therapeutic Part-time
  isTherapeuticPartTime: boolean;
  therapeuticHoursPerWeek?: number;
  therapeuticEndDate?: Date;

  // Work restrictions (from doctor)
  restrictions?: string;
  workstationAdjustmentNotes?: string;

  notes?: string;
  createdAt: Date;
}

interface PublicHoliday {
  id: string;
  date: Date;
  name: string;
  nameEn: string;
  region?: string;           // Alsace-Moselle, etc.
  isActive: boolean;
}
```

## Integration Points

### Alerts System
- Trigger Reprise medical visit based on:
  - Work Accident: After **30 days**
  - Accident Trajet: After 60 days
  - Non-professional Sick Leave: After **60 days**
  - Occupational Disease: **Immediate (0 days)**
  - Maternity: **Immediate (0 days)**
- Generate alert with employee details
- Include duration and threshold info

### Employee Status
- Set status to ON_LEAVE during absence
- Set leave sub-status based on leave type
- Add THERAPEUTIC_PART_TIME flag
- Restore to ACTIVE when back (after Reprise if required)

### Scheduling
- Block shifts during leave
- Show on schedule as unavailable
- Coverage needed notifications
- Apply reduced hours for therapeutic part-time

### Medical Module
- Link to medical visits
- Track Reprise requirements
- Link Aptitude with restrictions

### Payroll
- Report CP accrued during sick leave
- Report AT days for social declarations

## Workflows

### Leave Request Flow

1. Employee submits request
2. Select leave type and dates
3. System calculates working days (excludes public holidays)
4. System checks team coverage
5. **Show coverage warning if understaffed**
6. Manager reviews
7. Approve or reject
8. Update leave balance
9. Update schedule

### Return from Absence Flow

1. Employee returns
2. System checks leave type and duration
3. If Reprise required:
   - Create Reprise alert
   - Assign to manager
4. **Manager must complete Reprise Checklist**
5. Update employee status to ACTIVE

### Work Accident Flow

1. Employee has AT
2. Record absence as **WORK_ACCIDENT**
3. Mark `isAT = true`
4. Get AT declaration number
5. **System auto-triggers Reprise alert after 30 days**
6. Upload medical certificates (initial, prolongations, final)

### Sick Leave > 60 Days Flow

1. Employee on sick leave
2. Track duration
3. At **Day 60**: System triggers Reprise alert
4. Manager schedules visit
5. Employee returns

### CP Accrual During Sick Leave (2024)

1. Employee on sick leave
2. System tracks each month
3. At month end: Add 2 days (non-professional) or 2.5 days (AT/MP)
4. Update LeaveBalance
5. Report to payroll

## UI Components

### Leave Request Form
- Leave type dropdown (with sub-categories)
- Date pickers
- **Automatic working days calculator** (excludes weekends + public holidays)
- Notes field
- Coverage warning display

### Leave Calendar
- Month/Week view
- Color-coded absences
- **Heatmap overlay** for absence peaks
- Filter by department
- Filter by leave type
- Public holidays displayed

### Leave Balance Widget
- Paid leave remaining
- RTT remaining
- **Accrued during sick leave**
- Carried over days
- Visual progress bar

### Reprise Checklist Modal
> Required when returning from AT/MP:

- [ ] Checkbox: "Medical certificate received"
- [ ] Checkbox: "Reprise visit scheduled"
- [ ] Cannot proceed without acknowledgment

### Coverage Warning
- "Warning: 3 other Caristes are already on leave this week"
- "Minimum required for this zone: 2"

### Absence Reports
- Total absences
- By type (with AT vs Trajet breakdown)
- By employee
- By department
- **Absence heatmap** - identify patterns

## Future Considerations

- Integration with payroll
- Time management system sync
- Mobile leave requests
- Calendar sync
- Fractionnement auto-calculation
- Holiday calendar configuration by region
- Cerfa 11138*05 auto-fill for AT
- Integration with sick leave declaration API
