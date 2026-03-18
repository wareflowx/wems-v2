# Alerts Management

## Overview

The Alerts system is a critical component of WEMS that proactively notifies administrators, managers, and HR personnel about upcoming expirations, compliance requirements, and action items. The system helps ensure that employees maintain valid certifications, medical visits, contracts, and documents in accordance with French labor law.

## Current State

- Alerts are generated for expiring items
- Categories for different alert types
- Days left indicator for upcoming expirations
- Basic alert table with category and severity

## Alert Architecture

### Alert Flow

```
[Trigger Event] → [Alert Generation] → [Notification] → [Resolution] → [Archive]
```

1. **Trigger Event**: System checks for expiring items on scheduled basis
2. **Alert Generation**: Alert created with appropriate severity and category
3. **Notification**: Users receive alerts based on configuration
4. **Resolution**: User takes action to resolve the alert
5. **Archive**: Resolved alerts are archived for audit purposes

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

| Alert Code | Description | Default Trigger |
|------------|-------------|-----------------|
| CACES_EXPIRED | CACES has expired | Day 0 |
| CACES_CRITICAL | CACES expires in 30 days | Day -30 |
| CACES_WARNING | CACES expires in 60 days | Day -60 |
| CACES_INFO | CACES expires in 90 days | Day -90 |
| CACES_PLANNING | CACES renewal needed | Day -180 |

### Medical Alerts

| Alert Code | Description | Default Trigger |
|------------|-------------|-----------------|
| MEDICAL_EXPIRED | Medical visit expired | Day 0 |
| MEDICAL_CRITICAL | Medical expires in 30 days | Day -30 |
| MEDICAL_WARNING | Medical expires in 60 days | Day -60 |
| MEDICAL_SIR_INTERMEDIATE | SIR intermediate visit due | 2 years after last |
| MEDICAL_MI_CARRIERE | Mid-career visit (age 45) | During 45th birthday year |
| MEDICAL_REPRISE | Reprise visit required | After long absence |
| MEDICAL_CONVOCATION | Convocation not sent | Before scheduled visit |

### Training Alerts

| Alert Code | Description | Default Trigger |
|------------|-------------|-----------------|
| TRAINING_EXPIRED | Training certification expired | Day 0 |
| TRAINING_CRITICAL | Training expires in 30 days | Day -30 |
| TRAINING_WARNING | Training expires in 60 days | Day -60 |
| TRAINING_SST_MAC | SST MAC renewal (2 years) | Day -120 to -180 |
| TRAINING_MANDATORY_OVERDUE | Mandatory training not completed | Past due date |

### Contract Alerts

| Alert Code | Description | Default Trigger |
|------------|-------------|-----------------|
| CONTRACT_EXPIRED | Contract has ended | Day 0 |
| CONTRACT_CRITICAL | Contract expires in 30 days | Day -30 |
| CONTRACT_WARNING | Contract expires in 60 days | Day -60 |
| CONTRACT_DPAE_MISSING | DPAE not confirmed before start | Day 0 if start date reached |
| CONTRACT_PROBATION | Probation evaluation due | Based on seniority notice |
| CONTRACT_CARENCE | Délai de carence violation risk | When creating successive contract |

### Document Alerts

| Alert Code | Description | Default Trigger |
|------------|-------------|-----------------|
| DOCUMENT_EXPIRED | Document has expired | Day 0 |
| DOCUMENT_CRITICAL | Document expires in 7 days | Day -7 |
| DOCUMENT_WARNING | Document expires in 30 days | Day -30 |
| DOCUMENT_MANDATORY_MISSING | Required document missing | Immediate |
| DOCUMENT_WORK_PERMIT | Work permit verification pending | 2 days before start |

### Authorization Alerts

| Alert Code | Description | Default Trigger |
|------------|-------------|-----------------|
| AUTH_MEDICAL_EXPIRED | Medical expired - authorization invalid | Day 0 |
| AUTH_CACES_EXPIRED | CACES expired - authorization invalid | Day 0 |

## Severity Levels

| Severity | Color | Icon | Description |
|----------|-------|------|-------------|
| CRITICAL | Red | 🚨 | Immediate action required - compliance risk |
| WARNING | Orange | ⚠️ | Action needed soon - deadline approaching |
| INFO | Blue | ℹ️ | Informational - for planning purposes |

## Alert Status

| Status | Description |
|--------|-------------|
| NEW | Alert newly generated, not yet viewed |
| VIEWED | Alert has been viewed by user |
| IN_PROGRESS | User is working on resolving |
| RESOLVED | Alert has been resolved |
| DISMISSED | Alert dismissed by user (with reason) |
| ARCHIVED | Resolved alerts moved to archive |

## Alert Configuration

### Global Settings

| Setting | Description | Default |
|---------|-------------|---------|
| enableAlerts | Enable/disable alert system | true |
| checkFrequency | How often to check for expiring items | Daily (at midnight) |
| defaultWarningDays | Default warning threshold | 60 |
| defaultCriticalDays | Default critical threshold | 30 |
| maxAlertsPerUser | Maximum active alerts per user | 100 |

### Category Settings

Each alert category can have custom thresholds:

```typescript
interface AlertCategoryConfig {
  category: AlertCategory;
  enabled: boolean;
  warningDays: number;
  criticalDays: number;
  planningDays?: number;  // For CACES renewals
  sendEmail: boolean;
  assignTo?: string;      // Default assignee
}
```

### Default Configuration

| Category | Warning | Critical | Email |
|---------|---------|----------|-------|
| CACES | 60 | 30 | Yes |
| Medical | 60 | 30 | Yes |
| Training | 60 | 30 | Yes |
| Contract | 60 | 30 | Yes |
| Document | 30 | 7 | Yes |

## User Notifications

### Notification Channels

| Channel | Description | Priority |
|--------|-------------|----------|
| In-App | Alert appears in dashboard/notification center | High |
| Email | Email sent to assigned user | Medium |
| Badge | Count badge on navigation | High |

### Notification Rules

- Users receive alerts based on their role and permissions
- Managers receive alerts for their team members
- HR receives all compliance-related alerts
- Admins receive system alerts

### Notification Preferences

Users can configure:
- [ ] Enable/disable email notifications
- [ ] Select which categories to receive
- [ ] Set quiet hours
- [ ] Configure escalation rules

## Data Model

```typescript
interface Alert {
  id: string;
  code: string;                    // Alert type code
  category: AlertCategory;
  severity: Severity;
  status: AlertStatus;

  // Alert Details
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;

  // Related Entity
  entityType: string;              // 'caces', 'medical', 'training', etc.
  entityId: string;

  // Dates
  triggerDate: Date;               // When alert was triggered
  dueDate?: Date;                 // When action is required
  resolvedAt?: Date;

  // Assignment
  assignedTo?: string;
  assignedAt?: Date;

  // Resolution
  resolution?: string;
  resolvedBy?: string;

  // Metadata
  isRecurring: boolean;
  previousAlertId?: string;
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
  sendEmail: boolean;
  emailTemplate?: string;
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
}

interface AlertDismissal {
  id: string;
  alertId: string;
  userId: string;
  reason: string;
  dismissedAt: Date;
}
```

## Features

### 1. Alert Dashboard

- [ ] Summary widgets showing alert counts by severity
- [ ] Category breakdown
- [ ] My Alerts (assigned to current user)
- [ ] Team Alerts (for managers)
- [ ] Recent activity
- [ ] Quick filters

### 2. Alert List View

- [ ] Table with columns: Severity, Category, Title, Employee, Due Date, Status
- [ ] Sorting by any column
- [ ] Filtering by category, severity, status, employee
- [ ] Search by employee name
- [ ] Bulk actions (assign, resolve, dismiss)
- [ ] Export to CSV

### 3. Alert Detail View

- [ ] Full alert information
- [ ] Related entity link (view details)
- [ ] Resolution form
- [ ] Assignment controls
- [ ] Comment thread
- [ ] History/audit trail

### 4. Alert Configuration

- [ ] Global settings
- [ ] Per-category configuration
- [ ] Custom thresholds
- [ ] Notification preferences
- [ ] Working days vs calendar days option

### 5. Escalation Rules

- [ ] Auto-assign based on rules
- [ ] Escalation after X days unresolved
- [ ] Manager notification
- [ ] Email to multiple recipients

### 6. Recurring Alerts

- [ ] Auto-renewal for periodic items
- [ ] Prevent duplicate alerts
- [ ] Link to previous alert

### 7. Reporting & Analytics

- [ ] Alert trends over time
- [ ] Resolution time metrics
- [ ] Category breakdown
- [ ] User workload
- [ ] Export reports

## UI Components

### Dashboard Widget
- Alert summary counts
- Critical alerts highlight
- Quick access to urgent items
- Mini chart of alert trends

### Alert List Page
- Filterable table
- Severity badges
- Category icons
- Status indicators
- Pagination
- Bulk actions toolbar

### Alert Detail Modal/Page
- Alert header with severity
- Related entity preview
- Resolution form
- History timeline

### Alert Settings Page
- Category cards with settings
- Toggle switches
- Number inputs for thresholds
- Preview of configured alerts

## Integration Points

### Alert Generation Sources

#### CACES Module
- Generate alert when CACES expires
- Generate alert forAutorisation de Conduite if medical expires
- Link to CACES renewal workflow

#### Medical Module
- Generate alert for medical expiration
- Generate alert for SIR intermediate visit
- Generate alert for mid-career visit
- Generate alert for reprise visit

#### Training Module
- Generate alert for training expiration
- Generate alert for SST MAC (2 years)
- Link to renewal training

#### Contracts Module
- Generate alert for contract expiration
- Generate alert for DPAE pending
- Generate alert for probation evaluation

#### Documents Module
- Generate alert for document expiration
- Generate alert for missing required documents

### External Notifications

- [ ] Email integration
- [ ] Webhook for external systems
- [ ] Calendar sync (optional)

## Workflows

### Alert Resolution Flow

1. User views alert
2. User clicks to investigate
3. System shows related entity details
4. User takes action in relevant module
5. User returns to alert and marks resolved
6. Alert archived with resolution details

### Escalation Flow

1. Alert created and assigned
2. X days pass without resolution
3. Alert escalated to manager
4. Manager notified
5. Resolution or further escalation

### Bulk Resolution

1. User selects multiple alerts
2. User chooses action (resolve/dismiss)
3. User provides reason (optional)
4. System processes in bulk
5. Confirmation shown

## Future Considerations

- Mobile push notifications
- Slack/Teams integration
- SMS for critical alerts
- Custom alert rules
- AI-powered recommendations
- Integration with external compliance systems
- Audit reports for labor inspection
