# HeartPredict - Heart Disease Risk Assessment

A web application that uses machine learning to predict heart disease risk based on health metrics.

## Features

- User-friendly interface for inputting health metrics
- Advanced machine learning model for accurate predictions
- Detailed risk assessment results
- Educational content about heart disease risk factors

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Download the dataset and train the model:
   \`\`\`
   npm run setup
   \`\`\`
4. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

## Data Sources

The heart disease prediction model is trained on the UCI Heart Disease dataset, which includes the following features:

- age: Age in years
- sex: Sex (1 = male, 0 = female)
- cp: Chest pain type (0-3)
- trestbps: Resting blood pressure (mm Hg)
- chol: Serum cholesterol (mg/dl)
- fbs: Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)
- restecg: Resting electrocardiographic results (0-2)
- thalach: Maximum heart rate achieved
- exang: Exercise induced angina (1 = yes, 0 = no)
- oldpeak: ST depression induced by exercise relative to rest
- slope: Slope of the peak exercise ST segment (0-2)
- ca: Number of major vessels colored by fluoroscopy (0-3)
- thal: Thalassemia (0-2)
- target: Heart disease diagnosis (1 = disease, 0 = no disease)

## Technology Stack

- Next.js for frontend and API routes
- TailwindCSS for styling
- scikit-learn for machine learning model
- Python for data processing and model training

## Disclaimer

This application is for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.
\`\`\`

Let's update the package.json to include the setup script:
