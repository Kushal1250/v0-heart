"use nodejs"

import { execSync } from "child_process"

// Install required packages for PDF generation
console.log("Installing PDF generation packages...")
try {
  execSync("npm install @react-pdf/renderer html2canvas jspdf")
  console.log("PDF packages installed successfully!")
} catch (error) {
  console.error("Error installing PDF packages:", error)
}
