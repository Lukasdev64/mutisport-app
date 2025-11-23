import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Événements', href: '#events' },
    { name: 'Tarifs', href: '#' },
    { name: 'Changelog', href: '#' },
  ],
  resources: [
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'API', href: '#' },
  ],
  company: [
    { name: 'À propos', href: '#' },
    { name: 'Carrières', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Partenaires', href: '#' },
  ],
  legal: [
    { name: 'Confidentialité', href: '#' },
    { name: 'Conditions', href: '#' },
    { name: 'Cookies', href: '#' },
    { name: 'Mentions légales', href: '#' },
  ],
};

const socialLinks = [
  { name: 'GitHub', icon: Github, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'Email', icon: Mail, href: '#' },
];

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/5 bg-transparent">
      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="py-16 border-b border-border/40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center space-y-6"
          >
            <h3 className="text-3xl font-bold tracking-tight">
              Restez informé des{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                nouveautés
              </span>
            </h3>
            <p className="text-muted-foreground text-lg">
              Recevez les dernières actualités, fonctionnalités et événements directement dans votre boîte mail
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 h-12 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm px-6 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                required
              />
              <Button type="submit" size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25">
                S'abonner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Main Footer */}
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  SportChampions
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                La plateforme nouvelle génération pour organiser vos compétitions sportives. Simple, puissant, gratuit.
              </p>
              <div className="flex gap-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Produit</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Ressources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Entreprise</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Légal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="ml-1 h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 SportChampions. Tous droits réservés.</p>
            <p className="flex items-center gap-2">
              Fait avec <span className="text-red-500 animate-pulse">❤️</span> pour les passionnés de sport
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
