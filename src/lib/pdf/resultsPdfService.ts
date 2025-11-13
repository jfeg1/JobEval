/**
 * In-Depth Analysis Results PDF Service
 *
 * Generates comprehensive PDF documents for in-depth salary analysis results
 * including company profile, position details, market data, budget calculations,
 * and recommendations.
 */

import jsPDF from "jspdf";
import { formatCurrency as formatCurrencyUtil } from "@/shared/lib/currency";
import type { CurrencyCode } from "@/types/i18n";

/**
 * Data structure for In-Depth Analysis PDF generation
 */
export interface ResultsPdfData {
  // Company information
  companyName: string;
  companyLocation: string;
  annualRevenue: number;
  currentPayroll: number;
  employeeCount: string;

  // Position information
  positionTitle: string;
  department: string;
  reportsTo: string;

  // Market data (BLS)
  occupationTitle: string;
  marketMedian: number;
  marketP25: number;
  marketP75: number;
  marketP10: number;
  marketP90: number;
  dataDate: string;

  // Budget calculations
  affordableRangeMin: number;
  affordableRangeTarget: number;
  affordableRangeMax: number;

  // Market alignment
  marketAlignment: "below" | "within" | "above";
  gap: number;

  // Payroll ratios (if available)
  currentPayrollRatio?: number;
  newPayrollRatio?: number;
  payrollStatus?: "sustainable" | "warning" | "exceed";

  // Metadata
  generatedDate: Date;
  countryCode?: string;
  currencyCode?: string;
  locale?: string;
}

/**
 * Determine paper size based on country code
 */
function getPaperSize(countryCode?: string): "letter" | "a4" {
  const letterCountries = ["US", "CA", "MX"];
  return countryCode && letterCountries.includes(countryCode) ? "letter" : "a4";
}

/**
 * Format currency for display with international support
 */
function formatCurrency(amount: number, currencyCode?: string, locale?: string): string {
  if (currencyCode) {
    try {
      return formatCurrencyUtil(amount, currencyCode as CurrencyCode, { decimals: 0 });
    } catch {
      // Fall through to Intl.NumberFormat
    }
  }

  return new Intl.NumberFormat(locale || "en-US", {
    style: "currency",
    currency: currencyCode || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Draw watermark on the PDF
 */
function drawWatermark(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  doc.saveGraphicsState();
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  doc.setGState(doc.GState({ opacity: 0.1 }));
  doc.text("CONFIDENTIAL", centerX, centerY, { angle: 45, align: "center" });
  doc.restoreGraphicsState();
}

/**
 * Draw footer with disclaimer and page numbers
 */
function drawFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  pageNumber: number,
  totalPages: number
): void {
  const margin = 20;
  const footerY = pageHeight - 15;

  doc.saveGraphicsState();
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);

  // Page number (right-aligned)
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, footerY, {
    align: "right",
  });

  // Disclaimer (center-aligned)
  const disclaimer =
    "This salary analysis is provided for informational purposes only and does not constitute professional advice.";
  doc.text(disclaimer, pageWidth / 2, footerY, { align: "center" });

  // JobEval branding (left-aligned)
  doc.text("JobEval In-Depth Analysis", margin, footerY);

  doc.restoreGraphicsState();
}

/**
 * Draw section header
 */
function drawSectionHeader(doc: jsPDF, text: string, y: number, margin: number): number {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(45, 55, 72); // Sage-900
  doc.text(text, margin, y);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y + 1, doc.internal.pageSize.getWidth() - margin, y + 1);
  return y + 8;
}

/**
 * Generates comprehensive PDF document for in-depth salary analysis
 */
export async function generateResultsPdf(data: ResultsPdfData): Promise<Blob> {
  try {
    const paperSize = getPaperSize(data.countryCode);
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: paperSize,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // === PAGE 1: HEADER & SUMMARY ===
    drawWatermark(doc, pageWidth, pageHeight);

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Salary Analysis Report", margin, yPosition);
    yPosition += 8;

    // Subtitle with company name
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(data.companyName, margin, yPosition);
    yPosition += 6;

    // Position title
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Position: ${data.positionTitle}`, margin, yPosition);
    yPosition += 5;

    // Generated date
    doc.setFontSize(9);
    const dateStr = data.generatedDate.toLocaleDateString(data.locale || "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generated: ${dateStr}`, margin, yPosition);
    yPosition += 12;

    // === EXECUTIVE SUMMARY BOX ===
    const boxY = yPosition;
    const boxHeight = 40;
    doc.setFillColor(239, 246, 255); // Light blue
    doc.rect(margin, boxY, contentWidth, boxHeight, "F");

    yPosition = boxY + 6;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Executive Summary", margin + 5, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Key metrics
    const summaryX = margin + 5;
    doc.text(
      `Recommended Salary Range: ${formatCurrency(data.affordableRangeMin, data.currencyCode, data.locale)} - ${formatCurrency(data.affordableRangeMax, data.currencyCode, data.locale)}`,
      summaryX,
      yPosition
    );
    yPosition += 5;

    doc.text(
      `Target Salary: ${formatCurrency(data.affordableRangeTarget, data.currencyCode, data.locale)}`,
      summaryX,
      yPosition
    );
    yPosition += 5;

    doc.text(
      `Market Median: ${formatCurrency(data.marketMedian, data.currencyCode, data.locale)}`,
      summaryX,
      yPosition
    );
    yPosition += 5;

    const alignmentText =
      data.marketAlignment === "below"
        ? "Below Market Rate"
        : data.marketAlignment === "above"
          ? "Above Market Rate"
          : "Within Market Range";
    doc.text(`Market Alignment: ${alignmentText}`, summaryX, yPosition);
    yPosition += 5;

    if (data.newPayrollRatio !== undefined) {
      doc.text(
        `Projected Payroll Ratio: ${formatPercentage(data.newPayrollRatio)}`,
        summaryX,
        yPosition
      );
    }

    yPosition = boxY + boxHeight + 10;

    // === COMPANY PROFILE ===
    yPosition = drawSectionHeader(doc, "Company Profile", yPosition, margin);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    doc.text(`Company Name: ${data.companyName}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Location: ${data.companyLocation}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Number of Employees: ${data.employeeCount}`, margin, yPosition);
    yPosition += 5;
    doc.text(
      `Annual Revenue: ${formatCurrency(data.annualRevenue, data.currencyCode, data.locale)}`,
      margin,
      yPosition
    );
    yPosition += 5;
    doc.text(
      `Current Payroll: ${formatCurrency(data.currentPayroll, data.currencyCode, data.locale)}`,
      margin,
      yPosition
    );
    yPosition += 5;

    if (data.currentPayrollRatio !== undefined) {
      doc.text(
        `Current Payroll Ratio: ${formatPercentage(data.currentPayrollRatio)} of revenue`,
        margin,
        yPosition
      );
      yPosition += 5;
    }

    yPosition += 5;

    // === POSITION DETAILS ===
    yPosition = drawSectionHeader(doc, "Position Details", yPosition, margin);

    doc.text(`Title: ${data.positionTitle}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Department: ${data.department}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Reports To: ${data.reportsTo}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Matched Occupation: ${data.occupationTitle}`, margin, yPosition);
    yPosition += 10;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      drawWatermark(doc, pageWidth, pageHeight);
      yPosition = margin;
    }

    // === MARKET DATA ===
    yPosition = drawSectionHeader(doc, "Market Data Analysis", yPosition, margin);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Based on ${data.occupationTitle} - ${data.dataDate}`, margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    // Market percentiles table
    const tableData = [
      ["10th Percentile", formatCurrency(data.marketP10, data.currencyCode, data.locale)],
      ["25th Percentile", formatCurrency(data.marketP25, data.currencyCode, data.locale)],
      ["Median (50th)", formatCurrency(data.marketMedian, data.currencyCode, data.locale)],
      ["75th Percentile", formatCurrency(data.marketP75, data.currencyCode, data.locale)],
      ["90th Percentile", formatCurrency(data.marketP90, data.currencyCode, data.locale)],
    ];

    tableData.forEach(([label, value]) => {
      doc.text(label, margin + 5, yPosition);
      doc.text(value, margin + 60, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // === AFFORDABILITY ANALYSIS ===
    yPosition = drawSectionHeader(doc, "Affordability Analysis", yPosition, margin);

    doc.setFontSize(10);
    doc.text("Your Affordable Range:", margin, yPosition);
    yPosition += 6;

    const rangeData = [
      ["Minimum", formatCurrency(data.affordableRangeMin, data.currencyCode, data.locale)],
      ["Target", formatCurrency(data.affordableRangeTarget, data.currencyCode, data.locale)],
      ["Maximum", formatCurrency(data.affordableRangeMax, data.currencyCode, data.locale)],
    ];

    rangeData.forEach(([label, value]) => {
      if (label === "Target") {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      doc.text(label, margin + 5, yPosition);
      doc.text(value, margin + 60, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Payroll ratio analysis (if available)
    if (
      data.currentPayrollRatio !== undefined &&
      data.newPayrollRatio !== undefined &&
      data.payrollStatus
    ) {
      doc.setFont("helvetica", "normal");
      doc.text("Payroll Ratio Impact:", margin, yPosition);
      yPosition += 6;

      doc.text(`Current: ${formatPercentage(data.currentPayrollRatio)}`, margin + 5, yPosition);
      yPosition += 5;
      doc.text(`After Hire: ${formatPercentage(data.newPayrollRatio)}`, margin + 5, yPosition);
      yPosition += 5;

      const statusText =
        data.payrollStatus === "sustainable"
          ? "✓ Sustainable (Under 35% of revenue)"
          : data.payrollStatus === "warning"
            ? "⚠ Warning (35-45% of revenue)"
            : "⚠ Exceeds 45% of revenue";

      doc.text(`Status: ${statusText}`, margin + 5, yPosition);
      yPosition += 8;
    }

    // === MARKET ALIGNMENT ===
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      drawWatermark(doc, pageWidth, pageHeight);
      yPosition = margin;
    }

    yPosition = drawSectionHeader(doc, "Market Alignment", yPosition, margin);

    // Alignment status with color coding
    const alignmentColor: [number, number, number] =
      data.marketAlignment === "within"
        ? [34, 197, 94]
        : data.marketAlignment === "above"
          ? [59, 130, 246]
          : [245, 158, 11];
    doc.setTextColor(...alignmentColor);
    doc.setFont("helvetica", "bold");
    doc.text(alignmentText, margin, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const gapText =
      data.gap > 0
        ? `Your target is $${Math.abs(data.gap).toLocaleString()} above market median`
        : data.gap < 0
          ? `Your target is $${Math.abs(data.gap).toLocaleString()} below market median`
          : "Your target aligns with market median";

    doc.text(gapText, margin, yPosition);
    yPosition += 10;

    // === RECOMMENDATIONS ===
    yPosition = drawSectionHeader(doc, "Recommendations", yPosition, margin);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const recommendations: string[] = [];

    if (data.marketAlignment === "below") {
      recommendations.push(
        "• Your budget is below market median. Consider:",
        "  - Adjusting position scope to match budget (junior level)",
        "  - Offering equity or performance bonuses",
        "  - Emphasizing non-monetary benefits",
        "  - Planning for phased salary increases"
      );
    } else if (data.marketAlignment === "above") {
      recommendations.push(
        "• Your budget is above market median. Opportunities:",
        "  - Attract highly experienced candidates",
        "  - Expand job responsibilities",
        "  - Set yourself apart from competitors"
      );
    } else {
      recommendations.push(
        "• Your budget aligns well with market rates:",
        "  - Emphasize company culture and mission",
        "  - Highlight growth opportunities",
        "  - Consider performance-based bonuses (10-15% of base)"
      );
    }

    if (data.payrollStatus === "exceed") {
      recommendations.push(
        "",
        "⚠ Payroll Concern:",
        "  - New payroll ratio exceeds healthy range (>45%)",
        "  - Consider adjusting salary or seeking revenue growth",
        "  - Consult with financial advisor"
      );
    } else if (data.payrollStatus === "warning") {
      recommendations.push(
        "",
        "⚠ Payroll Notice:",
        "  - Approaching high end of payroll ratio (35-45%)",
        "  - Monitor carefully and plan for revenue growth"
      );
    }

    const maxWidth = contentWidth - 10;
    recommendations.forEach((rec) => {
      const lines = doc.splitTextToSize(rec, maxWidth) as string[];
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          drawWatermark(doc, pageWidth, pageHeight);
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    });

    // === DISCLAIMER ===
    yPosition += 10;
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      drawWatermark(doc, pageWidth, pageHeight);
      yPosition = margin;
    }

    yPosition = drawSectionHeader(doc, "Important Disclaimer", yPosition, margin);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);

    const disclaimer =
      "This salary analysis is provided for informational and advisory purposes only. " +
      "It should not be used as the sole basis for compensation decisions. Final salary " +
      "determinations should consider local labor laws, cost of living adjustments, " +
      "industry-specific factors, individual qualifications, and professional counsel from " +
      "legal and financial advisors.";

    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
    disclaimerLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });

    // Add footers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(doc, pageWidth, pageHeight, i, totalPages);
    }

    // Convert to Blob
    const pdfBlob = doc.output("blob");
    return pdfBlob;
  } catch (error) {
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
