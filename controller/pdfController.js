const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const generateTaxFormPdf = async (req, res) => {
  try {
    // Extract form data from the request body
    const formData = req.body;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); // Width x Height (in points)
    const { width, height } = page.getSize();

    // Load a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper function for drawing text
    const drawText = (text, x, y, fontType = font, fontSize = 10, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x, y, size: fontSize, font: fontType, color });
    };

    // Draw Header
    drawText('Form W-9', 50, height - 40, boldFont, 12);
    drawText('(Rev. March 2024)', 50, height - 55, font, 8);
    drawText('Department of the Treasury', 50, height - 70, font, 8);
    drawText('Internal Revenue Service', 50, height - 85, font, 8);

    drawText('Request for Taxpayer', 200, height - 40, boldFont, 12);
    drawText('Identification Number and Certification', 150, height - 55, boldFont, 10);

    drawText('Give form to the requester. Do not send to the IRS.', width - 250, height - 40, boldFont, 8);

    // Fill the PDF with form data
    drawText('1. Name of entity/individual', 50, height - 120, boldFont, 10);
    drawText(formData.name || '_____________________________', 50, height - 150, font, 10);

    drawText('2. Business name/disregarded entity name, if different from above:', 50, height - 180, boldFont, 10);
    drawText(formData.businessName || '_____________________________', 50, height - 195, font, 10);

    // Additional data fields...
    drawText('Part I. Taxpayer Identification Number (TIN)', 50, height - 440, boldFont, 10);
    drawText(formData.socialSecurityNo || 'XXX-XX-XXXX', 200, height - 460, font, 10);
    drawText(formData.empIDno || 'XX-XXXXXXX', 200, height - 480, font, 10);

    drawText('Signature:', 50, height - 570, boldFont, 10);
    drawText(formData.signature || '_____________________________', 120, height - 570, font, 10);

    // Save the PDF as bytes
    const pdfBytes = await pdfDoc.save();

    // Define the output directory and file path
    const outputDir = path.join(__dirname, '..', 'output');
    const filePath = path.join(outputDir, 'TaxForm.pdf');

    // Check if the output directory exists, if not, create it
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the PDF to the output file
    fs.writeFileSync(filePath, pdfBytes);

    // Send the file to the client
    res.download(filePath, 'TaxForm.pdf', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error generating the PDF');
      } else {
        console.log('PDF sent successfully.');
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('An error occurred while generating the PDF.');
  }
};

module.exports = { generateTaxFormPdf };
