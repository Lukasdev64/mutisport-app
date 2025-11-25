import type { RegistrationData } from '../../logic/selectionAlgorithm';
import { cn } from '@/lib/utils';

interface AvailabilityHeatmapProps {
  players: RegistrationData[];
  startDate: Date;
  days?: number;
}

export function AvailabilityHeatmap({ players, startDate, days = 3 }: AvailabilityHeatmapProps) {
  // Generate time slots (e.g., 9am to 6pm)
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 9); // 9, 10, ..., 17
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isAvailable = (player: RegistrationData, date: Date, _hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    // Check full day unavailability
    if (player.constraints.unavailableDates.includes(dateStr)) return false;
    
    // Mock: Random hourly unavailability if not fully unavailable
    // In real app, check specific time ranges
    return true; 
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] space-y-6">
        {dates.map((date, dateIndex) => (
          <div key={dateIndex} className="space-y-2">
            <h4 className="text-white font-medium sticky left-0 bg-slate-950 py-2">
              {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>
            
            <div className="grid grid-cols-[200px_1fr] gap-4">
              {/* Header Row */}
              <div className="text-xs text-slate-500 uppercase tracking-wider self-end pb-2">Joueurs</div>
              <div className="grid grid-cols-9 gap-1">
                {timeSlots.map(hour => (
                  <div key={hour} className="text-center text-xs text-slate-500 pb-2">
                    {hour}h
                  </div>
                ))}
              </div>

              {/* Player Rows */}
              {players.map(player => (
                <div key={player.id} className="contents group">
                  <div className="text-sm text-slate-300 py-1 truncate pr-4 group-hover:text-white transition-colors">
                    {player.name}
                  </div>
                  <div className="grid grid-cols-9 gap-1">
                    {timeSlots.map(hour => {
                      const available = isAvailable(player, date, hour);
                      return (
                        <div
                          key={hour}
                          className={cn(
                            "h-8 rounded-md transition-all duration-200",
                            available 
                              ? "bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/10" 
                              : "bg-red-500/10 border border-red-500/10 opacity-50 pattern-diagonal-lines"
                          )}
                          title={`${player.name}: ${available ? 'Disponible' : 'Indisponible'} à ${hour}h`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
