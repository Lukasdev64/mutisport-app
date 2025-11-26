import { motion } from 'framer-motion';
import { Zap, ShieldCheck, UserX } from 'lucide-react';

export const ValueProposition = () => {
  return (
    <section id="solutions" className="relative py-32 scroll-mt-20">
      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                La puissance sans la complexité
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Concentrez-vous sur le jeu, pas sur l'administration. Notre plateforme gère la complexité pour vous.
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  icon: Zap,
                  title: 'Ultra Rapide',
                  description: 'Lancez votre premier tournoi en quelques secondes.'
                },
                {
                  icon: UserX,
                  title: 'Accès Immédiat',
                  description: 'Pas de barrière à l\'entrée. Testez sans créer de compte.'
                },
                {
                  icon: ShieldCheck,
                  title: 'Fiabilité Totale',
                  description: 'Vos données sont sécurisées et sauvegardées en temps réel.'
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-900/20 border border-blue-800 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                    <feature.icon className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual - Blue Tech Aesthetic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            {/* Glow behind */}
            <div className="absolute -inset-4 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
            
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#020617] border border-blue-900/50 p-8 flex flex-col justify-between shadow-2xl shadow-blue-900/20">
              <div className="flex justify-between items-center">
                <div className="h-2 w-12 bg-blue-500 rounded-full" />
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              
              <div className="flex items-center justify-center py-8">
                 <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-400 tracking-tighter">
                   00:10
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-blue-200/70">
                  <span>Temps de création</span>
                  <span className="text-blue-400 font-medium">Optimisé</span>
                </div>
                <div className="h-1.5 w-full bg-blue-950 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-blue-500 rounded-full" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
