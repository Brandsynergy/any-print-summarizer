#!/usr/bin/env node

/**
 * Test script to verify academic mode functionality
 * This tests the API endpoints with different modes
 */

const testText = `
Artificial Intelligence (AI) represents one of the most significant technological developments of the 21st century. 
It encompasses machine learning, neural networks, deep learning, and natural language processing. 
AI systems can analyze vast amounts of data, recognize patterns, and make decisions with minimal human intervention.
Applications range from autonomous vehicles to medical diagnosis, financial analysis, and creative content generation.
The ethical implications include concerns about job displacement, privacy, bias in algorithms, and the need for responsible AI development.
Current research focuses on explainable AI, quantum computing integration, and achieving artificial general intelligence.
`;

async function testStandardMode() {
  console.log('\n🌟 Testing Standard Mode...');
  try {
    const response = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: testText, 
        mode: 'standard' 
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Standard mode successful');
      console.log(`📊 Summary length: ${data.wordCount.summary} words`);
      console.log(`🔄 Mode returned: ${data.mode}`);
      console.log('📝 Summary preview:', data.summary.substring(0, 200) + '...');
    } else {
      console.log('❌ Standard mode failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Standard mode error:', error.message);
  }
}

async function testAcademicMode() {
  console.log('\n🎓 Testing Academic Mode...');
  try {
    const response = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: testText, 
        mode: 'academic' 
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Academic mode successful');
      console.log(`📊 Summary length: ${data.wordCount.summary} words`);
      console.log(`🔄 Mode returned: ${data.mode}`);
      console.log(`🎓 Has academic context: ${!!data.academicContext}`);
      console.log('📝 Summary preview:', data.summary.substring(0, 200) + '...');
      if (data.academicContext) {
        console.log('🏛️ Academic context preview:', data.academicContext.substring(0, 150) + '...');
      }
    } else {
      console.log('❌ Academic mode failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Academic mode error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting Academic Mode API Tests');
  console.log('====================================');
  
  await testStandardMode();
  await testAcademicMode();
  
  console.log('\n✨ Tests completed!');
  console.log('\nNext steps:');
  console.log('1. Visit http://localhost:3000 to test the UI');
  console.log('2. Try uploading an image and switching between modes');
  console.log('3. Check that academic mode produces longer, more detailed summaries');
}

// Only run if OpenAI API key is available
if (process.env.OPENAI_API_KEY) {
  runTests();
} else {
  console.log('⚠️  OPENAI_API_KEY not found in environment');
  console.log('Please set your API key in .env.local to test the summarization');
  console.log('\nYou can still test the UI functionality at http://localhost:3000');
}