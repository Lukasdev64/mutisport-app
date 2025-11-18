import './FreemiumModel.css'

function FreemiumModel() {
  return (
    <section 
      className="freemium-section" 
      aria-label="Modèle freemium et accès sans inscription"
      role="region"
    >
      <div className="container">
        <div className="freemium-content">
          <div className="freemium-text">
            <h2>Pourquoi Commencer Anonymement ?</h2>
            <p className="freemium-subtitle">
              Nous savons que les inscriptions peuvent être un frein. C'est pourquoi nous avons choisi une approche différente.
            </p>
            
            <div className="benefits-list" role="list">
              <div className="benefit-item" role="listitem">
                <span className="benefit-icon" aria-hidden="true">⚡</span>
                <div>
                  <h4>Accès instantané</h4>
                  <p>Commencez à utiliser la plateforme en moins de 10 secondes</p>
                </div>
              </div>
              
              <div className="benefit-item" role="listitem">
                <span className="benefit-icon" aria-hidden="true">🔒</span>
                <div>
                  <h4>Vie privée respectée</h4>
                  <p>Vos données restent anonymes tant que vous le souhaitez</p>
                </div>
              </div>
              
              <div className="benefit-item" role="listitem">
                <span className="benefit-icon" aria-hidden="true">🎯</span>
                <div>
                  <h4>Payez seulement si convaincu</h4>
                  <p>Inscription uniquement quand vous voulez débloquer les fonctionnalités premium</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="freemium-steps">
            <h3>Comment ça marche</h3>
            <ol className="steps-list">
              <li className="step">
                <span className="step-number" aria-hidden="true">1</span>
                <div className="step-content">
                  <h4>Cliquez et commencez</h4>
                  <p>Accès direct aux fonctionnalités gratuites</p>
                </div>
              </li>
              
              <li className="step">
                <span className="step-number" aria-hidden="true">2</span>
                <div className="step-content">
                  <h4>Explorez sans limite</h4>
                  <p>Testez toutes les fonctionnalités de base</p>
                </div>
              </li>
              
              <li className="step">
                <span className="step-number" aria-hidden="true">3</span>
                <div className="step-content">
                  <h4>Inscription à la demande</h4>
                  <p>Créez un compte seulement si vous voulez plus</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FreemiumModel