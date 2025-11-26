import { useState } from 'react';
import { Upload, Users, CheckCircle, XCircle, Clock, Play, Mail, Calendar, Activity } from 'lucide-react';
// import { motion } from 'framer-motion'; // Not used
import { SelectionAlgorithm, type RegistrationData, type SelectionResult } from '../../logic/selectionAlgorithm';
import { SchedulingEngine, type ScheduledMatch, type Resource } from '../../logic/schedulingEngine';
import { NotificationService } from '@/services/notificationService';
import { ScheduleView } from '../scheduling/ScheduleView';
import { AvailabilityHeatmap } from '../availability/AvailabilityHeatmap';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

/** Dashboard tab identifiers */
type DashboardTab = 'registration' | 'availability' | 'planning';

// Mock Data Generator
const generateMockRegistrations = (count: number): RegistrationData[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `p-${i}`,
    name: `Joueur ${i + 1}`,
    email: `joueur${i + 1}@example.com`,
    registrationDate: new Date(Date.now() - Math.random() * 100000000),
    constraints: {
      unavailableDates: Math.random() > 0.8 ? ['2024-06-15'] : [],
      maxMatchesPerDay: Math.random() > 0.9 ? 1 : 3
    }
  }));
};

const MOCK_RESOURCES: Resource[] = [
  { id: 'c1', name: 'Court Central', type: 'court' },
  { id: 'c2', name: 'Court Annexe', type: 'court' },
  { id: 't1', name: 'Table 1', type: 'table' },
];

export function RegistrationDashboard() {
  const [activeTab, setActiveTab] = useState<'registration' | 'planning' | 'availability'>('registration');
  const [candidates, setCandidates] = useState<RegistrationData[]>([]);
  const [selectionResult, setSelectionResult] = useState<SelectionResult | null>(null);
  const [schedule, setSchedule] = useState<ScheduledMatch[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  const handleSimulateImport = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setCandidates(generateMockRegistrations(20));
      setIsSimulating(false);
      setSelectionResult(null);
      setSchedule([]);
    }, 1000);
  };

  const handleRunSelection = () => {
    if (candidates.length === 0) return;
    const result = SelectionAlgorithm.selectParticipants(candidates, 8, new Date());
    setSelectionResult(result);
  };

  const handleGenerateSchedule = () => {
    if (!selectionResult) return;
    
    // Create mock matches from selected players
    const matches = [];
    const selected = selectionResult.selected;
    for (let i = 0; i < selected.length; i += 2) {
      if (selected[i + 1]) {
        matches.push({
          id: `m-${i}`,
          players: [
            { id: selected[i].id, name: selected[i].name },
            { id: selected[i + 1].id, name: selected[i + 1].name }
          ],
          status: 'pending' as const
        });
      }
    }

    const generatedSchedule = SchedulingEngine.generateSchedule(
      matches,
      MOCK_RESOURCES,
      new Map(),
      new Date()
    );
    setSchedule(generatedSchedule);
    setActiveTab('planning');
  };

  const handleSendNotifications = () => {
    if (!selectionResult) return;
    selectionResult.selected.forEach(p => NotificationService.sendAcceptanceEmail(p, "Tournoi d'Été"));
    selectionResult.waitlist.forEach((p, i) => NotificationService.sendWaitlistEmail(p, "Tournoi d'Été", i + 1));
    selectionResult.rejected.forEach(p => NotificationService.sendRejectionEmail(p.data, "Tournoi d'Été", p.reason));
    toast(`${candidates.length} emails envoyés (Simulation) !`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion du Tournoi</h2>
          <p className="text-slate-400">Pipeline complet : Inscription → Sélection → Planning</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10">
          {[
            { id: 'registration', label: 'Inscriptions', icon: Users },
            { id: 'availability', label: 'Disponibilités', icon: Activity },
            { id: 'planning', label: 'Planning', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Areas */}
      <div className="min-h-[500px]">
        {activeTab === 'registration' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Actions Bar */}
            <div className="flex gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <button
                onClick={handleSimulateImport}
                disabled={isSimulating}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {isSimulating ? 'Importation...' : '1. Importer Tally'}
              </button>
              
              {candidates.length > 0 && (
                <button
                  onClick={handleRunSelection}
                  disabled={!!selectionResult}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  2. Lancer Sélection
                </button>
              )}

              {selectionResult && (
                <>
                  <button
                    onClick={handleGenerateSchedule}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    3. Générer Planning
                  </button>
                  <button
                    onClick={handleSendNotifications}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    4. Notifier Joueurs
                  </button>
                </>
              )}
            </div>

            {/* Results Grid */}
            {selectionResult ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Selected */}
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <h3 className="text-emerald-400 font-semibold flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      Sélectionnés ({selectionResult.selected.length})
                    </h3>
                    <div className="space-y-2">
                      {selectionResult.selected.map(p => (
                        <div key={p.id} className="bg-slate-900/50 p-3 rounded-lg border border-emerald-500/10">
                          <div className="text-white font-medium">{p.name}</div>
                          <div className="text-xs text-emerald-400/70">Score élevé</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Waitlist */}
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                    <h3 className="text-amber-400 font-semibold flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5" />
                      Liste d'attente ({selectionResult.waitlist.length})
                    </h3>
                    <div className="space-y-2">
                      {selectionResult.waitlist.map((p, i) => (
                        <div key={p.id} className="bg-slate-900/50 p-3 rounded-lg border border-amber-500/10">
                          <div className="flex justify-between">
                            <div className="text-white font-medium">{p.name}</div>
                            <div className="text-xs font-bold text-amber-400">#{i + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rejected */}
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <h3 className="text-red-400 font-semibold flex items-center gap-2 mb-4">
                      <XCircle className="w-5 h-5" />
                      Non Retenus ({selectionResult.rejected.length})
                    </h3>
                    <div className="space-y-2">
                      {selectionResult.rejected.map(p => (
                        <div key={p.data.id} className="bg-slate-900/50 p-3 rounded-lg border border-red-500/10">
                          <div className="text-white font-medium">{p.data.name}</div>
                          <div className="text-xs text-red-400/70">{p.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              candidates.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Candidats Importés ({candidates.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates.map(c => (
                      <div key={c.id} className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                        <div className="font-medium text-white">{c.name}</div>
                        <div className="text-xs text-slate-400">Inscrit le {c.registrationDate.toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {schedule.length > 0 ? (
              <ScheduleView 
                matches={schedule} 
                resources={MOCK_RESOURCES} 
                startDate={new Date()} 
              />
            ) : (
              <div className="text-center py-20 text-slate-500 border border-dashed border-white/10 rounded-xl">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucun planning généré</p>
                <p className="text-sm">Veuillez d'abord lancer la sélection et générer le planning dans l'onglet "Inscriptions"</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {candidates.length > 0 ? (
              <AvailabilityHeatmap 
                players={selectionResult ? selectionResult.selected : candidates} 
                startDate={new Date()} 
              />
            ) : (
              <div className="text-center py-20 text-slate-500 border border-dashed border-white/10 rounded-xl">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucune donnée de disponibilité</p>
                <p className="text-sm">Importez des candidats pour visualiser leurs disponibilités</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
