import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SubscriptionContextType {
  isPro: boolean;
  togglePro: () => void;
  planName: 'Free' | 'Pro';
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsPro(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (profile) {
        const plan = profile.subscription_plan?.toLowerCase();
        setIsPro(plan === 'premium');
      }
    } catch (error) {
      console.error('Error in subscription check:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSubscription = async () => {
      await checkSubscription();
      if (mounted) setIsLoading(false);
    };

    initSubscription();

    // Realtime subscription
    const channel = supabase
      .channel('profile_subscription_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && payload.new.id === user.id) {
             const newPlan = payload.new.subscription_plan?.toLowerCase();
             setIsPro(newPlan === 'premium');
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Toggle for dev/testing purposes (syncs with DB)
  const togglePro = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPlan = isPro ? 'free' : 'premium';
      
      // Optimistic update
      setIsPro(!isPro);

      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: newPlan })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating subscription plan:', error);
        // Revert on error
        setIsPro(isPro);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      setIsPro(isPro);
    }
  };

  const value = {
    isPro,
    togglePro,
    planName: isPro ? 'Pro' : 'Free' as 'Free' | 'Pro',
    isLoading,
    checkSubscription
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
