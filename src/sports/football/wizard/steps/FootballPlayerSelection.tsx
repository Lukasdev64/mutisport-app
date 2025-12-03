import { useState } from 'react';
import { Plus, X, Users, UserPlus, Trash2, Shirt, LayoutTemplate, Wand2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/Card';
import { useFootballWizardStore } from '../store';
import { cn } from '@/lib/utils';

type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

const POSITIONS: { value: Position; label: string; color: string }[] = [
  { value: 'GK', label: 'GK', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'DEF', label: 'DEF', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'MID', label: 'MID', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'FWD', label: 'FWD', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const FORMATIONS = [
  '4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1'
];

// FFF-style numbering conventions
const getNextAvailableNumber = (existingPlayers: any[], position: Position): number => {
  const takenNumbers = new Set(existingPlayers.map(p => p.number).filter(Boolean));
  
  let preferred: number[] = [];
  switch (position) {
    case 'GK': preferred = [1, 16, 30, 40, 50]; break;
    case 'DEF': preferred = [2, 3, 4, 5, 12, 13, 14, 15, 23, 24, 25]; break;
    case 'MID': preferred = [6, 7, 8, 10, 17, 18, 19, 26, 27, 28]; break;
    case 'FWD': preferred = [9, 11, 20, 21, 22, 29, 31, 32, 33]; break;
  }

  // Try preferred numbers first
  for (const num of preferred) {
    if (!takenNumbers.has(num)) return num;
  }

  // Fallback to first available number from 1 to 99
  for (let i = 1; i <= 99; i++) {
    if (!takenNumbers.has(i)) return i;
  }
  
  return 0;
};

export function FootballPlayerSelection() {
  const { teams, addTeam, removeTeam, addPlayerToTeam, removePlayerFromTeam, updateTeamFormation, setTeams } = useFootballWizardStore();
  const [newTeamName, setNewTeamName] = useState('');
  
  // State for new player inputs per team
  const [playerInputs, setPlayerInputs] = useState<Record<string, {
    name: string;
    number: string;
    position: Position;
  }>>({});

  const getTeamInput = (teamId: string) => playerInputs[teamId] || { name: '', number: '', position: 'MID' };

  const updateTeamInput = (teamId: string, field: string, value: any) => {
    setPlayerInputs(prev => {
      const currentInput = prev[teamId] || { name: '', number: '', position: 'MID' };
      const newInput = { ...currentInput, [field]: value };
      
      // Auto-suggest number when position changes if number is empty
      if (field === 'position') {
        const team = teams.find(t => t.id === teamId);
        if (team && !currentInput.number) {
           const nextNum = getNextAvailableNumber(team.players, value as Position);
           newInput.number = nextNum.toString();
        }
      }
      
      return { ...prev, [teamId]: newInput };
    });
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    addTeam(newTeamName.trim());
    setNewTeamName('');
  };

  const handleAddPlayer = (teamId: string) => {
    const input = getTeamInput(teamId);
    if (!input.name.trim()) return;
    
    const team = teams.find(t => t.id === teamId);
    let number = input.number ? parseInt(input.number) : undefined;
    
    // Auto-assign number if not provided
    if (!number && team) {
      number = getNextAvailableNumber(team.players, input.position);
    }
    
    addPlayerToTeam(teamId, {
      name: input.name.trim(),
      number,
      position: input.position
    });

    // Reset input
    setPlayerInputs(prev => ({
      ...prev,
      [teamId]: { name: '', number: '', position: 'MID' }
    }));
  };

  const handleTeamKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTeam();
  };

  const handlePlayerKeyDown = (e: React.KeyboardEvent, teamId: string) => {
    if (e.key === 'Enter') handleAddPlayer(teamId);
  };

  const generateDevData = () => {
    const devTeams = [
      { name: 'Real Madrid', formation: '4-3-3' },
      { name: 'FC Barcelona', formation: '4-3-3' },
      { name: 'Manchester City', formation: '4-2-3-1' },
      { name: 'Bayern Munich', formation: '4-2-3-1' },
      { name: 'Liverpool', formation: '4-3-3' },
      { name: 'PSG', formation: '4-3-3' },
      { name: 'Juventus', formation: '3-5-2' },
      { name: 'Inter Milan', formation: '3-5-2' },
      { name: 'Arsenal', formation: '4-3-3' },
      { name: 'Chelsea', formation: '4-2-3-1' },
      { name: 'Man United', formation: '4-2-3-1' },
      { name: 'Atletico Madrid', formation: '4-4-2' },
      { name: 'Dortmund', formation: '4-2-3-1' },
      { name: 'AC Milan', formation: '4-2-3-1' },
      { name: 'Napoli', formation: '4-3-3' },
      { name: 'Tottenham', formation: '4-2-3-1' }
    ];

    const positions: Position[] = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];
    
    const newTeams = devTeams.map(t => {
      const teamPlayers: any[] = [];
      
      positions.forEach((pos) => {
         const number = getNextAvailableNumber(teamPlayers, pos);
         teamPlayers.push({
            id: uuidv4(),
            name: `${t.name} ${number}`,
            position: pos,
            number
         });
      });

      return {
        id: uuidv4(),
        name: t.name,
        formation: t.formation,
        players: teamPlayers
      };
    });

    setTeams(newTeams);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Gérer les Équipes & Effectifs</h2>
        <p className="text-white/60">Créez des équipes, attribuez des numéros et définissez les formations</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add Team Input */}
        <div className="flex gap-2 max-w-md mx-auto">
          <Input
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={handleTeamKeyDown}
            placeholder="Nom de la nouvelle équipe..."
            className="bg-white/5 border-white/10 text-white"
          />
          <Button onClick={handleAddTeam} disabled={!newTeamName.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Équipe
          </Button>
        </div>

        {/* Dev Tools */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateDevData}
            className="text-xs border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40"
          >
            <Wand2 className="w-3 h-3 mr-2" />
            Générer Équipes (Dev)
          </Button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-12 text-white/40 border border-dashed border-white/10 rounded-lg">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune équipe ajoutée</p>
              <p className="text-sm">Créez une équipe pour commencer à ajouter des joueurs</p>
            </div>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="bg-white/5 border-white/10 overflow-hidden flex flex-col">
                {/* Team Header */}
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{team.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>{team.players.length} joueurs</span>
                        <span>•</span>
                        <select 
                          value={team.formation || '4-4-2'}
                          onChange={(e) => updateTeamFormation(team.id, e.target.value)}
                          className="bg-transparent border-none p-0 text-xs text-emerald-400 focus:ring-0 cursor-pointer"
                        >
                          {FORMATIONS.map(f => <option key={f} value={f} className="bg-gray-900">{f}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeam(team.id)}
                    className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Pitch Visualization (Mini) */}
                <div className="relative h-48 bg-emerald-900/30 border-b border-white/5 overflow-hidden">
                  {/* Pitch Markings */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 border-b border-white/5"></div>
                    <div className="flex-1"></div>
                  </div>
                  <div className="absolute inset-x-0 top-0 h-8 border-b border-white/5 mx-12"></div>
                  <div className="absolute inset-x-0 bottom-0 h-8 border-t border-white/5 mx-12"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-white/5"></div>
                  </div>

                  {/* Players on Pitch */}
                  <div className="absolute inset-0 p-4">
                    {/* GK */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                      {team.players.filter(p => p.position === 'GK').map(p => (
                        <PlayerDot key={p.id} player={p} />
                      ))}
                    </div>
                    
                    {/* DEF */}
                    <div className="absolute bottom-12 inset-x-4 flex justify-around">
                      {team.players.filter(p => p.position === 'DEF').map(p => (
                        <PlayerDot key={p.id} player={p} />
                      ))}
                    </div>

                    {/* MID */}
                    <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex justify-around">
                      {team.players.filter(p => p.position === 'MID').map(p => (
                        <PlayerDot key={p.id} player={p} />
                      ))}
                    </div>

                    {/* FWD */}
                    <div className="absolute top-8 inset-x-4 flex justify-around">
                      {team.players.filter(p => p.position === 'FWD').map(p => (
                        <PlayerDot key={p.id} player={p} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Players List & Add Player */}
                <div className="p-4 space-y-3 flex-1 bg-black/20">
                  {/* Add Player Input Row */}
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="#"
                      className="w-12 h-8 text-sm bg-white/5 border-white/10 text-center px-1"
                      value={getTeamInput(team.id).number}
                      onChange={(e) => updateTeamInput(team.id, 'number', e.target.value)}
                      onKeyDown={(e) => handlePlayerKeyDown(e, team.id)}
                    />
                    <Input
                      value={getTeamInput(team.id).name}
                      onChange={(e) => updateTeamInput(team.id, 'name', e.target.value)}
                      onKeyDown={(e) => handlePlayerKeyDown(e, team.id)}
                      placeholder="Nom du Joueur"
                      className="h-8 text-sm bg-white/5 border-white/10 flex-1"
                    />
                    <select
                      value={getTeamInput(team.id).position}
                      onChange={(e) => updateTeamInput(team.id, 'position', e.target.value)}
                      className="h-8 text-xs bg-white/5 border border-white/10 rounded px-2 text-white focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {POSITIONS.map(p => (
                        <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
                      ))}
                    </select>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddPlayer(team.id)}
                      disabled={!getTeamInput(team.id).name.trim()}
                      className="h-8 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Roster List */}
                  <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {team.players.length === 0 && (
                      <p className="text-center text-xs text-white/30 py-2">Aucun joueur ajouté</p>
                    )}
                    {team.players.map((player) => (
                      <div 
                        key={player.id}
                        className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
                      >
                        <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-mono font-bold text-white/70">
                          {player.number || '-'}
                        </div>
                        <span className="flex-1 text-sm text-white/90 truncate">{player.name}</span>
                        
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border",
                          POSITIONS.find(p => p.value === player.position)?.color
                        )}>
                          {player.position}
                        </span>

                        <button
                          onClick={() => removePlayerFromTeam(team.id, player.id)}
                          className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerDot({ player }: { player: any }) {
  return (
    <div className="group relative flex flex-col items-center">
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform hover:scale-110 cursor-help",
        player.position === 'GK' ? "bg-yellow-500 border-yellow-300 text-black" :
        player.position === 'DEF' ? "bg-blue-600 border-blue-400 text-white" :
        player.position === 'MID' ? "bg-emerald-600 border-emerald-400 text-white" :
        "bg-red-600 border-red-400 text-white"
      )}>
        {player.number || '?'}
      </div>
      <div className="absolute -bottom-4 whitespace-nowrap text-[9px] font-medium text-white/90 bg-black/50 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {player.name}
      </div>
    </div>
  );
}
