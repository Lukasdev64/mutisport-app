import { Button } from '@/components/ui/button';
import { Bell, Moon, Globe, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function SettingsPage() {
  const { toast } = useToast();

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your application preferences</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="glass-panel rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-blue-400" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Theme</p>
                <p className="text-sm text-slate-400">Customize the look and feel</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-blue-600/20 border-blue-500 text-blue-400">Dark</Button>
                <Button variant="ghost" className="text-slate-400" onClick={() => toast('Light mode coming soon!', 'info')}>Light</Button>
                <Button variant="ghost" className="text-slate-400" onClick={() => toast('System theme sync coming soon!', 'info')}>System</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-panel rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Notifications
          </h2>
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
        </section>

        {/* Danger Zone */}
        <section className="glass-panel rounded-xl p-6 border border-red-500/20 bg-red-500/5">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Danger Zone
          </h2>
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
        </section>
      </div>
    </div>
  );
}
