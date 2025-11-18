// Authentication utilities for Better Auth integration

/**
 * Validation des emails avec regex RFC 5322 simplifiée
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { isValid: false, error: 'L\'adresse email est requise' }
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format d\'email invalide' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Validation de nom/prénom
 */
export const validateName = (name, fieldName = 'nom') => {
  if (!name) {
    return { isValid: false, error: `Le ${fieldName} est requis` }
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Minimum 2 caractères' }
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Maximum 50 caractères' }
  }
  
  // Vérifier les caractères autorisés (lettres, espaces, traits d'union)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Caractères non autorisés' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Calcul de la force du mot de passe
 * Retourne un score de 0 à 5
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0
  
  let score = 0
  
  // Longueur minimale
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  
  // Caractères en minuscules
  if (/[a-z]/.test(password)) score++
  
  // Caractères en majuscules
  if (/[A-Z]/.test(password)) score++
  
  // Chiffres
  if (/[0-9]/.test(password)) score++
  
  // Caractères spéciaux
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  // Vérifications supplémentaires pour réduire le score
  
  // Pénaliser les séquences répétitives
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1)
  
  // Pénaliser les séquences communes (123, abc, etc.)
  const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc']
  for (const seq of commonSequences) {
    if (password.toLowerCase().includes(seq)) {
      score = Math.max(0, score - 1)
      break
    }
  }
  
  return Math.min(5, score)
}

/**
 * Validation complète du mot de passe
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    minStrength = 3
  } = options
  
  if (!password) {
    return { isValid: false, error: 'Le mot de passe est requis' }
  }
  
  if (password.length < minLength) {
    return { isValid: false, error: `Minimum ${minLength} caractères` }
  }
  
  if (password.length > maxLength) {
    return { isValid: false, error: `Maximum ${maxLength} caractères` }
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Au moins une minuscule requise' }
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Au moins une majuscule requise' }
  }
  
  if (requireNumbers && !/[0-9]/.test(password)) {
    return { isValid: false, error: 'Au moins un chiffre requis' }
  }
  
  if (requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, error: 'Au moins un caractère spécial requis' }
  }
  
  const strength = calculatePasswordStrength(password)
  if (strength < minStrength) {
    return { isValid: false, error: 'Mot de passe trop faible' }
  }
  
  // Vérifier contre les mots de passe communs
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Mot de passe trop commun' }
  }
  
  return { isValid: true, error: null, strength }
}

/**
 * Obtenir le texte de force du mot de passe
 */
export const getPasswordStrengthText = (strength) => {
  const levels = [
    'Très faible',
    'Faible', 
    'Moyen',
    'Bon',
    'Fort',
    'Très fort'
  ]
  return levels[strength] || 'Très faible'
}

/**
 * Obtenir la couleur de force du mot de passe
 */
export const getPasswordStrengthColor = (strength) => {
  const colors = [
    '#ef4444', // Rouge
    '#f59e0b', // Orange
    '#eab308', // Jaune
    '#22c55e', // Vert clair
    '#16a34a', // Vert
    '#059669'  // Vert foncé
  ]
  return colors[strength] || colors[0]
}

/**
 * Validation de confirmation de mot de passe
 */
export const validatePasswordConfirmation = (password, confirmation) => {
  if (!confirmation) {
    return { isValid: false, error: 'Confirmez votre mot de passe' }
  }
  
  if (password !== confirmation) {
    return { isValid: false, error: 'Les mots de passe ne correspondent pas' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Détection d'attaques par force brute simple
 */
class RateLimiter {
  constructor() {
    this.attempts = new Map()
  }
  
  isAllowed(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Nettoyer les anciennes tentatives
    const recentAttempts = attempts.filter(time => now - time < windowMs)
    
    if (recentAttempts.length >= maxAttempts) {
      return false
    }
    
    // Enregistrer cette tentative
    recentAttempts.push(now)
    this.attempts.set(identifier, recentAttempts)
    
    return true
  }
  
  reset(identifier) {
    this.attempts.delete(identifier)
  }
}

export const rateLimiter = new RateLimiter()

/**
 * Validation côté client pour Better Auth
 */
export const validateLoginForm = (formData) => {
  const errors = {}
  
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }
  
  if (!formData.password) {
    errors.password = 'Le mot de passe est requis'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validation côté client pour l'inscription
 */
export const validateRegisterForm = (formData) => {
  const errors = {}
  
  const firstNameValidation = validateName(formData.firstName, 'prénom')
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error
  }
  
  const lastNameValidation = validateName(formData.lastName, 'nom')
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error
  }
  
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }
  
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error
  }
  
  const confirmPasswordValidation = validatePasswordConfirmation(
    formData.password, 
    formData.confirmPassword
  )
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error
  }
  
  if (!formData.acceptTerms) {
    errors.acceptTerms = 'Vous devez accepter les conditions'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sanitizer pour les entrées utilisateur
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Caractères de contrôle
    .slice(0, 1000) // Limiter la longueur
}

/**
 * Générateur de tokens CSRF simple (côté client uniquement pour démo)
 */
export const generateCSRFToken = () => {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(32))
  ).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Utilitaires pour Better Auth API
 */
export class AuthAPI {
  constructor(baseURL = '/api/auth') {
    this.baseURL = baseURL
  }
  
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(credentials.email),
          password: credentials.password,
          rememberMe: credentials.rememberMe || false
        }),
        credentials: 'include'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur de connexion')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
  
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: sanitizeInput(userData.firstName),
          lastName: sanitizeInput(userData.lastName),
          email: sanitizeInput(userData.email),
          password: userData.password,
          newsletter: userData.newsletter || false
        }),
        credentials: 'include'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'inscription')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }
  
  async socialLogin(provider) {
    try {
      // Redirection vers Better Auth OAuth
      window.location.href = `${this.baseURL}/oauth/${provider}`
    } catch (error) {
      console.error('Social login error:', error)
      throw error
    }
  }
  
  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/sign-out`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Erreur de déconnexion')
      }
      
      return true
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }
  
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseURL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(email)
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'envoi')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }
  
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: sanitizeInput(token),
          password: newPassword
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la réinitialisation')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }
}

// Instance par défaut de l'API
export const authAPI = new AuthAPI()

/**
 * Hook personnalisé pour la gestion d'état de l'authentification
 * (À utiliser avec React Context dans une app complète)
 */
export const createAuthState = () => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    
    // Actions
    login: async (credentials) => {
      // Implementation avec authAPI.login()
    },
    register: async (userData) => {
      // Implementation avec authAPI.register()  
    },
    logout: async () => {
      // Implementation avec authAPI.logout()
    }
  }
}

export default {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  calculatePasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  validateLoginForm,
  validateRegisterForm,
  sanitizeInput,
  generateCSRFToken,
  AuthAPI,
  authAPI,
  rateLimiter
}