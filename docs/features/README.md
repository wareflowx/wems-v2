# WEMS - Warehouse Employee Management System

## Project Overview

WEMS (Warehouse Employee Management System) is a comprehensive logistics employee management application designed for French 3PL (Third-Party Logistics) companies. It tracks and manages essential information about warehouse workers, ensuring compliance with French labor law (Code du Travail).

> **Target Industry:** French logistics, warehousing, and transportation companies
> **Compliance:** French labor law, DPAE, CACES/R489, medical visits, working time directives

## Core Features

### 1. Employee Management (`employee-management.md`)

- **Personal Information**: Name, contact, birth details (DPAE-compliant)
- **Employment Details**: Position, department, location, seniority
- **Status Tracking**: Active, On Leave, Terminated with sub-statuses
- **Social Categories (CSP)**: Ouvrier, Employé, TAM, Cadre
- **Multi-Client Allocation**: Track hours per client (3PL)
- **NIR Security**: Masked display, role-based access, audit logging

### 2. CACES Management (`caces-management.md`)

- **R489 Certifications**: Categories 1-7 for forklifts
- **Autorisation de Conduite**: Internal driving authorization
- **Medical Fitness Integration**: Link to medical aptitude
- **Gap Analysis**: Required vs held certifications

### 3. Medical Visits (`medical-visits.md`)

- **Visit Types**:
  - **SIR** (Suivi Individuel Renforcé): 4 years + intermediate visit
  - **VIP** (Visite d'Information et de Prévention): 5 years
  - **Mi-carrière**: At age 45
  - **Reprise**: After long absence (AT, MP, Maternity)
- **Traffic Light Status**: Green/Orange/Red compliance indicator
- **Convocation Tracking**: Send and track visit invitations

### 4. Online Training (`online-training.md`)

- **Job Profiles**: Skill matrix by position
- **Skill Levels**: Learner, Autonomous, Expert
- **Manager Validation**: Practical assessment sign-off
- **External Certificates**: Import for temporary workers
- **SST/MAC**: 2-year recycling (corrected from 7 years)

### 5. Employment Contracts (`employment-contracts.md`)

- **Contract Types**: CDI, CDD, Intérim, Apprentissage
- **Motif de Recours**: Legal reason for CDD
- **DPAE Tracker**: Declaration tracking (blocks work if missing)
- **Délai de Carence**: Calculate waiting period between contracts
- **Pénibilité Factors**: Track hardship exposure (C2P)
- **Coefficient/CCN**: Salary grid compliance

### 6. General Documents (`general-documents.md`)

- **Document Types**: ID, work permit, contracts, certificates
- **Expiration Tracking**: Alerts for expiring documents
- **Traffic Light Status**: Compliance indicator
- **Prefecture Verification**: Work permit status tracking
- **RIB Dual-Approval**: Fraud prevention for bank details

### 7. Reference Data (`reference-data.md`)

- **Salary Coefficients**: CCN grille
- **Hardship Factors**: C2P pénibilité
- **Professional Certifications**: CACES, Electric, Driving
- **Clients**: Business units for 3PL allocation
- **Locations & Departments**: Organizational structure

### 8. Alerts Management (`alerts-management.md`)

- **Alert Categories**: CACES, Medical, Training, Contract, Document
- **Severity Levels**: Critical, Warning, Info
- **Blocking Logic**: Safety lock prevents illegal assignments
- **EmployeePermissions**: canWork, canOperateEquipment, canWorkNightShift
- **Escalation (N+2)**: Manager → Director → Safety Officer
- **Compliance Health Score**: Department compliance percentage

### 9. Absence & Leave Management (`absence-leave-management.md`)

- **Leave Types**:
  - **Paid Leave (CP)**: 30 days/year, 2.5 days/month
  - **RTT**: Time off in lieu of overtime
  - **Sick Leave**: Common illness, AT, Accident Trajet, MP
  - **Family Leave**: Maternity, Paternity, Parental
  - **Therapeutic Part-Time**: Mi-temps thérapeutique
- **CP Accrual During Sick Leave**: 2024 law (2 days/month)
- **Reprise Triggers**:
  - Work Accident (AT): **After 30 days**
  - Sick Leave: **After 60 days**
  - Occupational Disease: **Immediate (0 days)**
  - Maternity: **Immediate (0 days)**
- **Fractionnement**: Extra days for leave outside May-October

### 10. Scheduling & Shifts (`scheduling-shifts-management.md`)

- **Shift Types**: Standard, Early, Day, Late, Night
- **Shift Patterns**: Fixed, 2x8, 3x8, Weekend
- **French Labor Law Compliance**:
  - **Rest Periods**: 11h daily, 35h weekly
  - **Max Hours**: 10h/day, 48h/week, 220h/year overtime
  - **Night Work**: 21h00-6h00, requires SIR visit
- **Qualification Matching**: CACES requirements per shift
- **3PL Client Allocation**: Track hours per client
- **Time Tracking (Pointage)**: Planned vs actual hours
- **Working Time Violations**: Track and report legal breaches
- **Safety Sidebar**: Real-time compliance indicators

## Architecture

### Integration Points

```
Employee Management
    ├── CACES → Alerts (AUTH_CACES_EXPIRED)
    ├── Medical → Alerts (AUTH_MEDICAL_EXPIRED)
    ├── Training → Alerts (TRAINING_EXPIRED)
    ├── Contracts → Alerts (CONTRACT_EXPIRED, DPAE)
    └── Documents → Alerts (DOCUMENT_EXPIRED)

Scheduling
    ├── Alerts → Check EmployeePermissions
    ├── Leave → Block during absence
    └── Medical → Validate SIR for night shifts

Absence/Leave
    └── Alerts → Trigger Reprise after AT/MP/Maternity
```

### Data Model Highlights

- **Employee**: Central entity with status, permissions, allocations
- **Alert**: Compliance notifications with blocking capability
- **LeaveBalance**: CP, RTT tracking with sick leave accrual
- **WorkingTimeViolation**: Legal compliance tracking

## Purpose

WEMS ensures compliance with French labor law while streamlining warehouse operations:

- **Safety**: Block unqualified employees from equipment operation
- **Compliance**: Track medical visits, certifications, contracts
- **Legal Protection**: Audit trail for labor inspections
- **Efficiency**: Centralize 3PL multi-client allocation

## Technology Stack

- **Frontend**: React with TypeScript
- **Desktop Framework**: Electron
- **Database**: SQLite
- **State Management**: TanStack Query
- **UI Components**: shadcn/ui

## Module List

| Module | File | Status |
|--------|------|--------|
| Overview | README.md | ✅ |
| Employee Management | employee-management.md | ✅ |
| CACES Management | caces-management.md | ✅ |
| Medical Visits | medical-visits.md | ✅ |
| Online Training | online-training.md | ✅ |
| Employment Contracts | employment-contracts.md | ✅ |
| General Documents | general-documents.md | ✅ |
| Reference Data | reference-data.md | ✅ |
| Alerts Management | alerts-management.md | ✅ |
| Absence & Leave | absence-leave-management.md | ✅ |
| Scheduling & Shifts | scheduling-shifts-management.md | ✅ |
