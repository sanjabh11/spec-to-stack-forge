
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { navItems } from "./nav-items";
import { WorkflowsPage } from "./pages/WorkflowsPage";
import EnhancedIndex from "./pages/EnhancedIndex";
import AuthPage from "./components/AuthPage";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        handleAuthUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthUser = async (authUser: any) => {
    try {
      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*, roles(*), tenants(*)')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
      }

      // If no profile exists, create one
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
          })
          .select('*, roles(*), tenants(*)')
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
        } else {
          setUser({
            ...authUser,
            profile: newProfile,
            name: newProfile?.name || authUser.email?.split('@')[0],
            role: newProfile?.roles?.name || 'user',
            tenant_id: newProfile?.tenant_id
          });
        }
      } else {
        setUser({
          ...authUser,
          profile,
          name: profile?.name || authUser.email?.split('@')[0],
          role: profile?.roles?.name || 'user',
          tenant_id: profile?.tenant_id
        });
      }
    } catch (error) {
      console.error('Auth user handling error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthPage onLogin={setUser} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<EnhancedIndex user={user} onLogout={handleLogout} />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
