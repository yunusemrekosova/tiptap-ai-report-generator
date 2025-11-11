import { NextRequest, NextResponse } from 'next/server';

// Use nodejs runtime for pdf-parse compatibility
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const filename = req.headers.get('X-Filename') || 'document.pdf';
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import pdf-parse with type assertion
    const pdf = (await import('pdf-parse') as any).default;

    // Parse PDF
    const data = await pdf(buffer);
    
    console.log('PDF processed:', filename);
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length);

    return NextResponse.json({
      success: true,
      filename,
      text: data.text,
      pages: data.numpages,
      info: data.info,
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}