export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-400 mb-8">Last updated: April 25, 2024</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            HeartCare ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have
            read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Create an account</li>
            <li>Fill out a form</li>
            <li>Participate in surveys</li>
            <li>Send us feedback</li>
            <li>Use our heart disease risk assessment tool</li>
          </ul>
          <p>This information may include:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Date of birth</li>
            <li>Health information related to heart disease risk factors</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Health Information</h3>
          <p>
            Our service collects health-related information to provide heart disease risk assessments. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Age</li>
            <li>Gender</li>
            <li>Blood pressure readings</li>
            <li>Cholesterol levels</li>
            <li>Medical history related to heart conditions</li>
            <li>Lifestyle factors (smoking, exercise habits, diet)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Automatically Collected Information</h3>
          <p>When you access our service, we may automatically collect certain information, including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Operating system</li>
            <li>Usage patterns and interactions with our service</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Providing and maintaining our service</li>
            <li>Generating heart disease risk assessments</li>
            <li>Improving our service and user experience</li>
            <li>Communicating with you about updates or changes to our service</li>
            <li>Providing customer support</li>
            <li>Analyzing usage patterns to enhance our service</li>
            <li>Detecting and preventing fraudulent activities</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information from
            unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the
            Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing and Disclosure</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>With your consent</li>
            <li>With service providers who help us operate our service</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Right to access your personal information</li>
            <li>Right to correct inaccurate information</li>
            <li>Right to delete your personal information</li>
            <li>Right to restrict or object to processing</li>
            <li>Right to data portability</li>
            <li>Right to withdraw consent</li>
          </ul>
          <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
          <p>
            Our service is not intended for individuals under the age of 18. We do not knowingly collect personal
            information from children. If you are a parent or guardian and believe your child has provided us with
            personal information, please contact us.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:heartguide108@gmail.com" className="text-blue-400 hover:underline">
              heartguide108@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+919016261380" className="text-blue-400 hover:underline">
              +91 (901) 626-1380
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
