import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { ValueProposition } from './components/ValueProposition';
import { Events } from './components/Events';
import { Footer } from './components/Footer';
import SEO from '@/components/common/SEO';
import { LandingLayout } from '@/components/layout/LandingLayout';

export const LandingPage = () => {
  return (
    <LandingLayout>
      <SEO 
        title="SportChampions - L'OS des Compétitions Sportives" 
        description="La plateforme la plus simple pour organiser vos tournois. Multi-sport, temps réel, sans inscription obligatoire."
      />
      <Header />
      <Hero />
      <Features />
      <ValueProposition />
      <Events />
      <Footer />
    </LandingLayout>
  );
};
