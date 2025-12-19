import { cn } from '../utils';

describe('cn utility function', () => {
  describe('basic class merging', () => {
    it('merges multiple class strings', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
    });

    it('handles single class string', () => {
      expect(cn('px-4')).toBe('px-4');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('handles undefined values', () => {
      expect(cn('px-4', undefined, 'py-2')).toBe('px-4 py-2');
    });

    it('handles null values', () => {
      expect(cn('px-4', null, 'py-2')).toBe('px-4 py-2');
    });

    it('handles boolean false values', () => {
      expect(cn('px-4', false, 'py-2')).toBe('px-4 py-2');
    });
  });

  describe('Tailwind class conflict resolution', () => {
    it('resolves conflicting padding classes (later wins)', () => {
      expect(cn('px-4', 'px-8')).toBe('px-8');
    });

    it('resolves conflicting margin classes', () => {
      expect(cn('mt-4', 'mt-8')).toBe('mt-8');
    });

    it('resolves conflicting background colors', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('resolves conflicting text colors', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('resolves conflicting text sizes', () => {
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    });

    it('resolves conflicting font weights', () => {
      expect(cn('font-normal', 'font-bold')).toBe('font-bold');
    });
  });

  describe('conditional classes', () => {
    it('handles conditional class application', () => {
      const isActive = true;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class');
    });

    it('handles false conditional', () => {
      const isActive = false;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class');
    });

    it('handles ternary expressions', () => {
      const variant = 'primary';
      expect(cn('base', variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500')).toBe('base bg-blue-500');
    });
  });

  describe('object syntax', () => {
    it('handles object with true values', () => {
      expect(cn({ 'px-4': true, 'py-2': true })).toBe('px-4 py-2');
    });

    it('handles object with false values', () => {
      expect(cn({ 'px-4': true, 'py-2': false })).toBe('px-4');
    });

    it('handles mixed string and object', () => {
      expect(cn('base-class', { 'px-4': true, 'py-2': false })).toBe('base-class px-4');
    });
  });

  describe('array syntax', () => {
    it('handles array of classes', () => {
      expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
    });

    it('handles nested arrays', () => {
      expect(cn(['px-4', ['py-2', 'mt-4']])).toBe('px-4 py-2 mt-4');
    });

    it('handles mixed array with conditionals', () => {
      expect(cn(['px-4', false && 'py-2', 'mt-4'])).toBe('px-4 mt-4');
    });
  });

  describe('complex combinations', () => {
    it('handles button-like class combinations', () => {
      const result = cn(
        'inline-flex items-center justify-center',
        'rounded-md text-sm font-medium',
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90'
      );
      expect(result).toContain('inline-flex');
      expect(result).toContain('bg-primary');
      expect(result).toContain('rounded-md');
    });

    it('handles component override pattern', () => {
      const baseClasses = 'px-4 py-2 bg-blue-500';
      const customClasses = 'px-8 bg-red-500';
      const result = cn(baseClasses, customClasses);
      expect(result).toContain('px-8');
      expect(result).toContain('bg-red-500');
      expect(result).not.toContain('px-4');
      expect(result).not.toContain('bg-blue-500');
    });
  });
});
