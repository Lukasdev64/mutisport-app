/**
 * Dashboard principal avec sidebar et routing vers les sous-pages
 */

import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase, auth } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import TournamentList from './dashboard/tournaments/TournamentList'
import TournamentWizard from '../components/tournament/TournamentWizard'
import TournamentDashboard from './tournament/TournamentDashboard'
import { ensureUserProfile } from '../services/profileService'
import { Calendar, MapPin, Users, Target } from 'lucide-react'
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
      
      // Vérifier/créer le profil utilisateur
      await ensureUserProfile()
      
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
          <Route path="/" element={<Navigate to="/dashboard/tournaments" replace />} />
          <Route path="/profile" element={<ProfileView user={user} />} />

          {/* Routes de tournois unifiées */}
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournaments/create" element={<TournamentWizard />} />
          <Route path="/tournaments/:id" element={<TournamentDashboard />} />

          {/* Anciennes routes redirigées */}
          <Route path="/create-tournament" element={<Navigate to="/dashboard/tournaments/create" replace />} />
          <Route path="/my-tournaments" element={<Navigate to="/dashboard/tournaments" replace />} />
          <Route path="/tournament/:code" element={<Navigate to="/dashboard/tournaments" replace />} />
          <Route path="/competitions" element={<Navigate to="/dashboard/tournaments" replace />} />

          {/* Autres pages */}
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
  
  const [stats, setStats] = useState({
    competitions: 0,
    participants: 0,
    messages: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Récupérer le nombre de compétitions
      const { count: competitionsCount } = await supabase
        .from('competitions')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', user.id)

      // Récupérer le nombre total de participants dans toutes les compétitions de l'utilisateur
      const { data: competitions } = await supabase
        .from('competitions')
        .select('current_participants')
        .eq('organizer_id', user.id)
      
      const totalParticipants = competitions?.reduce((sum, comp) => sum + (comp.current_participants || 0), 0) || 0

      // Récupérer le nombre de messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      setStats({
        competitions: competitionsCount || 0,
        participants: totalParticipants,
        messages: messagesCount || 0
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

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
              <span className={`status-badge ${user.email_confirmed_at ? 'status-success' : 'status-warning'}`}>
                {user.email_confirmed_at ? 'Vérifié' : 'Non vérifié'}
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
          {isLoadingStats ? (
            <div className="loading-container-small">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="stats-quick">
              <div className="stat-item">
                <div className="stat-value">{stats.competitions}</div>
                <div className="stat-label">Compétitions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.participants}</div>
                <div className="stat-label">Participants</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.messages}</div>
                <div className="stat-label">Messages</div>
              </div>
            </div>
          )}
        </div>
      </div>
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
          <Users size={18} style={{ marginRight: '0.5rem' }} />
          Ajouter participant
        </button>
      </header>

      <div className="empty-state">
        <Users size={48} className="empty-state-icon" />
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
        <Calendar size={48} className="empty-state-icon" />
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
        <Target size={48} className="empty-state-icon" />
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
          <p className="text-muted">Statistiques globales à venir</p>
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
          <Users size={18} style={{ marginRight: '0.5rem' }} />
          Nouveau message
        </button>
      </header>

      <div className="empty-state">
        <Users size={48} className="empty-state-icon" />
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
                <p className="text-muted">Recevoir des emails pour les nouvelles inscriptions</p>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div>
                <strong>Notifications push</strong>
                <p className="text-muted">Recevoir des notifications dans le navigateur</p>
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

