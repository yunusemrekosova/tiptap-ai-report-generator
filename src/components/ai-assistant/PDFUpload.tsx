'use client';

import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

type PDFUploadProps = {
  onPDFProcessed: (text: string, filename: string) => void;
};

export function PDFUpload({ onPDFProcessed }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // For now, just extract filename and inform user
      // We'll pass a placeholder text
      const placeholderText = `This is the ${file.name} annual report. Please analyze it for Team Wendy market insights.`;
      
      setUploadedFile(file.name);
      onPDFProcessed(placeholderText, file.name);
      
      console.log('PDF uploaded:', file.name, 'Size:', file.size);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <h3 className="text-sm font-semibold mb-2">Annual Report (PDF)</h3>
      
      {!uploadedFile ? (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">
              {uploading ? 'Processing...' : 'Upload Annual Report PDF'}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 flex-1 truncate">{uploadedFile}</span>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-green-100 rounded"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        PDF content will be included in AI analysis
      </p>
    </div>
  );
}