/**
 * Quick Advisory PDF Service
 *
 * Generates PDF documents for Quick Advisory salary analysis results
 * with international paper size and currency support
 */

import jsPDF from "jspdf";
import { formatCurrency as formatCurrencyUtil } from "@/shared/lib/currency";
import type { CurrencyCode } from "@/types/i18n";

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
  countryCode?: string; // ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'CA')
  currencyCode?: string; // ISO 4217 currency code (e.g., 'USD', 'GBP', 'EUR', 'CAD')
  locale?: string; // Locale string for formatting (e.g., 'en-US', 'en-GB', 'fr-CA')
}

/**
 * Determine paper size based on country code
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Paper size ('letter' or 'a4')
 */
function getPaperSize(countryCode?: string): "letter" | "a4" {
  const letterCountries = ["US", "CA", "MX"];
  return countryCode && letterCountries.includes(countryCode) ? "letter" : "a4";
}

/**
 * Format currency for display with international support
 *
 * @param amount - Numeric amount
 * @param currencyCode - ISO 4217 currency code
 * @param locale - Locale string for formatting
 * @returns Formatted currency string
 */
function formatCurrency(amount: number, currencyCode?: string, locale?: string): string {
  // Use existing currency utility if currency code is provided and valid
  if (currencyCode) {
    try {
      return formatCurrencyUtil(amount, currencyCode as CurrencyCode, { decimals: 0 });
    } catch {
      // Fall through to Intl.NumberFormat if currency code is invalid
    }
  }

  // Fallback to Intl.NumberFormat
  return new Intl.NumberFormat(locale || "en-US", {
    style: "currency",
    currency: currencyCode || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number as ordinal (1st, 2nd, 3rd, etc.)
 *
 * @param percentile - Numeric percentile value
 * @returns Formatted ordinal string
 */
function formatPercentile(percentile: number): string {
  const suffix = (() => {
    const lastDigit = percentile % 10;
    const lastTwoDigits = percentile % 100;

    // Handle special cases: 11th, 12th, 13th
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return "th";
    }

    // Handle regular cases
    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  })();

  return `${percentile}${suffix}`;
}

/**
 * Format percentage for display with one decimal place
 *
 * @param value - Numeric percentage value (as ratio, e.g., 0.368 for 36.8%)
 * @returns Formatted percentage string
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Draw watermark on the PDF
 *
 * @param doc - jsPDF document instance
 * @param pageWidth - Page width in mm
 * @param pageHeight - Page height in mm
 */
function drawWatermark(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  // Save the current graphics state
  doc.saveGraphicsState();

  // Set watermark styling
  doc.setTextColor(150, 150, 150); // Gray
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");

  // Calculate center position
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // Set opacity
  doc.setGState(doc.GState({ opacity: 0.1 }));

  // Rotate 45 degrees and add text
  doc.text("ADVISORY ONLY", centerX, centerY, {
    angle: 45,
    align: "center",
  });

  // Restore the previous graphics state
  doc.restoreGraphicsState();
}

/**
 * Draw footer with disclaimer text
 *
 * @param doc - jsPDF document instance
 * @param pageWidth - Page width in mm
 * @param pageHeight - Page height in mm
 */
function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const margin = 20;
  const footerY = pageHeight - 15;

  // Save current state
  doc.saveGraphicsState();

  // Set footer styling
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100); // Gray text

  // Disclaimer text
  const disclaimer =
    "ADVISORY NOTICE: This salary analysis is provided for informational and advisory purposes only. It is not intended to replace " +
    "comprehensive compensation analysis, legal counsel, or professional HR consultation. Organizations should consider multiple factors " +
    "when determining final compensation decisions.";

  // Split text to fit within margins
  const maxWidth = pageWidth - 2 * margin;
  const lines = doc.splitTextToSize(disclaimer, maxWidth);

  // Add text (center-aligned)
  doc.text(lines, pageWidth / 2, footerY, { align: "center" });

  // Restore state
  doc.restoreGraphicsState();
}

/**
 * Generate Quick Advisory PDF
 *
 * Creates a professional PDF report with salary advisory information,
 * including international paper size and currency support
 *
 * @param data - Quick Advisory data to include in the PDF
 * @returns Promise resolving to PDF Blob for download
 *
 * @example
 * const pdfData = {
 *   proposedSalary: 50000,
 *   percentile: 18,
 *   targetRangeLabel: "40th-60th percentile (Competitive)",
 *   gapDescription: "-32-42 percentile points below your target range",
 *   recommendedIncrease: 22000,
 *   recommendedSalary: 72000,
 *   currentPayrollRatio: 30.0,
 *   newPayrollRatio: 36.8,
 *   companyName: "Acme Corp",
 *   generatedDate: new Date(),
 *   countryCode: "US",
 *   currencyCode: "USD",
 *   locale: "en-US"
 * };
 *
 * const blob = await generateQuickAdvisoryPdf(pdfData);
 * // Use blob for download
 */
export async function generateQuickAdvisoryPdf(data: QuickAdvisoryPdfData): Promise<Blob> {
  try {
    // Determine paper size based on country
    const paperSize = getPaperSize(data.countryCode);

    // Create new PDF document with dynamic paper size
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: paperSize,
    });

    // Get dynamic page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Draw watermark first (behind all content)
    drawWatermark(doc, pageWidth, pageHeight);

    // Initialize position
    let yPosition = margin;

    // === HEADER SECTION ===
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("JobEval Quick Salary Advisory", margin, yPosition);
    yPosition += 8;

    // Generated date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const dateStr = data.generatedDate.toLocaleDateString(data.locale || "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Generated: ${dateStr}`, margin, yPosition);
    yPosition += 6;

    // Company name (if provided)
    if (data.companyName) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(data.companyName, margin, yPosition);
      yPosition += 8;
    }

    // Add spacing after header
    yPosition += 10;

    // === PROPOSED SALARY SECTION ===
    const formattedSalary = formatCurrency(data.proposedSalary, data.currencyCode, data.locale);
    const percentileText = formatPercentile(data.percentile);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const salaryText = `Your proposed salary of ${formattedSalary} is at the ${percentileText} percentile`;
    doc.text(salaryText, margin, yPosition);
    yPosition += 8;

    // === MARKET POSITIONING COMPARISON (Boxed Section) ===
    const boxStartY = yPosition;
    const boxPadding = 5;
    const boxMargin = margin;

    // Set background color (light beige)
    doc.setFillColor(254, 243, 199); // #FEF3C7

    // Calculate box height (title + content lines + padding)
    const lineHeight = 5;
    const titleHeight = 6;
    const contentLines = 4;
    const boxHeight = boxPadding * 2 + titleHeight + contentLines * lineHeight + 2;

    // Draw background rectangle
    doc.rect(boxMargin, boxStartY, pageWidth - 2 * boxMargin, boxHeight, "F");

    // Draw content inside box
    yPosition = boxStartY + boxPadding + 5;

    // Title
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12); // Orange #EA580C
    doc.text("Market Positioning Comparison", boxMargin + boxPadding, yPosition);
    yPosition += titleHeight;

    // Content bullets
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const bulletX = boxMargin + boxPadding + 2;
    const contentX = bulletX + 3;

    // Bullet 1: Proposed salary
    doc.text("•", bulletX, yPosition);
    const bullet1Text = `Proposed salary: ${formattedSalary} (${percentileText} percentile)`;
    doc.text(bullet1Text, contentX, yPosition);
    yPosition += lineHeight;

    // Bullet 2: Target range
    doc.text("•", bulletX, yPosition);
    const bullet2Text = `You selected: ${data.targetRangeLabel}`;
    doc.text(bullet2Text, contentX, yPosition);
    yPosition += lineHeight;

    // Bullet 3: Gap
    doc.text("•", bulletX, yPosition);
    const bullet3Text = `Gap: ${data.gapDescription}`;
    doc.text(bullet3Text, contentX, yPosition);
    yPosition += lineHeight;

    // Bullet 4: Recommendation
    doc.text("•", bulletX, yPosition);
    const formattedRecommendedSalary = formatCurrency(
      data.recommendedSalary,
      data.currencyCode,
      data.locale
    );
    const bullet4Text = `Recommendation: To reach the lower end of your target range, consider increasing the salary to ${formattedRecommendedSalary}`;
    // Split long text to fit within box
    const maxBulletWidth = pageWidth - 2 * boxMargin - 2 * boxPadding - 5;
    const bullet4Lines = doc.splitTextToSize(bullet4Text, maxBulletWidth);
    doc.text(bullet4Lines, contentX, yPosition);

    // Move position past the box
    yPosition = boxStartY + boxHeight + 8;

    // === AFFORDABILITY ANALYSIS SECTION ===
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Affordability Analysis", margin, yPosition);
    yPosition += 6;

    // Subtitle
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Analysis based on your current revenue and payroll expenses", margin, yPosition);
    yPosition += 3;

    // Add spacing
    yPosition += 5;

    // Two-column layout for payroll ratios
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const contentWidth = pageWidth - 2 * margin;
    const columnWidth = contentWidth / 2;
    const leftColumnX = margin + columnWidth / 2;
    const rightColumnX = margin + columnWidth + columnWidth / 2;

    // Left column: Current Payroll Ratio
    const currentRatioText = `Current Payroll Ratio: ${formatPercentage(data.currentPayrollRatio)}`;
    doc.text(currentRatioText, leftColumnX, yPosition, { align: "center" });

    // Right column: New Payroll Ratio
    const newRatioText = `New Payroll Ratio (After Hire): ${formatPercentage(data.newPayrollRatio)}`;
    doc.text(newRatioText, rightColumnX, yPosition, { align: "center" });

    // Draw footer
    drawFooter(doc, pageWidth, pageHeight);

    // Convert to Blob
    const pdfBlob = doc.output("blob");

    return pdfBlob;
  } catch (error) {
    // Re-throw with more context
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
