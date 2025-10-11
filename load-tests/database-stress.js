/**
 * K6 Database Stress Test
 * Tests database-heavy operations with concurrent users
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 },   // Warm up
    { duration: '3m', target: 500 },   // Reach 500 users
    { duration: '5m', target: 500 },   // Hold at 500
    { duration: '1m', target: 0 },     // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const SCENARIOS = [
  { name: 'Check Announcements', weight: 40, endpoint: '/api/announcements' },
  { name: 'View Tribes', weight: 20, endpoint: '/api/tribes' },
  { name: 'Check Results', weight: 30, endpoint: '/api/competitions' },
  { name: 'View Leaderboard', weight: 10, endpoint: '/api/competitions/leaderboard' },
];

export default function () {
  // Weighted random scenario selection
  const rand = Math.random() * 100;
  let cumulative = 0;
  let scenario;

  for (const s of SCENARIOS) {
    cumulative += s.weight;
    if (rand <= cumulative) {
      scenario = s;
      break;
    }
  }

  // Execute selected scenario
  const res = http.get(`${BASE_URL}${scenario.endpoint}`, {
    tags: { name: scenario.name },
  });

  check(res, {
    [`${scenario.name}: status 200`]: (r) => r.status === 200,
    [`${scenario.name}: duration < 3s`]: (r) => r.timings.duration < 3000,
  });

  sleep(Math.random() * 5 + 1); // 1-6 seconds think time
}

