import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import './Auth.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Validation en temps réel
    const newErrors = { ...errors }
    
    if (name === 'email' && value && !validateEmail(value)) {
      newErrors.email = 'Adresse email invalide'
    } else if (name === 'email') {
      delete newErrors.email
    }

    if (name === 'password') {
      const strength = validatePassword(value)
      setPasswordStrength(strength)
      if (value && strength < 3) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre'
      } else {
        delete newErrors.password
      }
    }

    if (name === 'confirmPassword' && value && value !== formData.password) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    } else if (name === 'confirmPassword') {
      delete newErrors.confirmPassword
    }

    setErrors(newErrors)
  }

  /**
   * Gère la soumission du formulaire d'inscription avec Supabase Auth
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation côté client avant l'envoi
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis'
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis'
    if (!formData.email) newErrors.email = 'L\'email est requis'
    if (!validateEmail(formData.email)) newErrors.email = 'Email invalide'
    if (!formData.password) newErrors.password = 'Le mot de passe est requis'
    if (validatePassword(formData.password) < 3) newErrors.password = 'Mot de passe trop faible'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } = await auth.signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      if (error) {
        // Gestion des erreurs spécifiques de Supabase
        if (error.message.includes('already registered')) {
          setErrors({ 
            general: 'Un compte existe déjà avec cette adresse email.',
            email: 'Email déjà utilisé'
          })
        } else {
          setErrors({ 
            general: error.message || 'Erreur lors de la création du compte. Veuillez réessayer.'
          })
        }
        console.error('Erreur inscription:', error)
      } else {
        console.log('Inscription réussie:', data)
        // Redirection vers la page de bienvenue
        navigate('/welcome?email=' + encodeURIComponent(formData.email))
      }
    } catch (err) {
      setErrors({ 
        general: 'Erreur inattendue. Veuillez réessayer.'
      })
      console.error('Erreur inscription:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Gère l'inscription sociale avec Supabase Auth
   * @param {string} provider - Le fournisseur OAuth ('google' ou 'github')
   */
  const handleSocialSignUp = async (provider) => {
    try {
      const { data, error } = await auth.signInWithOAuth(provider)
      
      if (error) {
        console.error(`Erreur inscription ${provider}:`, error)
        setErrors({ general: `Impossible de s'inscrire avec ${provider}. Veuillez réessayer.` })
      }
    } catch (err) {
      console.error(`Erreur inscription ${provider}:`, err)
      setErrors({ general: `Impossible de s'inscrire avec ${provider}. Veuillez réessayer.` })
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Très faible'
      case 2: return 'Faible'
      case 3: return 'Moyen'
      case 4: return 'Fort'
      case 5: return 'Très fort'
      default: return ''
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'var(--status-error)'
      case 2: return '#f97316'
      case 3: return 'var(--status-warning)'
      case 4: return '#22c55e'
      case 5: return 'var(--status-success)'
      default: return 'var(--bg-tertiary)'
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
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
            <h2>Créer votre compte</h2>
            <p>Rejoignez des milliers d'athlètes et débloquez toutes les fonctionnalités</p>
          </header>

          {errors.general && (
            <div className="error-message" role="alert" aria-live="polite">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="Votre prénom"
                  required
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <span className="error-text" role="alert">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Votre nom"
                  required
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <span className="error-text" role="alert">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-text" role="alert">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Créer un mot de passe"
                required
                autoComplete="new-password"
              />
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="error-text" role="alert">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirmer votre mot de passe"
                required
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="error-text" role="alert">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label className={`checkbox-label ${errors.acceptTerms ? 'error' : ''}`}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="checkbox-input"
                  required
                />
                <span className="checkbox-custom"></span>
                J'accepte les{' '}
                <Link to="/terms" className="terms-link">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="terms-link">
                  politique de confidentialité
                </Link>
              </label>
              {errors.acceptTerms && (
                <span className="error-text" role="alert">{errors.acceptTerms}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading || Object.keys(errors).length > 0}
            >
              {isLoading ? (
                <span className="loading-spinner" aria-hidden="true"></span>
              ) : null}
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="social-auth">
            <button 
              className="social-btn google-btn" 
              type="button"
              onClick={() => handleSocialSignUp('google')}
              aria-label="S'inscrire avec Google"
            >
              <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              S'inscrire avec Google
            </button>
            
            <button 
              className="social-btn github-btn" 
              type="button"
              onClick={() => handleSocialSignUp('github')}
              aria-label="S'inscrire avec GitHub"
            >
              <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
                <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              S'inscrire avec GitHub
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="auth-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register