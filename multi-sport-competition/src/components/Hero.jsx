import './Hero.css'
import { Link } from 'react-router-dom'
import mainIllustration from '../assets/main-illustration.svg'

function Hero() {
  return (
    <main>
      <section
        id="accueil"
        className="hero"
        aria-label="Présentation de la plateforme de tournois sportifs"
      >
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Organiser vos tournois sportif n'a jamais été aussi
              <span className="gradient-text"> simple</span>
            </h1>
            <p className="hero-description">
              Commencez immédiatement avec notre plateforme gratuite.
              Pas d'inscription, pas de friction. Explorez toutes les fonctionnalités
              et décidez quand vous êtes prêt à passer au niveau supérieur.
            </p>

            {/* NOUVEAU: Bouton Tennis pour Seniors */}
            <div className="hero-feature-callout">
              <div className="callout-badge">🎾 NOUVEAU</div>
              <h3>Tournois de Tennis pour Seniors</h3>
              <p>Interface simplifiée spécialement conçue pour les seniors. Création anonyme, gros boutons, impression facile.</p>
              <Link
                to="/tournament/create"
                className="btn-tennis-large"
              >
                🎾 Créer un Tournoi de Tennis
              </Link>
            </div>

            <div className="hero-buttons" role="group" aria-label="Actions principales">
              <button
                className="btn-primary btn-large"
                aria-describedby="free-start-desc"
              >
                Commencer gratuitement
              </button>
              <span id="free-start-desc" className="sr-only">
                Démarre l'utilisation gratuite de la plateforme sans inscription
              </span>
              <button
                className="btn-secondary btn-large"
                aria-describedby="discover-desc"
              >
                Découvrir les fonctionnalités
              </button>
              <span id="discover-desc" className="sr-only">
                En savoir plus sur les fonctionnalités disponibles
              </span>
            </div>
          </div>
          <div className="hero-image" role="img" aria-hidden="true">
            <div className="main-illustration">
              <img 
                src={mainIllustration} 
                alt="Interface de la plateforme montrant des graphiques de performance et des outils d'analyse"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
        <section 
          className="hero-stats" 
          aria-label="Statistiques de la plateforme"
          role="region"
        >
          <div className="stat" role="group">
            <h3 aria-label="5000 participants ou plus">5000+</h3>
            <p>Participants</p>
          </div>
          <div className="stat" role="group">
            <h3 aria-label="Plus de 15 sports différents">15+</h3>
            <p>Sports</p>
          </div>
          <div className="stat" role="group">
            <h3 aria-label="Plus de 50 événements organisés">50+</h3>
            <p>Événements</p>
          </div>
          <div className="stat" role="group">
            <h3 aria-label="Présence dans plus de 25 pays">25+</h3>
            <p>Pays</p>
          </div>
        </section>
      </section>
    </main>
  )
}

export default Hero