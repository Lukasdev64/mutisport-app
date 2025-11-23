import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Trash2, UserPlus, Shield, Mail } from 'lucide-react'

export default function TeamManagement({ user }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchMembers()
  }, [user])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .eq('team_owner_id', user.id)

      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      console.error('Erreur chargement membres:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      // 1. Trouver l'utilisateur par email
      // Note: C'est une simplification. Idéalement, on envoie une invitation par email.
      // Ici on suppose que l'utilisateur existe déjà dans la base.
      
      // Pour des raisons de sécurité, on ne peut pas chercher n'importe qui par email directement coté client
      // sauf si on a une fonction RPC ou si les règles RLS le permettent sur la table profiles.
      // On va utiliser une Edge Function pour faire ça proprement ou une fonction RPC.
      // Pour l'instant, on va essayer de trouver le profil directement (si RLS le permet).
      
      // Alternative simple: On utilise une fonction RPC 'get_user_by_email' si elle existe, 
      // sinon on doit demander à l'utilisateur de s'inscrire d'abord.
      
      // Simulation: On va appeler une Edge Function 'invite-member' (à créer)
      // OU on fait une requête simple si on a les droits.
      
      // Pour ce prototype, on va supposer qu'on peut ajouter par email si l'user existe dans 'profiles'
      // ATTENTION: Par défaut RLS empêche de lire les emails des autres.
      
      // Solution robuste: Appeler une Edge Function.
      // Je vais créer une Edge Function 'invite-team-member' juste après.
      
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: { email: inviteEmail, role: inviteRole }
      })

      if (error) throw error
      
      setSuccess('Membre ajouté avec succès !')
      setInviteEmail('')
      fetchMembers()
      
    } catch (err) {
      console.error('Erreur invitation:', err)
      setError(err.message || "Impossible d'ajouter ce membre. Vérifiez qu'il est bien inscrit sur l'application.")
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      setMembers(members.filter(m => m.id !== memberId))
    } catch (err) {
      console.error('Erreur suppression:', err)
      setError("Erreur lors de la suppression du membre")
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error
      
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ))
    } catch (err) {
      console.error('Erreur mise à jour rôle:', err)
      setError("Erreur lors de la mise à jour du rôle")
    }
  }

  return (
    <div className="view-container">
      <header className="view-header">
        <div>
          <h1>Gestion d'équipe</h1>
          <p className="view-description">Gérez vos membres et leurs permissions</p>
        </div>
      </header>

      <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Carte d'invitation */}
        <div className="card">
          <h3>Inviter un nouveau membre</h3>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Email du membre</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="collegue@exemple.com"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Rôle</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
                <option value="viewer">Observateur</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ marginBottom: '1rem' }}>
              <UserPlus size={18} style={{ marginRight: '0.5rem' }} />
              Inviter
            </button>
          </form>
          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginTop: '1rem', color: 'green' }}>{success}</div>}
        </div>

        {/* Liste des membres */}
        <div className="card">
          <h3>Membres de l'équipe ({members.length})</h3>
          
          {loading ? (
            <div className="loading-spinner"></div>
          ) : members.length === 0 ? (
            <p style={{ color: '#718096', fontStyle: 'italic', padding: '1rem 0' }}>
              Aucun membre dans votre équipe pour le moment.
            </p>
          ) : (
            <div className="members-list">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Utilisateur</th>
                    <th style={{ padding: '0.75rem' }}>Rôle</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            background: '#ebf8ff', color: '#3182ce',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            {member.user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>
                              {member.user?.user_metadata?.full_name || 'Utilisateur sans nom'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                              {member.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <select 
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            border: '1px solid #cbd5e0',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="member">Membre</option>
                          <option value="admin">Admin</option>
                          <option value="viewer">Observateur</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="btn-icon-danger"
                          title="Retirer de l'équipe"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
