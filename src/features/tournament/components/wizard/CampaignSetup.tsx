import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWizardStore } from '../../store/wizardStore';
import { Users, Filter, Link as LinkIcon, Send, CheckCircle, Search, AlertCircle, Play, BarChart3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SelectionAlgorithm } from '../../logic/selectionAlgorithm';
import type { SelectionResult } from '../../logic/selectionAlgorithm';
import type { Player } from '@/types/tournament';

// Mock Player Database with realistic names
const MOCK_PLAYER_NAMES = [
  'Lucas Martin', 'Emma Bernard', 'Hugo Dubois', 'Chloé Leroy', 'Louis Moreau',
  'Léa Simon', 'Arthur Laurent', 'Manon Michel', 'Jules Lefebvre', 'Camille Garcia',
  'Gabriel Martinez', 'Sarah Rodriguez', 'Adam Fontaine', 'Laura Chevalier', 'Tom Girard',
  'Marie Lambert', 'Nathan Rousseau', 'Sophie Vincent', 'Mathis Fournier', 'Clara Bonnet',
  'Alexandre Dupont', 'Julia Gautier', 'Raphaël Morel', 'Inès Robin', 'Maxime André',
  'Lisa Mercier', 'Antoine Blanc', 'Zoé Laurent', 'Paul Dumas', 'Margaux Faure',
  'Victor Bertrand', 'Juliette Renard', 'Noah Blanc', 'Anaïs Petit', 'Ethan Roy',
  'Charlotte Brun', 'Théo Fernandez', 'Lilou Lopez', 'Robin Sanchez', 'Lina Perrin',
  'Pierre Durand', 'Jade Martin', 'Enzo Roussel', 'Rose Clement', 'Clément Morin',
  'Alice Nicolas', 'Matteo Richard', 'Eva Giraud', 'Baptiste Denis', 'Louise Marchand'
];

const MOCK_DB_PLAYERS = MOCK_PLAYER_NAMES.map((name, i) => ({
  id: `db-${i}`,
  name,
  age: 18 + Math.floor(Math.random() * 30), // 18-48
  rank: ['NC', '40', '30/5', '30/4', '30/3', '30/2', '30/1', '30', '15/5', '15/4'][Math.floor(Math.random() * 10)],
  email: `${name.toLowerCase().replace(' ', '.')}@tennis-club.fr`,
  avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name.replace(' ', '')}&backgroundColor=b6e3f4`
}));

export function CampaignSetup() {
  // State values - use useShallow to prevent unnecessary re-renders
  const { players, step } = useWizardStore(
    useShallow((s) => ({
      players: s.players,
      step: s.step
    }))
  );

  // Actions - stable references, no useShallow needed
  const setCampaignFilters = useWizardStore((s) => s.setCampaignFilters);
  const addExistingPlayer = useWizardStore((s) => s.addExistingPlayer);
  const setStep = useWizardStore((s) => s.setStep);
  const [filteredPlayers, setFilteredPlayers] = useState(MOCK_DB_PLAYERS);
  const [tallyLink, setTallyLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectionPreview, setSelectionPreview] = useState<SelectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'candidates' | 'responses' | 'analysis'>('candidates');

  // Local filter state
  const [ageRange, setAgeRange] = useState<{min: number, max: number}>({ min: 18, max: 50 });
  const [rankFilter, setRankFilter] = useState<string>('');

  useEffect(() => {
    // Filter logic
    const filtered = MOCK_DB_PLAYERS.filter(p => 
      p.age >= ageRange.min && 
      p.age <= ageRange.max &&
      (!rankFilter || p.rank === rankFilter)
    );
    setFilteredPlayers(filtered);
    setCampaignFilters({ minAge: ageRange.min, maxAge: ageRange.max, minRank: rankFilter });
  }, [ageRange, rankFilter, setCampaignFilters]);

  // Auto-switch tabs based on state
  useEffect(() => {
    if (players.length > 0 && activeTab === 'candidates') {
      setActiveTab('responses');
    }
  }, [players.length]);

  const handleGenerateTally = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setTallyLink(import.meta.env.VITE_TALLY_FORM_URL || 'https://tally.so/r/w7X8kL?tournament=summer2025');
      setIsGenerating(false);
    }, 1000);
  };

  const handleSimulateResponses = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Simulate 60-90% response rate
      const responseRate = 0.6 + Math.random() * 0.3;
      const respondents = filteredPlayers.filter(() => Math.random() < responseRate);
      
      // Create new players list including existing ones
      const currentPlayers = [...players];
      
      respondents.forEach(p => {
        if (!currentPlayers.find(existing => existing.id === p.id)) {
          const newPlayer = {
            id: p.id,
            name: p.name,
            email: p.email,
            avatar: p.avatar,
            rank: p.rank,
            registrationDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            constraints: {
                unavailableDates: Math.random() > 0.8 ? ['2024-06-15'] : [],
                maxMatchesPerDay: 3
            }
          };
          
          addExistingPlayer(newPlayer);
          currentPlayers.push(newPlayer);
        }
      });

      setIsGenerating(false);
      setSelectionPreview(null);
      setActiveTab('analysis'); // Auto-switch to analysis
      handleRunSelectionPreview(currentPlayers); // Pass updated list
    }, 1500);
  };

  const handleRunSelectionPreview = (customListOrEvent?: Player[] | React.MouseEvent) => {
    // Check if it's an array or an event
    const sourceList = Array.isArray(customListOrEvent) ? customListOrEvent : players;

    const candidates = sourceList.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email || '',
        registrationDate: new Date(p.registrationDate || Date.now()),
        constraints: p.constraints || { unavailableDates: [], maxMatchesPerDay: 3 }
    }));

    const result = SelectionAlgorithm.selectParticipants(candidates, 16, new Date());
    setSelectionPreview(result);
  };

  const handleProceed = () => {
    if (selectionPreview?.selected) {
      const store = useWizardStore.getState();
      store.setMaxParticipants(selectionPreview.selected.length);
      
      // CRITICAL: Convert RegistrationData to Player format with avatars
      const selectedPlayersWithAvatars = selectionPreview.selected.map(selectedData => {
        // Find the full player data from the registered players list
        const fullPlayer = players.find(p => p.id === selectedData.id);
        
        return fullPlayer || {
          id: selectedData.id,
          name: selectedData.name,
          avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedData.id}`, // Fallback avatar
          email: selectedData.email
        };
      });
      
      store.setSelectedPlayers(selectedPlayersWithAvatars);
    }
    setStep(step + 1);
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[600px] flex gap-6">
      {/* LEFT COLUMN: Configuration (30%) */}
      <div className="w-[350px] flex flex-col gap-4 shrink-0">
        <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 flex flex-col gap-6 h-full">
          
          {/* 1. Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <Filter className="w-5 h-5 text-blue-400" />
              Configuration
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Age ({ageRange.min}-{ageRange.max})</label>
                <div className="flex gap-2">
                  <input type="range" min="10" max="80" value={ageRange.min} onChange={(e) => setAgeRange(prev => ({ ...prev, min: parseInt(e.target.value) }))} className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                  <input type="range" min="10" max="80" value={ageRange.max} onChange={(e) => setAgeRange(prev => ({ ...prev, max: parseInt(e.target.value) }))} className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Classement Min.</label>
                <select value={rankFilter} onChange={(e) => setRankFilter(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1.5 text-sm text-white">
                  <option value="">Tous</option>
                  <option value="NC">NC</option>
                  <option value="40">40</option>
                  <option value="30">30</option>
                  <option value="15">15</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* 2. Tally & Simulation */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <LinkIcon className="w-5 h-5 text-purple-400" />
              Campagne
            </div>

            {!tallyLink ? (
              <button onClick={handleGenerateTally} disabled={isGenerating} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all">
                {isGenerating ? 'Création...' : 'Créer Formulaire Tally'}
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <div className="bg-slate-950 border border-purple-500/30 rounded p-2.5 flex items-center justify-between gap-2">
                  <code className="text-purple-300 text-xs truncate flex-1">tally.so/r/w7X8kL</code>
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                </div>
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Prêt à envoyer</span>
                  </div>
                  <div className="text-xs text-emerald-400/70">{filteredPlayers.length} cibles potentielles</div>
                </div>

                <button onClick={handleSimulateResponses} disabled={isGenerating} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium border border-white/10 flex items-center justify-center gap-2">
                  {isGenerating ? <span className="animate-pulse">Simulation...</span> : <><Users className="w-4 h-4 text-blue-400" /> Simuler Réponses</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dashboard (70%) */}
      <div className="flex-1 flex flex-col bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-white/10">
          <button onClick={() => setActiveTab('candidates')} className={cn("flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2", activeTab === 'candidates' ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-slate-400 hover:text-white hover:bg-white/5")}>
            <Search className="w-4 h-4" /> Candidats ({filteredPlayers.length})
          </button>
          <button onClick={() => setActiveTab('responses')} className={cn("flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2", activeTab === 'responses' ? "border-purple-500 text-purple-400 bg-purple-500/5" : "border-transparent text-slate-400 hover:text-white hover:bg-white/5")}>
            <List className="w-4 h-4" /> Réponses ({players.length})
          </button>
          <button onClick={() => setActiveTab('analysis')} className={cn("flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2", activeTab === 'analysis' ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent text-slate-400 hover:text-white hover:bg-white/5")}>
            <BarChart3 className="w-4 h-4" /> Analyse
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {activeTab === 'candidates' && (
              <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPlayers.map(player => (
                  <div key={player.id} className="bg-slate-800/50 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                    <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full bg-slate-700" />
                    <div>
                      <div className="text-sm font-medium text-white">{player.name}</div>
                      <div className="text-xs text-slate-400">{player.age} ans • {player.rank}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'responses' && (
              <motion.div key="responses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {players.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 mt-20">
                    <Users className="w-12 h-12 opacity-20" />
                    <p>Aucune réponse pour le moment.</p>
                    <p className="text-sm">Lancez la simulation ou partagez le lien Tally.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {players.map(player => (
                      <div key={player.id} className="bg-slate-800/50 p-3 rounded-lg border border-purple-500/20 flex items-center gap-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8" />
                        <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full bg-slate-700 z-10" />
                        <div className="z-10">
                          <div className="text-sm font-medium text-white">{player.name}</div>
                          <div className="text-xs text-purple-300">Inscrit le {new Date(player.registrationDate || '').toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {!selectionPreview ? (
                   <div className="text-center py-12 text-slate-500">
                     <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                     <p>Lancez la simulation pour voir l'analyse.</p>
                     {players.length > 0 && (
                       <button onClick={handleRunSelectionPreview} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">
                         Lancer l'analyse maintenant
                       </button>
                     )}
                   </div>
                ) : (
                  <>
                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-emerald-400">{selectionPreview.selected.length}</div>
                            <div className="text-xs text-emerald-400/70 uppercase tracking-wider font-medium mt-1">Sélectionnés</div>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-amber-400">{selectionPreview.waitlist.length}</div>
                            <div className="text-xs text-amber-400/70 uppercase tracking-wider font-medium mt-1">Liste d'attente</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-red-400">{selectionPreview.rejected.length}</div>
                            <div className="text-xs text-red-400/70 uppercase tracking-wider font-medium mt-1">Refusés</div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className={cn(
                        "p-4 rounded-xl border flex items-center justify-between gap-4",
                        selectionPreview.selected.length >= 4 
                            ? "bg-emerald-500/10 border-emerald-500/20" 
                            : "bg-amber-500/10 border-amber-500/20"
                    )}>
                        <div className="flex items-center gap-3">
                            {selectionPreview.selected.length >= 4 ? (
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-amber-400" />
                            )}
                            <div>
                                <h4 className={cn("font-bold", selectionPreview.selected.length >= 4 ? "text-emerald-400" : "text-amber-400")}>
                                    {selectionPreview.selected.length >= 4 ? "Prêt à lancer" : "Participants insuffisants"}
                                </h4>
                                <p className="text-sm text-slate-400">
                                    {selectionPreview.selected.length} joueurs qualifiés sur 4 minimum requis.
                                </p>
                            </div>
                        </div>
                        
                        {selectionPreview.selected.length >= 4 && (
                            <button 
                                onClick={handleProceed}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Valider & Continuer
                            </button>
                        )}
                    </div>

                    {/* Lists */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-3">Top Sélection</h5>
                            <div className="space-y-2">
                                {selectionPreview.selected.slice(0, 8).map((p, idx) => (
                                    <div key={p.id} className="bg-slate-800/50 p-2.5 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">{idx+1}</span>
                                            <span className="text-white">{p.name}</span>
                                        </div>
                                        <span className="text-slate-500 text-xs">100 pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-3">Liste d'attente</h5>
                            <div className="space-y-2">
                                {selectionPreview.waitlist.slice(0, 5).map((p) => (
                                    <div key={p.id} className="bg-slate-800/50 p-2.5 rounded-lg flex justify-between items-center text-sm border border-white/5 opacity-75">
                                        <span className="text-slate-300">{p.name}</span>
                                        <span className="text-amber-400 text-xs bg-amber-500/10 px-1.5 py-0.5 rounded">Waitlist</span>
                                    </div>
                                ))}
                                {selectionPreview.waitlist.length === 0 && (
                                    <div className="text-sm text-slate-600 italic py-4 text-center border border-dashed border-white/5 rounded-lg">
                                        Personne en liste d'attente
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
