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
function preprocessText(text: string, mode: string = 'standard'): string {
  // Clean up the text
  let cleanedText = text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
  
  // Adjust max length based on mode
  // Academic mode allows longer input text for more comprehensive analysis
  const maxLength = mode === 'academic' ? 15000 : 8000; // Academic: ~12k tokens, Standard: ~6k tokens
  if (cleanedText.length > maxLength) {
    cleanedText = cleanedText.substring(0, maxLength) + '...';
  }
  
  return cleanedText;
}

export async function POST(request: NextRequest) {
  try {
    const { text, mode = 'standard' } = await request.json();

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
    const processedText = preprocessText(text, mode);

    // Create different prompts based on mode
    let combinedPrompt: string;
    let maxTokens: number;
    let systemPrompt: string;
    
    if (mode === 'academic') {
      // GPT-4 Turbo supports up to 128k tokens context and 4k completion
      maxTokens = 4000; // Safe limit for comprehensive academic analysis
      systemPrompt = "You are an academic assistant specialized in creating comprehensive, scholarly analyses. Your summaries should be thorough, well-structured, and suitable for research and academic purposes. Use formal language while remaining accessible.";
      
      combinedPrompt = `Please provide a comprehensive academic analysis of the following text:

${processedText}

IMPORTANT: You MUST follow this exact format structure. Do not include brackets or instructions in your response - provide actual content.

## ACADEMIC SUMMARY

Provide a detailed, comprehensive summary (1,500-3,000 words) that includes:
- Thorough analysis of main concepts and themes
- Critical examination of arguments and evidence  
- Discussion of methodology (if applicable)
- Contextual background and significance
- Connections to broader academic fields
- Evaluation of strengths and limitations
- Implications for further research or study

Use academic language and structure with clear explanations suitable for scholarly work.

## 10 CRITICAL INSIGHTS

Provide exactly 10 critical academic insights as a numbered list (1-10). Each insight should be detailed and analytically rigorous, focusing on:
- Theoretical implications
- Methodological contributions  
- Critical arguments
- Research gaps identified
- Academic significance
- Scholarly applications

## ACADEMIC CONTEXT

Provide additional context including:
- Related academic fields and theories
- Potential research applications
- Scholarly significance
- Connections to existing literature

Ensure the analysis is thorough, well-reasoned, and suitable for academic research purposes.`;
    } else {
      maxTokens = 2200; // Standard mode
      systemPrompt = "You are a helpful assistant that creates clear, educational content suitable for all ages. Focus on making complex topics accessible and interesting.";
      
      combinedPrompt = `Please analyze the following text and provide both a summary and key takeaways:

${processedText}

Please respond with the following format:

## SUMMARY
[Create a comprehensive yet concise summary in no more than 2,000 words. Make it engaging and easy to understand for a general audience, including children. Keep the language simple but informative.]

## 10 KEY TAKEAWAYS
[Extract exactly 10 key takeaways or lessons. Format as a numbered list (1-10) with each takeaway being concise but meaningful. Focus on actionable insights, important facts, or valuable lessons.]`;
    }

    // Single API call instead of two parallel calls
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI service not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Use GPT-4o for both modes to ensure consistent availability and performance in production
    const modelToUse = mode === 'academic' ? 'gpt-4o' : 'gpt-4o-mini';
    
    // Add timeout and retry logic for production reliability
    const response = await Promise.race([
      client.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: combinedPrompt
          }
        ],
        max_tokens: maxTokens,
        temperature: mode === 'academic' ? 0.3 : 0.7, // Lower temperature for academic mode for more focused analysis
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 60000) // 60 second timeout
      )
    ]) as any;

    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to generate summary or takeaways' 
      }, { status: 500 });
    }

    // Enhanced parsing logic to handle various AI response formats
    console.log('Raw AI response:', content); // Debug logging
    
    let summary = '';
    let takeaways = '';
    let academicContext = '';
    
    // Method 1: Try parsing with ## headers
    const sections = content.split(/##\s*/g);
    console.log('Sections found:', sections.length, sections.map(s => s.substring(0, 50))); // Debug
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      const nextSection = sections[i + 1];
      
      if (section.match(/^ACADEMIC SUMMARY/i) || section.match(/^SUMMARY/i)) {
        // Extract everything after the header until the next section
        const headerMatch = section.match(/^(ACADEMIC SUMMARY|SUMMARY)[:\s]*/i);
        if (headerMatch) {
          const contentAfterHeader = section.substring(headerMatch[0].length);
          // If there's a next section, take content until that section starts
          if (nextSection && nextSection.match(/^(10 CRITICAL INSIGHTS|10 KEY TAKEAWAYS|ACADEMIC CONTEXT)/i)) {
            summary = contentAfterHeader.trim();
          } else {
            // No clear next section, take all remaining content
            summary = sections.slice(i).join('##').substring(headerMatch[0].length).trim();
            if (summary.includes('## 10 CRITICAL INSIGHTS') || summary.includes('## 10 KEY TAKEAWAYS')) {
              summary = summary.split(/##\s*(10 CRITICAL INSIGHTS|10 KEY TAKEAWAYS)/i)[0].trim();
            }
          }
        }
      } else if (section.match(/^10 CRITICAL INSIGHTS/i) || section.match(/^10 KEY TAKEAWAYS/i)) {
        const headerMatch = section.match(/^(10 CRITICAL INSIGHTS|10 KEY TAKEAWAYS)[:\s]*/i);
        if (headerMatch) {
          const contentAfterHeader = section.substring(headerMatch[0].length);
          if (nextSection && nextSection.match(/^ACADEMIC CONTEXT/i)) {
            takeaways = contentAfterHeader.trim();
          } else {
            takeaways = sections.slice(i).join('##').substring(headerMatch[0].length).trim();
            if (takeaways.includes('## ACADEMIC CONTEXT')) {
              takeaways = takeaways.split(/##\s*ACADEMIC CONTEXT/i)[0].trim();
            }
          }
        }
      } else if (section.match(/^ACADEMIC CONTEXT/i)) {
        const headerMatch = section.match(/^ACADEMIC CONTEXT[:\s]*/i);
        if (headerMatch) {
          academicContext = section.substring(headerMatch[0].length).trim();
        }
      }
    }
    
    // Method 2: Fallback parsing if Method 1 didn't work well
    if (!summary || summary.length < 50) {
      // Try splitting by different patterns
      const patterns = [
        /##\s*10\s*(CRITICAL INSIGHTS|KEY TAKEAWAYS)/i,
        /\n\s*10\s*(CRITICAL INSIGHTS|KEY TAKEAWAYS)/i,
        /(CRITICAL INSIGHTS|KEY TAKEAWAYS)\s*:/i
      ];
      
      for (const pattern of patterns) {
        const parts = content.split(pattern);
        if (parts.length >= 2 && parts[0].trim().length > 50) {
          // Clean up the summary part
          summary = parts[0]
            .replace(/^##\s*(ACADEMIC SUMMARY|SUMMARY)[:\s]*/i, '')
            .trim();
          break;
        }
      }
    }
    
    // Method 3: Extract takeaways if still empty
    if (!takeaways || takeaways.length < 20) {
      const insightsMatch = content.match(/(?:##\s*)?(10\s*(?:CRITICAL INSIGHTS|KEY TAKEAWAYS))([\s\S]*?)(?=##\s*ACADEMIC CONTEXT|$)/i);
      if (insightsMatch && insightsMatch[2]) {
        takeaways = insightsMatch[2].trim();
      } else {
        // Try to extract numbered list
        const numberedList = content.match(/1\.[\s\S]*?(?=##|$)/i);
        if (numberedList) {
          takeaways = numberedList[0].trim();
        }
      }
    }
    
    // Final fallback
    if (!summary && !takeaways) {
      summary = content;
      takeaways = 'Unable to extract specific takeaways from this content.';
    } else if (!summary) {
      // If we have takeaways but no summary, try to extract summary from the beginning
      const beforeTakeaways = content.split(/(?:##\s*)?10\s*(?:CRITICAL INSIGHTS|KEY TAKEAWAYS)/i)[0];
      summary = beforeTakeaways.replace(/^##\s*(ACADEMIC SUMMARY|SUMMARY)[:\s]*/i, '').trim();
      if (summary.length < 50) {
        summary = 'Summary extraction failed. Please try with different text.';
      }
    }
    
    console.log('Parsed summary length:', summary.length);
    console.log('Parsed takeaways length:', takeaways.length);

    const responseData: any = {
      success: true,
      summary,
      takeaways,
      wordCount: {
        summary: summary.split(/\s+/).length,
        takeaways: takeaways.split(/\s+/).length,
        original: processedText.split(/\s+/).length
      },
      mode
    };
    
    // Add academic context if available
    if (mode === 'academic' && academicContext) {
      responseData.academicContext = academicContext;
    }
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Summarization error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      stack: error?.stack
    });
    
    let errorMessage = 'Failed to generate summary';
    let statusCode = 500;
    
    if (error?.message === 'Request timeout') {
      errorMessage = 'Request timed out. The text might be too long or the service is busy. Please try again with shorter text.';
      statusCode = 408;
    } else if (error?.response?.status === 401) {
      errorMessage = 'AI service authentication failed. Please contact support.';
      statusCode = 401;
    } else if (error?.response?.status === 429) {
      errorMessage = 'Service temporarily overwhelmed. Please try again in a moment.';
      statusCode = 429;
    } else if (error?.response?.status === 400) {
      errorMessage = 'Invalid request to AI service. Please try with different text.';
      statusCode = 400;
    } else if (!process.env.OPENAI_API_KEY) {
      errorMessage = 'AI service not configured. Please contact support.';
      statusCode = 500;
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: statusCode });
  }
}
