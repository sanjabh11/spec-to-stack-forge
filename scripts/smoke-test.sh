
#!/bin/bash
set -e

echo "🚀 Running smoke tests..."

# Health check
echo "Checking health endpoint..."
curl -sf http://localhost:54321/functions/v1/health-check || {
    echo "❌ Health check failed"
    exit 1
}

# Database connectivity
echo "Checking database connectivity..."
curl -sf -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGV2cWpwZndsaXplbGJsYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzM0MzIsImV4cCI6MjA2MzQwOTQzMn0.3FADPwJRgPivj3AlKqTyz6xCDqq8emAG1wykKjr2ZK0" \
     "https://vydevqjpfwlizelblavb.supabase.co/rest/v1/tenants?select=id&limit=1" || {
    echo "❌ Database connectivity failed"
    exit 1
}

# Function invocation test
echo "Testing function invocation..."
curl -sf -X POST \
     -H "Content-Type: application/json" \
     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGV2cWpwZndsaXplbGJsYXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzM0MzIsImV4cCI6MjA2MzQwOTQzMn0.3FADPwJRgPivj3AlKqTyz6xCDqq8emAG1wykKjr2ZK0" \
     -d '{"domain":"healthcare"}' \
     "http://localhost:54321/functions/v1/start-requirement-session" || {
    echo "❌ Function invocation failed"
    exit 1
}

echo "✅ All smoke tests passed!"
