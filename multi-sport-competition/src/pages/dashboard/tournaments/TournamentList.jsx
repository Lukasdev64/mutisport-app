/**
 * Tournament List - Unified Dashboard View
 * Replaces both CompetitionsView and TournamentList (anonymous)
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import tournamentService from '../../../services/tournamentService.unified'
// import Skeleton from '../../../components/common/Skeleton'
import { 
  Plus, 
  Trophy, 
  Calendar, 
  Users, 
  Target, 
  MapPin, 
  Trash2, 
  Eye, 
  Filter,
  X
} from 'lucide-react'
import './TournamentList.css'

const TournamentList = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: '',
    sport: '',
    format: ''
  })

  // Hardcoded tournaments for testing
  const hardcodedTournaments = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Tournoi de Tennis Printemps',
      status: 'upcoming',
      sport: 'Tennis',
      date: '2024-04-15',
      current_participants: 8,
      max_participants: 32,
      format: 'single-elimination',
      city: 'Paris',
      created_at: '2024-03-01',
      unique_url_code: 'TENNIS-2024',
      cover_image_url: null
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Championnat Basket 3x3',
      status: 'ongoing',
      sport: 'Basketball',
      date: '2024-03-20',
      current_participants: 16,
      max_participants: 16,
      format: 'double-elimination',
      city: 'Lyon',
      created_at: '2024-02-15',
      unique_url_code: 'BASKET-3X3',
      cover_image_url: null
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Ligue de Football Amateur',
      status: 'completed',
      sport: 'Football',
      date: '2024-01-10',
      current_participants: 20,
      max_participants: 20,
      format: 'round-robin',
      city: 'Marseille',
      created_at: '2023-12-01',
      unique_url_code: 'FOOT-LIGUE',
      cover_image_url: null
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Open Badminton',
      status: 'draft',
      sport: 'Badminton',
      date: '2024-05-01',
      current_participants: 0,
      max_participants: 64,
      format: 'swiss',
      city: 'Bordeaux',
      created_at: '2024-03-10',
      unique_url_code: 'BAD-OPEN',
      cover_image_url: null
    }
  ]

  // Fetch tournaments with React Query - DISABLED FOR TESTING
  /*
  const {
    data: tournaments,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['userTournaments', filters],
    queryFn: async () => {
      const { data, error } = await tournamentService.getUserTournaments(filters)
      if (error) throw new Error(error)
      return data
    },
    staleTime: 30000, // 30 seconds
    cacheTime: 300000 // 5 minutes
  })
  */
  
  const tournaments = hardcodedTournaments
  const isLoading = false
  const isError = false
  const error = null
  const refetch = () => {}

  const handleCreateNew = () => {
    navigate('/dashboard/tournaments/create')
  }

  const handleViewTournament = (id) => {
    navigate(`/dashboard/tournaments/${id}`)
  }

  const handleDeleteTournament = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) return

    const { error } = await tournamentService.deleteTournament(id)
    if (error) {
      alert(`Erreur: ${error}`)
      return
    }

    // Refetch list
    refetch()
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Brouillon', class: 'badge-draft' },
      upcoming: { text: 'À venir', class: 'badge-upcoming' },
      ongoing: { text: 'En cours', class: 'badge-ongoing' },
      completed: { text: 'Terminé', class: 'badge-completed' },
      cancelled: { text: 'Annulé', class: 'badge-cancelled' }
    }
    const badge = badges[status] || badges.draft
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>
  }

  const getFormatLabel = (format) => {
    const labels = {
      'single-elimination': 'Simple élimination',
      'double-elimination': 'Double élimination',
      'round-robin': 'Round Robin',
      'swiss': 'Swiss'
    }
    return labels[format] || format
  }

  // Skeleton removed for testing
  /*
  if (isLoading) {
    return (
      <div className="tournament-list">
        <div className="tournament-list-header">
          <div className="header-content">
            <Skeleton type="text" width="200px" height="32px" className="mb-2" />
            <Skeleton type="text" width="300px" height="20px" />
          </div>
          <Skeleton type="rect" width="180px" height="48px" />
        </div>

        <div className="tournament-filters">
          {[1, 2, 3].map(i => (
            <div key={i} className="filter-group">
              <Skeleton type="text" width="60px" height="16px" className="mb-1" />
              <Skeleton type="rect" width="100%" height="40px" />
            </div>
          ))}
        </div>

        <div className="tournament-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="tournament-card">
              <Skeleton type="rect" height="140px" style={{ borderRadius: '12px 12px 0 0' }} />
              <div className="tournament-card-content">
                <div className="tournament-card-header">
                  <Skeleton type="text" width="70%" height="24px" />
                  <Skeleton type="rect" width="80px" height="24px" style={{ borderRadius: '999px' }} />
                </div>
                <div className="tournament-card-meta">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="meta-item">
                      <Skeleton type="circle" width="16px" height="16px" />
                      <Skeleton type="text" width="80px" height="16px" />
                    </div>
                  ))}
                </div>
                <div className="tournament-card-actions">
                  <Skeleton type="rect" width="100%" height="36px" />
                  <Skeleton type="rect" width="40px" height="36px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  */

  if (isError) {
    return (
      <div className="tournament-list">
        <div className="error-message">
          <h3>❌ Erreur de chargement</h3>
          <p>{error.message}</p>
          <button onClick={() => refetch()} className="btn-retry">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tournament-list">
      {/* Header */}
      <div className="tournament-list-header">
        <div className="header-content">
          <h1>Mes Tournois</h1>
          <p className="subtitle">
            Gérez tous vos tournois depuis un seul endroit
          </p>
        </div>
        <button onClick={handleCreateNew} className="btn-primary btn-create">
          <Plus size={20} />
          Créer un tournoi
        </button>
      </div>

      {/* Filters */}
      <div className="tournament-filters">
        <div className="filter-group">
          <label>Statut</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tous</option>
            <option value="draft">Brouillon</option>
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sport</label>
          <select
            value={filters.sport}
            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
          >
            <option value="">Tous</option>
            <option value="Tennis">Tennis</option>
            <option value="Basketball">Basketball</option>
            <option value="Football">Football</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Badminton">Badminton</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Format</label>
          <select
            value={filters.format}
            onChange={(e) => setFilters({ ...filters, format: e.target.value })}
          >
            <option value="">Tous</option>
            <option value="single-elimination">Simple élimination</option>
            <option value="double-elimination">Double élimination</option>
            <option value="round-robin">Round Robin</option>
            <option value="swiss">Swiss</option>
          </select>
        </div>

        <button
          onClick={() => setFilters({ status: '', sport: '', format: '' })}
          className="btn-reset-filters"
          title="Réinitialiser les filtres"
        >
          <X size={18} />
          Réinitialiser
        </button>
      </div>

      {/* Tournament Grid */}
      {tournaments && tournaments.length > 0 ? (
        <div className="tournament-grid">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="tournament-card">
              {/* Cover Image */}
              {tournament.cover_image_url && (
                <div
                  className="tournament-cover"
                  style={{ backgroundImage: `url(${tournament.cover_image_url})` }}
                />
              )}

              {/* Content */}
              <div className="tournament-card-content">
                <div className="tournament-card-header">
                  <h3>{tournament.name}</h3>
                  {getStatusBadge(tournament.status)}
                </div>

                <div className="tournament-card-meta">
                  <div className="meta-item">
                    <Trophy size={16} className="icon" />
                    <span>{tournament.sport}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} className="icon" />
                    <span>{new Date(tournament.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={16} className="icon" />
                    <span>
                      {tournament.current_participants || 0}/{tournament.max_participants}
                    </span>
                  </div>
                  <div className="meta-item">
                    <Target size={16} className="icon" />
                    <span>{getFormatLabel(tournament.format)}</span>
                  </div>
                </div>

                {tournament.city && (
                  <div className="tournament-location">
                    <MapPin size={16} className="icon" />
                    <span>{tournament.city}</span>
                  </div>
                )}

                <div className="tournament-card-actions">
                  <button
                    onClick={() => handleViewTournament(tournament.id)}
                    className="btn-secondary btn-view"
                  >
                    <Eye size={18} />
                    Voir / Gérer
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(tournament.id)}
                    className="btn-danger btn-delete"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Quick Info Footer */}
              <div className="tournament-card-footer">
                <span className="created-date">
                  Créé le {new Date(tournament.created_at).toLocaleDateString('fr-FR')}
                </span>
                <span className="url-code">
                  Code: {tournament.unique_url_code}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Trophy className="empty-icon" size={64} />
          <h2>Aucun tournoi trouvé</h2>
          <p>
            {filters.status || filters.sport || filters.format
              ? 'Aucun tournoi ne correspond à vos filtres.'
              : 'Vous n\'avez pas encore créé de tournoi.'}
          </p>
          <button onClick={handleCreateNew} className="btn-primary">
            <Plus size={20} />
            Créer votre premier tournoi
          </button>
        </div>
      )}

      {/* Stats Summary */}
      {tournaments && tournaments.length > 0 && (
        <div className="tournament-stats">
          <div className="stat-card">
            <h4>Total</h4>
            <p className="stat-number">{tournaments.length}</p>
          </div>
          <div className="stat-card">
            <h4>En cours</h4>
            <p className="stat-number">
              {tournaments.filter(t => t.status === 'ongoing').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>À venir</h4>
            <p className="stat-number">
              {tournaments.filter(t => t.status === 'upcoming').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Terminés</h4>
            <p className="stat-number">
              {tournaments.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TournamentList
