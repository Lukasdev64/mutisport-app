import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTeamMembers, useInviteTeamMember, useRemoveTeamMember, useUpdateTeamMember } from '@/hooks/useTeams';
import { Loader2, Mail, Trash2, Shield, User, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TeamRole } from '@/types/team';
import { useSubscription } from '@/context/SubscriptionContext';

export default function TeamManagement() {
  const { isPro, isLoading: subLoading } = useSubscription();
  const { data: members, isLoading } = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const removeMutation = useRemoveTeamMember();
  const updateMutation = useUpdateTeamMember();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('viewer');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    try {
      await inviteMutation.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
        permissions: {} // Default permissions
      });
      setFeedback({ type: 'success', message: 'Invitation envoyée avec succès !' });
      setInviteEmail('');
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erreur lors de l\'envoi de l\'invitation.' });
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      try {
        await removeMutation.mutateAsync(id);
        setFeedback({ type: 'success', message: 'Membre retiré.' });
      } catch (err) {
        setFeedback({ type: 'error', message: 'Erreur lors de la suppression.' });
      }
    }
  };

  const handleRoleChange = async (id: string, newRole: TeamRole) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { role: newRole } });
      setFeedback({ type: 'success', message: 'Rôle mis à jour.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour.' });
    }
  };

  if (subLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400">Chargement de votre abonnement...</p>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield className="h-12 w-12 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Fonctionnalité Pro</h2>
        <p className="text-slate-400 mb-6 text-center max-w-md">
          La gestion avancée d'équipe est réservée aux membres <span className="text-blue-400 font-semibold">Pro</span>.<br />
          Passez au plan Pro pour inviter des collaborateurs, gérer les rôles et accéder à toutes les fonctionnalités d'équipe.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full text-lg shadow-lg">
          <a href="/billing">Découvrir le plan Premium</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestion d'Équipe</h1>
        <p className="text-slate-400">Invitez des collaborateurs pour gérer vos tournois ensemble.</p>
      </div>

      {/* Feedback Message */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            } flex items-center gap-3`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Invite Form */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/50 border-blue-900/30 backdrop-blur-sm sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserPlusIcon className="h-5 w-5 text-blue-500" />
                Inviter un membre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="collegue@exemple.com"
                      value={inviteEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                      className="pl-9 bg-slate-950/50 border-slate-800 text-white focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Rôle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['admin', 'editor', 'viewer'] as TeamRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setInviteRole(role)}
                        className={`px-3 py-2 text-sm rounded-md border transition-all ${
                          inviteRole === role
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                            : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {role === 'admin' ? 'Admin' : role === 'editor' ? 'Éditeur' : 'Lecteur'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {inviteRole === 'admin' && "Accès complet à tous les tournois et paramètres."}
                    {inviteRole === 'editor' && "Peut créer et modifier des tournois."}
                    {inviteRole === 'viewer' && "Lecture seule uniquement."}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-4"
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Envoyer l'invitation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-blue-900/30 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-white">Membres de l'équipe</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : members?.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Aucun membre dans votre équipe pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members?.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-950/30 border border-slate-800/50 hover:border-blue-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                          {member.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              member.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {member.status === 'active' ? 'Actif' : 'En attente'}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                          className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:border-blue-500 outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Éditeur</option>
                          <option value="viewer">Lecteur</option>
                        </select>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(member.id)}
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}
