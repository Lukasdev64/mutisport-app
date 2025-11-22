/**
 * TournamentWizard - Composant wizard en 5 étapes pour créer un tournoi
 * Design guidé et simple pour seniors
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import FormatSelector from './FormatSelector'
import BracketDisplay from './BracketDisplay'
import InvitationManager from './organisms/InvitationManager'
import Skeleton from '../common/Skeleton'
import {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  generateRoundRobinBracket,
  generateSwissBracket,
} from '../../utils/bracketAlgorithms'
import { createTournamentWithBracket } from '../../services/tournamentService.unified'
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Minus, 
  Plus, 
  AlertTriangle, 
  Trophy, 
  MapPin, 
  Calendar,
  Users,
  Loader2
} from 'lucide-react'
import './TournamentWizard.css'

const TournamentWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (e) {
        console.error('Error fetching user:', e)
      } finally {
        setIsLoadingUser(false)
      }
    }
    getUser()
  }, [])

  // Données du formulaire
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    tournament_date: new Date().toISOString().split('T')[0],
    format: 'single-elimination',
    players_count: 8,
    players_names: [],
    mode: 'instant', // 'instant' or 'planned'
  })

  // Gérer le changement des inputs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Navigation entre les étapes
  const goToStep = (step) => {
    // Validation avant de passer à l'étape suivante
    if (step > currentStep) {
      if (currentStep === 1 && !formData.name.trim()) {
        setError('Veuillez entrer un nom pour le tournoi')
        return
      }
      if (currentStep === 4 && formData.players_count < 2) {
        setError('Le tournoi doit avoir au moins 2 joueurs')
        return
      }
    }
    setCurrentStep(step)
    setError(null)
  }

  // Générer les noms de joueurs par défaut
  const generateDefaultPlayerNames = (count) => {
    return Array.from({ length: count }, (_, i) => `Joueur ${i + 1}`)
  }

  // Soumettre le tournoi
  const handleSubmit = async () => {
    if (!user) {
      setError("Vous devez être connecté pour créer un tournoi.")
      return
    }

    // If Planned mode, show Invitation Manager instead of immediate submit
    if (formData.mode === 'planned' && currentStep !== 'invitation') {
      setCurrentStep('invitation')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Générer les noms si pas encore fait
      const players = formData.players_names.length === formData.players_count
        ? formData.players_names
        : Array.from({ length: formData.players_count }, (_, i) => formData.players_names[i] || `Joueur ${i + 1}`)

      // Créer le tournoi avec bracket généré automatiquement
      const { data, error } = await createTournamentWithBracket(
        {
          name: formData.name,
          location: formData.location,
          date: formData.tournament_date,
          format: formData.format,
          sport: 'Tennis', // Default sport - can be made configurable later
          user_id: user.id
        },
        players
      )

      if (error) {
        throw new Error(error.message || 'Erreur lors de la création')
      }

      // Rediriger vers la page de gestion du tournoi unifié
      navigate(`/dashboard/tournaments/${data.id}`)
    } catch (err) {
      console.error('Erreur lors de la création du tournoi:', err)
      setError(err.message || 'Une erreur est survenue lors de la création du tournoi')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingUser) {
    return (
      <div className="tournament-wizard-loading">
        <Skeleton type="rect" height="60px" className="mb-4" />
        <Skeleton type="rect" height="400px" />
      </div>
    )
  }

  return (
    <div className="tournament-wizard">
      {/* Progress indicator */}
      <div className="wizard-progress">
        <div className="mobile-step-indicator" aria-live="polite">
          Étape {currentStep} sur 5: {
            currentStep === 1 ? 'Infos' :
            currentStep === 2 ? 'Mode' :
            currentStep === 3 ? 'Format' :
            currentStep === 4 ? 'Joueurs' :
            'Aperçu'
          }
        </div>
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              <div className="step-number">
                {currentStep > step ? <Check size={16} /> : step}
              </div>
              <div className="step-label">
                {step === 1 && 'Infos'}
                {step === 2 && 'Mode'}
                {step === 3 && 'Format'}
                {step === 4 && 'Joueurs'}
                {step === 5 && 'Aperçu'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="wizard-error" role="alert">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* Étapes */}
      <div className="wizard-content">
        {/* Étape 1: Informations de base */}
        {currentStep === 1 && (
          <div className="wizard-step slide-in">
            <h2>Informations générales</h2>
            <p className="step-subtitle">Configurez les détails de base de votre tournoi</p>

            <div className="form-group-large">
              <label htmlFor="name">Nom du tournoi *</label>
              <div className="input-with-icon">
                <Trophy className="input-icon" size={20} />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Tournoi d'été 2025"
                  className="input-large"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group-large">
              <label htmlFor="location">Lieu (optionnel)</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={20} />
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Ex: Stade Municipal"
                  className="input-large"
                />
              </div>
            </div>

            <div className="form-group-large">
              <label htmlFor="tournament_date">Date (optionnel)</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" size={20} />
                <input
                  type="date"
                  id="tournament_date"
                  value={formData.tournament_date}
                  onChange={(e) => handleChange('tournament_date', e.target.value)}
                  className="input-large"
                />
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Mode */}
        {currentStep === 2 && (
          <div className="wizard-step slide-in">
            <h2>Mode de tournoi</h2>
            <p className="step-subtitle">Comment souhaitez-vous gérer les participants ?</p>

            <div className="mode-selection">
              <div 
                className={`mode-card ${formData.mode === 'instant' ? 'selected' : ''}`}
                onClick={() => handleChange('mode', 'instant')}
              >
                <div className="mode-icon">⚡</div>
                <h3>Instant</h3>
                <p>Les joueurs sont déjà présents. Créez le tournoi et commencez tout de suite.</p>
              </div>

              <div 
                className={`mode-card ${formData.mode === 'planned' ? 'selected' : ''}`}
                onClick={() => handleChange('mode', 'planned')}
              >
                <div className="mode-icon">📅</div>
                <h3>Planifié</h3>
                <p>Envoyez des invitations, gérez les réponses et planifiez les matchs à l'avance.</p>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3: Format */}
        {currentStep === 3 && (
          <div className="wizard-step slide-in">
            <FormatSelector
              selectedFormat={formData.format}
              onSelect={(format) => handleChange('format', format)}
              playerCount={formData.players_count}
            />
          </div>
        )}

        {/* Étape 4: Joueurs */}
        {currentStep === 4 && (
          <div className="wizard-step slide-in">
            <h2>Participants</h2>
            <p className="step-subtitle">Définissez le nombre de joueurs et leurs noms</p>

            <div className="player-count-selector">
              <button
                className="count-button"
                onClick={() => handleChange('players_count', Math.max(2, formData.players_count - 1))}
                disabled={formData.players_count <= 2}
                aria-label="Diminuer le nombre de joueurs"
              >
                <Minus size={24} aria-hidden="true" />
              </button>
              <div className="count-display" aria-live="polite" aria-atomic="true">
                {formData.players_count}
                <span className="sr-only"> joueurs</span>
              </div>
              <button
                className="count-button"
                onClick={() => handleChange('players_count', Math.min(64, formData.players_count + 1))}
                disabled={formData.players_count >= 64}
                aria-label="Augmenter le nombre de joueurs"
              >
                <Plus size={24} aria-hidden="true" />
              </button>
            </div>

            <div className="quick-select-buttons">
              {[4, 8, 16, 32].map((count) => (
                <button
                  key={count}
                  className={`quick-select-btn ${formData.players_count === count ? 'active' : ''}`}
                  onClick={() => handleChange('players_count', count)}
                >
                  {count} joueurs
                </button>
              ))}
            </div>

            <div className="player-names-section">
              <h3>Noms des joueurs (optionnel)</h3>
              <div className="player-names-grid">
                {Array.from({ length: formData.players_count }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Joueur ${i + 1}`}
                    value={formData.players_names[i] || ''}
                    onChange={(e) => {
                      const newNames = [...formData.players_names]
                      newNames[i] = e.target.value
                      handleChange('players_names', newNames)
                    }}
                    className="player-name-input"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Étape 5: Vérification */}
        {currentStep === 5 && (
          <div className="wizard-step slide-in">
            <h2>Récapitulatif</h2>
            <p className="step-subtitle">Vérifiez les informations avant de créer le tournoi</p>

            <div className="verification-card">
              <div className="verification-item">
                <span className="verification-label">Nom</span>
                <span className="verification-value">{formData.name}</span>
              </div>
              {formData.location && (
                <div className="verification-item">
                  <span className="verification-label">Lieu</span>
                  <span className="verification-value">{formData.location}</span>
                </div>
              )}
              {formData.tournament_date && (
                <div className="verification-item">
                  <span className="verification-label">Date</span>
                  <span className="verification-value">
                    {new Date(formData.tournament_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div className="verification-item">
                <span className="verification-label">Format</span>
                <span className="verification-value">
                  {formData.format === 'single-elimination' && 'Élimination Simple'}
                  {formData.format === 'double-elimination' && 'Double Élimination'}
                  {formData.format === 'round-robin' && 'Round-Robin'}
                  {formData.format === 'swiss' && 'Système Suisse'}
                </span>
              </div>
              <div className="verification-item">
                <span className="verification-label">Participants</span>
                <span className="verification-value">{formData.players_count} joueurs</span>
              </div>
              <div className="verification-item">
                <span className="verification-label">Mode</span>
                <span className="verification-value">
                  {formData.mode === 'instant' ? 'Instant (Joueurs présents)' : 'Planifié (Invitations)'}
                </span>
              </div>
            </div>

            <div className="verification-preview">
              <h3>Aperçu du tableau</h3>
              <div className="bracket-preview-container">
                <BracketDisplay
                  bracket={
                    formData.format === 'single-elimination'
                      ? generateSingleEliminationBracket(generateDefaultPlayerNames(formData.players_count))
                      : formData.format === 'round-robin'
                        ? generateRoundRobinBracket(generateDefaultPlayerNames(formData.players_count))
                        : formData.format === 'swiss'
                          ? generateSwissBracket(generateDefaultPlayerNames(formData.players_count))
                          : generateDoubleEliminationBracket(generateDefaultPlayerNames(formData.players_count))
                  }
                  format={formData.format}
                />
              </div>
            </div>
          </div>
        )}
        {/* Étape Spéciale: Invitation Manager */}
        {currentStep === 'invitation' && (
          <div className="wizard-step slide-in">
            <InvitationManager 
              tournamentId={null}
              players={Array.from({ length: formData.players_count }, (_, i) => ({
                name: formData.players_names[i] || `Joueur ${i + 1}`,
                email: `player${i+1}@example.com`
              }))}
              onComplete={handleSubmit}
            />
          </div>
        )}
      </div>

      {/* Navigation buttons - Hide in Invitation Manager */}
      {currentStep !== 'invitation' && (
        <div className="wizard-navigation">
          {currentStep > 1 && (
          <button
            className="btn-nav btn-previous"
            onClick={() => goToStep(currentStep - 1)}
            disabled={isSubmitting}
          >
            <ChevronLeft size={20} /> Retour
          </button>
        )}
        
        <div className="btn-placeholder"></div>

        {currentStep < 5 && (
          <button
            className="btn-nav btn-next"
            onClick={() => goToStep(currentStep + 1)}
          >
            Suivant <ChevronRight size={20} />
          </button>
        )}

        {currentStep === 5 && (
          <button
            className="btn-nav btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Création...
              </>
            ) : (
              <>
                Créer le tournoi <Check size={20} />
              </>
            )}
          </button>
        )}
      </div>
      )}
    </div>
  )
}

export default TournamentWizard
