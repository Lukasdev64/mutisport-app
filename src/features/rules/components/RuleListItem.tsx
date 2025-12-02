import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Tag } from 'lucide-react';
import type { SportRule, RuleSearchResult } from '@/types/rules';
import { getDifficultyLabel, getDifficultyColor } from '@/types/rules';
import { cn } from '@/lib/utils';

interface RuleListItemProps {
  rule: SportRule | RuleSearchResult;
  index?: number;
}

// Type guard to check if rule has difficulty property
function hasFullDetails(rule: SportRule | RuleSearchResult): rule is SportRule {
  return 'difficulty' in rule && 'content' in rule;
}

const difficultyBgColors: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-red-500/20 text-red-400',
};

export function RuleListItem({ rule, index = 0 }: RuleListItemProps) {
  const difficultyColor = hasFullDetails(rule)
    ? getDifficultyColor(rule.difficulty)
    : 'emerald';
  const difficultyBg = difficultyBgColors[difficultyColor] || difficultyBgColors.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/rules/detail/${rule.slug}`}
        className={cn(
          'block p-4 rounded-lg',
          'bg-slate-800/30 border border-white/5',
          'hover:bg-slate-800/50 hover:border-white/10',
          'transition-all duration-200',
          'group'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">
              {rule.title}
            </h4>
            {rule.summary && (
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                {rule.summary}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {hasFullDetails(rule) && (
                <span className={cn('text-xs px-2 py-0.5 rounded-full', difficultyBg)}>
                  {getDifficultyLabel(rule.difficulty)}
                </span>
              )}
              {rule.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-slate-500"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}
