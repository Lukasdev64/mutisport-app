import { motion } from 'framer-motion';
import { Check, Zap, Shield, Star, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LandingLayout } from '@/components/layout/LandingLayout';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import SEO from '@/components/common/SEO';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

export const PricingPage = () => {
  const features = [
    "Tournois illimités",
    "Statistiques avancées",
    "Support prioritaire",
    "Personnalisation complète",
    "Export des données",
    "Badge Premium sur votre profil"
  ];

  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez passer au plan Premium ou revenir au plan gratuit à tout moment depuis votre espace de facturation."
    },
    {
      question: "Quels moyens de paiement acceptez-vous ?",
      answer: "Nous acceptons toutes les cartes bancaires majeures (Visa, Mastercard, Amex) via notre partenaire sécurisé Stripe."
    },
    {
      question: "Y a-t-il un engagement ?",
      answer: "Non, nos offres sont sans engagement. Vous pouvez annuler votre abonnement quand vous le souhaitez."
    },
    {
      question: "Le plan gratuit est-il limité dans le temps ?",
      answer: "Non, le plan gratuit est disponible à vie. Il est idéal pour découvrir la plateforme et organiser de petits tournois."
    }
  ];

  return (
    <LandingLayout>
      <SEO 
        title="Tarifs - SportChampions" 
        description="Des plans adaptés à tous les organisateurs. Commencez gratuitement et évoluez selon vos besoins."
      />
      <Header />
      
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 md:px-6">
        <div className="container max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
            >
              Des tarifs simples et <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">transparents</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400"
            >
              Commencez gratuitement. Passez au niveau supérieur quand vous êtes prêt.
              Aucun frais caché.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-800 h-full flex flex-col hover:border-slate-700 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Gratuit</CardTitle>
                  <CardDescription>Pour découvrir la plateforme</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">0€</span>
                    <span className="text-slate-400">/mois</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-300">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-emerald-500" />
                      </div>
                      Jusqu'à 3 tournois
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-emerald-500" />
                      </div>
                      Gestion basique des joueurs
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-emerald-500" />
                      </div>
                      Formats standards
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/register" className="w-full">
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 text-lg">
                      Commencer gratuitement
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-30 animate-pulse" />
              <Card className="bg-slate-900/80 border-blue-500/50 h-full flex flex-col relative backdrop-blur-xl">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        Premium
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
                  <ul className="space-y-4">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-white">
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Check className="h-4 w-4 text-blue-400" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/register" className="w-full">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 h-12 text-lg"
                    >
                      <Star className="mr-2 h-5 w-5 fill-current" />
                      Devenir Premium
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          {/* Trust/Security Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-20 p-8 rounded-2xl bg-slate-900/30 border border-slate-800 max-w-4xl mx-auto text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-slate-800/50">
                <Shield className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Paiement 100% Sécurisé</h3>
              <p className="text-slate-400 max-w-2xl">
                Tous les paiements sont traités par Stripe, leader mondial du paiement en ligne. 
                Nous ne stockons jamais vos informations bancaires. Annulation possible à tout moment en un clic.
              </p>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Questions fréquentes</h2>
            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-400 ml-8">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </LandingLayout>
  );
};
