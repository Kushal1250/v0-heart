export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Accessibility Statement</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-400 mb-8">Last updated: April 25, 2024</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment to Accessibility</h2>
          <p>
            HeartCare is committed to ensuring digital accessibility for people with disabilities. We are continually
            improving the user experience for everyone and applying the relevant accessibility standards.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve
            accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and
            Level AAA.
          </p>
          <p>
            HeartCare is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the
            content do not fully conform to the accessibility standard.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Accessibility Features</h2>
          <p>HeartCare includes the following accessibility features:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Semantic HTML to ensure proper structure and navigation</li>
            <li>ARIA landmarks to identify regions of a page</li>
            <li>Alt text for all informative images</li>
            <li>Sufficient color contrast ratios</li>
            <li>Keyboard accessibility for all interactive elements</li>
            <li>Resizable text without loss of content or functionality</li>
            <li>Clear focus indicators for keyboard navigation</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Known Accessibility Issues</h2>
          <p>
            Despite our best efforts to ensure accessibility of HeartCare, there may be some limitations. Below is a
            description of known limitations, and potential solutions. Please contact us if you observe an issue not
            listed below.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Complex data visualizations:</strong> Some of our heart health data visualizations may be
              difficult to interpret using screen readers. We are working on providing alternative text descriptions and
              tabular data for these visualizations.
            </li>
            <li>
              <strong>PDF documents:</strong> Some of our older PDF documents may not be fully accessible. We are in the
              process of remediating these documents and providing accessible alternatives.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of HeartCare. Please let us know if you encounter
            accessibility barriers:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Email:{" "}
              <a href="mailto:heartguide108@gmail.com" className="text-blue-400 hover:underline">
                heartguide108@gmail.com
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href="tel:+919016261380" className="text-blue-400 hover:underline">
                +91 (901) 626-1380
              </a>
            </li>
          </ul>
          <p>
            We try to respond to feedback within 3 business days and aim to fix accessibility issues as quickly as
            possible.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Compatibility with Browsers and Assistive Technology</h2>
          <p>HeartCare is designed to be compatible with the following assistive technologies:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>JAWS (latest version)</li>
            <li>NVDA (latest version)</li>
            <li>VoiceOver (latest version)</li>
            <li>TalkBack (latest version)</li>
          </ul>
          <p>HeartCare is designed to be compatible with the following browsers:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Chrome (latest version)</li>
            <li>Firefox (latest version)</li>
            <li>Safari (latest version)</li>
            <li>Edge (latest version)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Technical Specifications</h2>
          <p>
            Accessibility of HeartCare relies on the following technologies to work with the particular combination of
            web browser and any assistive technologies or plugins installed on your computer:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>HTML</li>
            <li>WAI-ARIA</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
          <p>These technologies are relied upon for conformance with the accessibility standards used.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Assessment Approach</h2>
          <p>HeartCare assessed the accessibility of our website by the following approaches:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Self-evaluation</li>
            <li>External evaluation</li>
            <li>User testing with assistive technologies</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Legal Disclaimer</h2>
          <p>
            HeartCare is committed to making our website accessible, in accordance with applicable laws and regulations.
            If you experience any difficulties accessing our website, please contact us for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}
