import { NextRequest, NextResponse } from 'next/server';

// Client-side OCR processing - no server-side file storage needed
export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image data is required' 
      }, { status: 400 });
    }

    // Return success - client will handle OCR processing with the imageData
    return NextResponse.json({
      success: true,
      message: 'Image ready for OCR processing',
      ready: true,
    });

  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process text extraction request' 
    }, { status: 500 });
  }
}

// Alternative server-side OCR implementation (commented out for now)
/*
import Tesseract from 'tesseract.js';

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filename is required' 
      }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), 'uploads', filename);
    
    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(filepath, 'eng', {
      logger: m => console.log(m)
    });

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: 'No readable text found in the image. Please try a clearer image.' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      text: text.trim(),
      wordCount: text.trim().split(/\s+/).length
    });

  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to extract text from image' 
    }, { status: 500 });
  }
}
*/