#!/usr/bin/env node

// Google API Diagnostic Tool
// This script helps identify the root cause of API issues

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const CSE_ID = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID;

if (!API_KEY || !CSE_ID) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_GOOGLE_API_KEY:', API_KEY ? 'Present' : 'MISSING');
  console.error('NEXT_PUBLIC_GOOGLE_CSE_ID:', CSE_ID ? 'Present' : 'MISSING');
  process.exit(1);
}

console.log('🔧 Google Custom Search API Diagnostic Tool');
console.log('='.repeat(50));
console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`CSE ID: ${CSE_ID}`);
console.log('');

async function testAPI(query, testName) {
  console.log(`🧪 Testing: ${testName}`);
  console.log(`Query: ${query}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: API_KEY,
        cx: CSE_ID,
        q: query,
        num: 3,
        safe: 'off',
        filter: '1'
      },
      timeout: 10000
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Success (${responseTime}ms)`);
    console.log(`   Results: ${response.data.items?.length || 0}`);
    console.log(`   Total: ${response.data.searchInformation?.totalResults || 0}`);
    console.log(`   Status: ${response.status}`);
    
    // Check for quota headers
    const quotaHeaders = Object.keys(response.headers)
      .filter(h => h.includes('quota') || h.includes('limit') || h.includes('rate'))
      .map(h => `${h}: ${response.headers[h]}`)
      .join(', ');
    
    if (quotaHeaders) {
      console.log(`   Quota info: ${quotaHeaders}`);
    }
    
    return { success: true, responseTime, resultCount: response.data.items?.length || 0 };
    
  } catch (error) {
    console.log(`❌ Failed`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.response?.status || 'Network Error'}`);
    console.log(`   Data: ${JSON.stringify(error.response?.data || {}, null, 2)}`);
    
    return { success: false, error: error.message, status: error.response?.status };
  }
  
  console.log('');
}

async function runDiagnostics() {
  const tests = [
    { query: 'test', name: 'Basic API connectivity' },
    { query: 'software engineer', name: 'Simple job search' },
    { query: 'software engineer job linkedin', name: 'Job with site mention' },
    { query: 'software engineer site:linkedin.com', name: 'Site operator usage' },
    { query: 'software engineer (job OR position) site:linkedin.com location:"San Francisco"', name: 'Complex query (like app uses)' },
    { query: 'a'.repeat(500), name: 'Very long query (stress test)' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testAPI(test.query, test.name);
    results.push({ ...test, ...result });
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(50));
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  const successRate = Math.round((successCount / results.length) * 100);
  
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log(`Success rate: ${successRate}%`);
  
  if (failureCount > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(test => {
      console.log(`   ${test.name}: ${test.error} (${test.status || 'Network'})`);
    });
  }
  
  if (successCount > 0) {
    const avgResponseTime = Math.round(
      results.filter(r => r.success).reduce((sum, r) => sum + r.responseTime, 0) / successCount
    );
    console.log(`\nAverage response time: ${avgResponseTime}ms`);
  }
  
  console.log('\n🔍 RECOMMENDATIONS:');
  if (successRate < 70) {
    console.log('❗ Low success rate detected. Check:');
    console.log('   - Google Cloud Console > APIs & Services > Quotas');
    console.log('   - Billing is enabled on your Google Cloud project');
    console.log('   - Custom Search API is enabled');
    console.log('   - API key has correct permissions');
  } else if (successRate < 100) {
    console.log('⚠️  Some tests failed. This might indicate:');
    console.log('   - Rate limiting for complex queries');
    console.log('   - Query length restrictions');
    console.log('   - Intermittent network issues');
  } else {
    console.log('✅ All tests passed! API is working correctly.');
    console.log('   The 63% error rate might be due to:');
    console.log('   - Concurrent requests in production');
    console.log('   - Specific query patterns not tested here');
    console.log('   - Quota limits reached during high usage periods');
  }
}

runDiagnostics().catch(console.error);
