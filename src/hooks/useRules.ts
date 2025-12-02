import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SportRule, RuleSearchResult, RuleCategory } from '@/types/rules';
import type { SportType } from '@/types/sport';
import {
  getRuleCategoriesForSport,
  getFallbackRulesForSport,
  getFallbackRulesByCategory,
  getFallbackRuleBySlug,
} from '@/sports/core/rulesRegistry';

// ============================================
// DATA MAPPING HELPERS
// ============================================

/**
 * Map database row (snake_case) to SportRule (camelCase)
 */
function mapRuleFromDb(row: Record<string, unknown>): SportRule {
  return {
    id: row.id as string,
    sport: row.sport as SportRule['sport'],
    categoryId: row.category_id as string,
    categoryName: row.category_name as string,
    categoryOrder: row.category_order as number,
    title: row.title as string,
    slug: row.slug as string,
    content: row.content as string,
    summary: row.summary as string | undefined,
    tags: (row.tags as string[]) || [],
    keywords: row.keywords as string | undefined,
    source: row.source as string | undefined,
    sourceUrl: row.source_url as string | undefined,
    difficulty: row.difficulty as SportRule['difficulty'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all rules for a sport
 */
export function useRules(sport: SportType = 'tennis') {
  return useQuery({
    queryKey: ['rules', sport],
    queryFn: async (): Promise<SportRule[]> => {
      const fallbackRules = getFallbackRulesForSport(sport);

      // Fallback to local data if Supabase not configured
      if (!isSupabaseConfigured()) {
        return fallbackRules;
      }

      const { data, error } = await supabase
        .from('sport_rules')
        .select('*')
        .eq('sport', sport)
        .order('category_order')
        .order('title');

      if (error) {
        console.error('Error fetching rules:', error);
        // Fallback to local data on error
        return fallbackRules;
      }

      return (data || []).map(mapRuleFromDb);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache - rules don't change often
  });
}

/**
 * Fetch rules for a specific category
 */
export function useRulesByCategory(sport: SportType, categoryId: string | null) {
  return useQuery({
    queryKey: ['rules', sport, 'category', categoryId],
    queryFn: async (): Promise<SportRule[]> => {
      if (!categoryId) return [];

      const fallbackRules = getFallbackRulesByCategory(sport, categoryId);

      // Fallback to local data if Supabase not configured
      if (!isSupabaseConfigured()) {
        return fallbackRules;
      }

      const { data, error } = await supabase
        .from('sport_rules')
        .select('*')
        .eq('sport', sport)
        .eq('category_id', categoryId)
        .order('title');

      if (error) {
        console.error('Error fetching rules by category:', error);
        return fallbackRules;
      }

      return (data || []).map(mapRuleFromDb);
    },
    enabled: !!categoryId,
  });
}

/**
 * Fetch a single rule by slug
 */
export function useRule(sport: SportType, slug: string) {
  return useQuery({
    queryKey: ['rules', sport, 'detail', slug],
    queryFn: async (): Promise<SportRule | null> => {
      const fallbackRule = getFallbackRuleBySlug(sport, slug);

      // Fallback to local data if Supabase not configured
      if (!isSupabaseConfigured()) {
        return fallbackRule || null;
      }

      const { data, error } = await supabase
        .from('sport_rules')
        .select('*')
        .eq('sport', sport)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching rule:', error);
        return fallbackRule || null;
      }

      return mapRuleFromDb(data);
    },
    enabled: !!slug,
  });
}

/**
 * Search rules with full-text search
 */
export function useSearchRules(
  sport: SportType,
  query: string,
  categoryId?: string | null
) {
  return useQuery({
    queryKey: ['rules', 'search', sport, query, categoryId],
    queryFn: async (): Promise<RuleSearchResult[]> => {
      if (!query.trim() || query.length < 2) return [];

      const fallbackRules = getFallbackRulesForSport(sport);

      // Local search function
      const localSearch = (): RuleSearchResult[] => {
        const lowerQuery = query.toLowerCase();
        return fallbackRules
          .filter(r =>
            (!categoryId || r.categoryId === categoryId) &&
            (r.title.toLowerCase().includes(lowerQuery) ||
              r.content.toLowerCase().includes(lowerQuery) ||
              r.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
          )
          .map(r => ({
            id: r.id,
            sport: r.sport,
            categoryId: r.categoryId,
            categoryName: r.categoryName,
            title: r.title,
            slug: r.slug,
            summary: r.summary,
            tags: r.tags,
            rank: 1,
          }));
      };

      // Fallback to simple local search if Supabase not configured
      if (!isSupabaseConfigured()) {
        return localSearch();
      }

      // Cast to any because search_sport_rules is a custom function not in generated types
      const { data, error } = await (supabase.rpc as CallableFunction)('search_sport_rules', {
        p_sport: sport,
        p_query: query,
        p_category_id: categoryId || null,
        p_limit: 20,
      });

      if (error) {
        console.error('Error searching rules:', error);
        return localSearch();
      }

      return data || [];
    },
    enabled: query.length >= 2,
  });
}

/**
 * Get categories with rule counts
 */
export function useRuleCategories(sport: SportType = 'tennis'): RuleCategory[] {
  const { data: rules } = useRules(sport);
  const categories = getRuleCategoriesForSport(sport);

  return categories.map(cat => ({
    ...cat,
    ruleCount: rules?.filter(r => r.categoryId === cat.id).length || 0,
  }));
}

/**
 * Hook to get categories as a query (for loading states)
 */
export function useRuleCategoriesQuery(sport: SportType = 'tennis') {
  const { data: rules, isLoading, error } = useRules(sport);
  const categories = getRuleCategoriesForSport(sport);

  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    ruleCount: rules?.filter(r => r.categoryId === cat.id).length || 0,
  }));

  return {
    data: categoriesWithCounts,
    isLoading,
    error,
  };
}
