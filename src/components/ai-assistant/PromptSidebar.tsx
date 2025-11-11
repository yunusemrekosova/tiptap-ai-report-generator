'use client';

import React, { useState } from 'react';
import { Play, Check, Loader2, AlertCircle } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { PDFUpload } from './PDFUpload';
import { ExportButtons } from './ExportButtons';

type PromptStep = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
};

const PROMPT_STEPS: PromptStep[] = [
  {
    id: '01-introduction',
    title: 'Company Overview',
    description: 'Generate comprehensive company overview with web search',
    status: 'pending',
  },
  {
    id: '02-offerings',
    title: 'Offerings Analysis',
    description: 'Identify Existing/Adjacent/New offerings',
    status: 'pending',
  },
  {
    id: '03-segments',
    title: 'Customer Segments',
    description: 'Define market segments (MECE approach)',
    status: 'pending',
  },
  {
    id: '04-geographies',
    title: 'Geographies',
    description: 'Map geographic markets',
    status: 'pending',
  },
  {
    id: '05-existing-matrix',
    title: 'Existing Market Matrix',
    description: 'Generate existing market combinations',
    status: 'pending',
  },
  {
    id: '06-adjacent-new-matrix',
    title: 'Adjacent & New Markets',
    description: 'Identify expansion opportunities',
    status: 'pending',
  },
  {
    id: '07-synthesis',
    title: 'Synthesis & Q&A',
    description: 'Generate strategic insights',
    status: 'pending',
  },
  {
    id: '08-pdf-refinement',
    title: '📄 Refine with PDF',
    description: 'Enrich report with annual report insights',
    status: 'pending',
  },
];

type PromptSidebarProps = {
  editor: Editor | null;
};

export function PromptSidebar({ editor }: PromptSidebarProps) {
  const [steps, setSteps] = useState<PromptStep[]>(PROMPT_STEPS);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>('');
  const [pdfFilename, setPdfFilename] = useState<string>('');

  const handlePDFProcessed = (text: string, filename: string) => {
    console.log('PDF processed:', filename);
    console.log('Text length:', text.length);
    setPdfText(text);
    setPdfFilename(filename);
  };

  const executeStep = async (stepId: string) => {
    if (!editor) {
      alert('Editor is not ready yet');
      return;
    }
  
    // Special handling for PDF refinement
    if (stepId === '08-pdf-refinement' && !pdfText) {
      alert('Please upload the annual report PDF first!');
      return;
    }
  
    setCurrentStep(stepId);
    
    // Update status to running
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, status: 'running' } : step
      )
    );
  
    try {
      console.log('Starting API call for step:', stepId);
      
      // Get current report content
      const currentReport = editor.state.doc.textContent || '';
      
      // Build message content based on step
      let messageContent = '';
      
      if (stepId === '01-introduction') {
        // First step - no existing content
        messageContent = `Execute prompt: ${stepId} for Team Wendy`;
      } else if (stepId === '08-pdf-refinement') {
        // PDF refinement - special case
        messageContent = `EXISTING REPORT TO ENRICH:
${currentReport}

ANNUAL REPORT CONTEXT:
${pdfText}

Task: Enrich the existing report above with specific insights, data, and facts from the annual report context.`;
      } else {
        // All other steps - APPEND to existing content
        messageContent = `CURRENT REPORT CONTENT:
${currentReport}

---

Execute prompt: ${stepId} for Team Wendy

IMPORTANT: The report above already exists. Your task is to ADD a new section to it. Do NOT regenerate or modify existing sections. Only APPEND your new section at the end of the report.`;
      }
      
      // Add PDF context if available (for non-refinement steps)
      if (pdfText && stepId !== '08-pdf-refinement' && stepId !== '01-introduction') {
        messageContent += `\n\nAnnual Report Context (${pdfFilename}):\n${pdfText.substring(0, 10000)}`;
      }
      
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: messageContent,
            },
          ],
          promptType: stepId,
        }),
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
  
      // Read the stream properly
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }
  
      const decoder = new TextDecoder();
      let fullContent = '';
  
      // Read stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream finished');
          break;
        }
  
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
      }
  
      console.log('Full content length:', fullContent.length);
  
      // Insert into editor - APPEND instead of REPLACE
      if (fullContent.trim()) {
        if (stepId === '01-introduction') {
          // First step - set content (replace)
          const htmlContent = fullContent
            .split('\n\n')
            .filter(p => p.trim())
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
          
          console.log('Setting initial content');
          editor.commands.setContent(htmlContent);
        } else {
          // Other steps - APPEND to existing content
          const newContent = fullContent
            .split('\n\n')
            .filter(p => p.trim())
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
          
          // Get current content and append
          const currentHTML = editor.getHTML();
          console.log('Appending new content to existing report');
          editor.commands.setContent(currentHTML + newContent);
        }
      } else {
        console.warn('No content received from AI');
      }
      
      // Update status to completed
      setSteps(prev =>
        prev.map(step =>
          step.id === stepId ? { ...step, status: 'completed' } : step
        )
      );
    } catch (error) {
      console.error('Error executing step:', error);
      setSteps(prev =>
        prev.map(step =>
          step.id === stepId ? { ...step, status: 'error' } : step
        )
      );
    } finally {
      setCurrentStep(null);
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold">Report Generation</h2>
      </div>
      
      {/* PDF Upload Component - Fixed */}
      <div className="flex-shrink-0">
        <PDFUpload onPDFProcessed={handlePDFProcessed} />
      </div>
      
      {/* Scrollable Prompt Buttons - Takes remaining space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg border ${
              step.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : step.status === 'running'
                ? 'bg-blue-50 border-blue-200'
                : step.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {step.status === 'completed' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : step.status === 'running' ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <span className="text-sm text-gray-500">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-sm">{step.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
              </div>
              
              {step.status === 'pending' && (
                <button
                  onClick={() => executeStep(step.id)}
                  disabled={currentStep !== null}
                  className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Export Buttons - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ExportButtons editor={editor} />
      </div>
    </div>
  );
}