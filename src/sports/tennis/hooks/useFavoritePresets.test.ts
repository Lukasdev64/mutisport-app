import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavoritePresets } from './useFavoritePresets';

const STORAGE_KEY = 'tennis-favorite-presets';

describe('useFavoritePresets', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('initial state', () => {
    it('should start with empty favorites', () => {
      const { result } = renderHook(() => useFavoritePresets());

      expect(result.current.favorites).toEqual([]);
      expect(result.current.hasFavorites).toBe(false);
    });

    it('should load favorites from localStorage on mount', async () => {
      // Pre-populate localStorage before mounting the hook
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['preset-1', 'preset-2']));

      const { result } = renderHook(() => useFavoritePresets());

      // Wait for useEffect to load from localStorage
      await waitFor(() => {
        expect(result.current.favorites).toEqual(['preset-1', 'preset-2']);
      });

      expect(result.current.hasFavorites).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should add a preset to favorites', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.toggleFavorite('preset-1');
      });

      expect(result.current.favorites).toContain('preset-1');
      expect(result.current.hasFavorites).toBe(true);
    });

    it('should remove a preset from favorites when toggled again', () => {
      const { result } = renderHook(() => useFavoritePresets());

      // Add first
      act(() => {
        result.current.toggleFavorite('preset-1');
      });

      expect(result.current.favorites).toContain('preset-1');

      // Toggle again to remove
      act(() => {
        result.current.toggleFavorite('preset-1');
      });

      expect(result.current.favorites).not.toContain('preset-1');
      expect(result.current.hasFavorites).toBe(false);
    });

    it('should persist to localStorage', async () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.toggleFavorite('preset-1');
      });

      // Wait for useEffect to save to localStorage
      await waitFor(() => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        expect(saved).toContain('preset-1');
      });
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited preset', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
        result.current.addFavorite('preset-2');
      });

      expect(result.current.isFavorite('preset-1')).toBe(true);
      expect(result.current.isFavorite('preset-2')).toBe(true);
    });

    it('should return false for non-favorited preset', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
      });

      expect(result.current.isFavorite('preset-3')).toBe(false);
    });
  });

  describe('addFavorite', () => {
    it('should add a preset to favorites', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
      });

      expect(result.current.favorites).toContain('preset-1');
    });

    it('should not duplicate if already favorited', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
        result.current.addFavorite('preset-1');
      });

      expect(result.current.favorites.filter(id => id === 'preset-1').length).toBe(1);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a preset from favorites', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
        result.current.addFavorite('preset-2');
      });

      act(() => {
        result.current.removeFavorite('preset-1');
      });

      expect(result.current.favorites).not.toContain('preset-1');
      expect(result.current.favorites).toContain('preset-2');
    });

    it('should do nothing if preset not in favorites', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
      });

      const beforeLength = result.current.favorites.length;

      act(() => {
        result.current.removeFavorite('preset-999');
      });

      expect(result.current.favorites.length).toBe(beforeLength);
      expect(result.current.favorites).toEqual(['preset-1']);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
        result.current.addFavorite('preset-2');
        result.current.addFavorite('preset-3');
      });

      expect(result.current.favorites.length).toBe(3);

      act(() => {
        result.current.clearFavorites();
      });

      expect(result.current.favorites).toEqual([]);
      expect(result.current.hasFavorites).toBe(false);
    });
  });

  describe('hasFavorites', () => {
    it('should be false when empty', () => {
      const { result } = renderHook(() => useFavoritePresets());

      expect(result.current.hasFavorites).toBe(false);
    });

    it('should be true when has favorites', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('preset-1');
      });

      expect(result.current.hasFavorites).toBe(true);
    });

    it('should update when favorites change', () => {
      const { result } = renderHook(() => useFavoritePresets());

      expect(result.current.hasFavorites).toBe(false);

      act(() => {
        result.current.addFavorite('preset-1');
      });

      expect(result.current.hasFavorites).toBe(true);

      act(() => {
        result.current.clearFavorites();
      });

      expect(result.current.hasFavorites).toBe(false);
    });
  });

  describe('multiple operations', () => {
    it('should handle multiple add and remove operations correctly', () => {
      const { result } = renderHook(() => useFavoritePresets());

      act(() => {
        result.current.addFavorite('a');
        result.current.addFavorite('b');
        result.current.addFavorite('c');
      });

      expect(result.current.favorites).toEqual(['a', 'b', 'c']);

      act(() => {
        result.current.removeFavorite('b');
      });

      expect(result.current.favorites).toEqual(['a', 'c']);

      act(() => {
        result.current.toggleFavorite('a'); // remove
        result.current.toggleFavorite('d'); // add
      });

      expect(result.current.favorites).toEqual(['c', 'd']);
    });
  });
});
