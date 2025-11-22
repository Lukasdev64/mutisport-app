import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '../components/CheckoutForm'
import './Payment.css'

// Remplacez par votre clé publique Stripe
const stripePromise = loadStripe('pk_test_51SWOkICa5azamjTQW1sVIT9YIstYIzzFtyJqNeypTcnFQ08D1IakJLDpYaPqxghY0pW7Sl7pfqRbvt6CZ23EpMXG00yM8ZcIPB');

function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  
  // Vérifier le statut du paiement après redirection
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login?redirect=/payment')
      return
    }
    setUser(user)
    
    // Si on n'est pas en retour de redirection, on initie le paiement
    if (!redirectStatus) {
      createSubscription(user)
    } else {
      setLoading(false)
    }
  }

  const createSubscription = async (currentUser) => {
    try {
      setError(null)
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          priceId: 'price_1SWOsbCa5azamjTQV4nwkCty', // Votre ID de prix
        },
      })

      if (error) throw error
      if (!data.clientSecret) throw new Error('Erreur lors de la création de l\'abonnement')
      
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error('Erreur création souscription:', err)
      let errorMessage = 'Impossible d\'initialiser le paiement. Veuillez réessayer.'
      
      // Tentative d'extraction du message d'erreur de la Edge Function
      if (err.context && typeof err.context.json === 'function') {
        try {
          const errorBody = await err.context.json()
          if (errorBody.error) {
            errorMessage = `Erreur serveur: ${errorBody.error}`
          }
        } catch (e) {
          console.error('Erreur lecture body:', e)
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  // Affichage succès après redirection
  if (redirectStatus === 'succeeded') {
    return (
      <>
        <Header />
        <div className="payment-container">
          <div className="payment-form-card success-message">
            <span className="success-icon">🎉</span>
            <h1>Paiement réussi !</h1>
            <p>Félicitations, votre abonnement est activé.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
              Accéder à mon Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <>
      <Header />
      <div className="payment-container">
        <div className="payment-header">
          <h1>Finaliser votre commande</h1>
          <p>Paiement sécurisé intégré</p>
        </div>

        <div className="payment-grid">
          <div className="order-summary">
            <h2>Récapitulatif</h2>
            <div className="plan-details">
              <div>
                <div className="plan-name">Plan Premium</div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>Facturation mensuelle</div>
              </div>
              <div className="plan-price">9.99 €</div>
            </div>
            <div className="total-row">
              <span>Total à payer</span>
              <span>9.99 €</span>
            </div>
            <ul style={{ marginTop: '1.5rem', listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <CheckCircle size={16} color="#48bb78" /> Statistiques détaillées
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <CheckCircle size={16} color="#48bb78" /> Export des données
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <CheckCircle size={16} color="#48bb78" /> Support prioritaire
              </li>
            </ul>
          </div>

          <div className="payment-form-card">
            {clientSecret ? (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            ) : error ? (
              <div style={{textAlign: 'center', color: '#e53e3e'}}>
                <p>{error}</p>
                <button 
                  onClick={() => createSubscription(user)}
                  className="btn-dashboard"
                  style={{marginTop: '1rem', background: '#5469d4'}}
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <div style={{textAlign: 'center'}}>Chargement du formulaire de paiement...</div>
            )}
            
            <div className="secure-badge" style={{marginTop: '1rem'}}>
              <Lock size={14} />
              Paiement sécurisé par Stripe
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Payment
