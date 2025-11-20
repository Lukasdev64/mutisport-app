/**
 * Tournament List - Unified Dashboard View
 * Replaces both CompetitionsView and TournamentList (anonymous)
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import tournamentService from '../../../services/tournamentService.unified'
import './TournamentList.css'

const TournamentList = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: '',
    sport: '',
    format: ''
  })

  // Fetch tournaments with React Query
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

  if (isLoading) {
    return (
      <div className="tournament-list">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des tournois...</p>
        </div>
      </div>
    )
  }

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
          <span className="icon">➕</span>
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
        >
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
                    <span className="icon">🏆</span>
                    <span>{tournament.sport}</span>
                  </div>
                  <div className="meta-item">
                    <span className="icon">📅</span>
                    <span>{new Date(tournament.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="meta-item">
                    <span className="icon">👥</span>
                    <span>
                      {tournament.current_participants || 0}/{tournament.max_participants}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="icon">🎯</span>
                    <span>{getFormatLabel(tournament.format)}</span>
                  </div>
                </div>

                {tournament.city && (
                  <div className="tournament-location">
                    <span className="icon">📍</span>
                    <span>{tournament.city}</span>
                  </div>
                )}

                <div className="tournament-card-actions">
                  <button
                    onClick={() => handleViewTournament(tournament.id)}
                    className="btn-secondary btn-view"
                  >
                    Voir / Gérer
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(tournament.id)}
                    className="btn-danger btn-delete"
                    title="Supprimer"
                  >
                    🗑️
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
          <div className="empty-state-icon">🏆</div>
          <h2>Aucun tournoi trouvé</h2>
          <p>
            {filters.status || filters.sport || filters.format
              ? 'Aucun tournoi ne correspond à vos filtres.'
              : 'Vous n\'avez pas encore créé de tournoi.'}
          </p>
          <button onClick={handleCreateNew} className="btn-primary">
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
