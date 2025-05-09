// User profile data types for HeartPredict application

export interface UserProfile {
  id: string
  name: string | null
  email: string
  phone?: string
  profile_picture?: string
  role: UserRole
  created_at: string
  updated_at?: string
  health_data?: HealthData
  preferences?: UserPreferences
  medical_history?: MedicalHistory
  emergency_contact?: EmergencyContact
  verification_status: VerificationStatus
}

export type UserRole = "user" | "admin" | "doctor" | "researcher"

export interface HealthData {
  age?: number
  gender?: "male" | "female" | "other"
  height?: number // in cm
  weight?: number // in kg
  bmi?: number
  blood_type?: BloodType
  allergies?: string[]
  medications?: Medication[]
  last_checkup_date?: string
  heart_rate_history?: HeartRateRecord[]
  blood_pressure_history?: BloodPressureRecord[]
  cholesterol_levels?: CholesterolLevels
  glucose_levels?: GlucoseRecord[]
}

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"

export interface Medication {
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string
}

export interface HeartRateRecord {
  timestamp: string
  value: number // bpm
  activity?: string
}

export interface BloodPressureRecord {
  timestamp: string
  systolic: number // mmHg
  diastolic: number // mmHg
  pulse?: number // bpm
}

export interface CholesterolLevels {
  total: number // mg/dL
  hdl: number // mg/dL
  ldl: number // mg/dL
  triglycerides: number // mg/dL
  date: string
}

export interface GlucoseRecord {
  timestamp: string
  value: number // mg/dL
  measurement_type: "fasting" | "post-meal" | "random"
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: NotificationPreferences
  language: string
  units: "metric" | "imperial"
  data_sharing: DataSharingPreferences
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  reminders: boolean
  newsletter: boolean
  assessment_results: boolean
}

export interface DataSharingPreferences {
  share_with_doctors: boolean
  share_for_research: boolean
  anonymized_data_usage: boolean
}

export interface MedicalHistory {
  heart_conditions: boolean
  diabetes: boolean
  hypertension: boolean
  stroke: boolean
  cancer: boolean
  surgeries: Surgery[]
  family_history: FamilyHistory
}

export interface Surgery {
  procedure: string
  date: string
  hospital?: string
  notes?: string
}

export interface FamilyHistory {
  heart_disease: boolean
  diabetes: boolean
  cancer: boolean
  other_conditions?: string[]
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
}

export interface VerificationStatus {
  email_verified: boolean
  phone_verified: boolean
  identity_verified: boolean
  medical_professional?: boolean
}

// Sample user profile data for testing
export const sampleUserProfile: UserProfile = {
  id: "user_123456",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  profile_picture: "/uploads/profile_user_123456_1682541234.jpg",
  role: "user",
  created_at: "2023-01-15T08:30:00Z",
  updated_at: "2023-04-27T14:22:14Z",
  health_data: {
    age: 45,
    gender: "male",
    height: 178,
    weight: 82,
    bmi: 25.9,
    blood_type: "O+",
    allergies: ["Penicillin", "Pollen"],
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        start_date: "2022-11-10",
      },
    ],
    last_checkup_date: "2023-03-15",
    cholesterol_levels: {
      total: 195,
      hdl: 55,
      ldl: 120,
      triglycerides: 100,
      date: "2023-03-15",
    },
  },
  preferences: {
    theme: "system",
    notifications: {
      email: true,
      sms: false,
      push: true,
      reminders: true,
      newsletter: false,
      assessment_results: true,
    },
    language: "en-US",
    units: "metric",
    data_sharing: {
      share_with_doctors: true,
      share_for_research: false,
      anonymized_data_usage: true,
    },
  },
  medical_history: {
    heart_conditions: false,
    diabetes: false,
    hypertension: true,
    stroke: false,
    cancer: false,
    surgeries: [
      {
        procedure: "Appendectomy",
        date: "2010-06-22",
        hospital: "General Hospital",
      },
    ],
    family_history: {
      heart_disease: true,
      diabetes: true,
      cancer: false,
    },
  },
  emergency_contact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "+1 (555) 987-6543",
    email: "jane.doe@example.com",
  },
  verification_status: {
    email_verified: true,
    phone_verified: false,
    identity_verified: false,
  },
}
