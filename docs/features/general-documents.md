# General Documents Management

## Overview

General documents (Documents généraux) encompass all employee-related administrative files that are not specific to CACES, medical visits, training, or contracts. This feature enables centralized document storage, categorization, expiration tracking, and compliance with French retention requirements and GDPR (RGPD).

> **Critical:** This system must comply with CNIL guidelines and French Labor Law regarding document storage, retention, and deletion.

## Current State

- Documents can be uploaded for employees
- Category field in alerts table
- Days left indicator for expiring documents

## Document Categories

### Identity Documents

| Document Type | French | Description | Retention | GDPR Status |
|---------------|--------|-------------|-----------|-------------|
| ID Card | Carte d'identité | National identity card | Employment + 5 years (data only) | Store only necessary data |
| Passport | Passeport | Foreign passport | Employment + 5 years (data only) | Store only necessary data |
| **Work Permit** | **Titre de séjour** | Work permit for foreigners | Employment + 5 years | **SENSITIVE - Verify with Prefecture** |
| Driving License | Permis de conduire | Standard/weight vehicles | Employment + 1 year | Verify validity |
| Visa | Visa | Work visa | Employment + 1 year | Verify validity |

> **IMPORTANT:** Remove "Carte Vitale" from storage. Employers should only store the NIR (Social Security Number), not the card image. This is considered excessive data collection by CNIL.

### Administrative Documents

| Document Type | French | Description | Retention | GDPR Status |
|---------------|--------|-------------|-----------|-------------|
| CV | Curriculum Vitae | Resume/CV | **Auto-delete 2 years after departure** | Non-essential |
| Diplomas | Diplômes | Education certificates | Employment + 1 year | Verify authenticity |
| Professional Cards | Cartes professionnelles | Professional ID cards | Employment + 1 year | Verify validity |
| RIB | Relevé d'Identité Bancaire | Bank details | Employment + 1 year | **SENSITIVE - High fraud risk** |
| Social Security Number | Numéro NIR | Social security number | Employment + 5 years | PII - Strict access |

### Work-Related Documents

| Document Type | French | Description | Retention | GDPR Status |
|---------------|--------|-------------|-----------|-------------|
| Attestation de travail | Work certificate | Employer certificate | Employment + 1 year | Standard |
| Bulletins de salaire | Pay slips | Salary statements | **5 years (legal)** | **SENSITIVE - Use external archiving** |
| DSN | Déclaration Sociale Nominative | Social declarations | 5 years | Standard |
| **Probation Report** | **Rapport fin de période d'essai** | End of probation evaluation | Employment + 5 years | Standard |

### Logistics-Specific Documents

| Document Type | French | Description | Retention | Notes |
|---------------|--------|-------------|-----------|-------|
| **PPE Acknowledgment** | **Décharge EPI** | Receipt of safety equipment | Employment + 5 years | **MANDATORY** |
| Driving License Check | Vérification permis | License validity check | Employment + 1 year | Visual verification only |
| Prefecture Verification | Vérification Prefecture | Work permit validity check | Employment + 5 years | **MANDATORY for foreign workers** |
| Uniform Receipt | Badge/Vêtements | Company uniform/badge | Employment + 1 year | Standard |

### Emergency & Personal

| Document Type | French | Description | Retention | GDPR Status |
|---------------|--------|-------------|-----------|-------------|
| Contact d'urgence | Emergency contact | Emergency contact info | Employment | PII - Minimize data |
| Bénéficiaire | Next of kin | Family/beneficiary info | Employment | PII - Minimize data |
| Notice d'information | Information notice | Company policy acknowledgment | Duration of employment | Standard |

## Critical GDPR & CNIL Requirements

### Documents NOT to Store

| Document | Reason | Alternative |
|----------|--------|-------------|
| **Carte Vitale** | CNIL: Excessive collection | Store only NIR number |
| ID Card copies > 1 year post-departure | CNIL: Storage limitation | Delete scan, keep data only |
| CV > 2 years post-departure | No longer relevant | Auto-purge |
| Medical diagnoses | RGPD: Special category data | Store only aptitude result |

### What Can Be Stored (Data vs File)

> **Important Distinction:**

| Document Type | Store Data | Store File |
|---------------|------------|------------|
| ID Card | Name, ID number, expiry | Delete after 1 year post-departure |
| RIB | Bank name, IBAN | Delete after 1 year post-departure |
| Pay slips | Summary info | Use external service (Digiposte) |
| CV | N/A | Delete after 2 years post-departure |

## Desired Features

### 1. Document Upload & Storage

- [ ] Upload documents (PDF, images)
- [ ] Document categorization
- [ ] Multi-page PDF support
- [ ] File size limits
- [ ] Automatic file naming
- [ ] Duplicate detection
- [ ] Version history
- [ ] **PDF Split Tool** - Split multi-page PDF into separate documents

### 2. GDPR Compliance Features

- [ ] **Blur/Redact Tool** - Hide sensitive info (height, weight, photo) before saving
- [ ] **PII Flag** - Mark documents containing personally identifiable information
- [ ] **Data vs File distinction** - Store metadata without keeping file
- [ ] **Auto-purge** - Delete files after retention period
- [ ] **Anonymization** - Scrub metadata on deletion, keep audit log

### 3. Work Permit Verification (Foreign Workers)

> **CRITICAL:** Employer must verify work permit validity with Prefecture at least 2 business days before hiring (Article L5221-8).

- [ ] **Prefecture Verification Date** - When permit was checked
- [ ] **Work Right Validated** checkbox
- [ ] Alert if verification not done before start date
- [ ] Keep proof of verification

### 4. Driving License Verification

- [ ] Visual verification date
- [ ] License validity status
- [ ] Alert for license expiration
- [ ] Cannot store point balance (employee's private data)

### 5. Required Document Sets (Onboarding Checklist)

> **Critical:** Define required documents per job type

- [ ] Create document sets per contract type
- [ ] **Compliance Gauge** - Show % of required documents present
- [ ] Gap analysis view
- [ ] Alerts for missing mandatory documents

**Example Required Sets:**

| Job Type | Required Documents |
|----------|------------------|
| CDI Forklift Driver | ID + RIB + Contract + DPAE + PPE Acknowledgment |
| CDD Handler | ID + RIB + Contract + DPAE |
| Temporary Worker | ID + Work Permit + Agency Contract |

### 6. RIB Security (Double Validation)

> RIB is high-risk for fraud

- [ ] **Dual-factor approval** for RIB changes
- [ ] Upload requires one person
- [ ] Approval requires different person
- [ ] Alert on any RIB modification

### 7. Document Expiration Tracking

- [ ] Track expiration dates
- [ ] Automatic alerts before expiration
- [ ] Status: Valid, Expiring Soon, Expired
- [ ] Bulk renewal workflow
- [ ] **Traffic Light View:**
  - 🔴 Red: Mandatory document missing
  - 🟠 Orange: Expiring soon (< 60 days)
  - 🟢 Green: Compliant

### 8. Employee Document Profile

- [ ] Complete document history
- [ ] Current valid documents
- [ ] Expired documents
- [ ] Pending renewals
- [ ] Document download
- [ ] Compliance percentage

### 9. Document Registry

- [ ] Dedicated page listing all documents
- [ ] Filter by:
  - Employee
  - Document type
  - Status (valid, expired)
  - Expiration date
  - PII status
- [ ] Sort by various fields
- [ ] Export functionality (CSV/PDF)

### 10. Compliance Dashboard

- [ ] Widget showing:
  - Total documents
  - Documents expiring soon
  - Expired documents
  - Missing documents
  - **Compliance Gauge** per employee
- [ ] Department breakdown
- [ ] **Pyramid View:**
  - 🔴 Missing mandatory
  - 🟠 Expiring soon
  - 🟢 Compliant

### 11. Document Retention Management

- [ ] Track retention periods
- [ ] Auto-archive after retention
- [ ] **Auto-delete** after legal period
- [ ] **Legal Hold** override
- [ ] Audit trail
- [ ] Deletion reason tracking (GDPR requirement)

### 12. Access Control & Audit

- [ ] Role-based access
- [ ] Document visibility settings
- [ ] Confidentiality levels
- [ ] **Access logging** - Log every view/download of sensitive docs
- [ ] Timestamp and user tracking

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
  autoDeleteEnabled: boolean;

  // GDPR/Compliance
  isPII: boolean;                    // Personally Identifiable Information
  isSensitive: boolean;              // High-risk document (RIB, Pay slip)
  dataStoredSeparately: boolean;    // Keeping data without file

  // Special flags
  isWorkPermit: boolean;            // For Titre de séjour
  prefectureVerificationDate?: Date; // Mandatory for work permits
  prefectureVerified: boolean;       // Checkbox: work right validated

  // Driving license
  licenseVerificationDate?: Date;   // Visual verification

  // RIB Security
  requiresDualApproval: boolean;    // For RIB changes
  approvedBy?: string;             // Who approved

  // Status
  status: DocumentStatus;

  // Access
  isConfidential: boolean;
  accessLevel: AccessLevel;

  // Audit
  lastAccessedBy?: string;
  lastAccessedAt?: Date;

  // Deletion (GDPR)
  purgeReason?: string;
  purgedAt?: Date;

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

  // Prefecture Verification (NEW)
  PREFECTURE_VERIFICATION = "prefecture_verification",

  // Administrative
  CV = "cv",
  DIPLOMA = "diploma",
  PROFESSIONAL_CARD = "professional_card",
  NIR = "nir",  // Social Security Number only
  RIB = "rib",

  // Work
  WORK_CERTIFICATE = "work_certificate",
  PAY_SLIP = "pay_slip",
  CERTIFICATE = "certificate",
  DSN = "dsn",
  PROBATION_REPORT = "probation_report",

  // Logistics-Specific (NEW)
  PPE_ACKNOWLEDGMENT = "decharge_epi",
  DRIVING_LICENSE_CHECK = "driving_license_check",
  UNIFORM_RECEIPT = "uniform_receipt",

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
  autoDeleteMonths?: number;        // For non-legal documents
  isRequired: boolean;
  isPII: boolean;
  isSensitive: boolean;
  requiresDualApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RequiredDocumentSet {
  id: string;
  name: string;                    // e.g., "CDI Forklift Driver"
  jobProfileId?: string;
  requiredDocumentTypes: DocumentType[];
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentAuditLog {
  id: string;
  documentId: string;
  userId: string;
  action: 'view' | 'download' | 'upload' | 'delete' | 'approve';
  timestamp: Date;
  ipAddress?: string;
  details?: string;
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
| ID documents (data only) | Employment + 5 years | Registre Unique du Personnel |
| ID documents (scans) | Employment + 1 year | CNIL guidelines |
| CV | **Auto-delete 2 years** | GDPR - Storage limitation |
| RIB | Employment + 1 year | CNIL guidelines |

### Auto-Delete Policy

| Document Type | Delete After Departure |
|---------------|----------------------|
| CV | 2 years |
| ID scan | 1 year |
| RIB | 1 year |
| Photo | 1 year |
| Pay slips | Use external archiving (50 years) |

## Integration Points

### Alerts System
- Generate alert before document expiration
- Generate alert when document expires
- **Generate alert for missing required documents**
- **Generate alert for work permit verification pending**
- Include employee name, document type, expiration date

### Employee Profile
- Display document summary
- Show compliance gauge
- Show expiring documents
- Quick access to download

### Contracts Module
- Link contract documents
- Track contract retention
- Required document set based on contract type

### CACES Module
- Link CACES certificates
- Link PPE acknowledgment

### Medical Visits Module
- Link medical certificates
- Separate from medical data (GDPR)

### Training Module
- Link training certificates

## UI Components

### Documents Page
- **Traffic Light Status:**
  - 🔴 Red: Mandatory missing
  - 🟠 Orange: Expiring < 60 days
  - 🟢 Green: Compliant
- Table view with columns: Employee, Document Type, Issue Date, Expiration Date, Status, PII Flag
- Quick actions: View, Download, Delete, Approve (for RIB)
- Filter by type, status, employee, PII
- Export functionality

### Employee Detail - Documents Tab
- Employee's documents list
- **Compliance Gauge** (e.g., "75% complete")
- Upload new document
- Download existing
- Expiration warnings

### Document Upload Modal
- Select document type
- Enter dates
- Upload file
- Set confidentiality
- **Redaction tool** (blur sensitive info)
- Dual approval checkbox (for RIB)

### Prefecture Verification Widget
- For foreign workers only
- Date of verification (mandatory)
- Checkbox: "Work right validated"
- Alert if not verified before start date

### Dashboard Widget
- Documents expiring soon
- Expired documents
- **Missing mandatory documents**
- **Compliance Gauge**
- Quick link to full documents page

### Alerts Configuration
- Work Permit: 7 days before start if not verified
- Driving License: 30 days before expiration
- ID Documents: 60 days before expiration
- RIB: Alert on any change
- Required Documents: Immediate if missing

## Workflows

### Document Upload
1. Select employee
2. Choose document type
3. Enter issue/expiration dates (if applicable)
4. **Optional: Redact sensitive info**
5. Upload file
6. Set confidentiality level
7. **Dual approval** if RIB
8. Confirm upload
9. **Log access** for sensitive documents

### Work Permit Verification (Foreign Workers)
1. Upload Titre de séjour
2. **Verify with Prefecture** (mandatory)
3. Record verification date
4. Check "Work right validated"
5. **Alert if not done 2 days before start**

### RIB Change (Fraud Prevention)
1. HR uploads new RIB
2. Status: "Pending Approval"
3. Different person reviews and approves
4. Log who approved
5. Alert sent to management

### Document Auto-Delete
1. Employee departs
2. Start retention countdown
3. At retention limit:
   - Review document
   - Decide: Delete or Legal Hold
4. If delete: Anonymize metadata, keep audit log

### GDPR Right to be Forgotten
1. Document flagged for deletion
2. **Keep audit log** (that it existed, when deleted)
3. **Scrub all metadata** (filename, notes, etc.)
4. **Delete file** permanently
5. Record purge reason

## Security Features

### Access Control
- Role-based permissions
- Document-level security
- **Audit logging** for all sensitive document access

### Data Protection
- Encryption at rest
- Secure file storage
- Backup procedures
- **High-security vault** for RIB/Pay slips

### Compliance
- Retention policy enforcement
- **Complete audit trail**
- GDPR compliance
- CNIL guideline adherence

## Pay Slip (Bulletin de Paie) Warning

> **IMPORTANT:** French law requires pay slips to be accessible for **50 years** or until the employee is 75.

- This system should **NOT** be the primary storage for pay slips
- Use as a "mirror" only
- Recommend integration with **Digiposte** or similar
- Clearly label as "backup copy only"

## Future Considerations

- Digital signature integration
- OCR for document scanning
- Automated data extraction
- Integration with Prefecture API
- Integration with Digiposte (e-archiving)
- Mobile document access
- Bulk document operations
- Template management
- RIB verification API
