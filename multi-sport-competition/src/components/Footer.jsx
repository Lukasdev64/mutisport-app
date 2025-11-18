import './Footer.css'

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SportChampions</h3>
            <p>La plateforme de référence pour les compétitions multi-sport. Rejoignez des milliers d'athlètes passionnés.</p>
            <div className="social-links" role="list" aria-label="Réseaux sociaux">
              <a href="#" aria-label="Suivez-nous sur Facebook" role="listitem">📈</a>
              <a href="#" aria-label="Suivez-nous sur Twitter" role="listitem">🐦</a>
              <a href="#" aria-label="Suivez-nous sur Instagram" role="listitem">📷</a>
              <a href="#" aria-label="Abonnez-vous à notre chaîne YouTube" role="listitem">📺</a>
            </div>
          </div>
          
          <nav className="footer-section" aria-label="Navigation sports">
            <h4>Sports</h4>
            <ul>
              <li><a href="#tennis">Tennis</a></li>
              <li><a href="#football">Football</a></li>
              <li><a href="#basketball">Basketball</a></li>
              <li><a href="#natation">Natation</a></li>
              <li><a href="#athletisme">Athlétisme</a></li>
              <li><a href="#cyclisme">Cyclisme</a></li>
            </ul>
          </nav>
          
          <nav className="footer-section" aria-label="Navigation événements">
            <h4>Événements</h4>
            <ul>
              <li><a href="#championnat">Championnat d'Été</a></li>
              <li><a href="#coupe">Coupe Internationale</a></li>
              <li><a href="#festival">Festival Aquatique</a></li>
              <li><a href="#tournois">Tournois Locaux</a></li>
            </ul>
          </nav>
          
          <nav className="footer-section" aria-label="Support et aide">
            <h4>Support</h4>
            <ul>
              <li><a href="#aide">Centre d'aide</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#reglements">Règlements</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>
          
          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Restez informé des dernières actualités et événements</p>
            <form className="newsletter-form" aria-label="Inscription à la newsletter">
              <label for="email-newsletter" className="sr-only">
                Adresse email pour la newsletter
              </label>
              <input 
                type="email" 
                id="email-newsletter"
                placeholder="Votre email" 
                required
                aria-describedby="email-help"
              />
              <span id="email-help" className="sr-only">
                Votre email ne sera utilisé que pour notre newsletter
              </span>
              <button type="submit" aria-describedby="subscribe-desc">
                S'abonner
              </button>
              <span id="subscribe-desc" className="sr-only">
                S'abonner à la newsletter SportChampions
              </span>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 SportChampions. Tous droits réservés.</p>
          <div className="footer-links">
            <a href="#">Politique de confidentialité</a>
            <a href="#">Conditions d'utilisation</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer