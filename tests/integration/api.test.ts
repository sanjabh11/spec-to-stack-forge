import { describe, test, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client.ts';

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
