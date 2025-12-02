import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Tag,
  ExternalLink,
  Loader2,
  BookOpen,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRule } from '@/hooks/useRules';
import { getDifficultyLabel, getDifficultyColor, getRuleCategoryById, TENNIS_RULE_CATEGORIES } from '@/types/rules';
import { RuleBreadcrumb, RuleContent } from './components';
import { cn } from '@/lib/utils';

const difficultyBgColors: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function RuleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: rule, isLoading, error } = useRule('tennis', slug || '');

  // Get category info
  const category = rule ? getRuleCategoryById(rule.categoryId, TENNIS_RULE_CATEGORIES) : null;
  const difficultyColor = rule ? getDifficultyColor(rule.difficulty) : 'emerald';
  const difficultyBg = difficultyBgColors[difficultyColor] || difficultyBgColors.emerald;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="text-center py-24">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-500 opacity-50" />
        <h2 className="text-xl font-semibold text-white mb-2">Regle introuvable</h2>
        <p className="text-slate-400 mb-6">
          Cette regle n'existe pas ou a ete supprimee.
        </p>
        <Link to="/rules">
          <Button className="bg-blue-600 hover:bg-blue-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux regles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="text-slate-400 hover:text-white -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      {/* Breadcrumb */}
      <RuleBreadcrumb
        items={[
          ...(category ? [{ label: category.name, href: `/rules/${category.id}` }] : []),
          { label: rule.title },
        ]}
      />

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-heading font-bold text-white">
          {rule.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty badge */}
          <span className={cn('text-sm px-3 py-1 rounded-full border', difficultyBg)}>
            {getDifficultyLabel(rule.difficulty)}
          </span>

          {/* Category */}
          {category && (
            <Link
              to={`/rules/${category.id}`}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {category.name}
            </Link>
          )}

          {/* Last updated */}
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {new Date(rule.updatedAt).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Tags */}
        {rule.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rule.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/5"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 rounded-xl bg-slate-800/30 border border-white/10">
        <RuleContent content={rule.content} />
      </div>

      {/* Source */}
      {rule.source && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/20 border border-white/5">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-400">Source</p>
              <p className="text-white">{rule.source}</p>
            </div>
          </div>
          {rule.sourceUrl && (
            <a
              href={rule.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Voir l'original
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* Navigation footer */}
      <div className="flex justify-between items-center pt-6 border-t border-white/5">
        <Link to="/rules">
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Toutes les regles
          </Button>
        </Link>

        {category && (
          <Link to={`/rules/${category.id}`}>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              Plus dans "{category.name}"
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
