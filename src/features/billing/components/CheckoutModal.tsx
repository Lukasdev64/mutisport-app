import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string | null;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/settings',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? "Une erreur est survenue.");
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // CONFIRMATION STRIPE REÇUE : Le paiement est validé à 100%
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = window.location.origin + '/settings';
      }, 2000);
    } else {
      // Cas rares : processing, requires_capture, etc.
      setIsLoading(false);
      if (paymentIntent?.status === 'processing') {
        setErrorMessage("Le paiement est en cours de traitement. Vous recevrez une confirmation par email.");
      } else {
        setErrorMessage("Le statut du paiement est incertain. Veuillez vérifier votre tableau de bord.");
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 h-full min-h-[300px]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <CheckCircle className="w-24 h-24 text-emerald-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white"
          >
            Paiement réussi !
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400"
          >
            Votre abonnement est maintenant actif.
            <br />
            Redirection en cours...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <PaymentElement 
        options={{
          layout: 'tabs',
        }} 
      />
      
      {errorMessage && (
        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
          {errorMessage}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Payer et s'abonner
          </>
        )}
      </Button>
    </form>
  );
}

export function CheckoutModal({ isOpen, onClose, clientSecret }: CheckoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[85vh] bg-slate-950 border-slate-800 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <DialogTitle>Paiement sécurisé</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-slate-950">
          {clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#3b82f6',
                    colorBackground: '#020617',
                    colorText: '#f8fafc',
                    colorDanger: '#ef4444',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  }
                }
              }}
            >
              <CheckoutForm />
            </Elements>
          ) : (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
