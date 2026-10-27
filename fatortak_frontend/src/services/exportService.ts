
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportStatsDto } from '@/types/reports';

export const exportService = {
  exportToPDF: async (elementId: string, filename: string = 'report.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found for export');
    }

    // `html2canvas` has known issues with Arabic/RTL bidi rendering in some cases.
    // We force RTL semantics on the cloned DOM when the source element is RTL.
    const isRTL =
      element.getAttribute('dir') === 'rtl' ||
      getComputedStyle(element).direction === 'rtl' ||
      element.closest('[dir="rtl"]') !== null;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      foreignObjectRendering: true,
      onclone: (clonedDoc) => {
        if (!isRTL) return;
        const clonedEl = clonedDoc.getElementById(elementId);
        if (!clonedEl) return;

        clonedEl.setAttribute('dir', 'rtl');
        // Ensure bidi algorithm runs correctly inside the render clone.
        (clonedEl as HTMLElement).style.direction = 'rtl';
        (clonedEl as HTMLElement).style.unicodeBidi = 'plaintext';
        (clonedEl as HTMLElement).style.textAlign = 'right';
      },
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  },

  exportToCSV: (data: any[], filename: string = 'report.csv') => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  exportStatsToJSON: (stats: ReportStatsDto, filename: string = 'stats.json') => {
    const jsonContent = JSON.stringify(stats, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}
