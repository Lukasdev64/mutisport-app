import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Square,
  Zap,
  AlertTriangle,
  Calculator,
  Swords,
  Repeat,
  Users,
  Shield,
  Clock,
} from 'lucide-react';
import type { RuleCategory } from '@/types/rules';
import { cn } from '@/lib/utils';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Square,
  Zap,
  AlertTriangle,
  Calculator,
  Swords,
  Repeat,
  Users,
  Shield,
  Clock,
};

// Color mapping for gradients
const colorGradients: Record<string, string> = {
  emerald: 'from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20',
  blue: 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20',
  red: 'from-red-500/20 to-red-600/10 hover:from-red-500/30 hover:to-red-600/20',
  purple: 'from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 hover:to-purple-600/20',
  orange: 'from-orange-500/20 to-orange-600/10 hover:from-orange-500/30 hover:to-orange-600/20',
  slate: 'from-slate-500/20 to-slate-600/10 hover:from-slate-500/30 hover:to-slate-600/20',
  cyan: 'from-cyan-500/20 to-cyan-600/10 hover:from-cyan-500/30 hover:to-cyan-600/20',
  amber: 'from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20',
  teal: 'from-teal-500/20 to-teal-600/10 hover:from-teal-500/30 hover:to-teal-600/20',
};

const iconColors: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  slate: 'text-slate-400',
  cyan: 'text-cyan-400',
  amber: 'text-amber-400',
  teal: 'text-teal-400',
};

interface RuleCategoryCardProps {
  category: RuleCategory;
  index?: number;
}

export function RuleCategoryCard({ category, index = 0 }: RuleCategoryCardProps) {
  const Icon = iconMap[category.icon] || Square;
  const gradient = colorGradients[category.color] || colorGradients.slate;
  const iconColor = iconColors[category.color] || iconColors.slate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/rules/${category.id}`}
        className={cn(
          'block p-6 rounded-xl border border-white/10',
          'bg-gradient-to-br backdrop-blur-sm',
          'transition-all duration-300',
          'hover:border-white/20 hover:scale-[1.02]',
          gradient
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg bg-white/10', iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-slate-400 mb-2">
                {category.description}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {category.ruleCount || 0} regles
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
