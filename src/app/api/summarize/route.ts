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
    const maxLength = mode === 'academic' ? 20000 : 8000; // Academic: ~16k tokens, Standard: ~6k tokens
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
      // GPT-4o supports comprehensive analysis - increase for thorough academic work
      maxTokens = 8000; // Higher limit for comprehensive academic analysis (8,000-10,000+ words)
      systemPrompt = "You are a distinguished academic researcher with deep expertise in your field. Your analysis must demonstrate intellectual sophistication and original thinking. CRITICAL: Never repeat content between sections - each section must offer completely unique perspectives and insights. Write with the authority of someone who has spent decades mastering their discipline, offering nuanced observations that only a true expert would make. Your analysis should reveal layers of meaning that casual readers would miss. Maintain scholarly rigor while writing in a naturally engaging voice that reflects genuine intellectual passion for the subject matter.";
      
      combinedPrompt = `You are a distinguished academic researcher conducting a comprehensive scholarly analysis. Each section below requires DISTINCTLY DIFFERENT content - avoid any repetition between sections. Demonstrate deep expertise and original thinking.

${processedText}

CRITICAL INSTRUCTION: Each section must contain completely unique content. Do NOT repeat ideas, concepts, or analysis across sections. Show intellectual sophistication by addressing different dimensions of the material.

## ACADEMIC SUMMARY

Produce a comprehensive academic summary (6,000-8,000 words) that demonstrates mastery of the subject matter. This section is your PRIMARY ANALYSIS - cover the material's essence completely:

1. **Opening Analysis (800-1000 words)**: Begin with the most compelling aspects of the work. What immediately strikes you as significant? Provide your expert assessment of the work's central proposition and its intellectual merit.

2. **Structural Examination (1200-1500 words)**: Dissect how the argument is constructed. Analyze the logical progression, examine how evidence is presented, evaluate the coherence of the overall framework. This is about HOW the work makes its case.

3. **Content Deep-Dive (1500-2000 words)**: Examine the substantive content in detail. What specific claims are made? What evidence supports them? Which arguments are strongest/weakest? Focus on WHAT is being argued.

4. **Methodological Assessment (1000-1200 words)**: If applicable, evaluate research methods, data collection, analytical approaches. How sound is the methodology? What are the procedural strengths and limitations?

5. **Intellectual Positioning (800-1000 words)**: Where does this work stand intellectually? How does it relate to major schools of thought? What intellectual tradition does it represent or challenge?

6. **Evaluative Conclusion (700-800 words)**: Your expert judgment on the work's overall contribution. What does it achieve? Where does it fall short? What is its lasting value?

Write as a true expert who has spent years thinking about these issues. Show genuine intellectual engagement.

## 10 CRITICAL INSIGHTS

Provide 10 UNIQUE analytical insights (200-300 words each). These must be DIFFERENT from anything in your summary. Each insight should be a distinctive observation that shows your expertise:

1. Focus on HIDDEN IMPLICATIONS not obvious to casual readers
2. Identify SUBTLE CONNECTIONS to broader intellectual movements
3. Spot METHODOLOGICAL INNOVATIONS or flaws others might miss
4. Recognize THEORETICAL CONTRIBUTIONS that advance the field
5. Find PRACTICAL APPLICATIONS beyond the obvious
6. Identify UNEXAMINED ASSUMPTIONS in the work
7. Spot INTERDISCIPLINARY BRIDGES the work creates
8. Recognize PARADIGM SHIFTS the work represents or suggests
9. Identify RESEARCH GAPS the work reveals but doesn't address
10. Assess the work's TRANSFORMATIVE POTENTIAL for the field

Each insight must reveal something new - think like a peer reviewer offering sophisticated commentary.

## ACADEMIC CONTEXT

This section must be ENTIRELY DIFFERENT from both previous sections. Focus specifically on PLACEMENT and POSITIONING (1200-1500 words):

**Historical Scholarly Context (400-500 words)**: Where does this work fit in the evolution of thought in its field? What came before that led to this? What scholarly conversations does it join?

**Contemporary Academic Landscape (400-500 words)**: How does this work relate to current debates and trends? Which contemporary scholars would find this relevant? What current research programs does it support or challenge?

**Disciplinary Impact Potential (400-500 words)**: How might this work influence future scholarship? What new research directions might it spawn? How could it reshape academic discourse?

Each paragraph must add new information not covered elsewhere. Show your knowledge of the broader academic ecosystem.`;
    } else {
      maxTokens = 2200; // Standard mode
      systemPrompt = "Write like a thoughtful teacher who genuinely cares about helping people understand things. Use your own voice - be conversational, ask rhetorical questions, share observations, and write as if you're explaining something fascinating to a curious friend. Mix up your sentence lengths and structures naturally. Don't be afraid to show enthusiasm or use everyday language alongside more formal terms.";
      
      combinedPrompt = `Hey! I've got some interesting material here that I'd love your take on. Could you help me break it down in a way that's engaging and easy to follow?

${processedText}

Here's what would be really helpful:

## SUMMARY

Give me the full picture in your own words (keep it under 2,000 words). What's this really about? Write like you're explaining something fascinating to a friend - use your natural voice, mix up your sentence structures, and don't be afraid to show what you find interesting about it. Make it accessible but don't dumb it down.

## 10 KEY TAKEAWAYS

What are the 10 most important things someone should walk away with? Number them 1-10, but write each one like you're sharing a genuine insight. Think about:
- What would stick with you after reading this?
- What practical lessons are here?
- What facts or ideas are worth remembering?
- What might change how someone thinks about this topic?

Write with personality - let your enthusiasm or curiosity show through naturally.`;
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
    console.log('Sections found:', sections.length, sections.map((s: string) => s.substring(0, 50))); // Debug
    
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
