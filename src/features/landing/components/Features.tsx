import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Calendar, Trophy, BarChart3, Smartphone, Share2 } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: "Planification Intelligente",
    description: "Génération automatique des matchs et gestion des conflits.",
  },
  {
    icon: Smartphone,
    title: "Expérience Mobile",
    description: "Vos joueurs suivent leurs résultats en direct sur leur smartphone.",
  },
  {
    icon: BarChart3,
    title: "Statistiques Avancées",
    description: "Analysez les performances avec des graphiques détaillés.",
  },
  {
    icon: Users,
    title: "Gestion des Joueurs",
    description: "Base de données centralisée pour tous vos participants.",
  },
  {
    icon: Trophy,
    title: "Formats de Tournoi",
    description: "Support complet : Élimination directe, Poules, Suisse...",
  },
  {
    icon: Share2,
    title: "Partage Live",
    description: "Liens publics et QR codes pour les spectateurs.",
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Features = () => {
  return (
    <section className="relative py-32">
      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Tout pour réussir votre événement
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Une suite d'outils professionnels au service de votre organisation.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="group h-full bg-[#0f172a]/60 backdrop-blur-sm border-blue-900/30 hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
