import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowLeft, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useRuleCategoriesQuery,
  useRulesByCategory,
  useSearchRules,
} from '@/hooks/useRules';
import {
  getRuleCategoryById,
  RULES_IMPLEMENTATION_STATUS,
  getRulesStatusLabel,
  hasRulesAvailable,
} from '@/types/rules';
import type { SportType } from '@/types/sport';
import { SPORTS } from '@/types/sport';
import { useSportStore } from '@/store/sportStore';
import { getRuleCategoriesForSport, getRulesSource } from '@/sports/core/rulesRegistry';
import {
  RuleCategoryCard,
  RuleSearchBar,
  RuleListItem,
  RuleBreadcrumb,
} from './components';

export function RulesLibraryPage() {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  // Get active sport from store
  const activeSport = useSportStore((s) => s.activeSport) as SportType;
  const sport = SPORTS[activeSport];
  const rulesStatus = RULES_IMPLEMENTATION_STATUS[activeSport];
  const rulesAvailable = hasRulesAvailable(activeSport);
  const rulesSource = getRulesSource(activeSport);

  // Fetch data
  const { data: categories, isLoading: categoriesLoading } = useRuleCategoriesQuery(activeSport);
  const { data: categoryRules, isLoading: rulesLoading } = useRulesByCategory(activeSport, categoryId || null);
  const { data: searchResults, isLoading: searchLoading } = useSearchRules(activeSport, searchQuery);

  // Get current category info
  const currentCategory = useMemo(() => {
    if (!categoryId) return null;
    const sportCategories = getRuleCategoriesForSport(activeSport);
    return getRuleCategoryById(categoryId, sportCategories);
  }, [categoryId, activeSport]);

  // Determine what to display
  const isSearching = searchQuery.length >= 2;
  const showCategories = !categoryId && !isSearching;
  const showCategoryRules = categoryId && !isSearching;
  const showSearchResults = isSearching;

  const isLoading = categoriesLoading || (showCategoryRules && rulesLoading) || (isSearching && searchLoading);

  // Get status label for badge
  const statusLabel = getRulesStatusLabel(rulesStatus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {categoryId && (
            <Link to="/rules">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-heading font-bold text-white">
                {currentCategory ? currentCategory.name : `Regles du ${sport.name}`}
              </h1>
              {statusLabel && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                  {statusLabel}
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-1">
              {currentCategory
                ? currentCategory.description
                : rulesSource
                  ? `Consultez le reglement officiel ${rulesSource.name} ${rulesSource.year || ''}`
                  : `Regles du ${sport.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* WIP Banner for sports without rules */}
      {!rulesAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center"
        >
          <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Regles {sport.name} - Bientot disponibles
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            La bibliotheque de regles pour le {sport.name} est en cours de developpement.
            {rulesSource && (
              <>
                {' '}Elle sera basee sur le reglement officiel{' '}
                <a
                  href={rulesSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {rulesSource.name}
                </a>.
              </>
            )}
          </p>
        </motion.div>
      )}

      {/* Only show content if rules are available */}
      {rulesAvailable && (
        <>
          {/* Breadcrumb */}
          {categoryId && (
            <RuleBreadcrumb
              items={currentCategory ? [{ label: currentCategory.name }] : []}
            />
          )}

          {/* Search */}
          <RuleSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            isLoading={searchLoading}
            placeholder={`Rechercher dans les regles du ${sport.name}...`}
          />

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}

          {/* Categories Grid */}
          <AnimatePresence mode="wait">
            {showCategories && !isLoading && (
              <motion.div
                key="categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {categories?.map((category, index) => (
                  <RuleCategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {/* Category Rules List */}
            {showCategoryRules && !isLoading && (
              <motion.div
                key="category-rules"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {categoryRules && categoryRules.length > 0 ? (
                  categoryRules.map((rule, index) => (
                    <RuleListItem key={rule.id} rule={rule} index={index} />
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune regle dans cette categorie</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Search Results */}
            {showSearchResults && !isLoading && (
              <motion.div
                key="search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-slate-400 mb-4">
                  {searchResults?.length || 0} resultat(s) pour "{searchQuery}"
                </p>
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <RuleListItem key={result.id} rule={result} index={index} />
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun resultat pour cette recherche</p>
                    <p className="text-sm mt-2">Essayez avec d'autres mots-cles</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Source attribution */}
          {!isLoading && rulesSource && (
            <div className="text-center text-xs text-slate-500 pt-8 border-t border-white/5">
              Source : {rulesSource.name} {rulesSource.year} •{' '}
              {rulesSource.url && (
                <a
                  href={rulesSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Reglement officiel
                </a>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
