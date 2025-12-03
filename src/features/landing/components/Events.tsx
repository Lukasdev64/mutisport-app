import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const events = [
  {
    name: 'Championnat d\'Été',
    date: 'Juin 2025',
    location: 'Paris',
    status: 'open'
  },
  {
    name: 'Coupe Nationale',
    date: 'Juillet 2025',
    location: 'Lyon',
    status: 'upcoming'
  },
  {
    name: 'Master Series',
    date: 'Août 2025',
    location: 'Nice',
    status: 'open'
  }
];

export const Events = () => {
  return (
    <section id="events" className="relative py-32 scroll-mt-20">
      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Événements à la une
            </h2>
            <p className="text-slate-400">
              Découvrez les tournois organisés avec Tournaly.
            </p>
          </div>
          <Link to="/events">
            <Button variant="link" className="text-blue-400 p-0 h-auto hover:text-blue-300">
              Voir tout le calendrier <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-4">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group flex items-center justify-between p-6 bg-[#0f172a]/40 border border-blue-900/30 hover:border-blue-500/50 hover:bg-blue-900/10 rounded-xl transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 group-hover:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-500/70" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-500/70" /> {event.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {event.status === 'open' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Inscriptions
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-500 border border-slate-700">
                    Bientôt
                  </span>
                )}
                <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
