'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText } from 'lucide-react';
import { Editor } from '@tiptap/react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: string[];
};

type ChatInterfaceProps = {
  editor: Editor | null;
};

export function ChatInterface({ editor }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Get report text - try multiple methods
    let reportText = '';
    
    try {
      if (editor && editor.state && editor.state.doc) {
        reportText = editor.state.doc.textContent || '';
      }
    } catch (e) {
      console.error('Error getting editor text:', e);
    }
    
    console.log('Report text length:', reportText.length);
  
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      // Call API with report context (even if empty)
      const contextMessage = reportText.length > 0
        ? `You are a strategy consultant assistant. Answer questions about the Team Wendy market report below. Always cite specific sections when answering.\n\nREPORT CONTENT:\n${reportText.substring(0, 15000)}`
        : 'You are a helpful strategy consultant assistant for Team Wendy. Note: No report has been generated yet, so provide general guidance.';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: contextMessage,
            },
            {
              role: 'user',
              content: input,
            },
          ],
        }),
      });
  
      if (!response.ok) throw new Error('Chat API failed');
  
      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
  
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
        }
      }
  
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };
  
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Report Q&A
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Ask questions about the generated report
        </p>
      </div>
  
      {/* Messages - Scrollable middle section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-2 mb-4">
              Ask questions about the report
            </p>
            <div className="space-y-2 text-xs text-left max-w-xs mx-auto">
              <div className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                   onClick={() => setInput("What are the key market drivers?")}>
                "What are the key market drivers?"
              </div>
              <div className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                   onClick={() => setInput("Summarize the competitive landscape")}>
                "Summarize the competitive landscape"
              </div>
              <div className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                   onClick={() => setInput("What growth rate is projected?")}>
                "What growth rate is projected?"
              </div>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                <p className="text-xs opacity-75 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
  
      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the report..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}