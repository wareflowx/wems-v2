# Absence & Leave Management

## Overview

The Absence & Leave Management module tracks employee absences, time off, and leave types in accordance with French labor law. It integrates with the Alerts system to trigger medical visits (Reprise) after certain absences and connects to Scheduling to manage shift coverage.

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

| Type | French | Description |
|------|--------|-------------|
| Common illness | Maladie courante | Standard sick leave |
| Work accident | Accident du travail | Work-related injury |
| Occupational disease | Maladie professionnelle | Work-related illness |

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
- **Calculation method:** Civil or professional method

### RTT (Reduction du Temps de Travail)

- Earned when working beyond 35h/week
- Typically 8-12 days per year

## Features

### 1. Leave Request

- [ ] Employee submits leave request
- [ ] Select leave type
- [ ] Select dates
- [ ] Add notes
- [ ] Submit for approval

### 2. Leave Approval

- [ ] Manager receives request
- [ ] Approve or reject
- [ ] Add comments
- [ ] Notify employee

### 3. Leave Calendar

- [ ] Visual calendar view
- [ ] Team absences
- [ ] Department absences
- [ ] Color-coded by type

### 4. Leave Balance

- [ ] Track remaining days
- [ ] Show accrued days
- [ ] Show used days
- [ ] Project end-of-year balance

### 5. Absence Tracking

- [ ] Track sick leave
- [ ] Track work accidents
- [ ] Track unexcused absences
- [ ] Generate reports

### 6. Medical Reprise Integration

> When employee returns from certain absences, trigger medical visit alert

- [ ] **Work Accident (AT):** Always triggers Reprise alert
- [ ] **Occupational Disease:** Always triggers Reprise alert
- [ ] **Sick Leave > 60 days:** Triggers Reprise alert
- [ ] **Maternity:** Triggers Reprise alert

### 7. Scheduling Integration

- [ ] Block shifts during leave
- [ ] Show availability on schedule
- [ ] Notify for coverage needed

## Data Model

```typescript
interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
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
  SICK_LEAVE = "sick_leave",           // Arrêt maladie
  WORK_ACCIDENT = "work_accident",     // Accident du travail
  OCCUPATIONAL_DISEASE = "occupational_disease", // Maladie professionnelle
  MATERNITY = "maternity",             // Maternité
  PATERNITY = "paternity",             // Paternité
  PARENTAL = "parental",               // Congé parental
  MARRIAGE = "marriage",               // Congé mariage
  DEATH = "death",                     // Congé décès
  TRAINING = "training",                // Formation
  JURY_DUTY = "jury_duty",             // Jury d'assises
  UNION = "union_duties",              // Mandat syndical
  SUSPENSION = "suspension",          // Suspension
  UNPAID = "unpaid_leave",             // Congé sans solde
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
  paidLeaveDays: number;      // Congés payés
  paidLeaveUsed: number;
  paidLeaveRemaining: number;
  rttDays: number;
  rttUsed: number;
  rttRemaining: number;
}

interface AbsenceRecord {
  id: string;
  employeeId: string;
  absenceType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isWorkAccident: boolean;    // For AT reporting
  accidentNumber?: string;     // AT declaration number
  isOccupationalDisease: boolean;
  medicalCertificateUrl?: string;
  notes?: string;
  createdAt: Date;
}
```

## Integration Points

### Alerts System
- Trigger Reprise medical visit after:
  - Work Accident (always)
  - Occupational Disease (always)
  - Sick Leave > 60 days
  - Maternity leave
- Generate alert with employee details

### Employee Status
- Set status to ON_LEAVE during absence
- Set leave sub-status based on leave type
- Restore to ACTIVE when back

### Scheduling
- Block shifts during leave
- Show on schedule as unavailable
- Coverage needed notifications

### Medical Module
- Link to medical visits
- Track Reprise requirements

## Workflows

### Leave Request Flow

1. Employee submits request
2. Select leave type and dates
3. Manager reviews
4. Approve or reject
5. Update leave balance
6. Update schedule

### Return from Absence Flow

1. Employee returns
2. System checks leave type
3. If Reprise required:
   - Create Reprise alert
   - Assign to manager
4. Update employee status to ACTIVE

### Work Accident Flow

1. Employee has AT
2. Record absence as WORK_ACCIDENT
3. Get AT declaration number
4. System auto-triggers Reprise alert
5. Upload medical certificate

## UI Components

### Leave Request Form
- Leave type dropdown
- Date pickers
- Duration calculator
- Notes field
- Submit button

### Leave Calendar
- Month/Week view
- Color-coded absences
- Filter by department
- Filter by leave type

### Leave Balance Widget
- Paid leave remaining
- RTT remaining
- Visual progress bar

### Absence Report
- Total absences
- By type
- By employee
- By department
- Trends over time

## Future Considerations

- Integration with payroll
- Time management system sync
- Mobile leave requests
- Calendar sync
- Automatic balance updates
- Holiday calendar configuration
