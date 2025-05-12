export interface ProfileData {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  gender: string
  emergencyContact: string
  bio: string
  profilePicture: string
  createdAt: string
  updatedAt: string
}

export interface HealthData {
  height: number
  weight: number
  bloodType: string
  allergies: string
  medications: string
  conditions: string
  familyHistory: string
  lastCheckup: string
  doctorNotes: string
}

export interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  appNotifications: boolean
  newsletterSubscription: boolean
  dataSharing: boolean
  anonymousDataCollection: boolean
  thirdPartyDataSharing: boolean
  reminders: boolean
  reminderFrequency: string
  darkMode: boolean
}

export interface HealthService {
  id: string
  name: string
  connected: boolean
  lastSync: string
}

export interface HealthAssessment {
  id: string
  date: string
  score: number
  risk: "Low" | "Moderate" | "High"
  recommendations: string[]
}

export interface HealthNotification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  type: "info" | "warning" | "success"
}

export interface HealthRoutineItem {
  id: string
  title: string
  description: string
  frequency: string
  completed: boolean
}
