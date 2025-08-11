// Demo script for AI endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'x-user-role': 'company_manager',
  'x-user-id': '1'
};

async function testAIEndpoints() {
  console.log('🤖 Testing AI Endpoints\n');

  const testText = 'هذا نص تجريبي لاختبار وظائف الذكاء الاصطناعي في نظام إدارة الموارد البشرية. النص يحتوي على معلومات مهمة حول أداء الموظفين وتحليل البيانات.';

  try {
    // Test 1: Text Summarization
    console.log('1️⃣ Testing Text Summarization...');
    const summaryResponse = await fetch(`${BASE_URL}/api/ai/summary`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ Summary generated successfully');
      console.log(`📝 Summary: ${summaryData.summary}`);
      console.log(`📊 Compression: ${summaryData.compressionRatio}\n`);
    } else {
      console.log('❌ Summary generation failed');
    }

    // Test 2: Sentiment Analysis
    console.log('2️⃣ Testing Sentiment Analysis...');
    const sentimentResponse = await fetch(`${BASE_URL}/api/ai/sentiment`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (sentimentResponse.ok) {
      const sentimentData = await sentimentResponse.json();
      console.log('✅ Sentiment analyzed successfully');
      console.log(`😊 Sentiment: ${sentimentData.sentiment}`);
      console.log(`🎯 Confidence: ${(sentimentData.confidence * 100).toFixed(1)}%\n`);
    } else {
      console.log('❌ Sentiment analysis failed');
    }

    // Test 3: Keyword Extraction
    console.log('3️⃣ Testing Keyword Extraction...');
    const keywordsResponse = await fetch(`${BASE_URL}/api/ai/keywords`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (keywordsResponse.ok) {
      const keywordsData = await keywordsResponse.json();
      console.log('✅ Keywords extracted successfully');
      console.log(`🔑 Keywords: ${keywordsData.keywords.join(', ')}`);
      console.log(`📊 Count: ${keywordsData.count}\n`);
    } else {
      console.log('❌ Keyword extraction failed');
    }

    // Test 4: Insights Generation
    console.log('4️⃣ Testing Insights Generation...');
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
      console.log('✅ Insights generated successfully');
      console.log('💡 Insights:');
      insightsData.insights.forEach((insight, index) => {
        console.log(`   ${index + 1}. ${insight}`);
      });
      console.log();
    } else {
      console.log('❌ Insights generation failed');
    }

    // Test 5: Comprehensive Analysis
    console.log('5️⃣ Testing Comprehensive Analysis...');
    const analyzeResponse = await fetch(`${BASE_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ text: testText })
    });
    
    if (analyzeResponse.ok) {
      const analyzeData = await analyzeResponse.json();
      console.log('✅ Comprehensive analysis completed');
      console.log(`📝 Summary: ${analyzeData.summary}`);
      console.log(`😊 Sentiment: ${analyzeData.sentiment} (${(analyzeData.confidence * 100).toFixed(1)}%)`);
      console.log(`🔑 Keywords: ${analyzeData.keywords.join(', ')}`);
      console.log(`📊 Analysis: ${analyzeData.analysis.compressionRatio} compression, ${analyzeData.analysis.keywordCount} keywords\n`);
    } else {
      console.log('❌ Comprehensive analysis failed');
    }

    // Test 6: Service Status
    console.log('6️⃣ Testing Service Status...');
    const statusResponse = await fetch(`${BASE_URL}/api/ai/status`, {
      method: 'GET',
      headers: AUTH_HEADERS
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Service status retrieved');
      console.log(`🟢 Status: ${statusData.status}`);
      console.log(`🔧 Service: ${statusData.service}`);
      console.log(`📦 Version: ${statusData.version}`);
      console.log(`✨ Features: ${statusData.features.join(', ')}\n`);
    } else {
      console.log('❌ Status check failed');
    }

    console.log('🎉 All AI endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error testing AI endpoints:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// Run the demo
testAIEndpoints(); 