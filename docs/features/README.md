# WEMS - Warehouse Employee Management System

## Project Overview

WEMS (Warehouse Employee Management System) is a logistics employee management application designed to track and manage essential information about warehouse workers. It provides a comprehensive view of each employee's professional status, certifications, and compliance requirements.

## Core Features

### Employee Management

- **Work Location Tracking**: Track where each employee works within the logistics facility
- **Contract Types**: Manage various employment contracts (CDI, CDD, Intérim, etc.)
- **Employee Directory**: Complete list of all employees with their personal and professional details

### Certifications & Compliance

- **CACE (Certificat d'Aptitude à la Conduite d'Engins)**: Equipment driving certifications
  - Track expiration dates
  - Manage renewal reminders
  - Store certification documents

- **Medical Visits**: Monitor employee medical examinations
  - Schedule upcoming visits
  - Track last examination date
  - Ensure compliance with health regulations

- **Driving Authorizations**: Special driving permissions for specific vehicles or equipment

### Training Management

- **Online Training**: Track completed and pending training modules
  - Training completion status
  - Certificate storage
  - Expiration tracking for time-limited certifications

### Document Management

- **Contracts**: Employment contract management
  - Contract type
  - Start/end dates
  - Contract renewal tracking

- **General Documents**: Store and manage employee-related documents
  - ID copies
  - Certificates
  - Administrative paperwork

## Purpose

The primary goal of WEMS is to ensure compliance with legal and safety requirements in a warehouse/logistics environment. By centralizing all employee information, administrators can easily:

- Identify employees with expiring certifications
- Track work assignments across different locations
- Maintain up-to-date employee records
- Generate alerts for compliance deadlines

## Technology Stack

- **Frontend**: React with TypeScript
- **Desktop Framework**: Electron
- **Database**: SQLite
- **State Management**: TanStack Query
- **UI Components**: shadcn/ui
