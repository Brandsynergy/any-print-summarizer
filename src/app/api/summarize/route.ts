import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only when needed
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Helper function to preprocess and optimize text
function preprocessText(text: string): string {
  // Clean up the text
  let cleanedText = text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
  
  // If text is very long, truncate to avoid excessive API costs and processing time
  const maxLength = 8000; // Roughly 6000 tokens
  if (cleanedText.length > maxLength) {
    cleanedText = cleanedText.substring(0, maxLength) + '...';
  }
  
  return cleanedText;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'Text content is required and must be at least 50 characters long' 
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI service not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Preprocess text for optimal performance
    const processedText = preprocessText(text);

    // Use a single optimized prompt for both summary and takeaways
    const combinedPrompt = `Please analyze the following text and provide both a summary and key takeaways:

${processedText}

Please respond with the following format:

## SUMMARY
[Create a comprehensive yet concise summary in no more than 1000 words. Make it engaging and easy to understand for a general audience, including children. Keep the language simple but informative.]

## 10 KEY TAKEAWAYS
[Extract exactly 10 key takeaways or lessons. Format as a numbered list (1-10) with each takeaway being concise but meaningful. Focus on actionable insights, important facts, or valuable lessons.]`;

    // Single API call instead of two parallel calls
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI service not configured. Please contact support.' 
      }, { status: 500 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Faster and more efficient than gpt-3.5-turbo
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates clear, educational content suitable for all ages. Focus on making complex topics accessible and interesting."
        },
        {
          role: "user",
          content: combinedPrompt
        }
      ],
      max_tokens: 2200,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to generate summary or takeaways' 
      }, { status: 500 });
    }

    // Parse the combined response
    const sections = content.split('## ');
    let summary = '';
    let takeaways = '';

    for (const section of sections) {
      const trimmedSection = section.trim();
      if (trimmedSection.startsWith('SUMMARY')) {
        summary = trimmedSection.replace('SUMMARY', '').trim();
      } else if (trimmedSection.startsWith('10 KEY TAKEAWAYS')) {
        takeaways = trimmedSection.replace('10 KEY TAKEAWAYS', '').trim();
      }
    }

    // Fallback parsing if the format isn't followed exactly
    if (!summary || !takeaways) {
      const parts = content.split(/(?:10 key takeaways|key takeaways|takeaways):?/i);
      if (parts.length >= 2) {
        summary = parts[0].replace(/summary:?/i, '').trim();
        takeaways = parts[1].trim();
      } else {
        // If parsing fails, treat the entire content as summary
        summary = content;
        takeaways = 'Unable to extract specific takeaways from this content.';
      }
    }

    return NextResponse.json({
      success: true,
      summary,
      takeaways,
      wordCount: {
        summary: summary.split(/\s+/).length,
        takeaways: takeaways.split(/\s+/).length,
        original: processedText.split(/\s+/).length
      }
    });

  } catch (error: any) {
    console.error('Summarization error:', error);
    
    let errorMessage = 'Failed to generate summary';
    if (error?.response?.status === 401) {
      errorMessage = 'AI service authentication failed. Please contact support.';
    } else if (error?.response?.status === 429) {
      errorMessage = 'Service temporarily overwhelmed. Please try again in a moment.';
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}