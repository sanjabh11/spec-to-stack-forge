
/**
 * Performance Tests using k6
 * Tests API endpoints under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up
    { duration: '2m', target: 20 },   // Stay at 20 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    errors: ['rate<0.1'],              // Error rate under 10%
  },
};

const BASE_URL = 'https://vydevqjpfwlizelblavb.supabase.co';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGV2cWpwZndsaXplbGJsYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzM0MzIsImV4cCI6MjA2MzQwOTQzMn0.3FADPwJRgPivj3AlKqTyz6xCDqq8emAG1wykKjr2ZK0';

export default function () {
  // Test health check
  let healthResponse = http.get(`${BASE_URL}/functions/v1/health-check`, {
    headers: { 'apikey': API_KEY }
  });
  
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Test requirement session start
  let sessionPayload = JSON.stringify({ domain: 'healthcare' });
  let sessionResponse = http.post(`${BASE_URL}/functions/v1/start-requirement-session`, 
    sessionPayload, {
      headers: { 
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      }
    });
  
  check(sessionResponse, {
    'session start status is 200': (r) => r.status === 200,
    'session start response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  // Test LLM Gateway (if available)
  let llmPayload = JSON.stringify({
    provider: 'google',
    model: 'gemini-2.5-pro',
    prompt: 'Hello world',
    maxTokens: 10
  });
  
  let llmResponse = http.post(`${BASE_URL}/functions/v1/llm-gateway`, 
    llmPayload, {
      headers: { 
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      }
    });
  
  check(llmResponse, {
    'llm response received': (r) => r.status === 200 || r.status === 503,
    'llm response time < 5s': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);

  sleep(1);
}
