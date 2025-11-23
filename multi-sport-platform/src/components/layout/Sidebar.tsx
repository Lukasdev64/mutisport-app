import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Trophy, 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  Shield,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
  { icon: Users, label: 'Players', path: '/players' },
  { icon: Shield, label: 'Teams', path: '/teams' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={{ width: 240, opacity: 0, x: -20 }}
      animate={{ 
        width: collapsed ? 80 : 240,
        opacity: 1,
        x: 0
      }}
      transition={{ 
        width: { type: "spring", damping: 25, stiffness: 200 },
        opacity: { duration: 0.3 },
        x: { type: "spring", damping: 20, stiffness: 100 }
      }}
      className="h-screen sticky top-0 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-heading font-bold text-xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
            >
              MultiSport
            </motion.span>
          )}
        </AnimatePresence>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hover:bg-white/10"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* New Tournament Button */}
      <div className="p-4">
        <NavLink to="/tournaments/new">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className={cn(
                "w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/20",
                collapsed ? "px-0" : ""
              )}
              size={collapsed ? "icon" : "default"}
            >
              <AnimatePresence mode="wait">
                {collapsed ? (
                  <motion.div
                    key="icon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <PlusCircle size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    New Tournament
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </NavLink>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
          >
            {({ isActive }) => (
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg group relative border transition-all duration-300",
                  isActive 
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border-transparent"
                )}
                whileHover={{ x: 2 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    damping: 15
                  }}
                  whileHover={{ scale: 1.1 }}
                  className="shrink-0"
                >
                  <item.icon size={20} />
                </motion.div>
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-xs rounded-lg whitespace-nowrap z-50 border border-white/10 shadow-xl pointer-events-none"
                  >
                    {item.label}
                  </motion.div>
                )}

                {/* Active indicator */}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1 h-6 bg-blue-400 rounded-full"
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ x: collapsed ? 0 : 5 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.div 
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", damping: 15 }}
          />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-slate-200 truncate">User Name</p>
                <p className="text-xs text-slate-500 truncate">user@example.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.aside>
  );
}
