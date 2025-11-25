import { useState } from 'react';
import { Mail, CheckCircle, XCircle, Clock, Send, RotateCw, UserPlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InvitedPlayer {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'confirmed' | 'declined';
  invitedAt: Date;
}

export function InvitationManager() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [invitedPlayers, setInvitedPlayers] = useState<InvitedPlayer[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      const newPlayer: InvitedPlayer = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        status: 'pending',
        invitedAt: new Date()
      };
      
      setInvitedPlayers([...invitedPlayers, newPlayer]);
      setEmail('');
      setName('');
      setIsSending(false);
    }, 800);
  };

  const removePlayer = (id: string) => {
    setInvitedPlayers(invitedPlayers.filter(p => p.id !== id));
  };

  // Debug function to mock responses
  const mockResponse = (id: string, status: 'confirmed' | 'declined') => {
    setInvitedPlayers(players => 
      players.map(p => p.id === id ? { ...p, status } : p)
    );
  };

  const stats = {
    total: invitedPlayers.length,
    confirmed: invitedPlayers.filter(p => p.status === 'confirmed').length,
    pending: invitedPlayers.filter(p => p.status === 'pending').length,
    declined: invitedPlayers.filter(p => p.status === 'declined').length,
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl">
          <div className="text-slate-400 text-sm mb-1">Total Invités</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
          <div className="text-emerald-400 text-sm mb-1">Confirmés</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.confirmed}</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
          <div className="text-amber-400 text-sm mb-1">En attente</div>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
          <div className="text-red-400 text-sm mb-1">Refusés</div>
          <div className="text-2xl font-bold text-red-400">{stats.declined}</div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-400" />
          Inviter un joueur
        </h3>
        
        <form onSubmit={handleInvite} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-400">Nom du joueur</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean@example.com"
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={!name || !email || isSending}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isSending ? <RotateCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Liste des invités</h3>
        
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {invitedPlayers.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    player.status === 'confirmed' ? "bg-emerald-500/20 text-emerald-400" :
                    player.status === 'declined' ? "bg-red-500/20 text-red-400" :
                    "bg-amber-500/20 text-amber-400"
                  )}>
                    {player.status === 'confirmed' ? <CheckCircle className="w-5 h-5" /> :
                     player.status === 'declined' ? <XCircle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-medium text-white">{player.name}</div>
                    <div className="text-sm text-slate-400">{player.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Debug Controls */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                    {player.status === 'pending' && (
                      <>
                        <button
                          onClick={() => mockResponse(player.id, 'confirmed')}
                          className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-2 py-1 rounded"
                          title="Simuler acceptation"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => mockResponse(player.id, 'declined')}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded"
                          title="Simuler refus"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {invitedPlayers.length === 0 && (
            <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-xl">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune invitation envoyée pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
