/**
 * Driving Authorization Status Types
 *
 * Used to determine if an employee is authorized to drive company vehicles
 * based on 4 validated elements:
 * 1. Medical visit (visite médicale) - valid/non-expired
 * 2. CACES - valid/non-expired
 * 3. Internal driving authorization - valid/non-expired
 * 4. Trainings - at least one completed
 */

export interface MedicalVisitStatus {
  valid: boolean;
  status?: string;
  expiresAt?: string;
  type?: string;
}

export interface CacesStatus {
  valid: boolean;
  category?: string;
  expiresAt?: string;
}

export interface DrivingAuthorizationStatus {
  valid: boolean;
  licenseCategory?: string;
  expiresAt?: string;
}

export interface TrainingStatus {
  valid: boolean;
  name?: string;
  completedAt?: string;
}

export interface DrivingAuthorizationDetails {
  medicalVisit: MedicalVisitStatus;
  caces: CacesStatus;
  drivingAuthorization: DrivingAuthorizationStatus;
  training: TrainingStatus;
}

export interface DrivingAuthorizationStatusResult {
  authorized: boolean;
  partial: boolean;
  details: DrivingAuthorizationDetails;
}
