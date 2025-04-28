import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ServerModelExplanation() {
  const features = [
    {
      name: "Age",
      description: "Patient's age in years",
      impact: "Higher age increases risk",
    },
    {
      name: "Sex",
      description: "Patient's gender (0 = female, 1 = male)",
      impact: "Males have statistically higher risk",
    },
    {
      name: "Chest Pain Type",
      description: "Type of chest pain experienced",
      impact: "Non-typical angina may indicate higher risk",
    },
    {
      name: "Blood Pressure",
      description: "Resting blood pressure in mm Hg",
      impact: "Higher values increase risk",
    },
    {
      name: "Cholesterol",
      description: "Serum cholesterol in mg/dl",
      impact: "Higher values increase risk",
    },
    {
      name: "Fasting Blood Sugar",
      description: "Fasting blood sugar > 120 mg/dl",
      impact: "Higher values may increase risk",
    },
    {
      name: "Resting ECG",
      description: "Resting electrocardiographic results",
      impact: "Abnormalities may indicate higher risk",
    },
    {
      name: "Maximum Heart Rate",
      description: "Maximum heart rate achieved",
      impact: "Lower max heart rate may indicate higher risk",
    },
    {
      name: "Exercise Induced Angina",
      description: "Angina induced by exercise",
      impact: "Presence increases risk",
    },
    {
      name: "ST Depression",
      description: "ST depression induced by exercise relative to rest",
      impact: "Higher values increase risk",
    },
    {
      name: "Slope of ST Segment",
      description: "Slope of peak exercise ST segment",
      impact: "Downsloping indicates higher risk",
    },
    {
      name: "Number of Major Vessels",
      description: "Number of major vessels colored by fluoroscopy",
      impact: "More vessels indicate higher risk",
    },
    {
      name: "Thalassemia",
      description: "Blood disorder called thalassemia",
      impact: "Certain types indicate higher risk",
    },
  ]

  // Server-side version always renders the full table
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Understanding the Heart Disease Prediction Model</CardTitle>
        <CardDescription>Our model uses the following features to predict heart disease risk</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Impact on Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{feature.name}</TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>{feature.impact}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
