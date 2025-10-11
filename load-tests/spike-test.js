/**
 * K6 Spike Test - Sudden Load
 * Tests how the system handles sudden spikes in traffic
 * (e.g., when announcements are posted or results are updated)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },    // Normal load
    { duration: '10s', target: 800 },   // Sudden spike to 800 users!
    { duration: '30s', target: 800 },   // Maintain spike
    { duration: '10s', target: 50 },    // Drop back to normal
    { duration: '10s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 95% of requests should be below 5s during spike
    http_req_failed: ['rate<0.1'],      // Less than 10% errors during spike
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate users checking the Live Feed during a critical announcement
  const res = http.get(`${BASE_URL}/api/announcements`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(Math.random() * 3); // Random think time
}

