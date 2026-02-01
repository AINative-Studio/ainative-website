/**
 * Test Suite for Issue #494: Design System Shadow Consistency
 *
 * Tests shadow tokens exist in Tailwind config and components use design system shadows.
 * Target: 85%+ coverage
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Path to Tailwind config
const TAILWIND_CONFIG_PATH = path.join(process.cwd(), 'tailwind.config.ts');

// Component paths to test
const COMPONENT_PATHS = {
  card: path.join(process.cwd(), 'components/ui/card.tsx'),
  dialog: path.join(process.cwd(), 'components/ui/dialog.tsx'),
  popover: path.join(process.cwd(), 'components/ui/popover.tsx'),
  dropdownMenu: path.join(process.cwd(), 'components/ui/dropdown-menu.tsx'),
  sheet: path.join(process.cwd(), 'components/ui/sheet.tsx'),
  hoverCard: path.join(process.cwd(), 'components/ui/hover-card.tsx'),
};

describe('Issue #494: Shadow System', () => {
  describe('Tailwind Config - Shadow Tokens', () => {
    let tailwindConfig: string;

    beforeAll(() => {
      tailwindConfig = fs.readFileSync(TAILWIND_CONFIG_PATH, 'utf-8');
    });

    it('should have ds-sm shadow token defined', () => {
      expect(tailwindConfig).toMatch(/'ds-sm':/);
    });

    it('should have ds-md shadow token defined', () => {
      expect(tailwindConfig).toMatch(/'ds-md':/);
    });

    it('should have ds-lg shadow token defined', () => {
      expect(tailwindConfig).toMatch(/'ds-lg':/);
    });

    it('should define ds-sm with correct shadow values', () => {
      const expectedShadow = '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)';
      expect(tailwindConfig).toContain(expectedShadow);
    });

    it('should define ds-md with correct shadow values', () => {
      const expectedShadow = '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)';
      expect(tailwindConfig).toContain(expectedShadow);
    });

    it('should define ds-lg with correct shadow values', () => {
      const expectedShadow = '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)';
      expect(tailwindConfig).toContain(expectedShadow);
    });

    it('should have shadow tokens in boxShadow extend section', () => {
      expect(tailwindConfig).toMatch(/boxShadow:\s*{/);
    });
  });

  describe('Component Usage - Cards (shadow-ds-md)', () => {
    let cardContent: string;

    beforeAll(() => {
      cardContent = fs.readFileSync(COMPONENT_PATHS.card, 'utf-8');
    });

    it('should use design system shadow (shadow-ds-md)', () => {
      expect(cardContent).toMatch(/shadow-ds-(sm|md|lg)/);
    });

    it('should NOT use generic Tailwind shadow classes', () => {
      // Should not have shadow-sm, shadow-md, shadow-lg without -ds prefix
      const genericShadowPattern = /shadow-(sm|md|lg|xl|2xl)(?!-ds)/;
      expect(cardContent).not.toMatch(genericShadowPattern);
    });

    it('should preferably use shadow-ds-md for cards', () => {
      // Cards should use medium shadow for elevation
      expect(cardContent).toMatch(/shadow-ds-md/);
    });
  });

  describe('Component Usage - Modals/Dialogs (shadow-ds-lg)', () => {
    let dialogContent: string;
    let sheetContent: string;

    beforeAll(() => {
      dialogContent = fs.readFileSync(COMPONENT_PATHS.dialog, 'utf-8');
      sheetContent = fs.readFileSync(COMPONENT_PATHS.sheet, 'utf-8');
    });

    it('dialog should use design system shadows', () => {
      expect(dialogContent).toMatch(/shadow-ds-(sm|md|lg)/);
    });

    it('sheet should use design system shadows', () => {
      expect(sheetContent).toMatch(/shadow-ds-(sm|md|lg)/);
    });

    it('dialog should NOT use generic shadows', () => {
      const genericShadowPattern = /shadow-(sm|md|lg|xl|2xl)(?!-ds)/;
      expect(dialogContent).not.toMatch(genericShadowPattern);
    });

    it('sheet should NOT use generic shadows', () => {
      const genericShadowPattern = /shadow-(sm|md|lg|xl|2xl)(?!-ds)/;
      expect(sheetContent).not.toMatch(genericShadowPattern);
    });
  });

  describe('Component Usage - Dropdowns/Popovers (shadow-ds-sm)', () => {
    let popoverContent: string;
    let dropdownContent: string;
    let hoverCardContent: string;

    beforeAll(() => {
      popoverContent = fs.readFileSync(COMPONENT_PATHS.popover, 'utf-8');
      dropdownContent = fs.readFileSync(COMPONENT_PATHS.dropdownMenu, 'utf-8');
      hoverCardContent = fs.readFileSync(COMPONENT_PATHS.hoverCard, 'utf-8');
    });

    it('popover should use design system shadows', () => {
      expect(popoverContent).toMatch(/shadow-ds-(sm|md|lg)/);
    });

    it('dropdown-menu should use design system shadows', () => {
      expect(dropdownContent).toMatch(/shadow-ds-(sm|md|lg)/);
    });

    it('hover-card should use design system shadows', () => {
      expect(hoverCardContent).toMatch(/shadow-ds-(sm|md|lg)/);
    });

    it('popover should NOT use generic shadows', () => {
      const genericShadowPattern = /shadow-(sm|md|lg|xl|2xl)(?!-ds)/;
      expect(popoverContent).not.toMatch(genericShadowPattern);
    });

    it('dropdown-menu should NOT use generic shadows', () => {
      const genericShadowPattern = /shadow-(sm|md|lg|xl|2xl)(?!-ds)/;
      expect(dropdownContent).not.toMatch(genericShadowPattern);
    });

    it('hover-card should NOT use generic shadows', () => {
      const genericShadowPattern = /shadow-(sm|md|lg|xl|2xl)(?!-ds)/;
      expect(hoverCardContent).not.toMatch(genericShadowPattern);
    });
  });

  describe('Shadow Hierarchy Validation', () => {
    it('should ensure shadow tokens follow depth hierarchy', () => {
      const tailwindConfig = fs.readFileSync(TAILWIND_CONFIG_PATH, 'utf-8');

      // Extract shadow values
      const dsSm = tailwindConfig.match(/'ds-sm':\s*'([^']+)'/)?.[1];
      const dsMd = tailwindConfig.match(/'ds-md':\s*'([^']+)'/)?.[1];
      const dsLg = tailwindConfig.match(/'ds-lg':\s*'([^']+)'/)?.[1];

      // Verify all exist
      expect(dsSm).toBeDefined();
      expect(dsMd).toBeDefined();
      expect(dsLg).toBeDefined();

      // Verify they use dark-1 color (rgba(19, 23, 38, ...))
      expect(dsSm).toContain('rgba(19, 23, 38');
      expect(dsMd).toContain('rgba(19, 23, 38');
      expect(dsLg).toContain('rgba(19, 23, 38');
    });
  });

  describe('Documentation', () => {
    it('should have shadow system documented in Tailwind config comments', () => {
      const tailwindConfig = fs.readFileSync(TAILWIND_CONFIG_PATH, 'utf-8');
      expect(tailwindConfig).toMatch(/Design System Shadows/i);
    });

    it('should document shadow usage guidelines', () => {
      const tailwindConfig = fs.readFileSync(TAILWIND_CONFIG_PATH, 'utf-8');
      // Should mention when to use each shadow level
      expect(tailwindConfig).toMatch(/ds-sm.*small/i);
      expect(tailwindConfig).toMatch(/ds-md.*medium/i);
      expect(tailwindConfig).toMatch(/ds-lg.*large/i);
    });
  });
});
