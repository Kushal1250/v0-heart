import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PartnersPage() {
  const healthcarePartners = [
    {
      name: "Metropolitan Medical Center",
      description:
        "A leading hospital network implementing HeartCare's risk assessment tools across their cardiology departments.",
      logo: "/placeholder.svg?height=80&width=200&query=hospital logo",
      type: "Hospital Network",
    },
    {
      name: "Heartland Health Alliance",
      description:
        "A network of rural clinics using HeartCare to extend preventive cardiology services to underserved communities.",
      logo: "/placeholder.svg?height=80&width=200&query=clinic logo",
      type: "Healthcare Provider",
    },
    {
      name: "CardioExcellence Institute",
      description:
        "A specialized cardiac care center integrating HeartCare's technology into their patient care protocols.",
      logo: "/placeholder.svg?height=80&width=200&query=cardiology logo",
      type: "Specialty Care",
    },
    {
      name: "Global Health Initiative",
      description:
        "An international non-profit organization partnering with HeartCare to improve heart health in developing countries.",
      logo: "/placeholder.svg?height=80&width=200&query=nonprofit logo",
      type: "Non-Profit",
    },
  ]

  const technologyPartners = [
    {
      name: "HealthTech Solutions",
      description:
        "Integration partner providing seamless connectivity between HeartCare and electronic health record systems.",
      logo: "/placeholder.svg?height=80&width=200&query=tech company logo",
      type: "Integration",
    },
    {
      name: "DataSense AI",
      description:
        "AI research partner collaborating on advanced machine learning algorithms for heart disease prediction.",
      logo: "/placeholder.svg?height=80&width=200&query=AI company logo",
      type: "AI & Machine Learning",
    },
    {
      name: "SecureHealth Cloud",
      description: "Cloud infrastructure partner ensuring HIPAA-compliant data storage and processing for HeartCare.",
      logo: "/placeholder.svg?height=80&width=200&query=cloud company logo",
      type: "Infrastructure",
    },
  ]

  const researchPartners = [
    {
      name: "University Medical Research",
      description: "Academic research partner conducting clinical validation studies of HeartCare's prediction models.",
      logo: "/placeholder.svg?height=80&width=200&query=university logo",
      type: "Academic",
    },
    {
      name: "Cardiovascular Research Institute",
      description:
        "Research institute collaborating on longitudinal studies of heart disease risk factors and prevention.",
      logo: "/placeholder.svg?height=80&width=200&query=research institute logo",
      type: "Research Institute",
    },
    {
      name: "Global Heart Health Consortium",
      description: "International research consortium working with HeartCare on global heart health initiatives.",
      logo: "/placeholder.svg?height=80&width=200&query=consortium logo",
      type: "Consortium",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Our Partners</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Collaborating with leading organizations to advance heart health worldwide
          </p>
        </div>

        {/* Healthcare Partners */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Healthcare Partners</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {healthcarePartners.map((partner, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{partner.name}</CardTitle>
                      <CardDescription>{partner.type}</CardDescription>
                    </div>
                    <div className="h-12 w-24 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">Logo</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Partners */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Technology Partners</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {technologyPartners.map((partner, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{partner.name}</CardTitle>
                      <CardDescription>{partner.type}</CardDescription>
                    </div>
                    <div className="h-10 w-20 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">Logo</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Research Partners */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Research Partners</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {researchPartners.map((partner, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{partner.name}</CardTitle>
                      <CardDescription>{partner.type}</CardDescription>
                    </div>
                    <div className="h-10 w-20 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">Logo</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Programs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Partnership Programs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Healthcare Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Partner with HeartCare to integrate our risk assessment tools into your healthcare practice or
                  hospital system.
                </p>
                <ul className="space-y-2 text-gray-400 text-sm mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Seamless EHR integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Provider dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Patient management tools</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Research Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Collaborate with our data science team on research projects related to heart disease prediction and
                  prevention.
                </p>
                <ul className="space-y-2 text-gray-400 text-sm mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Access to anonymized datasets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Joint publication opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Research grants available</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Technology Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Integrate HeartCare's API into your health technology platform or wearable device.
                </p>
                <ul className="space-y-2 text-gray-400 text-sm mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Comprehensive API documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Developer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span>Custom integration solutions</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Become a Partner */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Become a Partner</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Interested in partnering with HeartCare? We're always looking for organizations that share our mission of
            improving heart health worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">Contact Partnership Team</Button>
            <Button variant="outline">Download Partnership Guide</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
