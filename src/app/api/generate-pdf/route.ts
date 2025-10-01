import { NextRequest, NextResponse } from 'next/server';

// Note: PDF generation is now handled client-side using jsPDF
// This endpoint is kept for backwards compatibility but returns a message
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: false, 
    error: 'PDF generation is now handled client-side. Please use the download button in the browser.' 
  }, { status: 410 }); // 410 Gone - endpoint no longer supported
}
