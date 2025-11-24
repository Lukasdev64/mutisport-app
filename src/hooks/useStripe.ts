import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CheckoutSessionParams {
  priceId: string;
  returnUrl: string;
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async ({ priceId, returnUrl }: CheckoutSessionParams) => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, returnUrl },
      });

      if (error) throw error;
      return data; // Returns { url: string }
    },
  });
}

export function useStripePortal() {
  // This would typically invoke another function or redirect to Stripe Customer Portal
  // For now, we'll leave it as a placeholder or implement if the backend function exists
  return useMutation({
    mutationFn: async () => {
      // Implementation depends on if you have a create-portal-session function
      // const { data, error } = await supabase.functions.invoke('create-portal-session');
      // if (error) throw error;
      // return data;
      throw new Error("Customer portal not yet implemented");
    }
  });
}
