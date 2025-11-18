import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Gère la soumission du formulaire de connexion avec Supabase Auth
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setIsLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await auth.signIn({
        email,
        password,
      })

      if (signInError) {
        // Gestion des erreurs spécifiques de Supabase
        if (signInError.message.includes('Email not confirmed')) {
          setError('Veuillez vérifier votre adresse email avant de vous connecter.')
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect.')
        } else {
          setError(signInError.message || 'Erreur de connexion. Veuillez réessayer.')
        }
        console.error('Erreur de connexion:', signInError)
      } else {
        console.log('Connexion réussie:', data)
        // Redirection vers le tableau de bord ou la page d'origine
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
        navigate(redirectTo)
      }
    } catch (err) {
      setError('Erreur inattendue. Veuillez réessayer.')
      console.error('Erreur de connexion:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Gère la connexion sociale avec Supabase Auth
   * @param {string} provider - Le fournisseur OAuth ('google' ou 'github')
   */
  const handleSocialLogin = async (provider) => {
    try {
      const { data, error: oauthError } = await auth.signInWithOAuth(provider)
      
      if (oauthError) {
        console.error(`Erreur connexion ${provider}:`, oauthError)
        setError(`Impossible de se connecter avec ${provider}. Veuillez réessayer.`)
      }
    } catch (err) {
      console.error(`Erreur connexion ${provider}:`, err)
      setError(`Impossible de se connecter avec ${provider}. Veuillez réessayer.`)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="back-link" aria-label="Retour à l'accueil">
            ← Retour
          </Link>
          <div className="auth-logo">
            <h1>SportChampions</h1>
          </div>
        </div>

        <div className="auth-content">
          <header className="auth-title">
            <h2>Connexion</h2>
            <p>Connectez-vous à votre compte pour accéder aux fonctionnalités premium</p>
          </header>

          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="votre@email.com"
                required
                aria-describedby="email-error"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Votre mot de passe"
                required
                aria-describedby="password-error"
                autoComplete="current-password"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Se souvenir de moi
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading || !email || !password}
              aria-describedby="submit-help"
            >
              {isLoading ? (
                <span className="loading-spinner" aria-hidden="true"></span>
              ) : null}
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
            <span id="submit-help" className="sr-only">
              Cliquez pour vous connecter avec vos identifiants
            </span>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="social-auth">
            <button 
              className="social-btn google-btn" 
              type="button"
              onClick={() => handleSocialLogin('google')}
              aria-label="Se connecter avec Google"
            >
              <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>
            
            <button 
              className="social-btn github-btn" 
              type="button"
              onClick={() => handleSocialLogin('github')}
              aria-label="Se connecter avec GitHub"
            >
              <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
                <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continuer avec GitHub
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="auth-link">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login