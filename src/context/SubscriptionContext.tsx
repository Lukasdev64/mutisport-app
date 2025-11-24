import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SubscriptionContextType {
  isPro: boolean;
  togglePro: () => void;
  planName: 'Free' | 'Pro';
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSubscriptionStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (mounted) {
            setIsPro(false);
            setIsLoading(false);
          }
          return;
        }

        // Initial fetch
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profile && mounted) {
          // Check for 'premium' plan identifier in DB, but map to 'Pro' in app
          const plan = profile.subscription_plan?.toLowerCase();
          setIsPro(plan === 'premium');
        }

        // Realtime subscription
        const channel = supabase
          .channel('profile_subscription_changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              if (mounted) {
                const newPlan = payload.new.subscription_plan?.toLowerCase();
                setIsPro(newPlan === 'premium');
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };

      } catch (error) {
        console.error('Error in subscription check:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();

    return () => {
      mounted = false;
    };
  }, []);

  // Keep toggle for dev/testing purposes (local override)
  const togglePro = () => {
    setIsPro(prev => !prev);
  };

  const value = {
    isPro,
    togglePro,
    planName: isPro ? 'Pro' : 'Free' as 'Free' | 'Pro',
    isLoading
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
