import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { SportSelector } from '@/components/sport/SportSelector';

export function SettingsPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Configure your tournament platform</p>
      </div>

      {/* Sport Selection */}
      <div className="glass-panel p-6 rounded-xl border border-white/10">
        <SportSelector />
      </div>

      {/* Appearance */}
      <div className="glass-panel p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-heading font-bold text-white mb-4">Appearance</h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start border-white/10 hover:bg-white/5"
            onClick={() => toast('Dark mode is default!', 'info')}
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark Mode (Active)
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start border-white/10 hover:bg-white/5 opacity-50"
            disabled
          >
            <Sun className="w-4 h-4 mr-2" />
            Light Mode (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-heading font-bold text-white mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-slate-300">Tournament Updates</span>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer" onClick={() => toast('Notification settings saved!', 'success')}>
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-300">Match Reminders</span>
            <div className="w-10 h-6 bg-slate-700 rounded-full relative cursor-pointer" onClick={() => toast('Notification settings saved!', 'success')}>
              <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 rounded-xl border border-red-500/20 bg-red-500/5">
        <h2 className="text-xl font-heading font-bold text-red-400 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Clear All Data</p>
            <p className="text-sm text-slate-400">Remove all local tournaments and players</p>
          </div>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700" onClick={() => {
            if(confirm('Are you sure? This will reset all local data.')) {
              toast('Data cleared! (Mock action)', 'error');
            }
          }}>
            Clear Data
          </Button>
        </div>
      </div>
    </div>
  );
}
