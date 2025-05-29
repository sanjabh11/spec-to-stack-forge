
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [requestHistory, setRequestHistory] = useState<Map<string, RequestRecord>>(new Map());

  const checkRateLimit = useCallback((key: string = 'default'): boolean => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get current record for this key
    const currentRecord = requestHistory.get(key) || { timestamp: now, count: 0 };
    
    // Reset count if outside window
    if (currentRecord.timestamp < windowStart) {
      currentRecord.timestamp = now;
      currentRecord.count = 0;
    }
    
    // Check if limit exceeded
    if (currentRecord.count >= config.maxRequests) {
      const resetTime = new Date(currentRecord.timestamp + config.windowMs);
      toast({
        title: "Rate limit exceeded",
        description: config.message || `Too many requests. Try again after ${resetTime.toLocaleTimeString()}`,
        variant: "destructive"
      });
      return false;
    }
    
    // Increment count
    currentRecord.count++;
    setRequestHistory(new Map(requestHistory.set(key, currentRecord)));
    
    return true;
  }, [config, requestHistory]);

  const getRemainingRequests = useCallback((key: string = 'default'): number => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const currentRecord = requestHistory.get(key);
    
    if (!currentRecord || currentRecord.timestamp < windowStart) {
      return config.maxRequests;
    }
    
    return Math.max(0, config.maxRequests - currentRecord.count);
  }, [config, requestHistory]);

  const resetRateLimit = useCallback((key: string = 'default') => {
    setRequestHistory(new Map(requestHistory.delete(key) ? requestHistory : requestHistory));
  }, [requestHistory]);

  return {
    checkRateLimit,
    getRemainingRequests,
    resetRateLimit
  };
};
