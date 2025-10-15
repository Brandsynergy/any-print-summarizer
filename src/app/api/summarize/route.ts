import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
// Updated: Enhanced academic analysis with anti-repetition - v2.0
// Optional imports for monetization features
let getServerSession: any = null;
let PrismaClient: any = null;
let prisma: any = null;

// Try to import monetization features (optional)
try {
  const nextAuth = require("next-auth/next");
  getServerSession = nextAuth.getServerSession;
  const prismaClient = require("@prisma/client");
  PrismaClient = prismaClient.PrismaClient;
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
  }
} catch (error) {
  console.log('Monetization features not available - running in basic mode');
}

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
    
    // Simplified authentication - no premium restrictions 
    // All restrictions handled on client side
    let user = null;
    let session = null;
    
    if (getServerSession && prisma) {
      try {
        // Get user session (optional)
        session = await getServerSession();
        
        if (session?.user?.email) {
          // Find or create user (optional)
          user = await prisma.user.findUnique({
            where: { email: session.user.email }
          });
          
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: session.user.email,
                name: session.user.name || null
              }
            });
          }
        }
      } catch (authError) {
        console.log('Authentication check failed, proceeding without limits:', authError);
        // Continue without authentication in basic mode
      }
    }

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
      systemPrompt = "You are a meticulous academic researcher. ABSOLUTELY CRITICAL: Each section must cover completely different aspects - never repeat content, ideas, or analysis between sections. Follow the strict rules for each section precisely. If you repeat content between sections, the analysis will be considered flawed. Demonstrate expertise through unique, non-overlapping insights in each section.";
      
      combinedPrompt = `Analyze this text using three completely different analytical lenses. Each section must focus on distinct aspects with no overlap.

${processedText}

## ACADEMIC SUMMARY

Provide an extensive, detailed academic analysis (MINIMUM 4,000-6,000 words). Focus ONLY on content analysis and argument structure. Do NOT discuss historical context, contemporary relevance, or broader implications - save those for other sections.

**PART 1: What the Text Says (Content Deep-Dive - 1,500-2,000 words)**:
Provide a thorough, comprehensive examination of the content:
- Identify and explain ALL main arguments, claims, and propositions in detail
- Examine every piece of supporting evidence, data, examples, and citations provided
- Analyze the logical flow and structure of each argument section by section
- Evaluate internal consistency and coherence throughout the entire work
- Discuss key concepts, definitions, and terminology used
- Explain complex ideas and theories presented in accessible but scholarly language
- Identify underlying premises and foundational assumptions

**PART 2: How the Argument is Constructed (Structural Analysis - 1,500-2,000 words)**:
Provide detailed analysis of the argumentative framework:
- Analyze rhetorical strategies, persuasive techniques, and stylistic choices
- Examine how evidence is presented, organized, and sequenced for maximum effect
- Assess the strength and effectiveness of logical connections between different ideas
- Evaluate the overall argumentative framework and its scholarly sophistication
- Discuss the author's approach to building credibility and authority
- Analyze transitions, organization patterns, and structural choices
- Examine how counterarguments are addressed or anticipated

**PART 3: Quality and Rigor Assessment (Evaluation - 1,000-2,000 words)**:
Provide comprehensive evaluation of scholarly quality:
- Judge the adequacy, reliability, and currency of all evidence presented
- Assess methodological soundness, research design, and analytical approaches (if applicable)
- Identify any logical fallacies, weak reasoning, or unsupported claims
- Evaluate overall persuasiveness, scholarly merit, and intellectual rigor
- Assess clarity of presentation and accessibility to intended audience
- Examine the thoroughness of research and use of sources
- Evaluate the originality and significance of contributions made

Write with substantial depth and detail in each part. Provide specific examples and quotations where relevant. STRICT RULE: Do not mention historical background, contemporary debates, future implications, or broader academic positioning - these belong in other sections.

## 10 CRITICAL INSIGHTS

Provide 10 insights (200-300 words each) focusing ONLY on hidden patterns, subtle implications, and deeper meanings that casual readers would miss. Do NOT repeat content from the summary or discuss historical/contemporary context.

1. **Underlying Assumptions**: What unstated assumptions does this work rely on?
2. **Subtle Contradictions**: Are there any internal tensions or contradictions?
3. **Missing Perspectives**: What viewpoints or voices are absent from this analysis?
4. **Methodological Blind Spots**: What limitations in approach might affect conclusions?
5. **Implicit Biases**: What cultural, ideological, or disciplinary biases are present?
6. **Unexamined Variables**: What factors are overlooked that might be significant?
7. **Alternative Interpretations**: How else could this evidence be understood?
8. **Conceptual Gaps**: Where are the theoretical or conceptual weaknesses?
9. **Logical Vulnerabilities**: Where is the reasoning most susceptible to challenge?
10. **Hidden Complexities**: What nuances or complexities are underexplored?

STRICT RULE: Focus only on critical analysis of what's present in the text. Do not discuss broader academic context or implications.

## ACADEMIC CONTEXT

Focus ONLY on positioning and relationships (1,200-1,500 words). Do NOT analyze content, arguments, or evidence quality - those were covered above.

**Historical Academic Lineage**:
- Trace intellectual traditions this work builds upon
- Identify theoretical schools of thought it represents
- Explain how it fits in the evolution of ideas in its field

**Contemporary Academic Landscape**:
- Position within current scholarly debates and conversations
- Identify which academic communities would find this relevant
- Relate to ongoing research programs and initiatives

**Future Academic Trajectory**:
- Predict potential influence on future scholarship
- Identify research directions this might inspire
- Assess likely reception by different academic audiences

STRICT RULE: Focus only on academic positioning and relationships. Do not re-analyze content, arguments, or evidence quality.`;
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
    
    // Track usage and store summary (optional)
    if (prisma && user) {
      try {
        // Update usage count
        if (mode === 'standard') {
          await prisma.user.update({
            where: { id: user.id },
            data: { standardUsed: { increment: 1 } }
          });
        } else if (mode === 'academic') {
          await prisma.user.update({
            where: { id: user.id },
            data: { academicUsed: { increment: 1 } }
          });
        }
        
        // Store the summary
        await prisma.summary.create({
          data: {
            userId: user.id,
            type: mode,
            title: `${mode} Summary - ${new Date().toLocaleDateString()}`,
            content: JSON.stringify({ summary, takeaways, academicContext })
          }
        });
      } catch (trackingError) {
        console.error('Usage tracking error:', trackingError);
        // Don't fail the request if tracking fails
      }
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
