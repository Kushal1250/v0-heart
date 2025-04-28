export default function HIPAACompliancePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">HIPAA Compliance</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-400 mb-8">Last updated: April 25, 2024</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            HeartCare is committed to ensuring the privacy and security of protected health information (PHI) in
            compliance with the Health Insurance Portability and Accountability Act (HIPAA). This document outlines our
            approach to HIPAA compliance and the measures we have implemented to protect PHI.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Our HIPAA Compliance Program</h2>
          <p>
            Our HIPAA compliance program is designed to meet the requirements of the HIPAA Privacy Rule, Security Rule,
            and Breach Notification Rule. We have implemented administrative, physical, and technical safeguards to
            protect the confidentiality, integrity, and availability of PHI.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Administrative Safeguards</h2>
          <p>We have implemented the following administrative safeguards:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Designation of a Privacy Officer and Security Officer responsible for HIPAA compliance</li>
            <li>Comprehensive HIPAA policies and procedures</li>
            <li>Regular risk assessments and management processes</li>
            <li>Workforce training on HIPAA requirements and our policies</li>
            <li>Business Associate Agreements with all vendors who may access PHI</li>
            <li>Incident response and breach notification procedures</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Physical Safeguards</h2>
          <p>We have implemented the following physical safeguards:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Facility access controls to limit physical access to our systems</li>
            <li>Workstation security measures to protect devices that may access PHI</li>
            <li>Device and media controls for the receipt and removal of hardware and electronic media</li>
            <li>Secure disposal procedures for PHI in physical form</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Technical Safeguards</h2>
          <p>We have implemented the following technical safeguards:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access controls to limit electronic access to PHI to authorized users</li>
            <li>Audit controls to record and examine activity in systems that contain PHI</li>
            <li>Integrity controls to ensure that PHI is not improperly altered or destroyed</li>
            <li>Transmission security measures to protect PHI when transmitted over electronic networks</li>
            <li>Authentication mechanisms to verify that the person seeking access to PHI is authorized</li>
            <li>Encryption of PHI at rest and in transit</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Business Associate Agreements</h2>
          <p>
            As a business associate to covered entities, we enter into Business Associate Agreements (BAAs) that
            establish the permitted and required uses and disclosures of PHI. We also require BAAs from our
            subcontractors who handle PHI on our behalf.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Breach Notification</h2>
          <p>
            In the event of a breach of unsecured PHI, we will notify affected individuals, the Secretary of Health and
            Human Services, and, in certain circumstances, the media, in accordance with the HIPAA Breach Notification
            Rule. Our breach notification procedures include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Risk assessment to determine if a breach has occurred</li>
            <li>Timely notification to affected individuals (within 60 days)</li>
            <li>Notification to the Secretary of HHS</li>
            <li>Notification to prominent media outlets for breaches affecting more than 500 individuals</li>
            <li>Documentation of breaches and the response taken</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Patient Rights</h2>
          <p>We respect and support the following HIPAA rights for individuals:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Right to access their PHI</li>
            <li>Right to request amendments to their PHI</li>
            <li>Right to an accounting of disclosures of their PHI</li>
            <li>Right to request restrictions on certain uses and disclosures of their PHI</li>
            <li>Right to request confidential communications</li>
            <li>Right to receive a Notice of Privacy Practices</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Ongoing Compliance</h2>
          <p>We maintain an ongoing HIPAA compliance program that includes:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Regular risk assessments and audits</li>
            <li>Periodic review and updates to policies and procedures</li>
            <li>Ongoing workforce training</li>
            <li>Monitoring of security incidents and breaches</li>
            <li>Evaluation of the effectiveness of security measures</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about our HIPAA compliance program or would like to exercise your rights under
            HIPAA, please contact our Privacy Officer at:
          </p>
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
