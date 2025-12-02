/**
 * Tests for PWA Manifest configuration
 * Validating manifest structure and required fields
 */

import { describe, it, expect } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';

describe('PWA Manifest', () => {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');

  it('should exist in public directory', () => {
    const exists = fs.existsSync(manifestPath);
    expect(exists).toBe(true);
  });

  describe('Manifest Content', () => {
    let manifest: any;

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      manifest = JSON.parse(content);
    } catch {
      manifest = null;
    }

    it('should have required name field', () => {
      expect(manifest).not.toBeNull();
      expect(manifest.name).toBeDefined();
      expect(typeof manifest.name).toBe('string');
    });

    it('should have short_name field', () => {
      expect(manifest.short_name).toBeDefined();
      expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    });

    it('should have valid display mode', () => {
      const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
      expect(validDisplayModes).toContain(manifest.display);
    });

    it('should have theme_color in valid hex format', () => {
      expect(manifest.theme_color).toBeDefined();
      expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should have background_color in valid hex format', () => {
      expect(manifest.background_color).toBeDefined();
      expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should have start_url defined', () => {
      expect(manifest.start_url).toBeDefined();
      expect(manifest.start_url).toMatch(/^\//);
    });

    it('should have icons array with required sizes', () => {
      expect(manifest.icons).toBeDefined();
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);

      // Check for 192x192 icon
      const icon192 = manifest.icons.find((i: any) => i.sizes === '192x192');
      expect(icon192).toBeDefined();

      // Check for 512x512 icon
      const icon512 = manifest.icons.find((i: any) => i.sizes === '512x512');
      expect(icon512).toBeDefined();
    });

    it('should have valid scope', () => {
      expect(manifest.scope).toBeDefined();
      expect(manifest.scope).toBe('/');
    });
  });
});

describe('PWA Icons', () => {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');

  it('should have icons directory', () => {
    const exists = fs.existsSync(iconsDir);
    expect(exists).toBe(true);
  });

  it('should contain PWA icon files', () => {
    const files = fs.readdirSync(iconsDir);
    expect(files.length).toBeGreaterThan(0);

    // Should have at least one icon file
    const hasIconFile = files.some(f =>
      f.includes('pwa') && (f.endsWith('.svg') || f.endsWith('.png'))
    );
    expect(hasIconFile).toBe(true);
  });
});

describe('Service Worker Configuration', () => {
  it('should have vite-plugin-pwa configured in vite.config.ts', () => {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');

    expect(content).toContain('vite-plugin-pwa');
    expect(content).toContain('VitePWA');
  });

  it('should have registerType set to autoUpdate', () => {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');

    expect(content).toContain("registerType: 'autoUpdate'");
  });

  it('should have Supabase caching configured', () => {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');

    expect(content).toContain('supabase-cache');
    expect(content).toContain('NetworkFirst');
  });
});

describe('HTML PWA Meta Tags', () => {
  const indexPath = path.join(process.cwd(), 'index.html');
  let htmlContent: string;

  try {
    htmlContent = fs.readFileSync(indexPath, 'utf-8');
  } catch {
    htmlContent = '';
  }

  it('should have dynamic manifest injection script', () => {
    // Manifest is now injected dynamically for iOS PWA support
    expect(htmlContent).toContain("link.rel = 'manifest'");
    expect(htmlContent).toContain('application/manifest+json');
  });

  it('should have theme-color meta tag', () => {
    expect(htmlContent).toContain('name="theme-color"');
  });

  it('should have apple-mobile-web-app-capable meta tag', () => {
    expect(htmlContent).toContain('apple-mobile-web-app-capable');
  });

  it('should have apple-touch-icon link', () => {
    expect(htmlContent).toContain('apple-touch-icon');
  });

  it('should have viewport meta tag with viewport-fit', () => {
    expect(htmlContent).toContain('viewport-fit=cover');
  });
});
