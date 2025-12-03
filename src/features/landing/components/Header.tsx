import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Fonctionnalités', href: '#features', isAnchor: true },
    { name: 'Avantages', href: '#solutions', isAnchor: true },
    { name: 'Événements', href: '#events', isAnchor: true },
    { name: 'Tarifs', href: '/pricing', isAnchor: false },
  ];

  // Scroll to element helper
  const scrollToElement = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    console.log('Scrolling to:', sectionId, 'Element found:', !!element);
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Ajuster pour le header fixe après le scroll
      setTimeout(() => {
        const headerOffset = 80;
        const currentScroll = window.scrollY;
        window.scrollTo({
          top: currentScroll - headerOffset,
          behavior: 'smooth'
        });
      }, 300);
    }
  }, []);

  // Scroll spy - detect which section is in view
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const sections = ['features', 'solutions', 'events'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      
      // Si on est tout en haut
      if (window.scrollY < 100) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Handle hash on page load or navigation
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.replace('#', '');
      // Petit délai pour laisser le DOM se charger
      setTimeout(() => {
        scrollToElement(sectionId);
      }, 100);
    }
  }, [location, scrollToElement]);

  // Smooth scroll to section
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    
    e.preventDefault();
    const sectionId = href.replace('#', '');
    
    // Si on n'est pas sur la page d'accueil, naviguer d'abord
    if (location.pathname !== '/') {
      navigate('/' + href);
    } else {
      scrollToElement(sectionId);
    }
    
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-blue-900/20 bg-[#020617]/80 backdrop-blur-md transition-all duration-300"
      >
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <LayoutDashboard size={18} />
              </div>
              <Link to="/" className="text-xl font-bold tracking-tight text-white">
                Tournaly
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = link.isAnchor && activeSection === link.href.replace('#', '');
                
                return link.isAnchor ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-sm font-medium transition-colors duration-200 cursor-pointer ${
                      isActive 
                        ? 'text-blue-400' 
                        : 'text-slate-300 hover:text-blue-400'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeSection"
                        className="h-0.5 bg-blue-400 mt-1 rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-blue-900/20">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 rounded-full px-6">
                  Commencer
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#020617] pt-24 px-4 md:hidden"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => {
                const isActive = link.isAnchor && activeSection === link.href.replace('#', '');
                
                return link.isAnchor ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-lg font-medium border-b border-blue-900/20 pb-4 cursor-pointer ${
                      isActive ? 'text-blue-400' : 'text-slate-300 hover:text-blue-400'
                    }`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-lg font-medium text-slate-300 hover:text-blue-400 border-b border-blue-900/20 pb-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-4 flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center border-blue-900/50 text-slate-300 hover:bg-blue-900/20">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white">
                    Commencer gratuitement
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
