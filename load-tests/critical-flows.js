/**
 * K6 Load Test - Critical User Flows
 * Tests the most important endpoints with 500+ concurrent users
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 300 },   // Ramp up to 300 users
    { duration: '3m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users for 5 min
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests must complete below 3s
    http_req_failed: ['rate<0.05'],     // Error rate must be below 5%
    errors: ['rate<0.05'],
  },
};

// Base URL - UPDATE THIS to your actual URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Sample user credentials for testing
const TEST_USERS = [
  { email: 'admin@test.com', password: 'testpassword' },
  { email: 'leader1@test.com', password: 'testpassword' },
  { email: 'attendee1@test.com', password: 'testpassword' },
];

export default function () {
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  
  // Test 1: Homepage Load
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  sleep(1);

  // Test 2: Login Page Load
  res = http.get(`${BASE_URL}/login`);
  check(res, {
    'login page status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);

  // Test 3: API - Get Announcements (Simulating Live Feed)
  res = http.get(`${BASE_URL}/api/announcements`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  check(res, {
    'announcements API status is 200': (r) => r.status === 200,
    'announcements load in <3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
  sleep(2);

  // Test 4: API - Get Tribes
  res = http.get(`${BASE_URL}/api/tribes`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  check(res, {
    'tribes API status is 200': (r) => r.status === 200,
    'tribes load in <3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
  sleep(2);

  // Test 5: API - Get Competitions (Results Board)
  res = http.get(`${BASE_URL}/api/competitions`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  check(res, {
    'competitions API status is 200': (r) => r.status === 200,
    'competitions load in <3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
  sleep(2);

  // Test 6: Dashboard Page (requires auth - will test public version)
  res = http.get(`${BASE_URL}/dashboard`);
  check(res, {
    'dashboard responds': (r) => r.status === 200 || r.status === 302 || r.status === 307,
  }) || errorRate.add(1);
  sleep(1);
}

export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n';
  summary += `${indent}✓ checks.........................: ${data.metrics.checks.values.passes / data.metrics.checks.values.count * 100}%\n`;
  summary += `${indent}✓ data_received.................: ${(data.metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB\n`;
  summary += `${indent}✓ data_sent.....................: ${(data.metrics.data_sent.values.count / 1024).toFixed(2)} KB\n`;
  summary += `${indent}✓ http_req_duration.............: avg=${data.metrics.http_req_duration.values.avg.toFixed(2)}ms min=${data.metrics.http_req_duration.values.min.toFixed(2)}ms med=${data.metrics.http_req_duration.values.med.toFixed(2)}ms max=${data.metrics.http_req_duration.values.max.toFixed(2)}ms p(95)=${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}✓ http_req_failed...............: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  summary += `${indent}✓ http_reqs.....................: ${data.metrics.http_reqs.values.count} requests\n`;
  summary += `${indent}✓ iteration_duration............: avg=${data.metrics.iteration_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}✓ iterations....................: ${data.metrics.iterations.values.count}\n`;
  summary += `${indent}✓ vus...........................: ${data.metrics.vus.values.value} (max: ${data.metrics.vus_max.values.value})\n`;

  return summary;
}

