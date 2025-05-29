
export interface SpecValidationError extends Error {
  field?: string;
}

export interface RequirementSpec {
  domain: string;
  throughput?: number;
  token_budget?: number;
  compliance?: string[];
  llm_provider?: string;
  sla_target?: number;
  concurrency?: number;
  data_sources?: string;
  performance?: string;
  budget?: string;
}

export const validateSpec = (spec: RequirementSpec): boolean => {
  const errors: string[] = [];

  // Required fields
  if (!spec.domain) {
    errors.push('Domain is required');
  }

  // Validate throughput
  if (spec.throughput !== undefined && (spec.throughput < 1 || spec.throughput > 10000)) {
    errors.push('Throughput must be between 1 and 10000');
  }

  // Validate token budget
  if (spec.token_budget !== undefined && (spec.token_budget < 100 || spec.token_budget > 1000000)) {
    errors.push('Token budget must be between 100 and 1,000,000');
  }

  // Validate SLA target
  if (spec.sla_target !== undefined && (spec.sla_target < 50 || spec.sla_target > 99.99)) {
    errors.push('SLA target must be between 50% and 99.99%');
  }

  // Validate compliance flags
  const validCompliance = ['HIPAA', 'GDPR', 'SOC2', 'PCI'];
  if (spec.compliance) {
    const invalidFlags = spec.compliance.filter(flag => !validCompliance.includes(flag));
    if (invalidFlags.length > 0) {
      errors.push(`Invalid compliance flags: ${invalidFlags.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join('; ')) as SpecValidationError;
    error.name = 'SpecValidationError';
    throw error;
  }

  return true;
};

export const buildPrompt = (domain: string): string => {
  return `You are an AI advisor for ${domain} solutions. Ask one question at a time to gather requirements. Be specific and helpful.`;
};

export const buildNextPrompt = (history: string[]): string => {
  const lastEntry = history[history.length - 1] || '';
  
  if (lastEntry.includes('domain:')) {
    return 'What kind of data sources will you be working with?';
  }
  
  return 'Please provide more details about your requirements.';
};
