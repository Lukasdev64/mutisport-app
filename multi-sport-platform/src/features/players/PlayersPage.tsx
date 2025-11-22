import { useState } from 'react';
import { MOCK_PLAYERS } from '@/lib/mockData';
import { Search, UserPlus, MoreVertical, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

import { RANKINGS } from '@/config/rankings';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';

export function PlayersPage() {
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerAge, setNewPlayerAge] = useState('');
  const [newPlayerRanking, setNewPlayerRanking] = useState('NC');

  const [editingPlayer, setEditingPlayer] = useState<typeof MOCK_PLAYERS[0] | null>(null);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    if (editingPlayer) {
      // Update existing player
      setPlayers(players.map(p => p.id === editingPlayer.id ? {
        ...p,
        name: newPlayerName,
        email: newPlayerEmail || 'no-email@example.com',
        age: newPlayerAge ? parseInt(newPlayerAge) : undefined,
        ranking: newPlayerRanking,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPlayerName}` // Update avatar if name changes
      } : p));
    } else {
      // Add new player
      const id = `p${Date.now()}`;
      const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9'];
      const bg = bgColors[Math.floor(Math.random() * bgColors.length)];
      const newPlayer = {
        id,
        name: newPlayerName,
        email: newPlayerEmail || 'no-email@example.com',
        age: newPlayerAge ? parseInt(newPlayerAge) : undefined,
        ranking: newPlayerRanking,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(id)}&backgroundColor=${bg}`
      };
      setPlayers([newPlayer, ...players]);
    }

    closeModal();
  };

  const openAddModal = () => {
    setEditingPlayer(null);
    setNewPlayerName('');
    setNewPlayerEmail('');
    setNewPlayerAge('');
    setNewPlayerRanking('NC');
    setIsModalOpen(true);
  };

  const openEditModal = (player: typeof MOCK_PLAYERS[0]) => {
    setEditingPlayer(player);
    setNewPlayerName(player.name);
    setNewPlayerEmail(player.email || '');
    setNewPlayerAge(player.age?.toString() || '');
    setNewPlayerRanking(player.ranking || 'NC');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingPlayer(null);
    setNewPlayerName('');
    setNewPlayerEmail('');
    setNewPlayerAge('');
    setNewPlayerRanking('NC');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Players</h1>
          <p className="text-slate-400">Manage your player database</p>
        </div>
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-500">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search players..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <PlayerAvatar 
                src={player.avatar} 
                name={player.name} 
                className="w-12 h-12" 
              />
              <div>
                <h3 className="font-bold text-white">{player.name}</h3>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Mail className="w-3 h-3" />
                    {player.email}
                  </div>
                  {player.age && (
                    <div className="text-xs text-emerald-400 font-medium">
                      Age: {player.age}
                    </div>
                  )}
                  {player.ranking && (
                    <div className="text-xs text-blue-400 font-medium">
                      Rank: {player.ranking}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => openEditModal(player)}
              className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Player Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingPlayer ? 'Edit Player' : 'Add New Player'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePlayer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter player name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newPlayerEmail}
                    onChange={(e) => setNewPlayerEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    min="5"
                    max="99"
                    value={newPlayerAge}
                    onChange={(e) => setNewPlayerAge(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ranking (FFT)</label>
                  <select
                    value={newPlayerRanking}
                    onChange={(e) => setNewPlayerRanking(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {RANKINGS.map(r => (
                      <option key={r} value={r} className="bg-slate-900">{r}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="ghost" onClick={closeModal} className="text-slate-400">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={!newPlayerName.trim()}>
                    {editingPlayer ? 'Save Changes' : 'Add Player'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
