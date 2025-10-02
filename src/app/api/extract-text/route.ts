import { NextRequest, NextResponse } from 'next/server';

import Tesseract from 'tesseract.js';

// Server-side OCR processing for better performance
export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image data is required' 
      }, { status: 400 });
    }

    console.log('Starting server-side OCR processing...');
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Perform OCR on server
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: m => console.log('Server OCR:', m.status, m.progress ? `${Math.round(m.progress * 100)}%` : '')
    });

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ 
        success: false, 
        error: 'No readable text found in the image. Please try a clearer image.' 
      }, { status: 400 });
    }

    console.log('Server OCR completed. Text length:', text.length);

    return NextResponse.json({
      success: true,
      text: text.trim(),
      wordCount: text.trim().split(/\s+/).length
    });

  } catch (error) {
    console.error('Server OCR error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to extract text from image' 
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