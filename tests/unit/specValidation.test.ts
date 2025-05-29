
import { describe, test, expect } from 'vitest';
import { validateSpec, buildPrompt, buildNextPrompt } from '@/lib/specValidation';

describe('Spec Validation', () => {
  test('should validate a complete spec', () => {
    const spec = {
      domain: 'healthcare',
      throughput: 100,
      token_budget: 5000,
      compliance: ['HIPAA'],
      sla_target: 99.9
    };
    
    expect(validateSpec(spec)).toBe(true);
  });

  test('should throw error for missing domain', () => {
    const spec = {
      token_budget: 5000
    } as any;
    
    expect(() => validateSpec(spec)).toThrow('Domain is required');
  });

  test('should throw error for invalid throughput', () => {
    const spec = {
      domain: 'healthcare',
      throughput: -1
    };
    
    expect(() => validateSpec(spec)).toThrow('Throughput must be between 1 and 10000');
  });

  test('should throw error for invalid compliance flags', () => {
    const spec = {
      domain: 'healthcare',
      compliance: ['INVALID_FLAG']
    };
    
    expect(() => validateSpec(spec)).toThrow('Invalid compliance flags: INVALID_FLAG');
  });
});

describe('Prompt Builders', () => {
  test('should build system prompt with instructions', () => {
    const prompt = buildPrompt('healthcare');
    expect(prompt).toContain('Ask one question at a time');
    expect(prompt).toContain('healthcare');
  });

  test('should build next question prompt based on history', () => {
    const history = ['domain: healthcare'];
    const nextPrompt = buildNextPrompt(history);
    expect(nextPrompt).toContain('What kind of data');
  });
});
