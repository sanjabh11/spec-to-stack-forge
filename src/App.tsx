
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
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await handleAuthUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        handleAuthUser(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthUser = async (authUser: any) => {
    try {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
      }

      let userProfile = profile;

      // If no profile exists, create one with default values
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            role: 'user',
            tenant_id: '00000000-0000-0000-0000-000000000000'
          })
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
        } else {
          userProfile = newProfile;
        }
      }

      setUser({
        ...authUser,
        profile: userProfile,
        name: userProfile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role: userProfile?.role || 'user',
        tenant_id: userProfile?.tenant_id || '00000000-0000-0000-0000-000000000000'
      });
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<EnhancedIndex user={user} onLogout={handleLogout} />} />
            <Route path="/auth" element={<AuthPage />} />
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
