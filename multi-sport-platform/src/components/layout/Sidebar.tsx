import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Trophy, 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
  { icon: Users, label: 'Players', path: '/players' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 80 : 240 }}
      className="h-screen sticky top-0 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex flex-col z-50"
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-heading font-bold text-xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
          >
            MultiSport
          </motion.span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="p-4">
        <NavLink to="/tournaments/new">
          <Button 
            className={cn("w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0", collapsed ? "px-0" : "")}
            size={collapsed ? "icon" : "default"}
          >
            {collapsed ? <PlusCircle size={20} /> : (
              <>
                <PlusCircle size={18} className="mr-2" />
                New Tournament
              </>
            )}
          </Button>
        </NavLink>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            )}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && (
              <span className="font-medium">{item.label}</span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">User Name</p>
              <p className="text-xs text-slate-500 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
