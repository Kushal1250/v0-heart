export type PredictionResult = {
  riskLevel: "High" | "Moderate" | "Low"
  probability: number
  age: number
  sex: number
  trestbps: number
  chol: number
  cp: number
  fbs: number
  restecg: number
  thalach: number
  exang: number
  oldpeak: number
  slope: number
  ca: number
  thal: number
  foodHabits: string
  junkFood: string
  sleepingHours: number
}
