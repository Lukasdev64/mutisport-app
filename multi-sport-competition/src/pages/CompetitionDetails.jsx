/**
 * Page de détails et gestion d'une compétition
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  getCompetitionById, 
  updateCompetition, 
  deleteCompetition,
  updateCompetitionCoverImage 
} from '../services/competitionService'
import './CompetitionDetails.css'

function CompetitionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [competition, setCompetition] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // overview, participants, results, settings
  
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    date: '',
    address: '',
    city: '',
    postalCode: '',
    maxParticipants: '',
    ageCategory: 'both',
    isOfficial: false,
    description: '',
    status: 'upcoming'
  })

  const sports = [
    'Tennis', 'Football', 'Basketball', 'Volleyball', 
    'Badminton', 'Rugby', 'Handball', 'Natation',
    'Athlétisme', 'Cyclisme', 'Escalade', 'Boxe'
  ]

  useEffect(() => {
    loadCompetition()
  }, [id])

  const loadCompetition = async () => {
    setIsLoading(true)
    setError(null)
    
    const { data, error: fetchError } = await getCompetitionById(id)
    
    if (fetchError) {
      setError('Erreur lors du chargement de la compétition')
      console.error(fetchError)
    } else {
      setCompetition(data)
      setFormData({
        name: data.name,
        sport: data.sport,
        date: data.competition_date,
        address: data.address,
        city: data.city,
        postalCode: data.postal_code,
        maxParticipants: data.max_participants,
        ageCategory: data.age_category,
        isOfficial: data.is_official,
        description: data.description || '',
        status: data.status
      })
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: updateError } = await updateCompetition(id, formData)
      
      if (updateError) {
        setError(updateError)
        return
      }

      setCompetition(data)
      setIsEditing(false)
      alert('✅ Compétition mise à jour avec succès !')
    } catch (err) {
      setError('Une erreur est survenue lors de la mise à jour')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétition ? Cette action est irréversible.')) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: deleteError } = await deleteCompetition(id)
      
      if (deleteError) {
        setError(deleteError)
        return
      }

      alert('✅ Compétition supprimée avec succès !')
      navigate('/dashboard/competitions')
    } catch (err) {
      setError('Une erreur est survenue lors de la suppression')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)
    try {
      const { data, error: uploadError } = await updateCompetitionCoverImage(id, file)
      
      if (uploadError) {
        setError(uploadError)
        return
      }

      setCompetition(prev => ({ ...prev, cover_image_url: data.cover_image_url }))
      alert('✅ Image de couverture mise à jour !')
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'image')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de la compétition...</p>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="error-container">
        <h2>Compétition introuvable</h2>
        <button className="btn-primary" onClick={() => navigate('/dashboard/competitions')}>
          ← Retour aux compétitions
        </button>
      </div>
    )
  }

  return (
    <div className="competition-details">
      {/* Header avec image de couverture */}
      <div className="competition-header-cover">
        {competition.cover_image_url ? (
          <img src={competition.cover_image_url} alt={competition.name} className="cover-image" />
        ) : (
          <div className="cover-placeholder">
            <span className="sport-icon">🏆</span>
          </div>
        )}
        <div className="cover-overlay">
          <button className="btn-secondary btn-small" onClick={() => navigate('/dashboard/competitions')}>
            ← Retour
          </button>
          <label className="btn-secondary btn-small" style={{ cursor: 'pointer' }}>
            📷 Changer l'image
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
          </label>
        </div>
      </div>

      {/* Titre et badges */}
      <div className="competition-title-section">
        <div className="competition-title-row">
          <div>
            <h1>{competition.name}</h1>
            <div className="competition-meta">
              <span className="meta-badge sport">{competition.sport}</span>
              {competition.is_official && <span className="meta-badge official">Officiel</span>}
              <span className={`meta-badge status status-${competition.status}`}>
                {competition.status === 'upcoming' && '📅 À venir'}
                {competition.status === 'ongoing' && '🔥 En cours'}
                {competition.status === 'completed' && '✅ Terminée'}
                {competition.status === 'cancelled' && '❌ Annulée'}
              </span>
            </div>
          </div>
          <div className="competition-actions-header">
            {!isEditing && (
              <>
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                  ✏️ Modifier
                </button>
                <button className="btn-danger" onClick={handleDelete} disabled={isSubmitting}>
                  🗑️ Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Vue d'ensemble
        </button>
        <button 
          className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          👥 Participants ({competition.current_participants}/{competition.max_participants})
        </button>
        <button 
          className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          🏅 Résultats
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Paramètres
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab competition={competition} />
        )}

        {activeTab === 'participants' && (
          <ParticipantsTab competition={competition} onUpdate={loadCompetition} />
        )}

        {activeTab === 'results' && (
          <ResultsTab competition={competition} onUpdate={loadCompetition} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            competition={competition}
            formData={formData}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            sports={sports}
            onInputChange={handleInputChange}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditing(false)
              setFormData({
                name: competition.name,
                sport: competition.sport,
                date: competition.competition_date,
                address: competition.address,
                city: competition.city,
                postalCode: competition.postal_code,
                maxParticipants: competition.max_participants,
                ageCategory: competition.age_category,
                isOfficial: competition.is_official,
                description: competition.description || '',
                status: competition.status
              })
            }}
          />
        )}
      </div>
    </div>
  )
}

// Onglet Vue d'ensemble
function OverviewTab({ competition }) {
  return (
    <div className="overview-content">
      <div className="info-cards-grid">
        <div className="info-card">
          <h3>📅 Date et Lieu</h3>
          <div className="info-list">
            <div className="info-item">
              <strong>Date</strong>
              <span>{new Date(competition.competition_date).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                weekday: 'long'
              })}</span>
            </div>
            <div className="info-item">
              <strong>Adresse</strong>
              <span>{competition.address}</span>
            </div>
            <div className="info-item">
              <strong>Ville</strong>
              <span>{competition.city} {competition.postal_code}</span>
            </div>
            <div className="info-item">
              <strong>Pays</strong>
              <span>{competition.country}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>👥 Participants</h3>
          <div className="info-list">
            <div className="info-item">
              <strong>Inscrits</strong>
              <span>{competition.current_participants} / {competition.max_participants}</span>
            </div>
            <div className="info-item">
              <strong>Places restantes</strong>
              <span>{competition.max_participants - competition.current_participants}</span>
            </div>
            <div className="info-item">
              <strong>Catégorie d'âge</strong>
              <span>
                {competition.age_category === 'minors' && 'Mineurs (-18 ans)'}
                {competition.age_category === 'adults' && 'Majeurs (+18 ans)'}
                {competition.age_category === 'both' && 'Toutes catégories'}
              </span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(competition.current_participants / competition.max_participants) * 100}%` 
              }}
            />
          </div>
        </div>

        <div className="info-card">
          <h3>ℹ️ Informations</h3>
          <div className="info-list">
            <div className="info-item">
              <strong>Sport</strong>
              <span>{competition.sport}</span>
            </div>
            <div className="info-item">
              <strong>Type</strong>
              <span>{competition.is_official ? 'Officielle' : 'Amicale'}</span>
            </div>
            <div className="info-item">
              <strong>Créée le</strong>
              <span>{new Date(competition.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="info-item">
              <strong>Dernière modification</strong>
              <span>{new Date(competition.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </div>

      {competition.description && (
        <div className="info-card description-card">
          <h3>📝 Description</h3>
          <p className="description-text">{competition.description}</p>
        </div>
      )}

      {competition.competition_files && competition.competition_files.length > 0 && (
        <div className="info-card">
          <h3>📎 Fichiers joints ({competition.competition_files.length})</h3>
          <div className="files-list">
            {competition.competition_files.map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link"
              >
                <span className="file-icon">
                  {file.file_type.startsWith('image/') ? '🖼️' : '📄'}
                </span>
                <span className="file-name">{file.file_name}</span>
                <span className="file-size">{(file.file_size / 1024).toFixed(1)} KB</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Onglet Participants
function ParticipantsTab({ competition }) {
  const participants = competition.participants || []

  return (
    <div className="participants-content">
      <div className="participants-header">
        <h3>Liste des participants</h3>
        <button className="btn-primary">+ Ajouter un participant</button>
      </div>

      {participants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>Aucun participant</h3>
          <p>Aucune inscription pour le moment</p>
        </div>
      ) : (
        <div className="participants-list">
          {participants.map((participant) => (
            <div key={participant.id} className="participant-card">
              <div className="participant-info">
                {participant.profiles?.avatar_url ? (
                  <img src={participant.profiles.avatar_url} alt="" className="participant-avatar" />
                ) : (
                  <div className="participant-avatar-placeholder">
                    {participant.profiles?.full_name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <div className="participant-name">{participant.profiles?.full_name || 'Anonyme'}</div>
                  <div className="participant-status">
                    <span className={`status-badge status-${participant.registration_status}`}>
                      {participant.registration_status === 'confirmed' && '✅ Confirmé'}
                      {participant.registration_status === 'pending' && '⏳ En attente'}
                      {participant.registration_status === 'cancelled' && '❌ Annulé'}
                      {participant.registration_status === 'rejected' && '🚫 Refusé'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="participant-actions">
                <button className="btn-secondary btn-small">Voir profil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Onglet Résultats
function ResultsTab({ competition }) {
  return (
    <div className="results-content">
      <div className="results-header">
        <h3>Classement et scores</h3>
        <button className="btn-primary">+ Ajouter des résultats</button>
      </div>

      <div className="empty-state">
        <div className="empty-icon">🏅</div>
        <h3>Aucun résultat</h3>
        <p>Les résultats seront disponibles après la compétition</p>
      </div>
    </div>
  )
}

// Onglet Paramètres
function SettingsTab({ competition, formData, isEditing, isSubmitting, sports, onInputChange, onSubmit, onCancel }) {
  if (!isEditing) {
    return (
      <div className="settings-content">
        <div className="info-card">
          <h3>Paramètres de la compétition</h3>
          <p>Cliquez sur "Modifier" pour changer les paramètres de la compétition.</p>
          <button className="btn-primary" onClick={() => onCancel()}>
            ✏️ Modifier les paramètres
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-content">
      <form onSubmit={onSubmit} className="settings-form">
        <div className="form-section">
          <h3>Informations générales</h3>
          
          <div className="form-group">
            <label htmlFor="name">Nom de la compétition *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sport">Sport *</label>
              <select
                id="sport"
                name="sport"
                value={formData.sport}
                onChange={onInputChange}
                required
              >
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Lieu</h3>
          
          <div className="form-group">
            <label htmlFor="address">Adresse *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Ville *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={onInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Code Postal *</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="maxParticipants">Nombre maximum de participants *</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={onInputChange}
              min="2"
              required
            />
          </div>

          <div className="form-group">
            <label>Catégorie d'âge *</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="ageCategory"
                  value="minors"
                  checked={formData.ageCategory === 'minors'}
                  onChange={onInputChange}
                />
                <span>Mineurs (-18 ans)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="ageCategory"
                  value="adults"
                  checked={formData.ageCategory === 'adults'}
                  onChange={onInputChange}
                />
                <span>Majeurs (+18 ans)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="ageCategory"
                  value="both"
                  checked={formData.ageCategory === 'both'}
                  onChange={onInputChange}
                />
                <span>Toutes catégories</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Statut *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onInputChange}
              required
            >
              <option value="upcoming">À venir</option>
              <option value="ongoing">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="isOfficial"
                checked={formData.isOfficial}
                onChange={onInputChange}
              />
              <span>Compétition officielle</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompetitionDetails
