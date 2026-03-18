# Scheduling & Shifts Management

## Overview

The Scheduling module manages employee work schedules, shifts, and assignments. It integrates with the Alerts system to respect employee permissions (blocking) and with Leave Management to handle unavailability.

> **Critical:** This module is operationally sensitive - failure to respect rest periods and legal constraints is a major legal risk. French labor law (Code du Travail) imposes strict limits on working hours, rest periods, and night work.

## Current State

- Basic scheduling concepts exist in reference data
- Shift patterns defined

## French Labor Law Compliance

### Maximum Working Hours

| Rule | Limit | Legal Reference |
|------|-------|-----------------|
| Daily maximum | 10 hours | Article L3121-18 |
| Weekly maximum | 48 hours | Article L3121-20 |
| Weekly average (35h reference) | 44h max without overtime | Article L3121-11 |
| Overtime limit | 220h/year | Article L3121-30 |

### Rest Periods

| Rule | Minimum | Legal Reference |
|------|---------|-----------------|
| Daily rest | **11 hours** | Article L3131-1 |
| Weekly rest | **35 hours** | Article L3132-2 |
| Weekly rest (reduced) | 24 hours (with compensation) | Article L3132-2 |
| Rest between shifts | Minimum 11h (can be reduced to 9h with agreement) | Article L3131-1 |

### Night Work Rules

| Rule | Details |
|------|---------|
| Night hours | 21h00 - 6h00 (default) |
| Maximum night hours | 8h per night shift |
| Maximum night hours/week | 40h (or 44h with agreement) |
| Medical visits | Night workers require **SIR** visits (not VIP) |
| Pénibilité | Night work triggers C2P pénibilité factor |

## Shift Types

### Standard Shifts

| Shift | French | Hours |
|-------|--------|-------|
| Standard | Horaire standard | 35h/week |
| Early | Matin | 6h00 - 14h00 |
| Day | Jour | 8h00 - 16h00 |
| Late | Après-midi | 14h00 - 22h00 |
| Night | Nuit | 22h00 - 6h00 |

### Shift Patterns

| Pattern | French | Description |
|---------|--------|-------------|
| Standard | Horaire fixe | Same hours every day |
| 2x8 | Équipe 2x8 | Two rotating shifts |
| 3x8 | Équipe 3x8 | Three rotating shifts |
| Weekend | Week-end | Saturday-Sunday only |
| Partial | Partiel | Reduced hours |

## Schedule Management

### Weekly Schedule

- Define working days
- Define start/end times
- Break times
- Total hours

### Shift Planning

- Create shifts per day
- Assign employees to shifts
- Cover requirements

## Features

### 1. Schedule Templates

- [ ] Create recurring schedules
- [ ] Weekly patterns
- [ ] Shift rotations

### 2. Shift Calendar

- [ ] View by day/week/month
- [ ] Filter by location
- [ ] Filter by department
- [ ] Filter by employee
- [ ] **Filter by client (3PL)**

### 3. Employee Assignment

- [ ] Assign employees to shifts
- [ ] Check availability
- [ ] Check qualifications
- [ ] Check permissions

### 4. Coverage View

- [ ] Show required vs assigned
- [ ] Highlight gaps
- [ ] Coverage alerts

### 5. Permission Checking

> Before assigning employee to shift, check permissions

- [ ] Check canOperateEquipment
- [ ] Check canWorkNightShift
- [ ] Check canWork
- [ ] Block if permissions revoked

### 6. Leave Integration

- [ ] Show unavailable employees
- [ ] Block during leave
- [ ] Update on leave status change

### 7. Qualification Matching

- [ ] Match required CACES to employee certifications
- [ ] Match required training
- [ ] Alert if unqualified

### 8. Overtime Tracking

- [ ] Track hours worked
- [ ] Flag overtime
- [ ] Link to RTT

### 9. Rest Period Validation

> **Critical Feature:** Validate rest periods before confirming shift assignment

- [ ] **Daily rest validation** - Minimum 11h between shift end and next shift start
- [ ] **Weekly rest validation** - Minimum 35h per week
- [ ] **Weekly maximum** - Maximum 48h/week
- [ ] **Daily maximum** - Maximum 10h/day (12h with agreement)
- [ ] **Overtime tracking** - Track toward 220h annual limit
- [ ] **Alert on violation** - Warn before saving illegal schedule

### 10. CACES/Qualification Requirements

> Each shift can require specific CACES categories or certifications

- [ ] Define required CACES categories per shift (e.g., R489 Cat 3 for cariste)
- [ ] Match employee certifications against requirements
- [ ] **Block assignment** if qualification missing
- [ ] Show qualification gap warning
- [ ] Support multiple CACES requirements per shift

### 11. 3PL Client Allocation

> For logistics companies serving multiple clients

- [ ] Assign shift to specific client/business unit
- [ ] Track employee hours per client
- [ ] Show client allocation on schedule
- [ ] Filter schedule by client
- [ ] Coverage tracking per client

### 12. Time Tracking (Pointage)

- [ ] Record planned vs actual start/end times
- [ ] Track breaks taken vs scheduled
- [ ] Calculate actual worked hours
- [ ] Flag overtime worked
- [ ] Link to payroll

### 13. Night Work Management

- [ ] Mark shifts as night shift (21h00 - 6h00)
- [ ] Validate SIR medical visit status
- [ ] Track cumulative night hours
- [ ] Trigger pénibilité factor
- [ ] Warn if night worker exceeds limits

### 14. Working Time Violations

> Track and report legal violations

- [ ] Log each rest period violation
- [ ] Generate violation report
- [ ] Track corrective actions
- [ ] Export for labor inspection

### 15. Safety Sidebar

> Real-time compliance indicators

- [ ] Show active warnings on schedule view
- [ ] Conflict detection (double booking, rest violations)
- [ ] Quick access to violation details
- [ ] Highlight problem shifts in red

## Data Model

```typescript
interface Schedule {
  id: string;
  name: string;
  locationId: string;
  departmentId?: string;
  clientId?: string;           // 3PL: Associated client
  startDate: Date;
  endDate?: Date;
  shiftPatternId: string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Shift {
  id: string;
  scheduleId: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  requiredEmployees: number;

  // Qualifications
  requiredCaces?: string[];   // R489 categories required
  requiredTraining?: string[];
  requiredCertifications?: string[];

  // Night work
  isNightShift: boolean;      // Contains hours between 21h00-6h00
  nightHoursStart?: string;   // Custom night start
  nightHoursEnd?: string;     // Custom night end

  // 3PL
  clientId?: string;         // Which client this shift is for

  createdAt: Date;
}

interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
  assignedAt: Date;
  assignedBy: string;
  status: AssignmentStatus;

  // Time tracking
  plannedStartTime?: string;
  plannedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  actualBreakMinutes?: number;

  // 3PL
  clientId?: string;         // Employee's allocation for this shift

  // Validation
  isValid: boolean;
  validationWarnings?: string[];
}

enum AssignmentStatus {
  ASSIGNED = "assigned",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

interface Coverage {
  shiftId: string;
  required: number;
  assigned: number;
  gap: number;
  clientId?: string;
}

interface WorkingTimeViolation {
  id: string;
  employeeId: string;
  shiftId: string;
  violationType: WorkingTimeViolationType;
  severity: 'warning' | 'critical';

  // Details
  date: Date;
  expectedValue: string;     // e.g., "11 hours"
  actualValue: string;       // e.g., "9 hours"

  // Resolution
  isResolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
  resolvedBy?: string;

  createdAt: Date;
}

enum WorkingTimeViolationType {
  DAILY_REST = "daily_rest",           // < 11h between shifts
  WEEKLY_REST = "weekly_rest",         // < 35h weekly rest
  DAILY_MAX = "daily_max",             // > 10h per day
  WEEKLY_MAX = "weekly_max",           // > 48h per week
  NIGHT_HOURS_MAX = "night_hours_max", // > 8h night shift
  OVERTIME_LIMIT = "overtime_limit",  // > 220h/year
}
```

## Validation Logic

### Rest Period Validation

```typescript
function validateRestPeriods(
  employeeId: string,
  proposedShift: Shift,
  existingAssignments: ShiftAssignment[]
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Get last shift end time
  const lastShift = getLastShift(employeeId, existingAssignments);
  if (lastShift) {
    const hoursSinceLastShift = getHoursBetween(
      lastShift.actualEndTime || lastShift.plannedEndTime,
      proposedShift.startTime
    );

    if (hoursSinceLastShift < 11) {
      errors.push(
        `Daily rest violation: Only ${hoursSinceLastShift}h between shifts. Minimum required: 11h.`
      );
    }
  }

  // Check weekly total
  const weeklyHours = calculateWeeklyHours(employeeId, proposedShift.date);
  if (weeklyHours > 48) {
    errors.push(`Weekly maximum exceeded: ${weeklyHours}h. Maximum allowed: 48h.`);
  }

  // Check daily total
  const dailyHours = proposedShift.endTime - proposedShift.startTime;
  if (dailyHours > 10) {
    warnings.push(`Daily hours exceed 10h (${dailyHours}h). Maximum is 10h normally.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

### CACES Qualification Matching

```typescript
function validateQualifications(
  employeeId: string,
  shift: Shift
): ValidationResult {
  if (!shift.requiredCaces || shift.requiredCaces.length === 0) {
    return { valid: true, errors: [], warnings: [] };
  }

  const employeeCaces = getEmployeeCaces(employeeId);
  const missing: string[] = [];

  for (const required of shift.requiredCaces) {
    const hasValid = employeeCaces.some(
      (c) => c.category === required && c.isValid
    );
    if (!hasValid) {
      missing.push(required);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [
        `Missing required CACES: ${missing.join(', ')}. Employee cannot be assigned.`
      ],
      warnings: []
    };
  }

  return { valid: true, errors: [], warnings: [] };
}
```

## Permission Checking

### Before Assignment

```typescript
function canAssign(employeeId: string, shift: Shift): boolean {
  const permissions = getEmployeePermissions(employeeId);

  // Check global work permission
  if (!permissions.canWork) {
    return false; // Blocked by alert
  }

  // Check night shift
  if (shift.isNightShift && !permissions.canWorkNightShift) {
    return false; // Blocked by medical alert
  }

  // Check equipment operation
  if (shift.requiresEquipment && !permissions.canOperateEquipment) {
    return false; // Blocked by CACES/medical alert
  }

  return true;
}
```

## UI Components

### Schedule Calendar
- Month/Week/Day views
- Color-coded shifts
- Drag-and-drop assignment

### Coverage Dashboard
- Required vs assigned
- Gap highlighting
- Alerts for understaffing

### Employee Availability
- Show on leave
- Show blocked
- Show available

### Assignment Modal
- Employee search
- Qualification check
- Permission warning

### Safety Sidebar

> Real-time compliance indicators

- [ ] **Daily rest indicator** - Green/Red per employee
- [ ] **Weekly hours bar** - Visual progress to 48h max
- [ ] **Overtime counter** - Progress to 220h annual
- [ ] **Conflict alerts** - Double booking, rest violations
- [ ] **Quick resolution** - Click to fix issues

### Rest Violation Warning

When scheduling would cause a violation:

- [ ] Show modal with warning
- [ ] Explain the violation
- [ ] Offer alternatives
- [ ] Require acknowledgment to override
- [ ] Log override for audit

## Integration Points

### Alerts System
- Check EmployeePermissions before assignment
- Show warning if blocked
- Explain why blocked

### Leave Management
- Mark unavailable during leave
- Update on leave status change

### Employee Profile
- Get qualifications
- Get certifications
- Get permissions

### Medical Module
- Get SIR status for night workers
- Check medical visit validity

### 3PL/Client Allocation
- Get client assignments
- Track hours per client

## Workflows

### Create Schedule

1. Select location/department
2. Define shift pattern
3. Set date range
4. Add shifts
5. Assign employees

### Assign Employee

1. Select shift
2. Search available employees
3. Check qualifications (CACES)
4. Check permissions (Alerts)
5. **Validate rest periods**
6. Check 3PL allocation
7. Confirm assignment
8. Notify employee

### Handle Leave

1. Employee goes on leave
2. System marks unavailable
3. Remove from future shifts
4. Flag coverage needed

### Rest Violation Detected

1. System calculates rest periods
2. **Show warning before save**
3. User can:
   - Cancel assignment
   - Modify shift times
   - Acknowledge and override (logged)
4. If overridden: Create WorkingTimeViolation record

## Blocking Integration

### When Alert Blocks Employee

1. AUTH_CACES_EXPIRED triggers
2. EmployeePermissions.canOperateEquipment = false
3. Scheduling checks permission
4. Shows warning: "Cannot assign - CACES expired"
5. Manager cannot override without acknowledgment

### When Employee Returns

1. Alert resolved
2. Permission restored
3. Scheduling allows assignment
4. Notification sent

## Reports

- Hours worked per employee
- Overtime tracking
- Coverage rates
- Shift distribution
- **Working Time Violations Report**
- **Rest Period Compliance Report**
- **Client Allocation Hours Report**
- **Night Hours Summary**

## Future Considerations

- Time tracking integration
- Clock-in/Clock-out
- Mobile scheduling
- Swap shifts feature
- Shift bidding
- Labor law compliance checks
- Cost estimation per shift
