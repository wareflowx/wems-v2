# Scheduling & Shifts Management

## Overview

The Scheduling module manages employee work schedules, shifts, and assignments. It integrates with the Alerts system to respect employee permissions (blocking) and with Leave Management to handle unavailability.

## Current State

- Basic scheduling concepts exist in reference data
- Shift patterns defined

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

## Data Model

```typescript
interface Schedule {
  id: string;
  name: string;
  locationId: string;
  departmentId?: string;
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
  createdAt: Date;
}

interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
  assignedAt: Date;
  assignedBy: string;
  status: AssignmentStatus;
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

## Integration Points

### Alerts System
- Check EmployeePermissions before assignment
- Show warning if blocked
- Explain why blocked

### Leave Management
- Mark unavailable during leave
- Update on leave changes

### Employee Profile
- Get qualifications
- Get certifications
- Get permissions

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
3. Check qualifications
4. Check permissions
5. Confirm assignment
6. Notify employee

### Handle Leave

1. Employee goes on leave
2. System marks unavailable
3. Remove from future shifts
4. Flag coverage needed

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

## Future Considerations

- Time tracking integration
- Clock-in/Clock-out
- Mobile scheduling
- Swap shifts feature
- Shift bidding
- Labor law compliance checks
- Cost estimation per shift
