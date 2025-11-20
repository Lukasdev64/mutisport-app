/**
 * PDF Export Utility
 * Exports tournament brackets to PDF using jsPDF and html2canvas
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Export bracket element to PDF
 * @param {HTMLElement} element - DOM element to export
 * @param {string} filename - PDF filename
 * @param {object} options - Export options
 * @returns {Promise<void>}
 */
export async function exportBracketToPDF(element, filename = 'bracket.pdf', options = {}) {
  const {
    orientation = 'landscape',
    format = 'a4',
    quality = 0.95,
    scale = 2,
    backgroundColor = '#ffffff'
  } = options

  try {
    // Hide elements that shouldn't be in PDF
    const elementsToHide = element.querySelectorAll('.no-print, .bracket-legend')
    elementsToHide.forEach(el => {
      el.style.display = 'none'
    })

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    })

    // Restore hidden elements
    elementsToHide.forEach(el => {
      el.style.display = ''
    })

    // Calculate PDF dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Create PDF with appropriate size
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [imgWidth / scale, imgHeight / scale]
    })

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png', quality)
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth / scale, imgHeight / scale)

    // Save PDF
    pdf.save(filename)

    return { success: true }
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return { success: false, error }
  }
}

/**
 * Export tournament with metadata page
 * @param {HTMLElement} bracketElement
 * @param {object} tournament - Tournament metadata
 * @param {string} filename
 * @returns {Promise<void>}
 */
export async function exportTournamentToPDF(bracketElement, tournament, filename = 'tournament.pdf') {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Page 1: Tournament Info
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(tournament.name, pageWidth / 2, 30, { align: 'center' })

    // Metadata
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const metadata = [
      `Format: ${tournament.format.replace('_', ' ').toUpperCase()}`,
      `Date: ${new Date(tournament.tournament_date).toLocaleDateString()}`,
      `Location: ${tournament.location}`,
      `Players: ${tournament.players_count}`,
      `Status: ${tournament.status.toUpperCase()}`
    ]

    let yPos = 50
    metadata.forEach(line => {
      pdf.text(line, 20, yPos)
      yPos += 10
    })

    // Footer
    pdf.setFontSize(10)
    pdf.setTextColor(128, 128, 128)
    pdf.text(
      `Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Page 2+: Bracket
    pdf.addPage()

    // Capture bracket as canvas
    const canvas = await html2canvas(bracketElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    const imgData = canvas.toDataURL('image/png', 0.95)
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Calculate dimensions to fit page
    const maxWidth = pageWidth - 20 // 10mm margin on each side
    const maxHeight = pageHeight - 20

    let finalWidth = maxWidth
    let finalHeight = (imgHeight * maxWidth) / imgWidth

    // If too tall, scale by height instead
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight
      finalWidth = (imgWidth * maxHeight) / imgHeight
    }

    // Center the image
    const xOffset = (pageWidth - finalWidth) / 2
    const yOffset = (pageHeight - finalHeight) / 2

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight)

    // Save
    pdf.save(filename)

    return { success: true }
  } catch (error) {
    console.error('Error exporting tournament PDF:', error)
    return { success: false, error }
  }
}

/**
 * Print bracket (using browser print dialog)
 * @param {HTMLElement} element
 */
export function printBracket(element) {
  // Create print-friendly version
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Please allow popups to print')
    return
  }

  // Clone element and add print styles
  const clonedElement = element.cloneNode(true)

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tournament Bracket</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }

          @media print {
            body {
              padding: 0;
            }

            .no-print, .bracket-legend {
              display: none !important;
            }

            @page {
              size: landscape;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        ${clonedElement.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

export default {
  exportBracketToPDF,
  exportTournamentToPDF,
  printBracket
}
