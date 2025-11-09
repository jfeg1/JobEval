/**
 * Quick Advisory PDF Service
 *
 * Generates PDF documents for Quick Advisory salary analysis results
 */

import jsPDF from "jspdf";

/**
 * Data structure for Quick Advisory PDF generation
 */
export interface QuickAdvisoryPdfData {
  proposedSalary: number;
  percentile: number;
  targetRangeLabel: string; // e.g., "40th-60th percentile (Competitive)"
  gapDescription: string; // e.g., "-32-42 percentile points below your target range"
  recommendedIncrease: number;
  recommendedSalary: number;
  currentPayrollRatio: number;
  newPayrollRatio: number;
  companyName?: string;
  generatedDate: Date;
}

/**
 * Add a diagonal watermark to the PDF
 *
 * @param doc - jsPDF document instance
 * @param text - Watermark text
 */
function addWatermark(doc: jsPDF, text: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Save the current graphics state
  doc.saveGraphicsState();

  // Set watermark styling
  doc.setTextColor(200, 200, 200); // Light gray
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");

  // Calculate center position
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // Set opacity (alpha)
  doc.setGState(new doc.GState({ opacity: 0.1 }));

  // Rotate 45 degrees and add text
  doc.text(text, centerX, centerY, {
    angle: 45,
    align: "center",
  });

  // Restore the previous graphics state
  doc.restoreGraphicsState();
}

/**
 * Add disclaimer footer to the current page
 *
 * @param doc - jsPDF document instance
 */
function addDisclaimerFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const footerY = pageHeight - 20;

  // Save current state
  doc.saveGraphicsState();

  // Set footer styling
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128); // Gray text

  // Disclaimer text
  const disclaimer =
    "ADVISORY NOTICE: This salary analysis is provided for informational and advisory purposes only. It is not intended to replace " +
    "comprehensive compensation analysis, legal counsel, or professional HR consultation. Organizations should consider multiple factors " +
    "when determining final compensation decisions.";

  // Split text to fit within margins
  const lines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);

  // Add text
  doc.text(lines, margin, footerY);

  // Restore state
  doc.restoreGraphicsState();
}

/**
 * Format currency for display
 *
 * @param amount - Numeric amount
 * @returns Formatted currency string
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 *
 * @param value - Numeric percentage value
 * @returns Formatted percentage string
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Generate Quick Advisory PDF
 *
 * Creates a professional PDF report with salary advisory information,
 * including watermark and disclaimer footer
 *
 * @param data - Quick Advisory data to include in the PDF
 * @returns Promise resolving to PDF Blob for download
 *
 * @example
 * const pdfData = {
 *   proposedSalary: 50000,
 *   percentile: 28,
 *   targetRangeLabel: "40th-60th percentile (Competitive)",
 *   gapDescription: "-32-42 percentile points below your target range",
 *   recommendedIncrease: 22000,
 *   recommendedSalary: 72000,
 *   currentPayrollRatio: 2.5,
 *   newPayrollRatio: 3.6,
 *   companyName: "Acme Corp",
 *   generatedDate: new Date()
 * };
 *
 * const blob = await generateQuickAdvisoryPdf(pdfData);
 * // Use blob for download
 */
export async function generateQuickAdvisoryPdf(
  data: QuickAdvisoryPdfData
): Promise<Blob> {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page dimensions and margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Add watermark
  addWatermark(doc, "ADVISORY ONLY");

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("JobEval Quick Salary Advisory", margin, yPosition);
  yPosition += 10;

  // Company name (if provided)
  if (data.companyName) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(data.companyName, margin, yPosition);
    yPosition += 8;
  }

  // Timestamp
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const dateStr = data.generatedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated: ${dateStr}`, margin, yPosition);
  yPosition += 15;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Current Salary Analysis Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Current Salary Analysis", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Proposed Salary
  doc.setFont("helvetica", "bold");
  doc.text("Proposed Salary:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(data.proposedSalary), margin + 60, yPosition);
  yPosition += 7;

  // Market Percentile
  doc.setFont("helvetica", "bold");
  doc.text("Market Percentile:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.percentile}th percentile`, margin + 60, yPosition);
  yPosition += 7;

  // Target Range
  doc.setFont("helvetica", "bold");
  doc.text("Target Range:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.targetRangeLabel, margin + 60, yPosition);
  yPosition += 7;

  // Gap Description
  doc.setFont("helvetica", "bold");
  doc.text("Market Gap:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 53, 69); // Red for gap
  doc.text(data.gapDescription, margin + 60, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Recommendation Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Recommendation", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Recommended Increase
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Increase:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 167, 69); // Green for positive
  doc.text(formatCurrency(data.recommendedIncrease), margin + 60, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 7;

  // Recommended Salary
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Salary:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(data.recommendedSalary), margin + 60, yPosition);
  yPosition += 15;

  // Affordability Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Affordability Analysis", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Current Payroll Ratio
  doc.setFont("helvetica", "bold");
  doc.text("Current Payroll Ratio:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(formatPercentage(data.currentPayrollRatio), margin + 60, yPosition);
  yPosition += 7;

  // New Payroll Ratio
  doc.setFont("helvetica", "bold");
  doc.text("New Payroll Ratio:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(formatPercentage(data.newPayrollRatio), margin + 60, yPosition);
  yPosition += 7;

  // Payroll context note
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const contextNote = doc.splitTextToSize(
    "Industry standard payroll ratio is typically 40-80% of revenue. Lower ratios indicate better affordability.",
    pageWidth - 2 * margin - 10
  );
  doc.text(contextNote, margin + 5, yPosition);

  // Add disclaimer footer
  addDisclaimerFooter(doc);

  // Convert to Blob
  const pdfBlob = doc.output("blob");

  return pdfBlob;
}
