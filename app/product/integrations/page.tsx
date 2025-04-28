import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Apple Health",
      category: "Health Data",
      description: "Sync your Apple Health data with HeartCare for seamless health tracking.",
      features: ["Automatic data sync", "Import health metrics", "Track activity data"],
      icon: "🍎",
    },
    {
      name: "Google Fit",
      category: "Health Data",
      description: "Connect your Google Fit account to import fitness and health metrics.",
      features: ["Real-time data sync", "Activity tracking", "Heart rate monitoring"],
      icon: "🏃",
    },
    {
      name: "Fitbit",
      category: "Wearables",
      description: "Import data from your Fitbit device for comprehensive health monitoring.",
      features: ["Sleep data analysis", "Heart rate tracking", "Activity monitoring"],
      icon: "⌚",
    },
    {
      name: "Garmin",
      category: "Wearables",
      description: "Connect your Garmin device to enhance your heart health tracking.",
      features: ["Advanced metrics", "Exercise data", "Recovery analysis"],
      icon: "🔄",
    },
    {
      name: "Epic",
      category: "Electronic Health Records",
      description: "Integrate with Epic EHR systems for healthcare provider connectivity.",
      features: ["Secure data sharing", "Provider access", "Medical record integration"],
      icon: "🏥",
    },
    {
      name: "Cerner",
      category: "Electronic Health Records",
      description: "Connect with Cerner EHR systems to share data with your healthcare team.",
      features: ["Clinical data exchange", "Provider dashboard", "Appointment integration"],
      icon: "📊",
    },
    {
      name: "Slack",
      category: "Notifications",
      description: "Receive health alerts and reminders through Slack.",
      features: ["Custom notifications", "Team health challenges", "Wellness reminders"],
      icon: "💬",
    },
    {
      name: "Microsoft Teams",
      category: "Notifications",
      description: "Get health updates and reminders in Microsoft Teams.",
      features: ["Health bot integration", "Team wellness programs", "Calendar integration"],
      icon: "👥",
    },
    {
      name: "Zapier",
      category: "Automation",
      description: "Connect HeartCare with thousands of apps through Zapier.",
      features: ["Custom workflows", "Automated reporting", "Cross-platform integration"],
      icon: "⚡",
    },
    {
      name: "IFTTT",
      category: "Automation",
      description: "Create custom automation workflows with IFTTT.",
      features: ["Trigger-based actions", "Custom recipes", "Smart home integration"],
      icon: "🔗",
    },
    {
      name: "Strava",
      category: "Fitness",
      description: "Connect your Strava account to track exercise impact on heart health.",
      features: ["Activity import", "Cardiovascular analysis", "Training load monitoring"],
      icon: "🚴",
    },
    {
      name: "MyFitnessPal",
      category: "Nutrition",
      description: "Import nutrition data to analyze dietary impact on heart health.",
      features: ["Dietary analysis", "Nutrition tracking", "Heart-healthy recommendations"],
      icon: "🥗",
    },
  ]

  // Group integrations by category
  const categories = integrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = []
      }
      acc[integration.category].push(integration)
      return acc
    },
    {} as Record<string, typeof integrations>,
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Integrations</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Connect HeartCare with your favorite apps and devices for a comprehensive health monitoring experience
          </p>
        </div>

        {Object.entries(categories).map(([category, categoryIntegrations]) => (
          <div key={category} className="mb-16">
            <h2 className="text-2xl font-bold mb-8">{category} Integrations</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryIntegrations.map((integration, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <CardTitle>{integration.name}</CardTitle>
                      </div>
                      <div className="bg-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {integration.category}
                      </div>
                    </div>
                    <CardDescription className="mt-2">{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 text-lg">✓</span>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-4 bg-gray-800 hover:bg-gray-700">Connect</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Integration?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Our team can develop custom integrations for your specific needs. Contact us to discuss your requirements.
          </p>
          <Button className="bg-red-600 hover:bg-red-700">Request Custom Integration</Button>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Integration Process</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="font-bold mb-2">Connect</h3>
              <p className="text-gray-400 text-sm">
                Authorize HeartCare to access your app or device data through our secure OAuth process.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-400">2</span>
              </div>
              <h3 className="font-bold mb-2">Configure</h3>
              <p className="text-gray-400 text-sm">
                Customize which data is shared and how it's used in your heart health assessment.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-400">3</span>
              </div>
              <h3 className="font-bold mb-2">Benefit</h3>
              <p className="text-gray-400 text-sm">
                Enjoy enhanced insights and more accurate assessments with your integrated data.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Developer Resources</h2>
          <p className="text-gray-400 mb-6">
            Building your own integration? Check out our developer documentation and API resources.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline">API Documentation</Button>
            <Button variant="outline">Developer Portal</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
