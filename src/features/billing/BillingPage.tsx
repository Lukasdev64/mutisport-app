
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { useCreateCheckoutSession } from '@/hooks/useStripe';
import { Check, Zap, Shield, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckoutModal } from './components/CheckoutModal';
import { useToast } from '@/components/ui/toast';

export default function BillingPage() {
  const checkoutMutation = useCreateCheckoutSession();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (priceId: string) => {
    try {
      console.log('Starting upgrade process for price:', priceId);
      const response = await checkoutMutation.mutateAsync({
        priceId,
        returnUrl: window.location.origin + '/settings',
      });
      
      console.log('Checkout response:', response);

      if (response?.clientSecret) {
        setClientSecret(response.clientSecret);
        setIsCheckoutOpen(true);
      } else if (response?.url) {
        // Fallback for older backend version
        console.warn('Backend returned URL instead of clientSecret. Redirecting...');
        window.location.href = response.url;
      } else {
        console.error('Invalid response format:', response);
        toast('Erreur de configuration du paiement. Veuillez contacter le support.', 'error');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast('Une erreur est survenue. Veuillez réessayer.', 'error');
    }
  };

  const features = [
    "Tournois illimités",
    "Statistiques avancées",
    "Support prioritaire",
    "Personnalisation complète",
    "Export des données",
    "Badge Pro sur votre profil"
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Abonnement & Facturation</h1>
        <p className="text-slate-400">Gérez votre abonnement et accédez aux fonctionnalités premium.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto mt-8">
        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900/50 border-slate-800 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Gratuit</CardTitle>
              <CardDescription>Pour découvrir la plateforme</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">0€</span>
                <span className="text-slate-400">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Jusqu'à 3 tournois
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Gestion basique des joueurs
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Formats standards
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800" disabled>
                Plan actuel
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-30 animate-pulse" />
          <Card className="bg-slate-900/80 border-blue-500/50 h-full flex flex-col relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    Pro
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                      POPULAIRE
                    </span>
                  </CardTitle>
                  <CardDescription>Pour les organisateurs sérieux</CardDescription>
                </div>
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">9.99€</span>
                <span className="text-slate-400">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white">
                    <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-blue-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20"
                onClick={() => handleUpgrade(import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || '')}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Star className="mr-2 h-4 w-4 fill-current" />
                )}
                Passer au Pro
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <div className="mt-12 p-6 rounded-xl bg-slate-900/30 border border-slate-800">
        <div className="flex items-start gap-4">
          <Shield className="h-6 w-6 text-slate-400 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Paiement sécurisé</h3>
            <p className="text-slate-400 text-sm">
              Tous les paiements sont traités de manière sécurisée par Stripe. Nous ne stockons jamais vos informations bancaires.
              Vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel.
            </p>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        clientSecret={clientSecret} 
      />
    </div>
  );
}
