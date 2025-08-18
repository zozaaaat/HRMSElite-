// Demo script for AI endpoints
// Using node-fetch for compatibility with Node.js versions < 18
// Install node-fetch if not already installed: npm install node-fetch

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'x-user-role': 'company_manager',
  'x-user-id': '1'
};

async function testAIEndpoints() {
  console.info('🤖 Testing AI Endpoints\n');

  const testText = 'هذا نص تجريبي لاختبار وظائف الذكاء الاصطناعي في نظام إدارة الموارد البشرية. النص يحتوي على معلومات مهمة حول أداء الموظفين وتحليل البيانات.';

  try {
    // Test 1: Text Summarization
    console.info('1️⃣ Testing Text Summarization...');
    const summaryResponse = await fetch(`${BASE_URL}/api/ai/summary`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.info('✅ Summary generated successfully');
      console.info(`📝 Summary: ${summaryData.summary}`);
      console.info(`📊 Compression: ${summaryData.compressionRatio}\n`);
    } else {
      console.info('❌ Summary generation failed');
    }

    // Test 2: Sentiment Analysis
    console.info('2️⃣ Testing Sentiment Analysis...');
    const sentimentResponse = await fetch(`${BASE_URL}/api/ai/sentiment`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (sentimentResponse.ok) {
      const sentimentData = await sentimentResponse.json();
      console.info('✅ Sentiment analyzed successfully');
      console.info(`😊 Sentiment: ${sentimentData.sentiment}`);
      console.info(`🎯 Confidence: ${(sentimentData.confidence * 100).toFixed(1)}%\n`);
    } else {
      console.info('❌ Sentiment analysis failed');
    }

    // Test 3: Keyword Extraction
    console.info('3️⃣ Testing Keyword Extraction...');
    const keywordsResponse = await fetch(`${BASE_URL}/api/ai/keywords`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (keywordsResponse.ok) {
      const keywordsData = await keywordsResponse.json();
      console.info('✅ Keywords extracted successfully');
      console.info(`🔑 Keywords: ${keywordsData.keywords.join(', ')}`);
      console.info(`📊 Count: ${keywordsData.count}\n`);
    } else {
      console.info('❌ Keyword extraction failed');
    }

    // Test 4: Insights Generation
    console.info('4️⃣ Testing Insights Generation...');
    const insightsResponse = await fetch(`${BASE_URL}/api/ai/insights`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ 
        data: {
          employees: 100,
          departments: 5,
          attendance: 95
        }
      })
    });
    
    if (insightsResponse.ok) {
      const insightsData = await insightsResponse.json();
      console.info('✅ Insights generated successfully');
      console.info('💡 Insights:');
      insightsData.insights.forEach((insight, index) => {
        console.info(`   ${index + 1}. ${insight}`);
      });
      console.info();
    } else {
      console.info('❌ Insights generation failed');
    }

    // Test 5: Comprehensive Analysis
    console.info('5️⃣ Testing Comprehensive Analysis...');
    const analyzeResponse = await fetch(`${BASE_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (analyzeResponse.ok) {
      const analyzeData = await analyzeResponse.json();
      console.info('✅ Comprehensive analysis completed');
      console.info(`📝 Summary: ${analyzeData.summary}`);
      console.info(`😊 Sentiment: ${analyzeData.sentiment} (${(analyzeData.confidence * 100).toFixed(1)}%)`);
      console.info(`🔑 Keywords: ${analyzeData.keywords.join(', ')}`);
      console.info(`📊 Analysis: ${analyzeData.analysis.compressionRatio} compression, ${analyzeData.analysis.keywordCount} keywords\n`);
    } else {
      console.info('❌ Comprehensive analysis failed');
    }

    // Test 6: Service Status
    console.info('6️⃣ Testing Service Status...');
    const statusResponse = await fetch(`${BASE_URL}/api/ai/status`, {
      method: 'GET',
      headers: AUTH_HEADERS
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.info('✅ Service status retrieved');
      console.info(`🟢 Status: ${statusData.status}`);
      console.info(`🔧 Service: ${statusData.service}`);
      console.info(`📦 Version: ${statusData.version}`);
      console.info(`✨ Features: ${statusData.features.join(', ')}\n`);
    } else {
      console.info('❌ Status check failed');
    }

    console.info('🎉 All AI endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error testing AI endpoints:', error.message);
    console.info('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// Run the demo
testAIEndpoints(); 