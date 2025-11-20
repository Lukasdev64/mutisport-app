/**
 * TournamentList - Liste des tournois créés par l'utilisateur
 * Permet de gérer les tournois existants et d'en créer de nouveaux (mockups inclus)
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiTrash2, FiEye, FiSettings, FiCpu } from 'react-icons/fi'
import { getTournamentsByOrganizer, deleteTournament, createMockTournament } from '../../services/anonymousTournamentService'
import { supabase } from '../../lib/supabase'
import './TournamentList.css'

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingMock, setIsCreatingMock] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUserAndTournaments = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadTournaments(user.id)
      }
    }
    getUserAndTournaments()
  }, [])

  const loadTournaments = async (userId) => {
    setIsLoading(true)
    const { data, error } = await getTournamentsByOrganizer(userId)
    if (error) {
      console.error('Erreur chargement tournois:', error)
    } else {
      setTournaments(data || [])
    }
    setIsLoading(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) {
      const { error } = await deleteTournament(id)
      if (!error) {
        setTournaments(tournaments.filter(t => t.id !== id))
      } else {
        alert('Erreur lors de la suppression')
      }
    }
  }

  const handleCreateMock = async (format = null, playerCount = null) => {
    if (!user) return
    setIsCreatingMock(true)
    
    const options = {}
    if (format) options.format = format
    if (playerCount) options.playerCount = playerCount

    const { data, error } = await createMockTournament(user.id, options)
    if (error) {
      alert('Erreur lors de la création du mockup: ' + error)
    } else {
      await loadTournaments(user.id)
    }
    setIsCreatingMock(false)
  }

  const getFormatLabel = (format) => {
    switch (format) {
      case 'single_elimination': return 'Élimination Simple'
      case 'double_elimination': return 'Double Élimination'
      case 'round_robin': return 'Round-Robin'
      case 'swiss': return 'Système Suisse'
      default: return format
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'setup': return 'Configuration'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminé'
      default: return status
    }
  }

  return (
    <div className="tournament-list-container">
      <div className="list-header">
        <div>
          <h1>Mes Tournois</h1>
          <p className="list-subtitle">Gérez vos tournois et créez des mockups de test</p>
        </div>
        <div className="header-actions">
          <Link to="/dashboard/create-tournament" className="btn-primary">
            <FiPlus /> Nouveau Tournoi
          </Link>
        </div>
      </div>

      {/* Dev Tools Section */}
      <div className="dev-tools-section">
        <h3>🛠️ Outils de Développement (Générateurs)</h3>
        <div className="dev-tools-grid">
          <div className="dev-tool-group">
            <h4>Élimination Simple</h4>
            <div className="btn-group">
              <button onClick={() => handleCreateMock('single_elimination', 4)} disabled={isCreatingMock}>4 Joueurs</button>
              <button onClick={() => handleCreateMock('single_elimination', 8)} disabled={isCreatingMock}>8 Joueurs</button>
              <button onClick={() => handleCreateMock('single_elimination', 16)} disabled={isCreatingMock}>16 Joueurs</button>
            </div>
          </div>
          <div className="dev-tool-group">
            <h4>Double Élimination</h4>
            <div className="btn-group">
              <button onClick={() => handleCreateMock('double_elimination', 4)} disabled={isCreatingMock}>4 Joueurs</button>
              <button onClick={() => handleCreateMock('double_elimination', 8)} disabled={isCreatingMock}>8 Joueurs</button>
            </div>
          </div>
          <div className="dev-tool-group">
            <h4>Round Robin</h4>
            <div className="btn-group">
              <button onClick={() => handleCreateMock('round_robin', 4)} disabled={isCreatingMock}>4 Joueurs</button>
              <button onClick={() => handleCreateMock('round_robin', 6)} disabled={isCreatingMock}>6 Joueurs</button>
            </div>
          </div>
          <div className="dev-tool-group">
            <h4>Système Suisse</h4>
            <div className="btn-group">
              <button onClick={() => handleCreateMock('swiss', 8)} disabled={isCreatingMock}>8 Joueurs</button>
              <button onClick={() => handleCreateMock('swiss', 16)} disabled={isCreatingMock}>16 Joueurs</button>
            </div>
          </div>
          <div className="dev-tool-group">
            <h4>Aléatoire</h4>
            <div className="btn-group">
              <button className="btn-secondary" onClick={() => handleCreateMock()} disabled={isCreatingMock}>
                <FiCpu /> Random
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des tournois...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>Aucun tournoi créé</h3>
          <p>Créez votre premier tournoi ou générez un mockup pour tester.</p>
          <div className="empty-actions">
            <button className="btn-secondary" onClick={handleCreateMock}>
              Générer un Mockup
            </button>
            <Link to="/dashboard/create-tournament" className="btn-primary">
              Créer un Tournoi
            </Link>
          </div>
        </div>
      ) : (
        <div className="tournaments-grid">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="tournament-card">
              <div className="card-header">
                <span className={`status-badge ${tournament.status}`}>
                  {getStatusLabel(tournament.status)}
                </span>
                <div className="card-actions">
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => handleDelete(tournament.id)}
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <h3 className="tournament-name">{tournament.name}</h3>
              
              <div className="tournament-info">
                <div className="info-row">
                  <span className="label">Format:</span>
                  <span className="value">{getFormatLabel(tournament.format)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Joueurs:</span>
                  <span className="value">{tournament.players_count}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date(tournament.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <Link 
                  to={`/tournament/${tournament.unique_url_code}`} 
                  className="btn-text"
                  target="_blank"
                >
                  <FiEye /> Public
                </Link>
                <Link 
                  to={`/dashboard/tournament/${tournament.unique_url_code}`} 
                  className="btn-outline"
                >
                  <FiSettings /> Gérer
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TournamentList
