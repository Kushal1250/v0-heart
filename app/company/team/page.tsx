import { Mail, Linkedin, Twitter } from "lucide-react"

export default function TeamPage() {
  const executiveTeam = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Executive Officer",
      bio: "Dr. Chen is a cardiologist with over 15 years of experience in preventive cardiology. She founded HeartCare with the vision of making heart disease risk assessment accessible to everyone.",
      image: "/team/sarah-chen.png",
    },
    {
      name: "Michael Rodriguez",
      role: "Chief Technology Officer",
      bio: "Michael leads our engineering team, bringing 20 years of experience in healthcare technology. He previously built AI systems for major hospitals and research institutions.",
      image: "/team/michael-rodriguez.png",
    },
    {
      name: "Aisha Patel",
      role: "Chief Medical Officer",
      bio: "Dr. Patel oversees our medical research and ensures the accuracy of our risk assessment models. She is a renowned researcher in cardiovascular epidemiology.",
      image: "/team/aisha-patel.png",
    },
  ]

  const leadershipTeam = [
    {
      name: "James Wilson",
      role: "VP of Product",
      bio: "James leads our product strategy and roadmap, focusing on creating intuitive and effective heart health monitoring tools.",
      image: "/team/james-wilson.png",
    },
    {
      name: "Emily Johnson",
      role: "VP of Data Science",
      bio: "Emily leads our data science team, developing and refining the machine learning models that power our risk assessments.",
      image: "/team/emily-johnson.png",
    },
    {
      name: "Robert Chang",
      role: "VP of Business Development",
      bio: "Robert manages our partnerships and enterprise solutions, helping organizations implement HeartCare at scale.",
      image: "/team/robert-chang.png",
    },
    {
      name: "Maria Gonzalez",
      role: "VP of Customer Success",
      bio: "Maria ensures our users have an exceptional experience and receive the support they need to improve their heart health.",
      image: "/team/maria-gonzalez.png",
    },
  ]

  const advisoryBoard = [
    {
      name: "Dr. William Taylor",
      role: "Chief of Cardiology, University Medical Center",
      bio: "Dr. Taylor provides clinical guidance and helps ensure our assessments align with the latest cardiology research and practices.",
      image: "/team/william-taylor.png",
    },
    {
      name: "Dr. Lisa Chen",
      role: "Director, Institute for Preventive Cardiology",
      bio: "Dr. Chen advises on preventive cardiology strategies and helps shape our approach to risk reduction.",
      image: "/team/lisa-chen.png",
    },
    {
      name: "Professor David Kim",
      role: "AI Research Chair, Tech University",
      bio: "Professor Kim advises on our machine learning approaches and helps us stay at the cutting edge of AI in healthcare.",
      image: "/team/david-kim.png",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Meet the passionate experts behind HeartCare who are dedicated to improving heart health worldwide
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Executive Leadership</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {executiveTeam.map((member, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="h-64 bg-gray-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-lg">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-red-400 mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm mb-4">{member.bio}</p>
                  <div className="flex gap-3">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <Mail className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadershipTeam.map((member, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-lg">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-red-400 text-sm mb-2">{member.role}</p>
                  <p className="text-gray-400 text-xs">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Medical Advisory Board</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {advisoryBoard.map((member, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-lg">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-blue-400 text-sm mb-2">{member.role}</p>
                  <p className="text-gray-400 text-xs">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about improving heart health through
            technology.
          </p>
          <a
            href="/company/careers"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            View Open Positions
          </a>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Innovation</h3>
              <p className="text-gray-400 text-sm">
                We continuously push the boundaries of what's possible in heart health monitoring.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Accessibility</h3>
              <p className="text-gray-400 text-sm">
                We believe everyone deserves access to tools that can help them understand and improve their heart
                health.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Scientific Rigor</h3>
              <p className="text-gray-400 text-sm">
                We base our assessments on solid scientific evidence and continuously validate our models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
