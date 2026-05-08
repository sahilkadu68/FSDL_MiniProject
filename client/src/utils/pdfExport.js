import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDFReport = async (userName, summaryData, advancedData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text
    const addText = (text, fontSize = 12, fontWeight = 'normal', color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      if (fontWeight === 'bold') {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      doc.text(text, 20, yPosition);
      yPosition += fontSize / 2.5;
    };

    const addSection = (title) => {
      yPosition += 5;
      doc.setDrawColor(99, 102, 241);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;
      addText(title, 16, 'bold', [99, 102, 241]);
      yPosition += 3;
    };

    const checkPageBreak = () => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // ===== HEADER =====
    addText('🌱 CarbonLens — Carbon Footprint Report', 20, 'bold', [99, 102, 241]);
    yPosition += 5;
    addText(`Generated for: ${userName || 'User'}`, 11, 'normal', [100, 100, 100]);
    addText(`Date: ${new Date().toLocaleDateString()}`, 11, 'normal', [100, 100, 100]);
    yPosition += 10;

    // ===== CARBON SCORE SECTION =====
    if (advancedData?.carbonScore) {
      checkPageBreak();
      addSection('📊 Carbon Score');
      const score = advancedData.carbonScore;
      addText(`Score: ${Math.round(score.score)}/100 (${score.label})`, 14, 'bold');
      addText(score.description, 11);
      yPosition += 3;
    }

    // ===== EMISSIONS SUMMARY =====
    checkPageBreak();
    addSection('📈 Emissions Summary');
    addText(`Daily Average: ${advancedData?.dailyAverage?.toFixed(2) || '0'} kg CO₂e/day`, 11);
    addText(`Weekly Total: ${advancedData?.weeklyTotal?.toFixed(2) || '0'} kg CO₂e`, 11);
    if (summaryData?.month) {
      addText(`Monthly Total: ${summaryData.month?.toFixed(2) || '0'} kg CO₂e`, 11);
    }
    yPosition += 5;

    // ===== PROGRESS TRACKING =====
    if (advancedData?.progressTracking) {
      checkPageBreak();
      addSection('📊 Weekly Progress');
      const progress = advancedData.progressTracking;
      addText(`Last Week Avg: ${progress.lastWeekAvg?.toFixed(2)} kg/day`, 11);
      addText(`Previous Week Avg: ${progress.previousWeekAvg?.toFixed(2)} kg/day`, 11);
      addText(`Change: ${progress.changePercent > 0 ? '+' : ''}${progress.changePercent?.toFixed(1)}%`, 11, 'bold');
      addText(`Status: ${progress.message}`, 10);
      yPosition += 5;
    }

    // ===== INSIGHTS =====
    if (advancedData?.insights?.insights?.length > 0) {
      checkPageBreak();
      addSection('💡 Category Insights');
      advancedData.insights.insights.forEach((insight) => {
        checkPageBreak();
        addText(
          `${insight.icon} ${insight.category.toUpperCase()}: ${insight.percentage.toFixed(1)}% (${insight.total.toFixed(2)} kg)`,
          11,
          'bold'
        );
        addText(`Impact Level: ${insight.impact}`, 10);
        yPosition += 3;
      });
      yPosition += 5;
    }

    // ===== SMART SUGGESTIONS =====
    if (advancedData?.suggestions?.length > 0) {
      checkPageBreak();
      addSection('🎯 Smart Suggestions');
      addText('Top recommendations to reduce your carbon footprint:', 11);
      yPosition += 3;
      advancedData.suggestions.slice(0, 5).forEach((suggestion, index) => {
        checkPageBreak();
        addText(`${index + 1}. ${suggestion.title}`, 10, 'bold', [99, 102, 241]);
        addText(suggestion.description, 9, 'normal', [150, 150, 150]);
        addText(`Impact: ${suggestion.impact}`, 9);
        yPosition += 3;
      });
      yPosition += 5;
    }

    // ===== MONTHLY BREAKDOWN =====
    if (summaryData?.categoryBreakdown?.length > 0) {
      checkPageBreak();
      addSection('🗂️ Emissions by Category (This Month)');
      summaryData.categoryBreakdown.forEach((category) => {
        checkPageBreak();
        const categoryName = category.category.toUpperCase();
        const percentage = (category.total / (summaryData.month || 1)) * 100;
        addText(`${categoryName}: ${category.total.toFixed(2)} kg CO₂e (${percentage.toFixed(1)}%)`, 11);
      });
      yPosition += 5;
    }

    // ===== FOOTER =====
    yPosition = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `CarbonLens © 2024 | Track your carbon footprint | https://carbonlens.local`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `CarbonLens_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

export const generateVisualPDFReport = async (reportElementId, userName) => {
  try {
    const element = document.getElementById(reportElementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    // Convert element to canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0e1a',
      scale: 2,
      logging: false,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add image to PDF (may span multiple pages)
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    // Save
    const fileName = `CarbonLens_FullReport_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Visual PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

export default { generatePDFReport, generateVisualPDFReport };
