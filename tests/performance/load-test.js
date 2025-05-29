
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGV2cWpwZndsaXplbGJsYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzM0MzIsImV4cCI6MjA2MzQwOTQzMn0.3FADPwJRgPivj3AlKqTyz6xCDqq8emAG1wykKjr2ZK0';

export default function () {
  // Test home page load
  let response = http.get(BASE_URL);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Test health check
  response = http.post(`http://localhost:54321/functions/v1/health-check`, null, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check responds quickly': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Test starting a requirement session
  response = http.post(`http://localhost:54321/functions/v1/start-requirement-session`, 
    JSON.stringify({ domain: 'healthcare' }), {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'session start status is 200': (r) => r.status === 200,
    'session start has sessionId': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.sessionId !== undefined;
      } catch {
        return false;
      }
    },
  });

  sleep(2);
}
