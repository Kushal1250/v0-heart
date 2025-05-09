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
  lifestyle_data?: LifestyleData
  fitness_data?: FitnessData
  nutrition_data?: NutritionData
  mental_health_data?: MentalHealthData
  sleep_data?: SleepData
  wearable_device_data?: WearableDeviceData
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
  vaccination_history?: Vaccination[]
  chronic_conditions?: string[]
  past_surgeries?: Surgery[]
  family_disease_history?: FamilyDiseaseHistory
  genetic_risk_factors?: string[]
}

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"

export interface Medication {
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string
  purpose?: string
  prescribing_doctor?: string
  side_effects?: string[]
  is_prescription: boolean
}

export interface HeartRateRecord {
  timestamp: string
  value: number // bpm
  activity?: string
  measurement_method?: "manual" | "device" | "clinical"
  notes?: string
}

export interface BloodPressureRecord {
  timestamp: string
  systolic: number // mmHg
  diastolic: number // mmHg
  pulse?: number // bpm
  position?: "sitting" | "standing" | "lying"
  measurement_method?: "manual" | "device" | "clinical"
  notes?: string
}

export interface CholesterolLevels {
  total: number // mg/dL
  hdl: number // mg/dL
  ldl: number // mg/dL
  triglycerides: number // mg/dL
  date: string
  fasting: boolean
  measurement_method?: "clinical" | "home-test"
  notes?: string
}

export interface GlucoseRecord {
  timestamp: string
  value: number // mg/dL
  measurement_type: "fasting" | "post-meal" | "random" | "hba1c"
  measurement_method?: "clinical" | "home-test"
  notes?: string
}

export interface Vaccination {
  name: string
  date: string
  expiration_date?: string
  administered_by?: string
  batch_number?: string
  notes?: string
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: NotificationPreferences
  language: string
  units: "metric" | "imperial"
  data_sharing: DataSharingPreferences
  accessibility_settings?: AccessibilitySettings
  dashboard_widgets?: string[]
  reminder_settings?: ReminderSettings
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  reminders: boolean
  newsletter: boolean
  assessment_results: boolean
  medication_reminders?: boolean
  appointment_reminders?: boolean
  health_tips?: boolean
  critical_alerts?: boolean
}

export interface DataSharingPreferences {
  share_with_doctors: boolean
  share_for_research: boolean
  anonymized_data_usage: boolean
  share_with_family_members?: boolean
  share_with_insurance?: boolean
  share_with_third_party_apps?: string[]
}

export interface AccessibilitySettings {
  font_size: "small" | "medium" | "large" | "extra-large"
  high_contrast: boolean
  screen_reader_compatible: boolean
  reduce_animations: boolean
  color_blind_mode?: "none" | "protanopia" | "deuteranopia" | "tritanopia"
}

export interface ReminderSettings {
  medication_times?: string[]
  water_intake?: boolean
  exercise?: boolean
  health_checkups?: boolean
  sleep_schedule?: boolean
  custom_reminders?: CustomReminder[]
}

export interface CustomReminder {
  title: string
  description?: string
  frequency: "daily" | "weekly" | "monthly" | "custom"
  time?: string
  days?: number[] // 0-6 for Sunday-Saturday
  enabled: boolean
}

export interface MedicalHistory {
  heart_conditions: boolean
  diabetes: boolean
  hypertension: boolean
  stroke: boolean
  cancer: boolean
  surgeries: Surgery[]
  family_history: FamilyHistory
  hospitalizations?: Hospitalization[]
  immunizations?: Immunization[]
  allergic_reactions?: AllergicReaction[]
  childhood_diseases?: ChildhoodDisease[]
  major_illnesses?: MajorIllness[]
}

export interface Surgery {
  procedure: string
  date: string
  hospital?: string
  surgeon?: string
  reason?: string
  outcome?: string
  complications?: string[]
  notes?: string
  follow_up_required?: boolean
}

export interface FamilyHistory {
  heart_disease: boolean
  diabetes: boolean
  cancer: boolean
  other_conditions?: string[]
  maternal_history?: FamilyCondition[]
  paternal_history?: FamilyCondition[]
  siblings_history?: FamilyCondition[]
}

export interface FamilyCondition {
  condition: string
  relation: string
  age_at_diagnosis?: number
  outcome?: string
  notes?: string
}

export interface Hospitalization {
  reason: string
  start_date: string
  end_date: string
  hospital: string
  doctor: string
  treatments: string[]
  outcome: string
  notes?: string
}

export interface Immunization {
  vaccine: string
  date: string
  administered_by?: string
  location?: string
  batch_number?: string
  next_dose_due?: string
}

export interface AllergicReaction {
  allergen: string
  reaction: string
  severity: "mild" | "moderate" | "severe"
  first_occurrence: string
  treatment?: string
  notes?: string
}

export interface ChildhoodDisease {
  disease: string
  age: number
  complications?: string[]
  treatment?: string
  resolved: boolean
}

export interface MajorIllness {
  condition: string
  diagnosis_date: string
  treating_physician?: string
  treatment?: string
  status: "active" | "in remission" | "resolved" | "chronic"
  notes?: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
  is_healthcare_proxy?: boolean
  notes?: string
  alternate_phone?: string
}

export interface VerificationStatus {
  email_verified: boolean
  phone_verified: boolean
  identity_verified: boolean
  medical_professional?: boolean
  government_id_verified?: boolean
  insurance_verified?: boolean
}

export interface LifestyleData {
  smoking_status: "never" | "former" | "current" | "occasional"
  smoking_details?: {
    cigarettes_per_day?: number
    years_smoked?: number
    quit_date?: string
    pack_years?: number
  }
  alcohol_consumption: "none" | "occasional" | "moderate" | "heavy"
  alcohol_details?: {
    drinks_per_week?: number
    preferred_type?: string[]
    history_of_heavy_use?: boolean
  }
  exercise_frequency: "none" | "occasional" | "regular" | "daily"
  exercise_details?: {
    activities?: string[]
    minutes_per_week?: number
    intensity?: "light" | "moderate" | "vigorous"
  }
  diet_type?: "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "keto" | "paleo" | "mediterranean" | "other"
  diet_details?: {
    dietary_restrictions?: string[]
    food_allergies?: string[]
    typical_meals?: string[]
    water_intake?: number // glasses per day
  }
  stress_level?: "low" | "moderate" | "high" | "severe"
  stress_management?: string[]
  occupation?: string
  occupation_details?: {
    job_title?: string
    work_environment?: "office" | "remote" | "field" | "mixed"
    physical_activity_level?: "sedentary" | "light" | "moderate" | "heavy"
    work_hours_per_week?: number
    shift_work?: boolean
    workplace_hazards?: string[]
  }
  hobbies?: string[]
  travel_history?: {
    countries_visited?: string[]
    recent_travel?: {
      destination: string
      date: string
      duration: number // days
    }[]
  }
}

export interface FitnessData {
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
  exercise_routine?: {
    cardio?: {
      type: string[]
      frequency: number // times per week
      duration: number // minutes per session
      intensity: "light" | "moderate" | "vigorous"
    }
    strength?: {
      type: string[]
      frequency: number // times per week
      duration: number // minutes per session
      target_muscle_groups?: string[]
    }
    flexibility?: {
      type: string[]
      frequency: number // times per week
      duration: number // minutes per session
    }
  }
  fitness_goals?: string[]
  fitness_metrics?: {
    resting_heart_rate?: number // bpm
    vo2_max?: number // mL/(kg·min)
    one_rep_max?: Record<string, number> // exercise name to weight in kg
    flexibility_metrics?: Record<string, number> // test name to measurement
    body_fat_percentage?: number
    muscle_mass_percentage?: number
  }
  exercise_history?: {
    past_routines?: string[]
    sports_played?: string[]
    injuries?: {
      type: string
      date: string
      treatment: string
      resolved: boolean
    }[]
  }
  step_count_history?: {
    date: string
    count: number
  }[]
  workout_logs?: {
    date: string
    type: string
    duration: number // minutes
    calories_burned?: number
    notes?: string
  }[]
}

export interface NutritionData {
  dietary_preferences?: string[]
  dietary_restrictions?: string[]
  allergies?: string[]
  intolerances?: string[]
  typical_diet?: {
    breakfast?: string[]
    lunch?: string[]
    dinner?: string[]
    snacks?: string[]
  }
  nutrition_goals?: string[]
  caloric_intake?: {
    target: number // calories per day
    actual: Record<string, number> // date to calories
  }
  macronutrient_targets?: {
    protein: number // grams
    carbohydrates: number // grams
    fat: number // grams
    fiber?: number // grams
  }
  micronutrient_concerns?: string[]
  hydration?: {
    water_intake_target: number // ounces or ml
    actual: Record<string, number> // date to amount
  }
  supplements?: {
    name: string
    dosage: string
    frequency: string
    reason: string
    started: string
  }[]
  meal_planning?: {
    meal_prep: boolean
    grocery_shopping_frequency: string
    common_ingredients: string[]
  }
  food_diary?: {
    date: string
    meals: {
      type: "breakfast" | "lunch" | "dinner" | "snack"
      time: string
      foods: string[]
      calories?: number
    }[]
  }[]
}

export interface MentalHealthData {
  stress_level?: "low" | "moderate" | "high" | "severe"
  stress_factors?: string[]
  stress_management_techniques?: string[]
  mood_tracking?: {
    date: string
    mood: "excellent" | "good" | "neutral" | "poor" | "terrible"
    notes?: string
  }[]
  diagnosed_conditions?: {
    condition: string
    diagnosis_date: string
    treating_professional?: string
    treatment?: string
    status: "active" | "in remission" | "resolved" | "chronic"
  }[]
  therapy?: {
    type: string
    frequency: string
    started: string
    ended?: string
    provider?: string
  }[]
  medications?: {
    name: string
    dosage: string
    frequency: string
    started: string
    ended?: string
    prescribed_for: string
    side_effects?: string[]
  }[]
  sleep_quality?: "excellent" | "good" | "fair" | "poor" | "terrible"
  mindfulness_practice?: {
    type: string[]
    frequency: string
    duration: number // minutes per session
  }
  social_support?: {
    level: "strong" | "adequate" | "limited" | "none"
    support_network?: string[]
  }
  life_satisfaction?: number // 1-10 scale
  work_life_balance?: "excellent" | "good" | "fair" | "poor" | "terrible"
}

export interface SleepData {
  average_duration?: number // hours
  sleep_schedule?: {
    typical_bedtime: string // HH:MM format
    typical_wake_time: string // HH:MM format
    consistency: "very consistent" | "somewhat consistent" | "inconsistent"
  }
  sleep_quality?: "excellent" | "good" | "fair" | "poor" | "terrible"
  sleep_disorders?: {
    condition: string
    diagnosed: boolean
    diagnosis_date?: string
    treatment?: string
    status: "active" | "in remission" | "resolved" | "chronic"
  }[]
  sleep_environment?: {
    bedroom_temperature?: number // degrees
    noise_level?: "silent" | "quiet" | "moderate" | "noisy"
    light_level?: "dark" | "dim" | "moderate" | "bright"
    bed_comfort?: "very comfortable" | "comfortable" | "adequate" | "uncomfortable"
  }
  sleep_aids?: {
    type: string
    frequency: "never" | "occasionally" | "regularly" | "daily"
    effectiveness: "very effective" | "somewhat effective" | "not effective"
  }[]
  sleep_tracking?: {
    date: string
    bedtime: string
    wake_time: string
    total_duration: number // minutes
    deep_sleep?: number // minutes
    rem_sleep?: number // minutes
    light_sleep?: number // minutes
    awake_time?: number // minutes
    quality_rating?: number // 1-10
    notes?: string
  }[]
  factors_affecting_sleep?: string[]
  sleep_goals?: string[]
}

export interface WearableDeviceData {
  devices?: {
    type: "fitness tracker" | "smartwatch" | "heart monitor" | "glucose monitor" | "blood pressure monitor" | "other"
    brand: string
    model: string
    connected_since: string
    data_synced: boolean
  }[]
  heart_rate_data?: {
    date: string
    average_resting: number // bpm
    max: number // bpm
    min: number // bpm
    detailed_readings?: {
      timestamp: string
      value: number // bpm
      activity?: string
    }[]
  }[]
  step_data?: {
    date: string
    total_steps: number
    distance: number // km or miles
    floors_climbed?: number
    active_minutes?: number
  }[]
  sleep_data?: {
    date: string
    total_duration: number // minutes
    deep_sleep?: number // minutes
    rem_sleep?: number // minutes
    light_sleep?: number // minutes
    awake_time?: number // minutes
    sleep_score?: number // 0-100
  }[]
  activity_data?: {
    date: string
    calories_burned: number
    active_minutes: number
    activities?: {
      type: string
      duration: number // minutes
      calories: number
      heart_rate_avg?: number // bpm
      heart_rate_max?: number // bpm
      distance?: number // km or miles
    }[]
  }[]
  blood_pressure_data?: {
    date: string
    readings: {
      timestamp: string
      systolic: number // mmHg
      diastolic: number // mmHg
      pulse?: number // bpm
      position?: "sitting" | "standing" | "lying"
      notes?: string
    }[]
  }[]
  glucose_data?: {
    date: string
    readings: {
      timestamp: string
      value: number // mg/dL
      meal_context?: "before meal" | "after meal" | "fasting" | "bedtime"
      notes?: string
    }[]
    daily_average?: number // mg/dL
    daily_min?: number // mg/dL
    daily_max?: number // mg/dL
  }[]
  oxygen_saturation_data?: {
    date: string
    readings: {
      timestamp: string
      value: number // percentage
      notes?: string
    }[]
    daily_average?: number // percentage
  }[]
}

export interface FamilyDiseaseHistory {
  heart_disease?: FamilyMemberHistory[]
  diabetes?: FamilyMemberHistory[]
  cancer?: FamilyMemberHistory[]
  stroke?: FamilyMemberHistory[]
  hypertension?: FamilyMemberHistory[]
  high_cholesterol?: FamilyMemberHistory[]
  asthma?: FamilyMemberHistory[]
  alzheimers?: FamilyMemberHistory[]
  mental_health_disorders?: FamilyMemberHistory[]
  other_conditions?: {
    condition: string
    members: FamilyMemberHistory[]
  }[]
}

export interface FamilyMemberHistory {
  relation: "mother" | "father" | "sister" | "brother" | "grandmother" | "grandfather" | "aunt" | "uncle" | "other"
  age_at_diagnosis?: number
  current_age?: number
  deceased?: boolean
  age_at_death?: number
  severity?: "mild" | "moderate" | "severe"
  treatment?: string
  notes?: string
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
        is_prescription: true,
      },
    ],
    last_checkup_date: "2023-03-15",
    cholesterol_levels: {
      total: 195,
      hdl: 55,
      ldl: 120,
      triglycerides: 100,
      date: "2023-03-15",
      fasting: true,
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
  lifestyle_data: {
    smoking_status: "former",
    smoking_details: {
      cigarettes_per_day: 10,
      years_smoked: 5,
      quit_date: "2018-03-15",
      pack_years: 2.5,
    },
    alcohol_consumption: "occasional",
    alcohol_details: {
      drinks_per_week: 3,
      preferred_type: ["Wine", "Beer"],
      history_of_heavy_use: false,
    },
    exercise_frequency: "regular",
    exercise_details: {
      activities: ["Walking", "Swimming", "Cycling"],
      minutes_per_week: 150,
      intensity: "moderate",
    },
    diet_type: "mediterranean",
    stress_level: "moderate",
    stress_management: ["Meditation", "Reading", "Nature walks"],
    occupation: "Software Engineer",
    occupation_details: {
      job_title: "Senior Developer",
      work_environment: "remote",
      physical_activity_level: "sedentary",
      work_hours_per_week: 40,
      shift_work: false,
    },
  },
  fitness_data: {
    activity_level: "moderately_active",
    exercise_routine: {
      cardio: {
        type: ["Walking", "Swimming"],
        frequency: 3,
        duration: 30,
        intensity: "moderate",
      },
      strength: {
        type: ["Bodyweight exercises", "Resistance bands"],
        frequency: 2,
        duration: 30,
        target_muscle_groups: ["Core", "Upper body", "Lower body"],
      },
    },
    fitness_goals: ["Improve cardiovascular health", "Maintain weight", "Increase strength"],
    fitness_metrics: {
      resting_heart_rate: 68,
      body_fat_percentage: 22,
    },
  },
  nutrition_data: {
    dietary_preferences: ["Mediterranean diet", "Low sodium"],
    dietary_restrictions: ["No red meat"],
    allergies: ["Shellfish"],
    nutrition_goals: ["Reduce sodium intake", "Increase vegetable consumption"],
    hydration: {
      water_intake_target: 2000, // ml
      actual: {
        "2023-05-01": 1800,
        "2023-05-02": 2100,
      },
    },
    supplements: [
      {
        name: "Vitamin D",
        dosage: "1000 IU",
        frequency: "Daily",
        reason: "Deficiency",
        started: "2022-01-15",
      },
      {
        name: "Omega-3",
        dosage: "1000 mg",
        frequency: "Daily",
        reason: "Heart health",
        started: "2022-03-10",
      },
    ],
  },
  sleep_data: {
    average_duration: 7.5, // hours
    sleep_schedule: {
      typical_bedtime: "22:30",
      typical_wake_time: "06:00",
      consistency: "somewhat consistent",
    },
    sleep_quality: "good",
    factors_affecting_sleep: ["Stress", "Screen time before bed"],
    sleep_goals: ["Improve consistency", "Increase deep sleep"],
  },
}
