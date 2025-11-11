'use client';

import React from 'react';
import { PromptSidebar } from './PromptSidebar';
import { ChatInterface } from './ChatInterface';
import { Editor } from '@tiptap/react';

type AIAssistantLayoutProps = {
  editor: Editor | null;
  children: React.ReactNode;
};

export function AIAssistantLayout({ editor, children }: AIAssistantLayoutProps) {
  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar */}
      <PromptSidebar editor={editor} />
      
      {/* Center - Editor */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      
      {/* Right Sidebar */}
      <ChatInterface />
    </div>
  );
}