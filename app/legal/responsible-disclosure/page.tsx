const ResponsibleDisclosurePage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Responsible Disclosure Policy</h1>
      <p className="mb-4">
        At [Your Company Name], we are committed to ensuring the security of our systems and data. We value the
        contributions of security researchers and others in the security community who help us identify vulnerabilities.
        This Responsible Disclosure Policy outlines our guidelines for reporting security vulnerabilities to us.
      </p>

      <h2 className="text-xl font-semibold mb-2">Reporting a Vulnerability</h2>
      <p className="mb-4">
        If you believe you have found a security vulnerability in our systems, we encourage you to report it to us
        immediately. Please provide us with the following information:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>A detailed description of the vulnerability</li>
        <li>Steps to reproduce the vulnerability</li>
        <li>The affected system or application</li>
        <li>Your contact information (so we can reach you for clarification)</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Our Commitment</h2>
      <p className="mb-4">We will make every effort to:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Acknowledge receipt of your report promptly</li>
        <li>Investigate the vulnerability and take appropriate steps to address it</li>
        <li>Keep you informed of our progress</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Guidelines</h2>
      <p className="mb-4">We ask that you:</p>
      <ul className="list-disc list-inside mb-4">
        <li>
          Do not exploit the vulnerability or disclose it to the public until we have had a reasonable opportunity to
          address it.
        </li>
        <li>Do not intentionally access or modify data that does not belong to you.</li>
        <li>Do not disrupt our services or systems.</li>
        <li>Act in good faith and avoid causing harm or damage.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
      <p className="mb-4">Please submit vulnerability reports to:</p>
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

      <h2 className="text-xl font-semibold mb-2">Safe Harbor</h2>
      <p>
        We consider activities conducted consistent with this policy to constitute "authorized" conduct and will not
        initiate legal action against you for such activities. If legal action is initiated by a third party against you
        in connection with activities conducted in accordance with this policy, we will take steps to make it known that
        your actions were conducted pursuant to and in compliance with this policy.
      </p>
    </div>
  )
}

export default ResponsibleDisclosurePage
