// k6 load test for wedding site
// Run with: k6 run tests/load/wedding-site.js
// Or with environment variable: k6 run -e BASE_URL=https://test.example.com tests/load/wedding-site.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const homePageDuration = new Trend('home_page_duration');

export const options = {
  stages: [
    { duration: '30s', target: 25 },   // Ramp up to 25 users
    { duration: '30s', target: 50 },   // Ramp to 50 users
    { duration: '1m', target: 100 },   // Ramp to 100 users (target)
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    // 95% of requests should complete under 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate should be under 1%
    'errors': ['rate<0.01'],
    // Home page specifically should be fast
    'home_page_duration': ['p(95)<400'],
  },
};

// Base URL - defaults to localhost for development testing
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate guest visiting wedding site home page
  const homeResponse = http.get(BASE_URL);

  const homeSuccess = check(homeResponse, {
    'home page status is 200': (r) => r.status === 200,
    'home page has content': (r) => r.body && r.body.length > 0,
    'home page loads under 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!homeSuccess);
  homePageDuration.add(homeResponse.timings.duration);

  // Simulate think time (user reading the page)
  sleep(Math.random() * 2 + 1); // 1-3 seconds

  // Simulate navigating to another page (if it exists)
  const storyResponse = http.get(`${BASE_URL}/story`);

  const storySuccess = check(storyResponse, {
    'story page responds': (r) => r.status === 200 || r.status === 404,
    'story page under 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!storySuccess);

  // Another think time
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Text summary helper
function textSummary(data, opts = {}) {
  const { indent = '', enableColors = false } = opts;

  const lines = [];
  lines.push(`${indent}Load Test Summary`);
  lines.push(`${indent}================`);

  if (data.metrics.http_req_duration) {
    const dur = data.metrics.http_req_duration;
    lines.push(`${indent}Request Duration (p95): ${dur.values['p(95)'].toFixed(2)}ms`);
    lines.push(`${indent}Request Duration (avg): ${dur.values.avg.toFixed(2)}ms`);
  }

  if (data.metrics.errors) {
    const err = data.metrics.errors;
    lines.push(`${indent}Error Rate: ${(err.values.rate * 100).toFixed(2)}%`);
  }

  if (data.metrics.http_reqs) {
    lines.push(`${indent}Total Requests: ${data.metrics.http_reqs.values.count}`);
    lines.push(`${indent}Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}`);
  }

  // Check thresholds
  lines.push(`${indent}`);
  lines.push(`${indent}Thresholds:`);
  for (const [name, threshold] of Object.entries(data.thresholds || {})) {
    const status = threshold.ok ? 'PASS' : 'FAIL';
    lines.push(`${indent}  ${name}: ${status}`);
  }

  return lines.join('\n');
}
