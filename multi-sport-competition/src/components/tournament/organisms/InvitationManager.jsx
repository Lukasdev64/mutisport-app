import React, { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import notificationService from '../../../services/notificationService'
import { Loader2, Mail, CheckCircle, XCircle, Clock, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import './InvitationManager.css'

export default function InvitationManager({ tournamentId, players, onComplete }) {
  const [sending, setSending] = useState(false)
  const [invitations, setInvitations] = useState(
    players.map(p => ({ ...p, status: 'pending_invite' }))
  )

  // Simulate sending invitations
  const handleSendInvitations = async () => {
    setSending(true)
    const updates = []
    
    for (const player of invitations) {
      if (player.status === 'pending_invite') {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300))
        updates.push({ ...player, status: 'pending_response' })
      } else {
        updates.push(player)
      }
    }
    
    setInvitations(updates)
    setSending(false)
    toast.success('Invitations sent!')
  }

  // Debug: Mock responses
  const handleMockResponse = (playerId, response) => {
    setInvitations(prev => prev.map(p => {
      if (p.id === playerId || p.name === playerId) { // Handle both ID and Name for unpersisted players
        return { ...p, status: response }
      }
      return p
    }))
    toast(response === 'confirmed' ? 'Player confirmed!' : 'Player declined', {
      icon: response === 'confirmed' ? '✅' : '❌'
    })
  }

  const confirmedCount = invitations.filter(p => p.status === 'confirmed').length
  const canProceed = confirmedCount >= 2 // Minimum 2 players

  return (
    <div className="invitation-manager">
      <div className="invitation-header">
        <h2>Gestion des Invitations</h2>
        <p>Envoyez les invitations et suivez les réponses des participants.</p>
      </div>

      <div className="invitation-stats">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-val">{invitations.length}</span>
        </div>
        <div className="stat-item success">
          <span className="stat-label">Confirmés</span>
          <span className="stat-val">{confirmedCount}</span>
        </div>
        <div className="stat-item warning">
          <span className="stat-label">En attente</span>
          <span className="stat-val">{invitations.filter(p => p.status === 'pending_response').length}</span>
        </div>
      </div>

      <div className="invitation-actions">
        <button 
          className="btn-primary"
          onClick={handleSendInvitations}
          disabled={sending || invitations.every(p => p.status !== 'pending_invite')}
        >
          {sending ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
          {sending ? 'Envoi en cours...' : 'Envoyer les invitations'}
        </button>
      </div>

      <div className="players-list">
        {invitations.map((player, idx) => (
          <div key={idx} className="player-invite-card">
            <div className="player-info">
              <span className="player-name">{player.name}</span>
              <span className="player-email">{player.email || 'No email'}</span>
            </div>
            
            <div className="invite-status">
              {player.status === 'pending_invite' && <span className="badge badge-gray">Non envoyé</span>}
              {player.status === 'pending_response' && <span className="badge badge-yellow"><Clock size={14} /> En attente</span>}
              {player.status === 'confirmed' && <span className="badge badge-green"><CheckCircle size={14} /> Confirmé</span>}
              {player.status === 'declined' && <span className="badge badge-red"><XCircle size={14} /> Refusé</span>}
            </div>

            {/* Debug Controls */}
            <div className="debug-controls">
              <button 
                className="btn-icon success" 
                onClick={() => handleMockResponse(player.id || player.name, 'confirmed')}
                title="Mock Confirm"
              >
                <CheckCircle size={16} />
              </button>
              <button 
                className="btn-icon danger" 
                onClick={() => handleMockResponse(player.id || player.name, 'declined')}
                title="Mock Decline"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="invitation-footer">
        <div className="debug-note">
          <small>ℹ️ Utilisez les boutons ✔/✖ pour simuler les réponses (Debug Mode)</small>
        </div>
        <button 
          className="btn-primary btn-large"
          onClick={onComplete}
          disabled={!canProceed}
        >
          Finaliser et Créer le Tournoi <Play size={18} />
        </button>
      </div>
    </div>
  )
}
