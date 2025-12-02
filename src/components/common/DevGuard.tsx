import { useState, useEffect, type ReactNode } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DevGuardProps {
  children: ReactNode;
}

export function DevGuard({ children }: DevGuardProps) {
  const sitePassword = import.meta.env.VITE_SITE_PASSWORD;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // If no password is set in env, allow access
    if (!sitePassword) {
      setIsAuthenticated(true);
      return;
    }

    // Check local storage
    const storedAuth = localStorage.getItem('dev_auth');
    if (storedAuth === sitePassword) {
      setIsAuthenticated(true);
    }
  }, [sitePassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === sitePassword) {
      localStorage.setItem('dev_auth', password);
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Accès Restreint</h1>
          <p className="text-slate-400">
            Ce site est en cours de développement. Veuillez entrer le mot de passe pour continuer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`bg-slate-950/50 border-slate-800 text-center text-lg tracking-widest ${
                error ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-400 text-center">
                Mot de passe incorrect
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            Accéder au site
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
