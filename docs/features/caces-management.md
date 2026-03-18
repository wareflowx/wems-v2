# CACES Management

## Overview

CACES (Certificat d'Aptitude à la Conduite d'Engins) is the French certification system for operating warehouse equipment such as forklifts, pallet jacks, and other material handling vehicles. This feature enables tracking of employee certifications, expiration dates, and compliance status.

## Current State

### Existing Functionality

- Alerts system tracks expiring CACES certifications
- Category field added to alerts table
- Days left indicator for expiring certifications

### Categories (Règles CACES)

| Category | Description |
|----------|-------------|
| R389-1 | Powered pallet trucks |
| R389-2 | Counterbalance forklifts (≤6t) |
| R389-3 | Counterbalance forklifts (>6t) |
| R389-4 | Reach trucks |
| R389-5 | Order pickers |
| R389-6 | Lateral-stacking forklifts |
| R389-7 | Variable-reach forklifts |

## Desired Features

### 1. CACES Categories Management

- [ ] Predefined list of CACES categories (R389 1-7)
- [ ] Category descriptions in French and English
- [ ] Ability to add custom categories if needed

### 2. Employee CACES Assignment

- [ ] Assign multiple CACES categories per employee
- [ ] Store certification dates:
  - Issue date
  - Expiration date
- [ ] Document upload capability (PDF/images)
- [ ] Notes field for each certification

### 3. Expiration Tracking

- [ ] Configurable reminder periods (e.g., 30, 60, 90 days before expiration)
- [ ] Automatic alert generation when certifications expire
- [ ] Dashboard widget showing upcoming expirations
- [ ] Email/notification system for expiring CACES

### 4. CACES Registry View

- [ ] Dedicated page listing all CACES certifications
- [ ] Filter by:
  - Employee
  - Category
  - Status (valid, expiring soon, expired)
- [ ] Sort by expiration date
- [ ] Export functionality (CSV/PDF)

### 5. Renewal Workflow

- [ ] Track renewal requests
- [ ] Status tracking: pending, in progress, completed
- [ ] Link to training records

## Data Model

### EmployeeCACES

```typescript
interface EmployeeCACES {
  id: string;
  employeeId: string;
  category: CACESCategory;
  issueDate: Date;
  expirationDate: Date;
  documentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum CACESCategory {
  R389_1 = "R389-1",
  R389_2 = "R389-2",
  R389_3 = "R389-3",
  R389_4 = "R389-4",
  R389_5 = "R389-5",
  R389_6 = "R389-6",
  R389_7 = "R389-7",
}
```

## UI Components

### CACES Page
- Table view with columns: Employee, Category, Issue Date, Expiration Date, Status
- Quick actions: View, Edit, Delete, Download document
- Add new certification button
- Bulk import/export

### Employee Detail - CACES Tab
- List of employee's CACES certifications
- Add/Edit/Delete capabilities
- Document preview

### Dashboard Widget
- Number of expiring CACES (next 30 days)
- Number of expired CACES
- Quick link to full CACES page

## Alerts Configuration

### Default Thresholds
- Warning: 60 days before expiration
- Critical: 30 days before expiration
- Expired: Past expiration date

### Alert Fields
- Employee name
- CACES category
- Expiration date
- Days remaining
- Link to renewal action

## Future Considerations

- Integration with external training providers
- QR code generation for physical certificates
- Mobile app for field verification
- Audit log for compliance reporting
