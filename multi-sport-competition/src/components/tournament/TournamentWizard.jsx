/**
 * TournamentWizard - Composant wizard en 5 étapes pour créer un tournoi
 * Design guidé et simple pour seniors
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import FormatSelector from './FormatSelector'
import BracketDisplay from './BracketDisplay'
import {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  generateRoundRobinBracket,
  generateSwissBracket,
} from '../../utils/bracketAlgorithms'
import { createAnonymousTournament } from '../../services/anonymousTournamentService'
import { FiCheck, FiChevronRight, FiChevronLeft, FiMinus, FiPlus } from 'react-icons/fi'
import './TournamentWizard.css'

const TournamentWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Données du formulaire
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    tournament_date: '',
    format: 'single_elimination',
    players_count: 8,
    players_names: [],
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
      if (currentStep === 1 && !formData.name) {
        setError('Veuillez entrer un nom pour le tournoi')
        return
      }
      if (currentStep === 3 && formData.players_count < 2) {
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
    setIsSubmitting(true)
    setError(null)

    try {
      // Générer les noms si pas encore fait
      const players = formData.players_names.length === formData.players_count
        ? formData.players_names
        : generateDefaultPlayerNames(formData.players_count)

      // Générer le bracket selon le format
      let bracket_data
      switch (formData.format) {
        case 'single_elimination':
          bracket_data = generateSingleEliminationBracket(players)
          break
        case 'double_elimination':
          bracket_data = generateDoubleEliminationBracket(players)
          break
        case 'round_robin':
          bracket_data = generateRoundRobinBracket(players)
          break
        case 'swiss':
          bracket_data = generateSwissBracket(players)
          break
        default:
          throw new Error('Format non supporté')
      }

      // Créer le tournoi
      const { data, error } = await createAnonymousTournament({
        name: formData.name,
        location: formData.location,
        tournament_date: formData.tournament_date,
        format: formData.format,
        players_count: formData.players_count,
        players_names: players,
        bracket_data,
        organizer_id: user?.id,
      })

      if (error) {
        throw new Error(error)
      }

      // Rediriger vers la page de gestion du tournoi pour l'organisateur
      navigate(`/tournament/${data.unique_url_code}/manage`)
    } catch (err) {
      console.error('Erreur lors de la création du tournoi:', err)
      setError(err.message || 'Une erreur est survenue lors de la création du tournoi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="tournament-wizard">
      {/* Progress indicator */}
      <div className="wizard-progress">
        <div className="mobile-step-indicator" aria-live="polite">
          Étape {currentStep} sur 4: {
            currentStep === 1 ? 'Infos' :
            currentStep === 2 ? 'Format' :
            currentStep === 3 ? 'Joueurs' :
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
                {currentStep > step ? <FiCheck /> : step}
              </div>
              <div className="step-label">
                {step === 1 && 'Infos'}
                {step === 2 && 'Format'}
                {step === 3 && 'Joueurs'}
                {step === 4 && 'Aperçu'}
                {step === 5 && 'Fin'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="wizard-error" role="alert">
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      )}

      {/* Étapes */}
      <div className="wizard-content">
        {/* Étape 1: Informations de base */}
        {currentStep === 1 && (
          <div className="wizard-step">
            <h2>Informations générales</h2>
            <p className="step-subtitle">Configurez les détails de base de votre tournoi</p>

            <div className="form-group-large">
              <label htmlFor="name">Nom du tournoi *</label>
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

            <div className="form-group-large">
              <label htmlFor="location">Lieu (optionnel)</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: Stade Municipal"
                className="input-large"
              />
            </div>

            <div className="form-group-large">
              <label htmlFor="tournament_date">Date (optionnel)</label>
              <input
                type="date"
                id="tournament_date"
                value={formData.tournament_date}
                onChange={(e) => handleChange('tournament_date', e.target.value)}
                className="input-large"
              />
            </div>
          </div>
        )}

        {/* Étape 2: Format */}
        {currentStep === 2 && (
          <div className="wizard-step">
            <FormatSelector
              selectedFormat={formData.format}
              onSelect={(format) => handleChange('format', format)}
              playerCount={formData.players_count}
            />
          </div>
        )}

        {/* Étape 3: Joueurs */}
        {currentStep === 3 && (
          <div className="wizard-step">
            <h2>Participants</h2>
            <p className="step-subtitle">Définissez le nombre de joueurs et leurs noms</p>

            <div className="player-count-selector">
              <button
                className="count-button"
                onClick={() => handleChange('players_count', Math.max(2, formData.players_count - 1))}
                disabled={formData.players_count <= 2}
                aria-label="Diminuer le nombre de joueurs"
              >
                <FiMinus aria-hidden="true" />
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
                <FiPlus aria-hidden="true" />
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

        {/* Étape 4: Vérification */}
        {currentStep === 4 && (
          <div className="wizard-step">
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
                  {formData.format === 'single_elimination' && 'Élimination Simple'}
                  {formData.format === 'double_elimination' && 'Double Élimination'}
                  {formData.format === 'round_robin' && 'Round-Robin'}
                  {formData.format === 'swiss' && 'Système Suisse'}
                </span>
              </div>
              <div className="verification-item">
                <span className="verification-label">Participants</span>
                <span className="verification-value">{formData.players_count} joueurs</span>
              </div>
            </div>

            <div className="verification-preview">
              <h3>Aperçu du tableau</h3>
              <BracketDisplay
                bracket={
                  formData.format === 'single_elimination'
                    ? generateSingleEliminationBracket(generateDefaultPlayerNames(formData.players_count))
                    : formData.format === 'round_robin'
                      ? generateRoundRobinBracket(generateDefaultPlayerNames(formData.players_count))
                      : formData.format === 'swiss'
                        ? generateSwissBracket(generateDefaultPlayerNames(formData.players_count))
                        : generateDoubleEliminationBracket(generateDefaultPlayerNames(formData.players_count))
                }
                format={formData.format}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="wizard-navigation">
        {currentStep > 1 && (
          <button
            className="btn-nav btn-previous"
            onClick={() => goToStep(currentStep - 1)}
            disabled={isSubmitting}
          >
            <FiChevronLeft /> Retour
          </button>
        )}
        
        <div className="btn-placeholder"></div>

        {currentStep < 4 && (
          <button
            className="btn-nav btn-next"
            onClick={() => goToStep(currentStep + 1)}
          >
            Suivant <FiChevronRight />
          </button>
        )}

        {currentStep === 4 && (
          <button
            className="btn-nav btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création...' : 'Créer le tournoi'} <FiCheck />
          </button>
        )}
      </div>
    </div>
  )
}

export default TournamentWizard
