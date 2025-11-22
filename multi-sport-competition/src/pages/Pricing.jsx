import React from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Pricing.css'

function Pricing() {
  const plans = [
    {
      name: 'Découverte',
      price: '0',
      features: [
        'Création de compétitions illimitée',
        'Gestion des participants basique',
        'Page publique de compétition',
        'Support communautaire',
        'Publicités sur les pages'
      ],
      notIncluded: [
        'Statistiques avancées',
        'Export des données',
        'Personnalisation de la marque',
        'Support prioritaire'
      ],
      cta: 'Commencer gratuitement',
      ctaLink: '/register',
      isPopular: false
    },
    {
      name: 'Premium',
      price: '9.99',
      features: [
        'Tout ce qui est inclus dans Découverte',
        'Statistiques détaillées',
        'Export Excel/PDF des résultats',
        'Sans publicité',
        'Personnalisation (Logo, Couleurs)',
        'Support prioritaire 24/7',
        'Gestion d\'équipe avancée'
      ],
      notIncluded: [],
      cta: 'Passer au Premium',
      ctaLink: '/register?plan=premium',
      isPopular: true
    }
  ]

  return (
    <>
      <Header />
      <div className="pricing-page">
        <div className="pricing-header">
          <h1>Nos Tarifs</h1>
          <p>Choisissez le plan qui correspond à vos besoins. Commencez gratuitement et évoluez à votre rythme.</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.isPopular ? 'featured' : ''}`}>
              {plan.isPopular && <div className="popular-badge">Populaire</div>}
              
              <div className="card-header">
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="currency">€</span>
                  {plan.price}
                  <span className="period">/mois</span>
                </div>
              </div>

              <ul className="features-list">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <Check className="check-icon" size={20} />
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <li key={i} style={{ opacity: 0.6 }}>
                    <X className="cross-icon" size={20} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="card-action">
                <Link 
                  to={plan.ctaLink} 
                  className={`btn-plan ${plan.isPopular ? 'primary' : 'outline'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Pricing
