import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DataDeletionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Data Deletion Policy</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Facebook Data Deletion</CardTitle>
          <CardDescription>How to delete your data associated with our Facebook integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We respect your privacy and provide multiple ways to delete your data from our application. If you've used
            Facebook to log in to our service, you can request deletion of your data in the following ways:
          </p>

          <h3 className="text-lg font-medium mt-4">Option 1: Delete Through Facebook</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to your Facebook Account Settings</li>
            <li>Navigate to "Apps and Websites"</li>
            <li>Find our application in the list</li>
            <li>Click "Remove" to revoke access and request data deletion</li>
          </ol>

          <h3 className="text-lg font-medium mt-4">Option 2: Delete Through Our Application</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Log in to your account</li>
            <li>Go to Profile Settings</li>
            <li>Click on "Delete Account"</li>
            <li>Confirm your decision</li>
          </ol>

          <h3 className="text-lg font-medium mt-4">Option 3: Contact Us</h3>
          <p>
            If you're having trouble deleting your data through the methods above, please contact our support team at{" "}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
            .
          </p>

          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium">What We Delete</h4>
            <p className="mt-2">
              When you request data deletion, we remove all personal information associated with your account,
              including:
            </p>
            <ul className="list-disc list-inside mt-2">
              <li>Profile information</li>
              <li>Health predictions and history</li>
              <li>Authentication data</li>
              <li>Usage data</li>
            </ul>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Note: We may retain certain information as required by law or for legitimate business purposes, such as
            basic analytics data that has been anonymized.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
