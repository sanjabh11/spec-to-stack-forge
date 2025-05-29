
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'loading';
  services: {
    database: boolean;
    functions: boolean;
    auth: boolean;
  };
  timestamp: Date;
}

export const useHealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'loading',
    services: {
      database: false,
      functions: false,
      auth: false
    },
    timestamp: new Date()
  });

  const checkHealth = async () => {
    try {
      const checks = await Promise.allSettled([
        // Database check
        supabase.from('tenants').select('count').limit(1),
        
        // Functions check
        supabase.functions.invoke('health-check'),
        
        // Auth check
        supabase.auth.getSession()
      ]);

      const dbHealthy = checks[0].status === 'fulfilled';
      const functionsHealthy = checks[1].status === 'fulfilled';
      const authHealthy = checks[2].status === 'fulfilled';

      const allHealthy = dbHealthy && functionsHealthy && authHealthy;

      setHealth({
        status: allHealthy ? 'healthy' : 'unhealthy',
        services: {
          database: dbHealthy,
          functions: functionsHealthy,
          auth: authHealthy
        },
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        status: 'unhealthy',
        services: {
          database: false,
          functions: false,
          auth: false
        },
        timestamp: new Date()
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { health, checkHealth };
};
