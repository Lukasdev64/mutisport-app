import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CheckoutSessionParams {
  priceId: string;
  returnUrl: string;
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationKey: ['stripe', 'checkout'],
    mutationFn: async ({ priceId, returnUrl }: CheckoutSessionParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error('Utilisateur non authentifié');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, returnUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      return data;
    },
  });
}

export function useStripePortal() {
  // This would typically invoke another function or redirect to Stripe Customer Portal
  // For now, we'll leave it as a placeholder or implement if the backend function exists
  return useMutation({
    mutationKey: ['stripe', 'portal'],
    mutationFn: async () => {
      // Implementation depends on if you have a create-portal-session function
      // const { data, error } = await supabase.functions.invoke('create-portal-session');
      // if (error) throw error;
      // return data;
      throw new Error("Customer portal not yet implemented");
    }
  });
}
