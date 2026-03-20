# Alerts Management

## Overview

The Alerts system is a critical component of WEMS that proactively notifies administrators, managers, and HR personnel about upcoming expirations, compliance requirements, and action items. The system helps ensure that employees maintain valid certifications, medical visits, contracts, and documents in accordance with French labor law.

> **Important:** This system acts as a **Compliance Guardrail** - not just notifications, but enforceable safety stops that prevent illegal work assignments and protect against "Fautes Inexcusables" (inexcusable negligence).

## Current State

- Alerts are generated for expiring items
- Categories for different alert types
- Days left indicator for upcoming expirations
- Basic alert table with category and severity

## Alert Architecture

### Alert Flow

```
[Trigger Event] → [Alert Generation] → [Blocking Check] → [Notification] → [Resolution] → [Archive]
```

1. **Trigger Event**: System checks for expiring items on scheduled basis
2. **Alert Generation**: Alert created with appropriate severity and category
3. **Blocking Check**: If blocking alert, immediately restrict employee permissions
4. **Notification**: Users receive alerts based on configuration
5. **Resolution**: User takes action to resolve (or system auto-resolves)
6. **Archive**: Resolved alerts are archived for audit purposes

### Alert Sources

| Source | Entity | Trigger |
|--------|--------|---------|
| CACES | EmployeeCACES | Expiration date approaching |
| Medical | MedicalVisit | Expiration date approaching |
| Training | EmployeeTraining | Expiration date approaching |
| Contract | EmploymentContract | End date approaching |
| Document | EmployeeDocument | Expiration date approaching |
| Probation | EmploymentContract | Probation end date approaching |
| DPAE | EmploymentContract | Start date without DPAE confirmation |

## Alert Types

### CACES Alerts

| Alert Code | Description | Default Trigger | Blocking |
|------------|-------------|-----------------|---------|
| CACES_EXPIRED | CACES has expired | Day 0 | **BLOCK** |
| CACES_CRITICAL | CACES expires in 30 days | Day -30 | - |
| CACES_WARNING | CACES expires in 60 days | Day -60 | - |
| CACES_INFO | CACES expires in 90 days | Day -90 | - |
| CACES_PLANNING | CACES renewal needed | Day -180 | - |

### Medical Alerts

| Alert Code | Description | Default Trigger | Blocking |
|------------|-------------|-----------------|---------|
| MEDICAL_EXPIRED | Medical visit expired | Day 0 | **BLOCK** |
| MEDICAL_CRITICAL | Medical expires in 30 days | Day -30 | - |
| MEDICAL_WARNING | Medical expires in 60 days | Day -60 | - |
| MEDICAL_SIR_INTERMEDIATE | SIR intermediate visit due | 2 years after last | - |
| MEDICAL_MI_CARRIERE | Mid-career visit (age 45) | During 45th birthday year | - |
| MEDICAL_REPRISE | Reprise visit required | After long absence | - |
| MEDICAL_CONVOCATION | Convocation not sent | 7 days before scheduled | - |

### Training Alerts

| Alert Code | Description | Default Trigger | Blocking |
|------------|-------------|-----------------|---------|
| TRAINING_EXPIRED | Training certification expired | Day 0 | Depends on training |
| TRAINING_CRITICAL | Training expires in 30 days | Day -30 | - |
| TRAINING_WARNING | Training expires in 60 days | Day -60 | - |
| TRAINING_SST_MAC | SST MAC renewal (2 years) | Day -120 to -180 | - |
| TRAINING_MANDATORY_OVERDUE | Mandatory training not completed | Past due date | **BLOCK** |

### Contract Alerts

| Alert Code | Description | Default Trigger | Blocking |
|------------|-------------|-----------------|---------|
| CONTRACT_EXPIRED | Contract has ended | Day 0 | **BLOCK** |
| CONTRACT_CRITICAL | Contract expires in 30 days | Day -30 | - |
| CONTRACT_WARNING | Contract expires in 60 days | Day -60 | - |
| CONTRACT_DPAE_MISSING | DPAE not confirmed | **48h BEFORE start** | **BLOCK** |
| CONTRACT_PROBATION | Probation evaluation due | Based on seniority notice | - |
| CONTRACT_CARENCE | Délai de carence violation risk | When creating contract | Warning only |

### Document Alerts

| Alert Code | Description | Default Trigger | Blocking |
|------------|-------------|-----------------|---------|
| DOCUMENT_EXPIRED | Document has expired | Day 0 | - |
| DOCUMENT_CRITICAL | Document expires in 7 days | Day -7 | - |
| DOCUMENT_WARNING | Document expires in 30 days | Day -30 | - |
| DOCUMENT_MANDATORY_MISSING | Required document missing | Immediate | - |
| DOCUMENT_WORK_PERMIT | Work permit verification pending | 2 days before start | **BLOCK** |

### Authorization Alerts (Safety Critical)

> **Critical:** These alerts directly impact the employee's ability to work.

| Alert Code | Description | Trigger | Blocking |
|------------|-------------|---------|----------|
| AUTH_MEDICAL_EXPIRED | Medical expired - authorization invalid | Day 0 | **BLOCK** |
| AUTH_CACES_EXPIRED | CACES expired - authorization invalid | Day 0 | **BLOCK** |

## Resolution Types

### Auto-Resolution vs Manual Resolution

| Type | Description | Examples |
|------|-------------|----------|
| **Auto-Resolution** | System closes alert when data is fixed | CACES expiry, Document expiry, Contract end |
| **Manual Resolution** | User must confirm completion | Probation evaluation, Training completion |

- [ ] System auto-closes alert when underlying entity is updated
- [ ] Manual resolution requires user confirmation
- [ ] Resolution method tracked in audit log

## Blocking Logic (Safety Lock)

### Employee Permission Flags

The system maintains permission flags on each employee:

```typescript
interface EmployeePermissions {
  employeeId: string;
  canOperateEquipment: boolean;    // Blocked if AUTH_CACES_EXPIRED
  canDriveCompanyVehicle: boolean; // Blocked if AUTH_DRIVING_EXPIRED
  canWorkNightShift: boolean;      // Blocked if MEDICAL_EXPIRED
  canWork: boolean;               // Global work flag
  blockedBy: string[];            // Array of alert IDs blocking work
  blockedAt?: Date;
  blockedReason?: string;
}
```

### Blocking Alerts Workflow

1. **Authorization Alert Triggered**: AUTH_CACES_EXPIRED or AUTH_MEDICAL_EXPIRED
2. **Immediate Action**: System sets `canOperateEquipment = false`
3. **UI Indicator**: Red warning on employee profile
4. **Scheduling Block**: Employee cannot be assigned to equipment shifts
5. **Resolution**: When alert is resolved, permission is restored

### Impacted Permissions Mapping

| Alert Type | Impacted Permission |
|------------|-------------------|
| AUTH_CACES_EXPIRED | canOperateEquipment |
| AUTH_MEDICAL_EXPIRED | canWorkNightShift, canWork |
| Training (mandatory) | canWork |
| CONTRACT_EXPIRED | canWork |
| CONTRACT_DPAE_MISSING | canWork |

## Severity Levels

| Severity | Color | Icon | Description | Escalation Time |
|----------|-------|------|-------------|-----------------|
| CRITICAL | Red | 🚨 | Immediate action required - compliance risk | 24h |
| WARNING | Orange | ⚠️ | Action needed soon - deadline approaching | 72h |
| INFO | Blue | ℹ️ | Informational - for planning purposes | None |

## Alert Status

| Status | Description |
|--------|-------------|
| NEW | Alert newly generated, not yet viewed |
| VIEWED | Alert has been viewed by user |
| IN_PROGRESS | User is working on resolving |
| RESOLVED | Alert has been resolved (system or manual) |
| DISMISSED | Alert dismissed by user (with mandatory reason) |
| ARCHIVED | Resolved alerts moved to archive |

## Escalation Rules (N+2 Logic)

### Escalation Levels

| Level | Description | Who Receives |
|-------|-------------|--------------|
| 0 | Initial Assignee | Assigned user |
| 1 | Direct Manager (N+1) | Department manager |
| 2 | Site Director / Safety Officer (N+2) | HSCT/CSE |

### Escalation Triggers

- **CRITICAL alerts**: Escalate after 24h unresolved
- **WARNING alerts**: Escalate after 72h unresolved
- **Authorization blocked**: Immediate escalation to Safety Officer

### Escalation Reasons

The system tracks escalation for legal protection:
- Shows that risk was reported upward
- Protects supervisor from "Fautes Inexcusables"
- Creates audit trail for labor inspection

## Notification Strategy

### Instant vs Digest

| Type | Alerts | Frequency |
|------|--------|-----------|
| **Instant** | CRITICAL, Authorization blocked, DPAE missing | Immediate |
| **Daily Digest** | WARNING | Once per day |
| **Weekly Digest** | INFO, Planning | Once per week |

### Notification Channels

| Channel | Priority | Use Case |
|---------|----------|----------|
| In-App | High | All alerts |
| Badge | High | Unread count |
| Email | Medium | CRITICAL, Daily digest |
| SMS | Critical | Authorization blocked |

## Alert Configuration

### Global Settings

| Setting | Description | Default |
|---------|-------------|---------|
| enableAlerts | Enable/disable alert system | true |
| checkFrequency | How often to check | Daily (at midnight) |
| defaultWarningDays | Default warning threshold | 60 |
| defaultCriticalDays | Default critical threshold | 30 |
| escalationCriticalHours | Hours before CRITICAL escalation | 24 |
| escalationWarningHours | Hours before WARNING escalation | 72 |
| digestFrequency | Daily or Weekly | Daily |

### Category Settings

```typescript
interface AlertCategoryConfig {
  category: AlertCategory;
  enabled: boolean;
  warningDays: number;
  criticalDays: number;
  planningDays?: number;
  isBlocking: boolean;           // Does this alert block work?
  impactedPermissions: string[]; // What permissions are affected
  sendEmail: boolean;
  instantNotification: boolean;
  assignToRole?: string;
}
```

### Default Configuration

| Category | Warning | Critical | Blocking | Instant |
|---------|---------|----------|----------|---------|
| CACES | 60 | 30 | AUTH alerts | Yes |
| Medical | 60 | 30 | AUTH alerts | Yes |
| Training | 60 | 30 | Depends | Yes |
| Contract | 60 | 30 | DPAE | Yes |
| Document | 30 | 7 | Work permit | Yes |

## Data Model

```typescript
interface Alert {
  id: string;
  code: string;
  category: AlertCategory;
  severity: Severity;
  status: AlertStatus;

  // Resolution Type
  isAutoResolvable: boolean;    // Can system close this automatically?
  resolutionType: 'auto' | 'manual';

  // Blocking
  blockingLevel: BlockingLevel; // Does this stop work?
  impactedPermissions: string[]; // What permissions are affected

  // Alert Details
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;

  // Related Entity
  entityType: string;
  entityId: string;

  // Dates
  triggerDate: Date;
  dueDate?: Date;
  resolvedAt?: Date;

  // Escalation
  escalationLevel: number;       // 0 = Assignee, 1 = Manager, 2 = Director
  lastEscalationAt?: Date;

  // Assignment
  assignedTo?: string;
  assignedAt?: Date;

  // Resolution
  resolution?: string;
  resolvedBy?: string;
  resolutionMethod?: 'auto' | 'manual';

  // Dismissal (requires reason)
  dismissalReason?: string;
  dismissedBy?: string;
  dismissedAt?: Date;

  // Notifications
  lastNotificationSentAt?: Date;
  notificationCount: number;

  // Metadata
  isRecurring: boolean;
  previousAlertId?: string;
  snoozeCount: number;
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
  AUTHORIZATION = "authorization",
}

enum BlockingLevel {
  NONE = "none",          // No work impact
  PARTIAL = "partial",    // Some permissions blocked
  FULL = "full",          // Cannot work at all
}

enum Severity {
  CRITICAL = "critical",
  WARNING = "warning",
  INFO = "info",
}

enum AlertStatus {
  NEW = "new",
  VIEWED = "viewed",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
  ARCHIVED = "archived",
}

interface AlertConfig {
  id: string;
  category: AlertCategory;
  enabled: boolean;
  warningDays: number;
  criticalDays: number;
  planningDays?: number;
  isBlocking: boolean;
  impactedPermissions: string[];
  sendEmail: boolean;
  instantNotification: boolean;
  escalationHours: number;
  assignToRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AlertNotification {
  id: string;
  alertId: string;
  userId: string;
  channel: NotificationChannel;
  sentAt: Date;
  readAt?: Date;
}

enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  SMS = "sms",
}

interface AlertDismissal {
  id: string;
  alertId: string;
  userId: string;
  reason: string;
  justificationDocument?: string;  // Upload if required
  dismissedAt: Date;
}

interface EmployeePermissions {
  employeeId: string;
  canOperateEquipment: boolean;
  canDriveCompanyVehicle: boolean;
  canWorkNightShift: boolean;
  canWork: boolean;
  blockedBy: string[];
  blockedAt?: Date;
  blockedReason?: string;
}
```

## Features

### 1. Alert Dashboard

- [ ] Summary widgets showing alert counts by severity
- [ ] **Compliance Health Score** per department
- [ ] Category breakdown
- [ ] My Alerts (assigned to current user)
- [ ] Team Alerts (for managers)
- [ ] Recent activity
- [ ] Quick filters

### 2. Compliance Health Score

> Visual indicator of department compliance status

| Score | Color | Description |
|-------|-------|-------------|
| 95-100% | 🟢 Green | Fully compliant |
| 80-94% | 🟡 Yellow | Minor issues |
| 60-79% | 🟠 Orange | Action needed |
| <60% | 🔴 Red | Critical - immediate action |

### 3. Alert List View

- [ ] Table with columns: Severity, Category, Title, Employee, Due Date, Status, Blocking
- [ ] Sorting by any column
- [ ] Filtering by category, severity, status, employee, blocking
- [ ] Search by employee name
- [ ] Bulk actions (assign, resolve, dismiss)
- [ ] Export to CSV

### 4. Alert Detail View

- [ ] Full alert information
- [ ] **"Take Action" button** - deep link to entity edit screen
- [ ] Related entity link (view details)
- [ ] Resolution form
- [ ] Assignment controls
- [ ] Comment thread
- [ ] History/audit trail

### 5. Blocking Alert Indicators

- [ ] Red banner on employee profile when blocked
- [ ] Blocked permissions list
- [ ] "Cannot work" indicator
- [ ] Resolution required to restore permissions

### 6. Escalation Management

- [ ] View escalation status
- [ ] Manual escalation trigger
- [ ] Escalation history
- [ ] N+2 notification settings

### 7. Alert Configuration

- [ ] Global settings
- [ ] Per-category configuration
- [ ] Custom thresholds
- [ ] Blocking level settings
- [ ] Notification preferences
- [ ] Working days vs calendar days option

### 8. Reporting & Analytics

- [ ] Alert trends over time
- [ ] Resolution time metrics
- [ ] Category breakdown
- [ ] User workload
- [ ] **Dismissed Alerts Report** - for safety audit
- [ ] Export reports

## UI Components

### Dashboard Widget
- Alert summary counts
- Critical alerts highlight
- **Compliance Health Score** per department
- Quick access to urgent items
- Mini chart of alert trends

### Alert List Page
- Filterable table
- Severity badges with blocking indicator
- Category icons
- Status indicators
- Pagination
- Bulk actions toolbar

### Alert Detail Modal/Page
- Alert header with severity
- Blocking status banner (if applicable)
- Related entity preview
- **"Take Action" button** - jumps to edit screen
- Resolution form
- History timeline

### Alert Settings Page
- Category cards with settings
- Toggle switches
- Number inputs for thresholds
- Blocking configuration
- Preview of configured alerts

## Integration Points

### Alert Generation Sources

#### CACES Module
- Generate alert when CACES expires
- **Generate AUTH alert** that blocks equipment operation
- Auto-resolve when new CACES uploaded

#### Medical Module
- Generate alert for medical expiration
- **Generate AUTH alert** that blocks work
- Auto-resolve when new medical uploaded

#### Training Module
- Generate alert for training expiration
- Generate alert for mandatory training overdue
- Auto-resolve when training completed

#### Contracts Module
- Generate alert for contract expiration
- **Generate DPAE alert 48h before start**
- Auto-resolve when DPAE confirmed

#### Documents Module
- Generate alert for document expiration
- Generate alert for work permit verification

### Permission System Integration
- Alerts modify EmployeePermissions
- Scheduling module checks permissions before assignment
- UI shows blocked status clearly

## Workflows

### Alert Resolution Flow

1. User views alert
2. User clicks **"Take Action"** → deep link to entity
3. User updates entity (upload new CACES, etc.)
4. **System detects change** → Auto-resolve alert
5. Alert archived automatically

### Manual Resolution Flow

1. User views alert
2. User takes action externally
3. User returns to alert, marks resolved
4. User provides resolution notes
5. Alert archived

### Blocking Alert Flow

1. AUTH alert triggered
2. System sets `canOperateEquipment = false`
3. Employee shows red "BLOCKED" status
4. Scheduling prevents assignment
5. User uploads new CACES/Medical
6. System detects update → Auto-resolve + Restore permissions

### Escalation Flow

1. Alert created at Level 0
2. 24h (CRITICAL) or 72h (WARNING) passes
3. System escalates to Level 1 (Manager)
4. Manager notified
5. Another period passes
6. System escalates to Level 2 (Director/Safety)
7. Full audit trail maintained

### Dismissal Flow (Critical Alerts Only)

> **Required:** Dismissing a CRITICAL alert requires justification

1. User attempts to dismiss CRITICAL alert
2. System shows mandatory reason dropdown:
   - "Employee on long-term leave"
   - "Training already scheduled - see notes"
   - "External exception approved"
   - "Other - requires justification"
3. User must select reason
4. Optional: Upload justification document
5. Alert marked DISMISSED
6. Alert visible in "Dismissed Alerts Report"

## Specific Alert Trigger Refinements

### DPAE Hard Stop
- **Trigger:** 48 hours BEFORE start date (not on day 0)
- **Severity:** CRITICAL
- **Blocking:** FULL - cannot start work

### Convocation Alert
- **Trigger:** If scheduledDate - convocationSentDate > 7 days
- **Severity:** WARNING
- **Blocking:** None

### Carence Warning
- **Trigger:** During contract creation if previous contract on same workstation
- **Severity:** WARNING
- **Blocking:** None - shows remaining carence days

### Reprise Alert
- **Trigger:** After absence return (maternity, AT, MP, >30 days)
- **Severity:** CRITICAL
- **Blocking:** FULL until visited

## Future Considerations

- Mobile push notifications
- Slack/Teams integration
- SMS for critical alerts
- Custom alert rules
- AI-powered recommendations
- Integration with external compliance systems
- Audit reports for labor inspection
- Integration with time management for automatic shift blocking
