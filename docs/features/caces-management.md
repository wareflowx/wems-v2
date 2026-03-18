# CACES Management

## Overview

CACES (Certificat d'Aptitude à la Conduite d'Engins) is the French certification system for operating warehouse equipment such as forklifts, pallet jacks, and other material handling vehicles. This feature enables tracking of employee certifications, expiration dates, and compliance status.

> **Important:** The R389 standard was replaced by **R489** on January 1, 2020. This system uses the current R489 standard, with support for other R-series recommendations.

## Current State

### Existing Functionality

- Alerts system tracks expiring CACES certifications
- Category field added to alerts table
- Days left indicator for expiring certifications

### Categories (R489 - Chariots automoteurs de manutention)

| Category | Description |
|----------|-------------|
| R489-1A | Pallet trucks and stackers (pedestrian) |
| R489-1B | High-lift pallet trucks and stackers (ride-on) |
| R489-2A | Horizontal platform trucks |
| R489-2B | Tow tractors |
| R489-3 | Counterbalance forklifts ≤ 6000 kg |
| R489-4 | Counterbalance forklifts > 6000 kg |
| R489-5 | Reach trucks |
| R489-6 | Lateral-stacking forklifts |
| R489-7 | Maintenance / Non-production transport |

### Other R-Series Support

| Recommendation | Description |
|----------------|-------------|
| R486 | PEMP (Aerial work platforms / Cherry pickers) |
| R482 | Engins de chantier (Construction equipment) |
| R485 | Gerbeurs (Pedestrian stackers) |

## Desired Features

### 1. Multi-Recommendation Support

- [ ] Support for multiple R-series recommendations (R489, R486, R482, R485)
- [ ] Recommendation type selection (dropdown)
- [ ] Category within each recommendation
- [ ] Custom recommendation support for future standards

### 2. CACES Categories Management

- [ ] Predefined list of CACES categories per recommendation
- [ ] Category descriptions in French and English
- [ ] Ability to add custom categories if needed

### 3. Employee CACES Assignment

- [ ] Assign multiple CACES categories per employee
- [ ] Store certification details:
  - Issue date
  - Expiration date
  - Certificate number (essential for audits)
  - Training provider (Organisme Testeur - e.g., Dekra, Apave)
  - Internal or external training (isInternal)
- [ ] Document upload capability (PDF/images)
- [ ] Notes field for each certification
- [ ] Link to SNC (Système Numérique CACES) verification

### 4. Autorisation de Conduite (Driving Authorization)

> **Critical:** In France, a valid CACES is NOT sufficient to operate equipment. The employer must issue a formal **Autorisation de Conduite**.

- [ ] Track driving authorization status per employee per category
- [ ] Authorization prerequisites validation:
  - [ ] Valid CACES (or equivalent)
  - [ ] Valid medical aptitude (Aptitude médicale)
  - [ ] Site-specific knowledge validated
- [ ] Authorization issued date
- [ ] Document generation for Autorisation de Conduite
- [ ] Batch printing for department

### 5. Medical Fitness Integration

- [ ] Link to medical visit records
- [ ] Display medical aptitude date for each CACES
- [ ] Warning if medical certificate expires before CACES

### 6. Expiration Tracking

- [ ] Configurable reminder periods:
  - Planning alert: 180 days (6 months) - for training center booking
  - Warning: 60 days before expiration
  - Critical: 30 days before expiration
- [ ] Automatic alert generation when certifications expire
- [ ] Dashboard widget showing upcoming expirations
- [ ] Email/notification system for expiring CACES

### 7. CACES Registry View

- [ ] Dedicated page listing all CACES certifications
- [ ] Filter by:
  - Employee
  - Recommendation (R489, R486, etc.)
  - Category
  - Status (valid, expiring soon, expired)
  - Has Autorisation de Conduite
- [ ] Sort by expiration date
- [ ] Export functionality (CSV/PDF)

### 8. Gap Analysis View

- [ ] Define required certifications per warehouse/shift
- [ ] Compare required vs. available valid certifications
- [ ] Highlight gaps in coverage

### 9. Renewal Workflow

- [ ] Track renewal requests
- [ ] Status tracking: pending, in progress, completed
- [ ] Link to training records
- [ ] Track training costs
- [ ] Track training provider for budget planning

## Data Model

### EmployeeCACES

```typescript
interface EmployeeCACES {
  id: string;
  employeeId: string;
  recommendation: CACESRecommendation;  // R489, R486, R482, R485
  category: string;                      // e.g., "3", "5", "1A"
  certificateNumber: string;              // Crucial for audits
  issueDate: Date;
  expirationDate: Date;
  trainingProvider: string;               // Organisme Testeur (e.g., Dekra, Apave)
  isInternal: boolean;                     // Internal test or external CACES
  sncVerificationUrl?: string;            // Link to verify certificate authenticity
  documentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum CACESRecommendation {
  R489 = "R489",   // Chariots automoteurs de manutention (current)
  R486 = "R486",   // PEMP
  R482 = "R482",   // Engins de chantier
  R485 = "R485",   // Gerbeurs
  R483 = "R483",   // Grues de chargement
  R490 = "R490",   // Plates-formes elevatrices de personnes
  CUSTOM = "custom",
}
```

### DrivingAuthorization

```typescript
interface DrivingAuthorization {
  id: string;
  employeeId: string;
  cacesId: string;
  authorizationIssuedDate?: Date;
  medicalAptitudeDate?: Date;    // Prerequisite: valid medical
  siteKnowledgeValidated: boolean; // Prerequisite: site-specific training
  prerequisitesMet: boolean;       // All prerequisites checked
  authorizedBy?: string;           // Manager who approved
  documentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## UI Components

### CACES Page
- Table view with columns: Employee, Recommendation, Category, Certificate #, Issue Date, Expiration Date, Status, Authorization
- Color coding by category (Cat 3 and Cat 5 most common - distinguishable colors)
- Quick actions: View, Edit, Delete, Download document, Generate Authorization
- Add new certification button
- Bulk import/export
- Gap Analysis toggle

### Employee Detail - CACES Tab
- List of employee's CACES certifications
- Authorization status for each
- Prerequisites checklist (medical, site knowledge)
- Add/Edit/Delete capabilities
- Document preview

### Autorisation de Conduite Page
- List of all authorizations
- Filter by status (pending, issued, expired)
- Batch print functionality
- Generation wizard

### Dashboard Widget
- Number of expiring CACES (next 30/60/90/180 days)
- Number of expired CACES
- Number of valid autorisations
- Compliance percentage
- Quick link to full CACES page

## Alerts Configuration

### Default Thresholds
- Planning: 180 days (6 months) before expiration - for scheduling
- Warning: 60 days before expiration
- Critical: 30 days before expiration
- Expired: Past expiration date

### Alert Fields
- Employee name
- CACES recommendation and category
- Certificate number
- Expiration date
- Days remaining
- Authorization status
- Link to renewal action

## Verification Workflow

### Certificate Verification
- [ ] Store SNC (Système Numérique CACES) verification link
- [ ] One-click verification redirect
- [ ] Verification status tracking

### Audit Support
- [ ] Certificate number required for all entries
- [ ] Training provider documentation
- [ ] Audit log for compliance reporting
- [ ] Export for CNAM/inspection

## Future Considerations

- Integration with external training providers (API)
- QR code generation for physical certificates
- Mobile app for field verification (scan and validate)
- Integration with time management systems
- Cost analysis per category/provider
- Automated renewal scheduling
- Multi-site support
