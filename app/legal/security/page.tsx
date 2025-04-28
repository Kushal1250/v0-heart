export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Security</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-400 mb-8">Last updated: April 25, 2024</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment to Security</h2>
          <p>
            At HeartCare, we take the security of your data very seriously. We understand that health information is
            highly sensitive and personal. This document outlines the security measures we have implemented to protect
            your data.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Encryption</h2>
          <p>We use industry-standard encryption protocols to protect your data both in transit and at rest:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>All data transmitted between your device and our servers is encrypted using TLS 1.3.</li>
            <li>All sensitive data stored in our databases is encrypted using AES-256 encryption.</li>
            <li>Encryption keys are managed using a secure key management system with regular rotation.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Infrastructure Security</h2>
          <p>Our infrastructure is designed with security as a priority:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              We host our services on secure cloud providers that maintain SOC 2, ISO 27001, and other relevant
              certifications.
            </li>
            <li>Our systems are protected by firewalls and intrusion detection systems.</li>
            <li>We implement network segmentation to isolate sensitive data.</li>
            <li>Regular vulnerability scanning and penetration testing are conducted on our infrastructure.</li>
            <li>We maintain comprehensive logging and monitoring to detect and respond to security events.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Access Controls</h2>
          <p>We implement strict access controls to ensure that only authorized personnel can access sensitive data:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>All staff access is based on the principle of least privilege.</li>
            <li>Multi-factor authentication is required for all administrative access.</li>
            <li>Regular access reviews are conducted to ensure appropriate permissions.</li>
            <li>All access to sensitive data is logged and monitored.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Application Security</h2>
          <p>Our application is developed with security in mind:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>We follow secure coding practices and conduct regular code reviews.</li>
            <li>Our development process includes security testing at multiple stages.</li>
            <li>We use automated tools to scan for vulnerabilities in our code and dependencies.</li>
            <li>Regular security assessments are conducted by internal and external security experts.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Incident Response</h2>
          <p>We have a comprehensive incident response plan in place:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Our security team is available 24/7 to respond to security incidents.</li>
            <li>
              We have documented procedures for identifying, containing, eradicating, and recovering from security
              incidents.
            </li>
            <li>We conduct regular incident response drills to ensure our team is prepared.</li>
            <li>
              We are committed to transparent communication with affected users in the event of a security incident.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Compliance</h2>
          <p>We comply with relevant security standards and regulations:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>HIPAA (Health Insurance Portability and Accountability Act)</li>
            <li>GDPR (General Data Protection Regulation)</li>
            <li>SOC 2 Type II</li>
            <li>ISO 27001</li>
          </ul>
          <p>We undergo regular audits to ensure compliance with these standards and regulations.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Security Updates</h2>
          <p>We regularly update our systems and applications to address security vulnerabilities:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Critical security patches are applied promptly.</li>
            <li>We maintain a vulnerability management program to track and remediate security issues.</li>
            <li>Our systems are regularly updated to include the latest security features.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Responsible Disclosure</h2>
          <p>
            We encourage responsible disclosure of security vulnerabilities. If you discover a security vulnerability in
            our service, please report it to us at{" "}
            <a href="mailto:heartguide108@gmail.com" className="text-blue-400 hover:underline">
              heartguide108@gmail.com
            </a>
            . We will investigate all legitimate reports and do our best to quickly fix the problem.
          </p>
          <p>
            Please refer to our{" "}
            <a href="/legal/responsible-disclosure" className="text-blue-400 hover:underline">
              Responsible Disclosure Policy
            </a>{" "}
            for more information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about our security practices, please contact us at:</p>
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
