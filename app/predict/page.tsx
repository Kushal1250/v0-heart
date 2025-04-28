"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PredictionForm } from "@/components/prediction-form"
import { AssessmentConfirmation } from "@/components/assessment-confirmation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, AlertCircle, CheckCircle2, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PredictPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState("predict")

  useEffect(() => {
    // Check if this is a redirect from login
    const isFromLogin = sessionStorage.getItem("fromLogin")
    if (isFromLogin === "true") {
      setShowWelcome(true)
      // Clear the flag
      sessionStorage.removeItem("fromLogin")

      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  // If not authenticated and not loading, redirect to login
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="predict-bg-animation">
        <div className="pulse-circle pulse-circle-1"></div>
        <div className="pulse-circle pulse-circle-2"></div>
        <div className="pulse-circle pulse-circle-3"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showWelcome && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md animate-fade-in flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Login successful! Welcome to HeartPredict.</span>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-green-700 hover:text-green-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        <Tabs defaultValue="predict" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="predict">Heart Assessment</TabsTrigger>
            <TabsTrigger value="about">About Heart Disease Prediction</TabsTrigger>
          </TabsList>

          <TabsContent value="predict">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name || "User"}!</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Here you can assess your heart disease risk.</h2>
            <p className="text-gray-600 mb-8">Fill out the form below to get a personalized heart health assessment.</p>

            <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/history"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">View Assessment History</span>
                </Link>
                <Link
                  href="/predict/results"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">See Latest Results</span>
                </Link>
                <Link
                  href="/about"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Info className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Learn About HeartPredict</span>
                </Link>
              </div>
            </div>

            {!showForm ? (
              <div className="mt-8">
                <AssessmentConfirmation onConfirm={() => setShowForm(true)} />
              </div>
            ) : (
              <div className="mt-8">
                <PredictionForm />
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="bg-white shadow-sm rounded-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Heart className="h-6 w-6 text-red-500" />
                  Understanding Heart Disease Prediction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">How HeartPredict Works</h3>
                  <p className="text-gray-700 mb-4">
                    HeartPredict uses advanced machine learning algorithms to analyze your health data and predict your
                    risk of developing heart disease. Our model has been trained on extensive cardiovascular research
                    data and validated with a 95% accuracy rate.
                  </p>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">The Prediction Process</h4>
                    <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                      <li>
                        <strong>Data Collection:</strong> We gather key health metrics including age, gender, blood
                        pressure, cholesterol levels, blood sugar, and other cardiovascular indicators.
                      </li>
                      <li>
                        <strong>Risk Analysis:</strong> Our algorithm analyzes these factors against established medical
                        research to identify patterns associated with heart disease.
                      </li>
                      <li>
                        <strong>Personalized Assessment:</strong> You receive a detailed risk score and personalized
                        recommendations based on your specific health profile.
                      </li>
                      <li>
                        <strong>Ongoing Monitoring:</strong> Regular assessments help track changes in your heart health
                        over time, allowing you to see the impact of lifestyle modifications.
                      </li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Key Risk Factors</h3>
                  <p className="text-gray-700 mb-4">
                    Heart disease risk is influenced by multiple factors. Our assessment evaluates the following key
                    indicators:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Demographic Factors</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Age (risk increases with age)</li>
                        <li>Gender (men generally at higher risk)</li>
                        <li>Family history of heart disease</li>
                        <li>Ethnicity (certain groups have higher risk)</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Clinical Measurements</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Blood pressure levels</li>
                        <li>Cholesterol levels (HDL, LDL, total)</li>
                        <li>Fasting blood glucose</li>
                        <li>Resting ECG results</li>
                        <li>Maximum heart rate during exercise</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Lifestyle Factors</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Smoking status</li>
                        <li>Physical activity level</li>
                        <li>Diet and nutrition</li>
                        <li>Alcohol consumption</li>
                        <li>Stress levels</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Medical Conditions</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Diabetes</li>
                        <li>Obesity</li>
                        <li>Previous cardiovascular events</li>
                        <li>Hypertension</li>
                        <li>Sleep apnea</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Scientific Foundation</h3>
                  <p className="text-gray-700 mb-4">
                    HeartPredict is built on established cardiovascular research and validated medical data sources:
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>
                        <strong>Cleveland Heart Disease Dataset:</strong> A comprehensive collection of patient data
                        used for heart disease classification.
                      </li>
                      <li>
                        <strong>Framingham Heart Study:</strong> A long-term, ongoing cardiovascular study on residents
                        of Framingham, Massachusetts, which has identified major risk factors.
                      </li>
                      <li>
                        <strong>NHANES Database:</strong> The National Health and Nutrition Examination Survey,
                        providing statistical data about the health status of Americans.
                      </li>
                      <li>
                        <strong>European Heart Journal:</strong> Research findings from the official journal of the
                        European Society of Cardiology.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Model Validation</h4>
                    <p className="text-gray-700">Our prediction model has undergone rigorous validation through:</p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                      <li>Cross-validation against established clinical datasets</li>
                      <li>Peer review by cardiologists and healthcare professionals</li>
                      <li>
                        Comparison with traditional risk assessment tools (Framingham Risk Score, ASCVD Risk Estimator)
                      </li>
                      <li>Ongoing refinement based on new research findings</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Taking Action</h3>
                  <p className="text-gray-700 mb-4">
                    After receiving your heart disease risk assessment, we recommend the following steps:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-medium text-gray-900 mb-2">Consult Healthcare Providers</h4>
                      <p className="text-sm text-gray-700">
                        Share your assessment results with your doctor for professional medical advice and potential
                        follow-up tests.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-medium text-gray-900 mb-2">Lifestyle Modifications</h4>
                      <p className="text-sm text-gray-700">
                        Implement recommended changes to diet, exercise, and habits based on your specific risk factors.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-medium text-gray-900 mb-2">Regular Monitoring</h4>
                      <p className="text-sm text-gray-700">
                        Schedule periodic reassessments to track changes in your heart health and the effectiveness of
                        interventions.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Important Disclaimer</h4>
                        <p className="text-sm text-gray-700">
                          HeartPredict provides risk assessments for educational purposes only and is not a substitute
                          for professional medical advice, diagnosis, or treatment. Always seek the advice of your
                          physician or other qualified health provider with any questions you may have regarding a
                          medical condition.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button onClick={() => setActiveTab("predict")} className="bg-red-600 hover:bg-red-700">
                    Take Your Heart Health Assessment Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
