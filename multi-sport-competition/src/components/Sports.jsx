import './Sports.css'

function Sports() {
  const sports = [
    {
      name: 'Performance',
      description: 'Analysez vos performances immédiatement. Accès gratuit aux outils de base, fonctionnalités avancées débloquées selon vos besoins',
      participants: 'Gratuit',
      level: 'Début immédiat'
    },
    {
      name: 'Analytiques',
      description: 'Visualisez vos progrès sans créer de compte. Statistiques de base incluses, rapports détaillés en premium',
      participants: 'Freemium',
      level: 'Sans engagement'
    },
    {
      name: 'Communauté',
      description: 'Consultez les défis publics anonymement. Participation active après inscription simple',
      participants: 'Ouvert à tous',
      level: 'Accès libre'
    },
    {
      name: 'Entraînement',
      description: 'Programmes de base gratuits et anonymes. Personnalisation complète avec abonnement',
      participants: 'Essai gratuit',
      level: 'Flexible'
    },
    {
      name: 'Progression',
      description: 'Suivez votre évolution dès le premier jour. Historique illimité et insights avancés en premium',
      participants: 'Immédiat',
      level: 'Progressif'
    },
    {
      name: 'Réussites',
      description: 'Badges et récompenses dès le début. Compétitions et classements avec inscription',
      participants: 'Gratuit',
      level: 'Motivant'
    }
  ]

  return (
    <section id="sports" className="sports-section">
      <div className="container">
        <div className="section-header">
          <h2>Commencez Gratuitement, Payez Seulement Si Nécessaire</h2>
          <p>Accédez immédiatement à notre plateforme sans créer de compte. Inscription uniquement pour les fonctionnalités premium.</p>
        </div>
        <div className="sports-grid">
          {sports.map((sport, index) => (
            <div key={index} className="sport-card">
              <h3>{sport.name}</h3>
              <p className="sport-description">{sport.description}</p>
              <div className="sport-stats">
                <div className="sport-stat">
                  <span className="stat-value">{sport.participants}</span>
                  <span className="stat-label">Participants</span>
                </div>
                <div className="sport-stat">
                  <span className="stat-value">{sport.level}</span>
                  <span className="stat-label">Niveau</span>
                </div>
              </div>
              <button className="btn-sport">Essayer gratuitement</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Sports