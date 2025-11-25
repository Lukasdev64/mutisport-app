import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';
import { useNavigate, useLocation } from 'react-router-dom';

export function AutoLogin() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const attemptAutoLogin = async () => {
      // Attempt auto-login regardless of the path (for testing purposes)
      // if (location.pathname !== '/') return;

      const email = import.meta.env.VITE_TEST_EMAIL;
      const password = import.meta.env.VITE_TEST_PASSWORD;

      if (!email || !password) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('Attempting auto-login with test credentials...');
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Auto-login failed:', error);
          toast('Échec de la connexion automatique', 'error');
        } else {
          console.log('Auto-login successful');
          toast('Connexion automatique réussie (Mode Test)', 'success');
          navigate('/dashboard');
        }
      } else {
        // Already logged in, maybe redirect to dashboard if on landing page?
        // navigate('/dashboard');
      }
    };

    attemptAutoLogin();
  }, [navigate, location.pathname, toast]);

  return null;
}
