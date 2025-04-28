# PDF Export Feature

The HeartPredict application includes functionality to export heart disease risk assessment results as PDF documents. This feature allows users to save their assessment results and share them with healthcare providers.

## How It Works

1. The PDF generation uses a combination of `html2canvas` and `jsPDF` libraries to:
   - Capture the assessment results as an image
   - Convert the image to a PDF document
   - Add metadata and formatting

2. The generated PDF includes:
   - Complete assessment results with risk level
   - All health metrics provided by the user
   - Key risk factors identified
   - Date of assessment
   - Disclaimer about medical advice

## Implementation Details

- The PDF generation happens entirely on the client side, ensuring privacy of health data
- The styling is optimized for PDF output while maintaining visual consistency with the web interface
- A loading state is shown during PDF generation to provide feedback to the user

## Usage

Users can download their assessment results as a PDF by clicking the "Download PDF Report" button on the results page. The PDF is named with the format `heart-assessment-[risk-level]-risk-[date].pdf`.

## Technical Considerations

- PDF generation can be resource-intensive, especially on mobile devices
- The implementation uses optimizations like cloning the DOM element to avoid affecting the visible UI
- Error handling is included to provide feedback if PDF generation fails
