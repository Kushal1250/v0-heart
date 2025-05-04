export default function NoJSFallback() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">JavaScript Required</h1>
        <p className="mb-6">
          HeartPredict requires JavaScript to function properly. Please enable JavaScript in your browser settings and
          reload the page.
        </p>
        <div className="p-4 bg-gray-100 rounded-lg text-left">
          <h2 className="font-semibold mb-2">How to enable JavaScript:</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>Chrome:</strong> Settings → Privacy and security → Site Settings → JavaScript → Allow
            </li>
            <li>
              <strong>Firefox:</strong> Options → Privacy & Security → Permissions → Enable JavaScript
            </li>
            <li>
              <strong>Safari:</strong> Preferences → Security → Enable JavaScript
            </li>
            <li>
              <strong>Edge:</strong> Settings → Cookies and site permissions → JavaScript → Allowed
            </li>
          </ul>
        </div>
        <a
          href="/"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </a>
      </div>
    </div>
  )
}
