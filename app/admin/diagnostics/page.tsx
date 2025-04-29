export default function DiagnosticsPage() {
  // Get environment variable status (server-side only)
  const twilioConfigured =
    !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_PHONE_NUMBER

  const emailConfigured =
    !!process.env.EMAIL_SERVER && !!process.env.EMAIL_PORT && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">System Diagnostics</h1>
      <p className="text-gray-600 mb-8">This page provides diagnostic information about the system configuration.</p>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">SMS Configuration</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-100 p-2 rounded">TWILIO_ACCOUNT_SID</div>
            <div className={process.env.TWILIO_ACCOUNT_SID ? "text-green-600" : "text-red-600"}>
              {process.env.TWILIO_ACCOUNT_SID ? "Configured" : "Missing"}
            </div>

            <div className="bg-gray-100 p-2 rounded">TWILIO_AUTH_TOKEN</div>
            <div className={process.env.TWILIO_AUTH_TOKEN ? "text-green-600" : "text-red-600"}>
              {process.env.TWILIO_AUTH_TOKEN ? "Configured" : "Missing"}
            </div>

            <div className="bg-gray-100 p-2 rounded">TWILIO_PHONE_NUMBER</div>
            <div className={process.env.TWILIO_PHONE_NUMBER ? "text-green-600" : "text-red-600"}>
              {process.env.TWILIO_PHONE_NUMBER ? "Configured" : "Missing"}
            </div>
          </div>

          <div className="mt-2">
            <span className="font-medium">Status: </span>
            {twilioConfigured ? (
              <span className="text-green-600">Fully Configured</span>
            ) : (
              <span className="text-red-600">Missing Configuration</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Email Configuration</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-100 p-2 rounded">EMAIL_SERVER</div>
            <div className={process.env.EMAIL_SERVER ? "text-green-600" : "text-red-600"}>
              {process.env.EMAIL_SERVER ? "Configured" : "Missing"}
            </div>

            <div className="bg-gray-100 p-2 rounded">EMAIL_PORT</div>
            <div className={process.env.EMAIL_PORT ? "text-green-600" : "text-red-600"}>
              {process.env.EMAIL_PORT ? "Configured" : "Missing"}
            </div>

            <div className="bg-gray-100 p-2 rounded">EMAIL_USER</div>
            <div className={process.env.EMAIL_USER ? "text-green-600" : "text-red-600"}>
              {process.env.EMAIL_USER ? "Configured" : "Missing"}
            </div>

            <div className="bg-gray-100 p-2 rounded">EMAIL_PASSWORD</div>
            <div className={process.env.EMAIL_PASSWORD ? "text-green-600" : "text-red-600"}>
              {process.env.EMAIL_PASSWORD ? "Configured" : "Missing"}
            </div>
          </div>

          <div className="mt-2">
            <span className="font-medium">Status: </span>
            {emailConfigured ? (
              <span className="text-green-600">Fully Configured</span>
            ) : (
              <span className="text-red-600">Missing Configuration</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Guide</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-amber-600">SMS not being sent</h3>
            <p className="text-gray-600 ml-4">
              Ensure all Twilio environment variables are set correctly. Verify your Twilio account has sufficient
              credits and the phone number is verified in trial accounts.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-amber-600">Email not being sent</h3>
            <p className="text-gray-600 ml-4">
              Check that all email configuration variables are set correctly. Make sure the email server allows
              connections from your deployment environment.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-blue-600">Development vs. Production</h3>
            <p className="text-gray-600 ml-4">
              In development mode, SMS and email messages are simulated and logged to the console. In production, they
              are sent via their respective services.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <p className="text-gray-600">
          For more detailed diagnostics and testing functionality, please contact the system administrator. Interactive
          testing features will be added in a future update.
        </p>
      </div>
    </div>
  )
}
