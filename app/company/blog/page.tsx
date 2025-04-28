import Link from "next/link"
import { Calendar, User, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const blogPosts = [
    {
      title: "Understanding Heart Disease Risk Factors You Can Control",
      excerpt:
        "While some risk factors like age and family history can't be changed, many others are within your control. Learn about the modifiable risk factors that can significantly impact your heart health.",
      date: "April 20, 2024",
      author: "Dr. Sarah Chen",
      category: "Heart Health",
      image: "/healthy-heart-lifestyle.png",
      slug: "understanding-heart-disease-risk-factors",
    },
    {
      title: "The Connection Between Stress and Heart Health",
      excerpt:
        "Chronic stress can take a toll on your cardiovascular system. Discover the physiological mechanisms behind stress-related heart issues and effective strategies to manage stress.",
      date: "April 15, 2024",
      author: "Dr. Michael Rodriguez",
      category: "Lifestyle",
      image: "/balanced-life.png",
      slug: "connection-between-stress-and-heart-health",
    },
    {
      title: "Heart-Healthy Diet: Beyond the Basics",
      excerpt:
        "A heart-healthy diet is more than just avoiding certain foods. Learn about the latest research on nutrition for optimal heart health and practical tips for implementing dietary changes.",
      date: "April 8, 2024",
      author: "Aisha Patel, RD",
      category: "Nutrition",
      image: "/vibrant-healthy-meal.png",
      slug: "heart-healthy-diet-beyond-basics",
    },
    {
      title: "Exercise and Heart Health: Finding the Right Balance",
      excerpt:
        "Regular physical activity is crucial for heart health, but finding the right type and amount of exercise can be challenging. Explore evidence-based recommendations for heart-healthy exercise.",
      date: "April 1, 2024",
      author: "James Wilson, PT",
      category: "Exercise",
      image: "/vibrant-heart-motion.png",
      slug: "exercise-and-heart-health-balance",
    },
    {
      title: "The Latest Advances in Heart Disease Prevention",
      excerpt:
        "Medical science continues to evolve in understanding and preventing heart disease. Learn about the most recent breakthroughs and how they might impact your heart health strategy.",
      date: "March 25, 2024",
      author: "Dr. Lisa Chen",
      category: "Research",
      image: "/microscopic-discovery.png",
      slug: "latest-advances-heart-disease-prevention",
    },
    {
      title: "Heart Health Across the Lifespan: Age-Specific Considerations",
      excerpt:
        "Heart health needs change throughout life. Discover the specific considerations and recommendations for different age groups, from childhood to older adulthood.",
      date: "March 18, 2024",
      author: "Dr. William Taylor",
      category: "Preventive Care",
      image: "/placeholder.svg?height=200&width=400&query=aging heart health",
      slug: "heart-health-across-lifespan",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Heart Health Blog</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Expert insights, research updates, and practical advice for maintaining optimal heart health
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-center p-6">
                    <span className="bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded">Featured</span>
                    <h2 className="text-2xl md:text-3xl font-bold mt-4">Artificial Intelligence in Cardiac Care</h2>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <CardDescription className="text-gray-400 mb-2">April 22, 2024 • Research & Technology</CardDescription>
                <CardTitle className="text-2xl mb-4">
                  How AI is Revolutionizing Heart Disease Prediction and Treatment
                </CardTitle>
                <p className="text-gray-300 mb-6">
                  Artificial intelligence is transforming cardiac care, from early detection to personalized treatment
                  plans. This article explores the latest AI applications in cardiology and how they're improving
                  patient outcomes.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">Dr. David Kim</span>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700">Read Article</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-800 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
                  <span className="text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded">{post.category}</span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3" /> {post.date} • <User className="h-3 w-3" /> {post.author}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Link
                  href={`/company/blog/${post.slug}`}
                  className="text-red-500 hover:text-red-400 text-sm flex items-center"
                >
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="rounded-full">
              All Topics
            </Button>
            <Button variant="outline" className="rounded-full">
              Heart Health
            </Button>
            <Button variant="outline" className="rounded-full">
              Nutrition
            </Button>
            <Button variant="outline" className="rounded-full">
              Exercise
            </Button>
            <Button variant="outline" className="rounded-full">
              Research
            </Button>
            <Button variant="outline" className="rounded-full">
              Lifestyle
            </Button>
            <Button variant="outline" className="rounded-full">
              Prevention
            </Button>
            <Button variant="outline" className="rounded-full">
              Technology
            </Button>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Stay updated with the latest heart health research, tips, and news. Our newsletter is delivered monthly and
            you can unsubscribe at any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Button className="bg-red-600 hover:bg-red-700 whitespace-nowrap">Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
