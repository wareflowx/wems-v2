# General Documents Management

## Overview

General documents (Documents généraux) encompass all employee-related administrative files that are not specific to CACES, medical visits, training, or contracts. This feature enables centralized document storage, categorization, expiration tracking, and compliance with French retention requirements.

## Current State

- Documents can be uploaded for employees
- Category field in alerts table
- Days left indicator for expiring documents

## Document Categories

### Identity Documents

| Document Type | French | Description | Retention |
|---------------|--------|-------------|-----------|
| ID Card | Carte d'identité | National identity card | Employment + 1 year |
| Passport | Passeport | Foreign passport | Employment + 1 year |
| Residence Permit | Titre de séjour | Work permit for foreigners | Employment + 1 year |
| Driving License | Permis de conduire | Standard/weight vehicles | Employment + 1 year |
| Visa | Visa | Work visa | Employment + 1 year |

### Administrative Documents

| Document Type | French | Description | Retention |
|---------------|--------|-------------|-----------|
| CV | Curriculum Vitae | Resume/CV | Employment + 1 year |
| Diplomas | Diplômes | Education certificates | Employment + 1 year |
| Professional Cards | Cartes professionnelles | Professional ID cards | Employment + 1 year |
| Social Security Card | Carte Vitale | Health insurance | Employment + 1 year |
| RIB | Relevé d'Identité Bancaire | Bank details | Employment + 1 year |

### Work-Related Documents

| Document Type | French | Description | Retention |
|---------------|--------|-------------|-----------|
| Attestation de travail | Work certificate | Employer certificate | Employment + 1 year |
| Bulletins de salaire | Pay slips | Salary statements | 5 years (legal) |
| Certificats divers | Various certificates | Work-related certificates | 5 years |
| DSN | Déclaration Sociale Nominative | Social declarations | 5 years |

### Emergency & Personal

| Document Type | French | Description | Retention |
|---------------|--------|-------------|-----------|
| Contact d'urgence | Emergency contact | Emergency contact info | Employment |
| Bénéficiaire | Next of kin | Family/beneficiary info | Employment |
| Notice d'information | Information notice | Company policy acknowledgment | Duration of employment |

## Desired Features

### 1. Document Upload & Storage

- [ ] Upload documents (PDF, images)
- [ ] Document categorization
- [ ] Multi-page PDF support
- [ ] File size limits
- [ ] Automatic file naming
- [ ] Duplicate detection
- [ ] Version history

### 2. Document Types Management

- [ ] Predefined document types
- [ ] Custom document types
- [ ] Required fields per type
- [ ] Expiration date tracking
- [ ] Renewal reminders

### 3. Document Expiration Tracking

- [ ] Track expiration dates
- [ ] Automatic alerts before expiration
- [ ] Status: Valid, Expiring Soon, Expired
- [ ] Bulk renewal workflow

### 4. Employee Document Profile

- [ ] Complete document history
- [ ] Current valid documents
- [ ] Expired documents
- [ ] Pending renewals
- [ ] Document download

### 5. Document Registry

- [ ] Dedicated page listing all documents
- [ ] Filter by:
  - Employee
  - Document type
  - Status (valid, expired)
  - Expiration date
- [ ] Sort by various fields
- [ ] Export functionality (CSV/PDF)

### 6. Compliance Dashboard

- [ ] Widget showing:
  - Total documents
  - Documents expiring soon
  - Expired documents
  - Missing documents
- [ ] Department breakdown
- [ ] Compliance percentage

### 7. Document Retention Management

- [ ] Track retention periods
- [ ] Auto-archive after retention
- [ ] Deletion reminders
- [ ] Legal hold support
- [ ] Audit trail

### 8. Access Control

- [ ] Role-based access
- [ ] Document visibility settings
- [ ] Confidentiality levels
- [ ] Access logging

## Data Model

```typescript
interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  name: string;
  description?: string;

  // Dates
  issueDate?: Date;
  expirationDate?: Date;
  uploadedAt: Date;

  // File
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;

  // Metadata
  version: number;
  previousVersionId?: string;

  // Retention
  retentionPeriodMonths?: number;
  deletionDate?: Date;

  // Status
  status: DocumentStatus;

  // Access
  isConfidential: boolean;
  accessLevel: AccessLevel;

  // Notes
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

enum DocumentType {
  // Identity
  ID_CARD = "id_card",
  PASSPORT = "passport",
  RESIDENCE_PERMIT = "residence_permit",
  DRIVING_LICENSE = "driving_license",
  VISA = "visa",

  // Administrative
  CV = "cv",
  DIPLOMA = "diploma",
  PROFESSIONAL_CARD = "professional_card",
  VITALE_CARD = "vitale_card",
  RIB = "rib",

  // Work
  WORK_CERTIFICATE = "work_certificate",
  PAY_SLIP = "pay_slip",
  CERTIFICATE = "certificate",
  DSN = "dsn",

  // Emergency
  EMERGENCY_CONTACT = "emergency_contact",
  NEXT_OF_KIN = "next_of_kin",
  INFORMATION_NOTICE = "information_notice",

  // Other
  OTHER = "other",
}

enum DocumentStatus {
  VALID = "valid",
  EXPIRING_SOON = "expiring_soon",
  EXPIRED = "expired",
  PENDING = "pending",
  ARCHIVED = "archived",
  DELETED = "deleted",
}

enum AccessLevel {
  PUBLIC = "public",
  HR = "hr",
  MANAGER = "manager",
  ADMIN = "admin",
  CONFIDENTIAL = "confidential",
}

interface DocumentTemplate {
  id: string;
  name: string;
  documentType: DocumentType;
  description?: string;
  requiredFields: string[];
  retentionPeriodMonths?: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Document Retention (French Law)

### Standard Retention Periods

| Document Type | Retention | Legal Reference |
|---------------|-----------|-----------------|
| Pay slips | 5 years | Code du Travail L3243-4 |
| Employment contracts | Employment + 5 years | Code du Travail |
| DSN declarations | 5 years | Code de la Sécurité Sociale |
| Medical documents | 5 years | Code du Travail |
| Training records | Employment + 5 years | Code du Travail |
| ID documents | Employment + 1 year | CNIL guidelines |

### GDPR Considerations

- [ ] Right to access
- [ ] Right to rectification
- [ ] Right to erasure (after retention)
- [ ] Data minimization
- [ ] Purpose limitation
- [ ] Storage limitation

## Integration Points

### Alerts System
- Generate alert before document expiration
- Generate alert when document expires
- Include employee name, document type, expiration date

### Employee Profile
- Display document summary
- Show expiring documents
- Quick access to download

### Contracts Module
- Link contract documents
- Track contract retention

### CACES Module
- Link CACES certificates

### Medical Visits Module
- Link medical certificates

### Training Module
- Link training certificates

## UI Components

### Documents Page
- Table view with columns: Employee, Document Type, Issue Date, Expiration Date, Status
- Quick actions: View, Download, Delete
- Filter by type, status, employee
- Export functionality

### Employee Detail - Documents Tab
- Employee's documents list
- Upload new document
- Download existing
- Expiration warnings

### Document Upload Modal
- Select document type
- Enter dates
- Upload file
- Set confidentiality

### Dashboard Widget
- Documents expiring soon
- Expired documents
- Compliance percentage
- Quick link to full documents page

### Alerts Configuration
- Warning: 30 days before expiration
- Critical: 7 days before expiration
- Expired: Past expiration date

## Workflows

### Document Upload
1. Select employee
2. Choose document type
3. Enter issue/expiration dates (if applicable)
4. Upload file
5. Set confidentiality level
6. Confirm upload

### Document Renewal
1. Alert before expiration
2. Review existing document
3. Upload new version
4. Archive old version

### Document Deletion
1. Retention period ends
2. Review document
3. Confirm deletion or extend retention
4. Log deletion for audit

## Security Features

### Access Control
- Role-based permissions
- Document-level security
- Audit logging

### Data Protection
- Encryption at rest
- Secure file storage
- Backup procedures

### Compliance
- Retention policy enforcement
- Audit trail
- GDPR compliance

## Future Considerations

- Digital signature integration
- OCR for document scanning
- Automated data extraction
- Integration with government APIs
- E-archiving services
- Mobile document access
- Bulk document operations
- Template management
