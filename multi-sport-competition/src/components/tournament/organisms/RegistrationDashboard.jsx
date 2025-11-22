import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import playerService from '../../../services/tournament/playerService'
import selectionService from '../../../services/tournament/selectionService'
import schedulingService from '../../../services/tournament/schedulingService'
import AvailabilityDisplay from '../atoms/AvailabilityDisplay'
import toast from 'react-hot-toast'
import './RegistrationDashboard.css'

export default function RegistrationDashboard({ tournamentId }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [stats, setStats] = useState({ registered: 0, confirmed: 0, waitlist: 0, rejected: 0 })
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    fetchPlayers()
  }, [tournamentId])

  async function fetchPlayers() {
    setLoading(true)
    const { data, error } = await playerService.getPlayers(tournamentId)
    if (error) {
      toast.error('Failed to load players')
    } else {
      setPlayers(data || [])
      calculateStats(data || [])
    }
    setLoading(false)
  }

  function calculateStats(playerList) {
    const newStats = { registered: 0, confirmed: 0, waitlist: 0, rejected: 0 }
    playerList.forEach(p => {
      if (newStats[p.status] !== undefined) {
        newStats[p.status]++
      }
    })
    setStats(newStats)
  }

  async function handleSimulateImport() {
    if (!confirm('This will add 10 mock players with random availability. Continue?')) return

    setProcessing(true)
    const mockPlayers = Array.from({ length: 10 }).map((_, i) => ({
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      email: `player${i}@example.com`,
      status: 'registered',
      availability: {
        dates: ['2023-10-27', '2023-10-28'],
        time_ranges: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
      },
      constraints: Math.random() > 0.7 ? { limited_mobility: true } : {}
    }))

    const { error } = await playerService.createPlayers(tournamentId, mockPlayers)
    
    if (error) {
      toast.error('Import failed')
    } else {
      toast.success('Imported 10 mock players')
      fetchPlayers()
    }
    setProcessing(false)
  }

  async function handleRunSelection() {
    setProcessing(true)
    // Assume max players is 8 for demo
    const maxPlayers = 8
    const result = await selectionService.selectPlayers(tournamentId, maxPlayers)
    
    if (result.error) {
      toast.error('Selection failed')
    } else {
      toast.success(`Selection complete! Confirmed: ${result.confirmed}, Waitlisted: ${result.waitlisted}`)
      fetchPlayers()
    }
    setProcessing(false)
  }

  async function handleAutoSchedule() {
    setProcessing(true)
    const result = await schedulingService.generateSchedule(tournamentId)
    
    if (result.error) {
      toast.error('Scheduling failed')
    } else {
      toast.success(`Scheduled ${result.scheduled} matches based on availability`)
    }
    setProcessing(false)
  }

  if (loading) return <div>Loading registration data...</div>

  return (
    <div className="registration-dashboard">
      <div className="dashboard-header">
        <h2>Registration & Scheduling</h2>
        <div className="dashboard-actions">
          <button 
            className="btn-secondary" 
            onClick={handleSimulateImport}
            disabled={processing}
          >
            Simulate Tally Import
          </button>
          <button 
            className="btn-primary" 
            onClick={handleRunSelection}
            disabled={processing}
          >
            Run Selection Algorithm
          </button>
          <button 
            className="btn-accent" 
            onClick={handleAutoSchedule}
            disabled={processing}
          >
            Auto-Schedule Matches
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-value">{stats.registered}</span>
          <span className="stat-label">New Registrations</span>
        </div>
        <div className="stat-card success">
          <span className="stat-value">{stats.confirmed}</span>
          <span className="stat-label">Confirmed</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-value">{stats.waitlist}</span>
          <span className="stat-label">Waitlist</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-value">{stats.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      <div className="players-list-section">
        <h3>Registered Players</h3>
        <div className="players-table-container">
          <table className="players-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Registration Date</th>
                <th>Availability</th>
                <th>Constraints</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr 
                  key={player.id} 
                  className={`status-${player.status} clickable-row`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <td>
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <span className="player-email">{player.email}</span>
                    </div>
                  </td>
                  <td>{new Date(player.registration_date || player.created_at).toLocaleString()}</td>
                  <td>
                    <AvailabilityDisplay availability={player.availability} />
                  </td>
                  <td>
                    {player.constraints && Object.keys(player.constraints).length > 0 ? (
                      <span className="constraints-tag">Has Constraints</span>
                    ) : (
                      <span className="no-constraints">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table">No players registered yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedPlayer.name}</h3>
              <button className="close-btn" onClick={() => setSelectedPlayer(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="player-detail-section">
                <h4>Status</h4>
                <span className={`status-badge status-${selectedPlayer.status} large`}>
                  {selectedPlayer.status}
                </span>
              </div>
              
              <div className="player-detail-section">
                <h4>Contact</h4>
                <p>Email: {selectedPlayer.email}</p>
                <p>Phone: {selectedPlayer.phone || 'N/A'}</p>
              </div>

              <div className="player-detail-section">
                <h4>Availability</h4>
                <AvailabilityDisplay availability={selectedPlayer.availability} />
              </div>

              <div className="player-detail-section">
                <h4>Constraints</h4>
                {selectedPlayer.constraints && Object.keys(selectedPlayer.constraints).length > 0 ? (
                  <pre className="constraints-json">
                    {JSON.stringify(selectedPlayer.constraints, null, 2)}
                  </pre>
                ) : (
                  <p className="text-muted">No specific constraints</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
