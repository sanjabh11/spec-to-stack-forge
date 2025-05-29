
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  isLimited: boolean;
  remainingRequests: number;
  resetTime: Date | null;
  isBlocked: boolean;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    remainingRequests: config.maxRequests,
    resetTime: null,
    isBlocked: false
  });

  const checkRateLimit = async (endpoint: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          endpoint,
          maxRequests: config.maxRequests,
          windowMs: config.windowMs,
          blockDurationMs: config.blockDurationMs
        }
      });

      if (error) throw error;

      setState({
        isLimited: !data.allowed,
        remainingRequests: data.remaining,
        resetTime: data.resetTime ? new Date(data.resetTime) : null,
        isBlocked: data.blocked || false
      });

      return data.allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Fail open for better UX
    }
  };

  return {
    ...state,
    checkRateLimit
  };
};
