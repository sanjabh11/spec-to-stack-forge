
import { describe, test, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('API Integration Tests', () => {
  let testSession: any;

  beforeAll(async () => {
    // Set up test session
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    testSession = data.session;
  });

  test('should start requirement session', async () => {
    const { data, error } = await supabase.functions.invoke('start-requirement-session', {
      body: { domain: 'healthcare' },
      headers: {
        Authorization: `Bearer ${testSession.access_token}`
      }
    });

    expect(error).toBeNull();
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('firstQuestion');
  });

  test('should process requirement', async () => {
    // First start a session
    const { data: sessionData } = await supabase.functions.invoke('start-requirement-session', {
      body: { domain: 'healthcare' },
      headers: {
        Authorization: `Bearer ${testSession.access_token}`
      }
    });

    // Then process a requirement
    const { data, error } = await supabase.functions.invoke('process-requirement', {
      body: {
        sessionId: sessionData.sessionId,
        userResponse: 'Clinical note analysis',
        currentQuestion: 0,
        domain: 'healthcare'
      },
      headers: {
        Authorization: `Bearer ${testSession.access_token}`
      }
    });

    expect(error).toBeNull();
    expect(data).toHaveProperty('validation');
    expect(data.validation).toHaveProperty('valid');
  });

  test('should check health endpoint', async () => {
    const { data, error } = await supabase.functions.invoke('health-check');
    
    expect(error).toBeNull();
    expect(data).toHaveProperty('status');
    expect(['healthy', 'unhealthy']).toContain(data.status);
  });
});
</lov-test>

<lov-write file_path="package.json">
{
  "name": "ai-platform",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "smoke:test": "bash ./scripts/smoke-test.sh"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@supabase/supabase-js": "^2.49.8",
    "@tanstack/react-query": "^5.56.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.3.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-resizable-panels": "^2.1.3",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vitest": "^1.0.0",
    "@vitest/coverage-c8": "^0.33.0"
  }
}
