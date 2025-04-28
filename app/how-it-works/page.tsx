"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Info,
  Activity,
  Heart,
  Database,
  Shield,
  Award,
  FileText,
  BarChartIcon as ChartBar,
  Users,
  Code,
} from "lucide-react"
import Image from "next/image"

export default function HowItWorksPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6">How HeartPredict Works</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Our advanced AI-powered platform uses machine learning models trained on extensive heart disease datasets to
            provide accurate risk assessments and personalized health insights.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Input Your Data</h3>
              <p className="text-gray-300">
                Provide your health metrics through our simple and secure form. We collect essential parameters like
                age, cholesterol levels, blood pressure, and lifestyle factors.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Advanced Analysis</h3>
              <p className="text-gray-300">
                Our model analyzes your data using patterns learned from thousands of clinical cases, applying
                sophisticated algorithms to identify risk factors and correlations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Get Your Results</h3>
              <p className="text-gray-300">
                Receive an instant assessment of your heart disease risk, complete with personalized recommendations and
                actionable insights to improve your heart health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Background */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Project Background</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-4">The HeartPredict Story</h3>
              <p className="text-gray-700 mb-4">
                HeartPredict was developed in response to the growing global burden of cardiovascular disease, which
                remains the leading cause of death worldwide. Our team of cardiologists, data scientists, and healthcare
                professionals came together with a shared mission: to create an accessible tool that could help identify
                heart disease risk early and empower individuals to take preventive action.
              </p>
              <p className="text-gray-700">
                The project began in 2020 with a comprehensive analysis of multiple heart disease datasets and
                collaboration with leading medical institutions. After extensive development and validation,
                HeartPredict launched as a user-friendly platform that brings clinical-grade risk assessment to
                everyone.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/heart-health-dashboard.png"
                alt="HeartPredict Dashboard"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/vibrant-heart-motion.png"
                  alt="Heart Health Visualization"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-700 mb-4">
                HeartPredict aims to democratize access to heart health assessment tools, making it possible for anyone
                to understand their cardiovascular risk factors without expensive medical tests or consultations.
              </p>
              <p className="text-gray-700">
                By combining cutting-edge AI technology with established medical knowledge, we're working to reduce the
                global burden of heart disease through early detection and prevention. Our goal is to empower
                individuals with knowledge about their heart health so they can make informed lifestyle choices and seek
                appropriate medical care when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Technical Framework</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl font-bold">Data Sources & Processing</h3>
              </div>
              <p className="text-gray-700 mb-4">HeartPredict's model is trained on multiple datasets, including:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Cleveland Heart Disease Dataset from the UCI Machine Learning Repository</li>
                <li>Framingham Heart Study data</li>
                <li>NHANES (National Health and Nutrition Examination Survey)</li>
                <li>Proprietary anonymized clinical data from partner institutions</li>
              </ul>
              <p className="text-gray-700">
                Our data processing pipeline includes rigorous cleaning, normalization, and feature engineering to
                ensure the highest quality input for our models.
              </p>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <Code className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl font-bold">Machine Learning Model</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Our prediction system employs an ensemble approach combining multiple algorithms:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Gradient Boosting Decision Trees for feature importance and primary prediction</li>
                <li>Neural Networks for pattern recognition in complex health data</li>
                <li>Random Forests for robust classification and handling missing data</li>
                <li>Logistic Regression for interpretable baseline predictions</li>
              </ul>
              <p className="text-gray-700">
                The final model achieves 95% accuracy on validation datasets, with regular retraining to incorporate new
                medical research findings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl font-bold">Data Security & Privacy</h3>
              </div>
              <p className="text-gray-700 mb-4">
                HeartPredict implements comprehensive security measures to protect your health data:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>End-to-end encryption for all data transmission</li>
                <li>HIPAA-compliant data storage and processing</li>
                <li>Regular security audits and penetration testing</li>
                <li>Strict access controls and authentication protocols</li>
                <li>Data anonymization for research and model improvement</li>
              </ul>
              <p className="text-gray-700">
                We never share your personal health information with third parties without your explicit consent.
              </p>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl font-bold">Validation & Certification</h3>
              </div>
              <p className="text-gray-700 mb-4">Our model has undergone rigorous validation processes:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Cross-validation against multiple independent datasets</li>
                <li>Blind testing with real patient data from clinical partners</li>
                <li>Comparison with established clinical risk scores (Framingham, ASCVD)</li>
                <li>Peer review by cardiologists and healthcare professionals</li>
              </ul>
              <p className="text-gray-700">
                While HeartPredict provides valuable insights, it is designed as a supplementary tool and not a
                replacement for professional medical advice or diagnosis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Factors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Key Risk Factors We Analyze</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Risk Factor 1 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-primary">Demographic Factors</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Age</li>
                <li>Sex</li>
                <li>Family history of heart disease</li>
                <li>Ethnicity</li>
              </ul>
            </div>

            {/* Risk Factor 2 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-primary">Clinical Measurements</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Blood pressure (systolic/diastolic)</li>
                <li>Cholesterol levels (HDL, LDL, total)</li>
                <li>Blood glucose levels</li>
                <li>Body Mass Index (BMI)</li>
                <li>Resting heart rate</li>
              </ul>
            </div>

            {/* Risk Factor 3 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-primary">Lifestyle Factors</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Smoking status</li>
                <li>Physical activity level</li>
                <li>Alcohol consumption</li>
                <li>Diet quality</li>
                <li>Stress levels</li>
              </ul>
            </div>

            {/* Risk Factor 4 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-primary">Medical Conditions</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Diabetes</li>
                <li>Hypertension</li>
                <li>Previous cardiovascular events</li>
                <li>Kidney disease</li>
                <li>Sleep apnea</li>
              </ul>
            </div>

            {/* Risk Factor 5 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-primary">Cardiac Symptoms</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Chest pain types</li>
                <li>Exercise-induced angina</li>
                <li>ST depression on ECG</li>
                <li>Heart rate abnormalities</li>
                <li>Shortness of breath</li>
              </ul>
            </div>

            {/* Risk Factor 6 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-primary">Advanced Biomarkers</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>C-reactive protein</li>
                <li>Troponin levels</li>
                <li>BNP (Brain Natriuretic Peptide)</li>
                <li>Homocysteine</li>
                <li>Lipoprotein(a)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Output & Recommendations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Understanding Your Results</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-4">
                <ChartBar className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl font-bold">Risk Assessment</h3>
              </div>
              <p className="text-gray-700 mb-4">HeartPredict provides a comprehensive risk assessment that includes:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <span className="font-semibold">Overall Risk Score:</span> A percentage indicating your likelihood of
                  developing heart disease in the next 10 years
                </li>
                <li>
                  <span className="font-semibold">Risk Category:</span> Classification as Low, Moderate, or High risk
                </li>
                <li>
                  <span className="font-semibold">Comparative Analysis:</span> How your risk compares to others in your
                  age group and demographic
                </li>
                <li>
                  <span className="font-semibold">Key Risk Factors:</span> Identification of your specific risk factors,
                  ranked by importance
                </li>
                <li>
                  <span className="font-semibold">Risk Trajectory:</span> Projection of how your risk may change over
                  time with and without interventions
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold mb-4 text-center">Sample Risk Assessment</h4>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Overall Risk Score</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-amber-500 h-4 rounded-full" style={{ width: "27%" }}></div>
                </div>
                <p className="text-right text-sm font-medium">27% (Moderate Risk)</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">High Blood Pressure</span>
                  <span className="text-sm font-medium text-red-500">High Impact</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cholesterol Levels</span>
                  <span className="text-sm font-medium text-amber-500">Medium Impact</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Physical Activity</span>
                  <span className="text-sm font-medium text-amber-500">Medium Impact</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Family History</span>
                  <span className="text-sm font-medium text-green-500">Low Impact</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold mb-4 text-center">Personalized Recommendations</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-sm">Schedule a blood pressure check with your doctor within 30 days</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-sm">Increase physical activity to 150 minutes per week</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-sm">Reduce sodium intake to less than 2,300mg daily</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-sm">Consider a lipid panel test in the next 3 months</span>
                </li>
              </ul>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-2xl font-bold">Personalized Recommendations</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Based on your specific risk profile, HeartPredict generates tailored recommendations in several key
                areas:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <span className="font-semibold">Medical Follow-up:</span> Suggestions for tests, screenings, or
                  consultations with healthcare providers
                </li>
                <li>
                  <span className="font-semibold">Lifestyle Modifications:</span> Specific changes to diet, exercise,
                  and habits that could reduce your risk
                </li>
                <li>
                  <span className="font-semibold">Monitoring Schedule:</span> Recommended frequency for checking vital
                  signs and biomarkers
                </li>
                <li>
                  <span className="font-semibold">Educational Resources:</span> Curated content to help you understand
                  and manage your specific risk factors
                </li>
                <li>
                  <span className="font-semibold">Risk Reduction Targets:</span> Specific goals for metrics like blood
                  pressure, cholesterol, and weight
                </li>
              </ul>
              <p className="text-gray-700 italic">
                Note: All recommendations are evidence-based and aligned with current clinical guidelines, but should be
                discussed with your healthcare provider before implementation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Development */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Research & Development</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-4">Ongoing Research</h3>
              <p className="text-gray-700 mb-4">
                HeartPredict is continuously evolving through active research initiatives:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Integration of genomic data to enhance prediction accuracy</li>
                <li>Development of population-specific models for diverse ethnic groups</li>
                <li>Incorporation of wearable device data for real-time monitoring</li>
                <li>Longitudinal studies to validate long-term prediction accuracy</li>
                <li>Exploration of novel biomarkers for early disease detection</li>
              </ul>
              <p className="text-gray-700">
                Our research team collaborates with academic institutions and healthcare organizations worldwide to
                advance cardiovascular risk prediction science.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/microscopic-discovery.png"
                alt="Heart Research"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h3 className="text-2xl font-bold">Our Expert Team</h3>
            </div>
            <p className="text-gray-700 mb-6">
              HeartPredict is developed by a multidisciplinary team of experts committed to advancing cardiovascular
              health:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                  <Image
                    src="/confident-cardiologist.png"
                    alt="Cardiologist"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold">Cardiologists</h4>
                <p className="text-sm text-gray-600">Clinical expertise and medical validation</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                  <Image
                    src="/focused-data-scientist.png"
                    alt="Data Scientist"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold">Data Scientists</h4>
                <p className="text-sm text-gray-600">Model development and statistical analysis</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                  <Image
                    src="/focused-engineer.png"
                    alt="Software Engineer"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold">Software Engineers</h4>
                <p className="text-sm text-gray-600">Platform development and security</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                  <Image
                    src="/compassionate-doctor-consultation.png"
                    alt="Healthcare Advisor"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold">Healthcare Advisors</h4>
                <p className="text-sm text-gray-600">Public health and patient education</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Assess Your Heart Health?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Take the first step toward better heart health by getting your personalized risk assessment today.
          </p>
          <div className="flex justify-center">
            <a
              href="/predict"
              className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-md transition-colors duration-300"
            >
              Start Assessment
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
