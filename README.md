# AI-Powered Strategy Report Generator

An intelligent document generation system built with Tiptap AI Agent, enabling conversational AI-driven creation of professional market analysis reports with web search integration and PDF enrichment capabilities.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
![Tiptap](https://img.shields.io/badge/Tiptap_AI-blue?style=for-the-badge)
![GPT-4o](https://img.shields.io/badge/GPT--4o-green?style=for-the-badge&logo=openai)

## 🎯 Overview

A technical demonstration of AI-powered document generation showcasing:

- **Sequential AI Orchestration** - Master prompt coordinating multiple sub-prompts
- **Live Web Data** - Real-time research via GPT-4o web search
- **PDF Enrichment** - Integrating annual report insights
- **Interactive Q&A** - Conversational queries about generated content
- **Multi-Format Export** - Markdown, HTML, and PDF output

## ✨ Key Features

### 1. Report Generation Agent
- 7 sequential prompts building comprehensive analysis
- Each step appends to existing content (non-destructive workflow)
- Real-time streaming responses
- Automatic source citation

### 2. Web Search Integration
- GPT-4o built-in web browsing
- Fetches current market data and competitive intelligence
- Proper URL attribution

### 3. PDF-Based Refinement
- Upload company documents
- AI extracts financial data and strategic insights
- Integrates with citations including page numbers

### 4. Interactive Chat Interface
- Context-aware Q&A about generated reports
- Cite-specific report sections in responses

### 5. Professional Export
- Download as Markdown, HTML, or PDF
- View mode renders markdown as formatted HTML

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Editor**: Tiptap AI Agent Extension
- **AI**: OpenAI GPT-4o
- **Styling**: Tailwind CSS + Typography
- **Export**: jsPDF, html2canvas, marked

## 🚀 Quick Start

### Installation
```bash
# Clone repository
git clone https://github.com/yunusemrekosova/tiptap-ai-report-generator.git
cd tiptap-ai-report-generator

# Install dependencies
npm install

# Configure environment variables
# Create .env.local with:
# OPENAI_API_KEY=your_key
# NEXT_PUBLIC_TIPTAP_APP_ID=your_app_id
# NEXT_PUBLIC_TIPTAP_TOKEN=your_jwt_token

# Configure .npmrc for Tiptap Pro packages
# Add your Tiptap registry token

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **(Optional) Upload PDF** - Add company annual report for enriched analysis
2. **Execute Prompts** - Click buttons sequentially (1→7)
3. **Refine with PDF** - Enrich report with document insights
4. **Ask Questions** - Use chat interface for Q&A
5. **Export** - Download as Markdown/HTML/PDF
6. **View Report** - See formatted professional output

## 🎨 Prompt Engineering

### Orchestration Pattern
Sequential prompts that build upon previous outputs:
- Step 1: Foundation (web search)
- Steps 2-7: Append new sections
- Step 8: PDF-based enrichment

### Design Principles
- **PERSONA → TASK → FORMAT → OUTPUT** structure
- Explicit web search instructions
- Markdown table specifications
- Source citation requirements
- Append-only for sequential building

## 🔧 Implementation Highlights

### Tiptap Features Used
- `@tiptap-pro/extension-ai-agent` - AI document editing
- `@tiptap-pro/extension-export` - Multi-format export
- StarterKit, Table, CharacterCount extensions

### Key Challenges Solved
1. ✅ Enterprise AI Toolkit limitation → Custom backend integration
2. ✅ Sequential content building → Append logic with context passing
3. ✅ Model access issues → Switched to GPT-4o
4. ✅ Markdown rendering → Dual-mode editor/view with marked library
5. ✅ PDF processing in Edge → Node.js runtime for pdf-parse

## 📊 Project Structure

**Three-Panel Interface:**
- **Left**: Prompt execution + PDF upload + Export
- **Center**: Tiptap editor with streaming AI
- **Right**: Interactive Q&A chat

**Data Flow:**
```
Prompt → GPT-4o (+ Web Search) → Stream Response → 
Append to Editor → Markdown ↔ HTML → Export
```

## 🌐 Deployment

Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

## 📝 Environment Variables
```env
OPENAI_API_KEY=sk-...                    # OpenAI API key
NEXT_PUBLIC_TIPTAP_APP_ID=...           # Tiptap Cloud App ID
NEXT_PUBLIC_TIPTAP_TOKEN=...            # Tiptap JWT token
```

## 👨‍💻 Author

**Yunus Emre Kosova**

## 📄 License

Educational and demonstration purposes.

---

**Powered by Tiptap AI Agent & GPT-4o**
