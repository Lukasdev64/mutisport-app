import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tennis-favorite-presets';

/**
 * Hook for managing favorite tennis presets in localStorage
 */
export function useFavoritePresets() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load favorite presets:', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.warn('Failed to save favorite presets:', error);
    }
  }, [favorites]);

  // Toggle a preset as favorite
  const toggleFavorite = useCallback((presetId: string) => {
    setFavorites(prev => {
      if (prev.includes(presetId)) {
        return prev.filter(id => id !== presetId);
      } else {
        return [...prev, presetId];
      }
    });
  }, []);

  // Check if a preset is favorited
  const isFavorite = useCallback((presetId: string) => {
    return favorites.includes(presetId);
  }, [favorites]);

  // Add to favorites
  const addFavorite = useCallback((presetId: string) => {
    setFavorites(prev => {
      if (prev.includes(presetId)) return prev;
      return [...prev, presetId];
    });
  }, []);

  // Remove from favorites
  const removeFavorite = useCallback((presetId: string) => {
    setFavorites(prev => prev.filter(id => id !== presetId));
  }, []);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    hasFavorites: favorites.length > 0
  };
}
