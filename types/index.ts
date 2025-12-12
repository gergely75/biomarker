// Patient types
export interface Patient {
  id: number
  name: string
  dateOfBirth: string
  lastVisit: string
}

// Biomarker types
export interface ReferenceRange {
  min: number
  max: number
}

export type BiomarkerStatus = 'normal' | 'high' | 'low'

export const BiomarkerCategory = ['metabolic', 'cardiovascular', 'hormonal'] 

export interface Biomarker {
  id: number | string
  patientId: number
  name: string
  value: number
  unit: string
  category: string
  referenceRange: ReferenceRange
  measuredAt: string
  status: BiomarkerStatus
}

// API Response types
export interface PatientsResponse {
  patients: Patient[]
}

export interface PatientResponse {
  patient: Patient
}

export interface BiomarkersResponse {
  biomarkers: Biomarker[]
}

export interface AIInsightsResponse {
  insights: string
}

