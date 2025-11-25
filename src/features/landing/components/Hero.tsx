import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, PlayCircle } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Badge - Blue Accent */}
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            La référence pour vos tournois
          </div>

          {/* Headline - Balanced */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Gérez vos compétitions <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              avec maîtrise
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Une interface puissante, inspirée des meilleurs dashboards, pour organiser vos événements sportifs sans friction.
          </p>

          {/* CTA - Blue Dominance */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/tournaments/new">
              <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 rounded-full transition-all">
                Créer un tournoi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-700 text-slate-300 hover:border-blue-500/50 hover:bg-blue-950/30 hover:text-blue-400 rounded-full transition-all">
                <PlayCircle className="mr-2 h-4 w-4" />
                Voir la démo
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-blue-500/10 text-blue-500">
                <Check className="h-3 w-3" />
              </div>
              <span>Multi-sports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-blue-500/10 text-blue-500">
                <Check className="h-3 w-3" />
              </div>
              <span>Temps réel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-blue-500/10 text-blue-500">
                <Check className="h-3 w-3" />
              </div>
              <span>Gratuit</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
