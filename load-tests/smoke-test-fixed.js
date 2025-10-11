/**
 * FIXED K6 Smoke Test
 * Tests only endpoints that exist in your app
 * Duration: ~30 seconds
 */

import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  group('Homepage', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'homepage loads': (r) => r.status === 200,
      'homepage is fast': (r) => r.timings.duration < 1000,
    });
  });

  group('Login Page', () => {
    const res = http.get(`${BASE_URL}/login`);
    check(res, {
      'login page loads': (r) => r.status === 200,
    });
  });

  group('API Endpoints', () => {
    // Only test endpoints that exist
    const endpoints = [
      '/api/announcements',
      '/api/tribes',
      // Removed /api/competitions - doesn't exist
    ];

    endpoints.forEach((endpoint) => {
      const res = http.get(`${BASE_URL}${endpoint}`);
      check(res, {
        [`${endpoint} responds`]: (r) => r.status === 200 || r.status === 401,
        [`${endpoint} is fast`]: (r) => r.timings.duration < 2000,
      });
    });
  });
}

export function handleSummary(data) {
  const passed = data.metrics.checks.values.passes;
  const failed = data.metrics.checks.values.fails;
  const total = passed + failed;
  const passRate = (passed / total) * 100;

  console.log('\n===========================================');
  console.log('        SMOKE TEST RESULTS');
  console.log('===========================================');
  console.log(`Checks Passed: ${passed}/${total} (${passRate.toFixed(1)}%)`);
  console.log(`Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(0)}ms`);
  console.log(`Max Response Time: ${data.metrics.http_req_duration.values.max.toFixed(0)}ms`);
  console.log(`Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(1)}%`);
  console.log('===========================================');
  
  if (passRate >= 95) {
    console.log('✓ Smoke test PASSED! Ready for load testing.');
  } else {
    console.log('✗ Smoke test FAILED! Fix issues before load testing.');
  }
  console.log('===========================================\n');

  return {
    'smoke-test-results.json': JSON.stringify(data, null, 2),
  };
}

