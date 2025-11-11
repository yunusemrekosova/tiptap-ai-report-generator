'use client';

import React, { useState } from 'react';
import { Download, FileText, FileType, Loader2 } from 'lucide-react';
import { Editor } from '@tiptap/react';

type ExportButtonsProps = {
  editor: Editor | null;
};

export function ExportButtons({ editor }: ExportButtonsProps) {
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportMarkdown = () => {
    if (!editor) return;

    try {
      // Get HTML content and convert to markdown-style text
      const html = editor.getHTML();
      
      // Simple HTML to Markdown conversion
      let markdown = html
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, ''); // Remove remaining HTML tags
      
      // Create blob and download
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'team-wendy-report.md';
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('Markdown exported successfully');
    } catch (error) {
      console.error('Markdown export error:', error);
      alert('Failed to export markdown');
    }
  };

  const handleExportHTML = () => {
    if (!editor) return;

    try {
      // Get HTML content
      const html = editor.getHTML();
      
      // Create a complete HTML document
      const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Wendy Market Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3 { color: #333; margin-top: 24px; }
    p { margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
      
      // Create blob and download
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'team-wendy-report.html';
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('HTML exported successfully');
    } catch (error) {
      console.error('HTML export error:', error);
      alert('Failed to export HTML');
    }
  };

  const handleExportPDF = async () => {
    if (!editor) return;

    setExportingPDF(true);

    try {
      // Dynamically import libraries (they're large, so load on demand)
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Get the editor element
      const editorElement = editor.view.dom;
      
      // Create canvas from editor content
      const canvas = await html2canvas(editorElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save('team-wendy-report.pdf');
      
      console.log('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 border-t border-gray-200 bg-white">
      <h3 className="text-sm font-semibold mb-1">Export Report</h3>
      
      <button
        onClick={handleExportMarkdown}
        disabled={!editor}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        <FileText className="w-4 h-4" />
        Download Markdown
      </button>
      
      <button
        onClick={handleExportHTML}
        disabled={!editor}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
      >
        <FileType className="w-4 h-4" />
        Download HTML
      </button>
      
      <button
        onClick={handleExportPDF}
        disabled={!editor || exportingPDF}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
      >
        {exportingPDF ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {exportingPDF ? 'Generating PDF...' : 'Download PDF'}
      </button>
    </div>
  );
}