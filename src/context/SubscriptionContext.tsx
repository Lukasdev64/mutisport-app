import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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

      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();

      const profile = data as { subscription_plan: string | null } | null;

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (profile) {
        const plan = (profile.subscription_plan ?? '').toLowerCase();
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
          const newRecord = payload.new as { id: string; subscription_plan?: string };
          if (user && newRecord.id === user.id) {
             const newPlan = newRecord.subscription_plan?.toLowerCase();
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

      const { error } = await (supabase
        .from('profiles') as ReturnType<typeof supabase.from>)
        .update({ subscription_plan: newPlan } as Record<string, string>)
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
