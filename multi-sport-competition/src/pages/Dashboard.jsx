/**
 * Dashboard principal avec sidebar et routing vers les sous-pages
 */

import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase, auth } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    // Récupérer la session au chargement
    const fetchSession = async () => {
      const { session: currentSession, error } = await auth.getSession()
      
      if (error || !currentSession) {
        navigate('/login')
        return
      }

      setSession(currentSession)
      setUser(currentSession.user)
      setIsPending(false)
    }

    fetchSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login')
      } else {
        setSession(session)
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleSignOut = async () => {
    const { error } = await auth.signOut()
    if (!error) {
      navigate('/login')
    }
  }

  if (isPending) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onSignOut={handleSignOut} />
      
      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/profile" replace />} />
          <Route path="/profile" element={<ProfileView user={user} />} />
          <Route path="/competitions" element={<CompetitionsView />} />
          <Route path="/participants" element={<ParticipantsView />} />
          <Route path="/availability" element={<AvailabilityView />} />
          <Route path="/results" element={<ResultsView />} />
          <Route path="/stats" element={<StatsView />} />
          <Route path="/messages" element={<MessagesView />} />
          <Route path="/settings" element={<SettingsView user={user} />} />
        </Routes>
      </main>
    </div>
  )
}

// Composant ProfileView
function ProfileView({ user }) {
  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  const fullName = user.user_metadata?.full_name || `${firstName} ${lastName}`.trim()

  return (
    <div className="view-container">
      <header className="view-header">
        <h1>Mon Profil</h1>
        <p className="view-description">Gérez vos informations personnelles</p>
      </header>

      <div className="cards-grid">
        <div className="card">
          <h3>Informations du compte</h3>
          <div className="info-list">
            <div className="info-item">
              <strong>Nom complet</strong>
              <span>{fullName || 'Non défini'}</span>
            </div>
            <div className="info-item">
              <strong>Email</strong>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <strong>Email vérifié</strong>
              <span className={user.email_confirmed_at ? 'status-success' : 'status-warning'}>
                {user.email_confirmed_at ? '✓ Vérifié' : '✗ Non vérifié'}
              </span>
            </div>
            <div className="info-item">
              <strong>Dernière connexion</strong>
              <span>
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Statistiques rapides</h3>
          <div className="stats-quick">
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Compétitions</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Participants</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant CompetitionsView
function CompetitionsView() {
  const [showForm, setShowForm] = useState(false)
  const [competitions, setCompetitions] = useState([])
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
    files: []
  })

  const sports = [
    'Tennis', 'Football', 'Basketball', 'Volleyball', 
    'Badminton', 'Rugby', 'Handball', 'Natation',
    'Athlétisme', 'Cyclisme', 'Escalade', 'Boxe'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB max
      return (isImage || isPDF) && isValidSize
    })

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles.map(file => ({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }))]
    }))
  }

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newCompetition = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      participants: 0
    }
    setCompetitions(prev => [...prev, newCompetition])
    setFormData({
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
      files: []
    })
    setShowForm(false)
  }

  if (showForm) {
    return (
      <div className="view-container">
        <div className="view-header">
          <div>
            <h1>Nouvelle Compétition</h1>
            <p className="view-description">Remplissez les informations de la compétition</p>
          </div>
          <button className="btn-secondary" onClick={() => setShowForm(false)}>
            ← Retour
          </button>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Informations générales</h3>
              
              <div className="form-group">
                <label htmlFor="name">Nom de la compétition *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Tournoi de Tennis Open 2025"
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
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un sport</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date de la compétition *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
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
                  onChange={handleInputChange}
                  placeholder="Décrivez la compétition, les règles spécifiques, les prix, etc."
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
                  onChange={handleInputChange}
                  placeholder="Ex: 12 Rue du Stade"
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
                    onChange={handleInputChange}
                    placeholder="Ex: Paris"
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
                    onChange={handleInputChange}
                    placeholder="Ex: 75001"
                    pattern="[0-9]{5}"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Participants</h3>
              
              <div className="form-group">
                <label htmlFor="maxParticipants">Nombre maximum de participants *</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="Ex: 32"
                  min="2"
                  max="1000"
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
                      onChange={handleInputChange}
                    />
                    <span>Mineurs uniquement (-18 ans)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="ageCategory"
                      value="adults"
                      checked={formData.ageCategory === 'adults'}
                      onChange={handleInputChange}
                    />
                    <span>Majeurs uniquement (+18 ans)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="ageCategory"
                      value="both"
                      checked={formData.ageCategory === 'both'}
                      onChange={handleInputChange}
                    />
                    <span>Toutes catégories</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    name="isOfficial"
                    checked={formData.isOfficial}
                    onChange={handleInputChange}
                  />
                  <span>Compétition officielle</span>
                </label>
                <p className="form-help">Les compétitions officielles apparaîtront avec un badge spécial</p>
              </div>
            </div>

            <div className="form-section">
              <h3>Documents et Images</h3>
              
              <div className="form-group">
                <label htmlFor="files">Fichiers joints (images ou PDF)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="files"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="files" className="file-upload-button">
                    <span className="upload-icon">📎</span>
                    <span>Choisir des fichiers</span>
                  </label>
                  <p className="form-help" style={{ marginLeft: 0, marginTop: '0.5rem' }}>
                    Images (JPG, PNG, GIF) ou PDF - Maximum 5 MB par fichier
                  </p>
                </div>

                {formData.files.length > 0 && (
                  <div className="files-preview">
                    {formData.files.map((fileObj, index) => (
                      <div key={index} className="file-item">
                        {fileObj.preview ? (
                          <img src={fileObj.preview} alt={fileObj.name} className="file-thumbnail" />
                        ) : (
                          <div className="file-icon">📄</div>
                        )}
                        <div className="file-info">
                          <div className="file-name">{fileObj.name}</div>
                          <div className="file-size">{(fileObj.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button
                          type="button"
                          className="file-remove"
                          onClick={() => removeFile(index)}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Créer la compétition
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1>Compétitions</h1>
          <p className="view-description">Créez et gérez vos compétitions sportives</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nouvelle Compétition
        </button>
      </div>
      
      {competitions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>Aucune compétition</h3>
          <p>Commencez par créer votre première compétition</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Créer une compétition
          </button>
        </div>
      ) : (
        <div className="competitions-grid">
          {competitions.map(comp => (
            <div key={comp.id} className="competition-card">
              <div className="competition-header">
                <div className="competition-sport">{comp.sport}</div>
                {comp.isOfficial && <span className="badge-official">Officiel</span>}
              </div>
              <h3>{comp.name}</h3>
              <div className="competition-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{new Date(comp.date).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{comp.city}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <span>{comp.participants} / {comp.maxParticipants} participants</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🎯</span>
                  <span>
                    {comp.ageCategory === 'minors' && 'Mineurs'}
                    {comp.ageCategory === 'adults' && 'Majeurs'}
                    {comp.ageCategory === 'both' && 'Toutes catégories'}
                  </span>
                </div>
              </div>
              <div className="competition-actions">
                <button className="btn-secondary">Voir détails</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Composant ParticipantsView
function ParticipantsView() {
  return (
    <div className="view-container">
      <header className="view-header">
        <div>
          <h1>Participants</h1>
          <p className="view-description">Gérez les inscriptions et les équipes</p>
        </div>
        <button className="btn-primary">
          + Ajouter participant
        </button>
      </header>

      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>Aucun participant</h3>
        <p>Les participants inscrits apparaîtront ici</p>
      </div>
    </div>
  )
}

// Composant AvailabilityView
function AvailabilityView() {
  return (
    <div className="view-container">
      <header className="view-header">
        <h1>Disponibilités</h1>
        <p className="view-description">Suivez les présences confirmées</p>
      </header>

      <div className="empty-state">
        <div className="empty-icon">✅</div>
        <h3>Aucune disponibilité</h3>
        <p>Les confirmations de présence s'afficheront ici</p>
      </div>
    </div>
  )
}

// Composant ResultsView
function ResultsView() {
  return (
    <div className="view-container">
      <header className="view-header">
        <h1>Résultats</h1>
        <p className="view-description">Consultez les classements et scores</p>
      </header>

      <div className="empty-state">
        <div className="empty-icon">🏅</div>
        <h3>Aucun résultat</h3>
        <p>Les résultats des compétitions apparaîtront ici</p>
      </div>
    </div>
  )
}

// Composant StatsView
function StatsView() {
  return (
    <div className="view-container">
      <header className="view-header">
        <h1>Statistiques</h1>
        <p className="view-description">Analyses et graphiques détaillés</p>
      </header>

      <div className="cards-grid">
        <div className="card">
          <h3>Vue d'ensemble</h3>
          <p>Statistiques globales à venir</p>
        </div>
      </div>
    </div>
  )
}

// Composant MessagesView
function MessagesView() {
  return (
    <div className="view-container">
      <header className="view-header">
        <div>
          <h1>Messages</h1>
          <p className="view-description">Communication avec les participants</p>
        </div>
        <button className="btn-primary">
          + Nouveau message
        </button>
      </header>

      <div className="empty-state">
        <div className="empty-icon">💬</div>
        <h3>Aucun message</h3>
        <p>Votre boîte de réception est vide</p>
      </div>
    </div>
  )
}

// Composant SettingsView
function SettingsView({ user }) {
  return (
    <div className="view-container">
      <header className="view-header">
        <h1>Paramètres</h1>
        <p className="view-description">Configuration de votre compte</p>
      </header>

      <div className="cards-grid">
        <div className="card">
          <h3>Préférences</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div>
                <strong>Notifications email</strong>
                <p>Recevoir des emails pour les nouvelles inscriptions</p>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div>
                <strong>Notifications push</strong>
                <p>Recevoir des notifications dans le navigateur</p>
              </div>
              <label className="toggle">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Sécurité</h3>
          <div className="settings-list">
            <button className="btn-secondary">Changer le mot de passe</button>
            {!user.email_confirmed_at && (
              <button className="btn-secondary">Vérifier mon email</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

