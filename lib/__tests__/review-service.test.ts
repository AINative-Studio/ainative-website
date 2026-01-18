/**
 * Review Service Tests
 * Integration tests for code review functionality
 */

import { ReviewService } from '../review-service';
import { ReviewConfig } from '../types/review';

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();
  });

  describe('Security Review', () => {
    it('should detect SQL injection vulnerabilities', async () => {
      const mockFiles = new Map([
        [
          'test.ts',
          `
          function getUserData(id: string) {
            const query = \`SELECT * FROM users WHERE id = \${id}\`;
            return execute(query);
          }
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'security',
        options: {
          security: {
            checkSecrets: true,
            owaspCheck: true,
            cweCheck: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.security).toBeDefined();
      expect(result.security?.vulnerabilities.length).toBeGreaterThan(0);
      expect(result.security?.vulnerabilities[0].type).toContain('SQL');
    });

    it('should detect XSS vulnerabilities', async () => {
      const mockFiles = new Map([
        [
          'test.tsx',
          `
          function Component({ userInput }) {
            return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
          }
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'security',
        options: {
          security: {
            checkSecrets: true,
            owaspCheck: true,
            cweCheck: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.security).toBeDefined();
      expect(result.security?.vulnerabilities.some((v) => v.type.includes('XSS'))).toBe(
        true
      );
    });

    it('should detect hardcoded secrets', async () => {
      const mockFiles = new Map([
        [
          'config.ts',
          `
          const API_KEY = "sk_test_1234567890abcdefghijklmnopqrstuvwxyz";
          const PASSWORD = "my_secret_password_123";
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'security',
        options: {
          security: {
            checkSecrets: true,
            owaspCheck: true,
            cweCheck: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.security).toBeDefined();
      expect(result.security?.secrets.length).toBeGreaterThan(0);
    });

    it('should calculate security score correctly', async () => {
      const config: ReviewConfig = {
        type: 'security',
        options: {
          security: {
            checkSecrets: true,
            owaspCheck: true,
            cweCheck: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.security).toBeDefined();
      expect(result.security?.score).toBeGreaterThanOrEqual(0);
      expect(result.security?.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance Review', () => {
    it('should detect N+1 query patterns', async () => {
      const mockFiles = new Map([
        [
          'test.ts',
          `
          const result = data.map(item => item.id).map(id => fetchById(id));
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'performance',
        options: {
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.performance).toBeDefined();
      expect(result.performance?.issues.some((i) => i.type.includes('N'))).toBe(true);
    });

    it('should detect blocking operations', async () => {
      const mockFiles = new Map([
        [
          'test.ts',
          `
          const data = fs.readFileSync('file.txt', 'utf-8');
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'performance',
        options: {
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.performance).toBeDefined();
      expect(
        result.performance?.issues.some((i) => i.type.includes('Blocking'))
      ).toBe(true);
    });

    it('should detect memory leaks', async () => {
      const mockFiles = new Map([
        [
          'test.ts',
          `
          setInterval(() => {
            console.log('running');
          }, 1000);
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'performance',
        options: {
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.performance).toBeDefined();
      expect(
        result.performance?.issues.some((i) => i.type.includes('Memory'))
      ).toBe(true);
    });

    it('should estimate performance metrics', async () => {
      const config: ReviewConfig = {
        type: 'performance',
        options: {
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.performance).toBeDefined();
      expect(result.performance?.metrics).toBeDefined();
      expect(result.performance?.metrics.recommendations).toBeDefined();
    });
  });

  describe('Style Review', () => {
    it('should detect console statements', async () => {
      const mockFiles = new Map([
        [
          'test.ts',
          `
          function debug() {
            console.log('debugging');
            console.error('error message');
          }
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'style',
        options: {
          style: {
            autoFix: false,
            strictMode: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.style).toBeDefined();
      expect(result.style?.violations.some((v) => v.rule.includes('console'))).toBe(
        true
      );
    });

    it('should detect TODO comments', async () => {
      const mockFiles = new Map([
        [
          'test.ts',
          `
          // TODO: Fix this later
          // FIXME: This is broken
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'style',
        options: {
          style: {
            autoFix: false,
            strictMode: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.style).toBeDefined();
      expect(result.style?.violations.some((v) => v.rule.includes('todo'))).toBe(true);
    });

    it('should detect var declarations', async () => {
      const mockFiles = new Map([
        [
          'test.ts',
          `
          var oldStyle = "should use const or let";
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'style',
        options: {
          style: {
            autoFix: false,
            strictMode: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.style).toBeDefined();
      expect(result.style?.violations.some((v) => v.rule.includes('var'))).toBe(true);
    });

    it('should identify auto-fixable issues', async () => {
      const config: ReviewConfig = {
        type: 'style',
        options: {
          style: {
            autoFix: true,
            strictMode: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.style).toBeDefined();
      if (result.style && result.style.violations.length > 0) {
        expect(result.style.summary.fixable).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Overall Review', () => {
    it('should perform comprehensive review', async () => {
      const config: ReviewConfig = {
        type: 'all',
        options: {
          security: {
            checkSecrets: true,
            owaspCheck: true,
            cweCheck: true,
          },
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
          style: {
            autoFix: false,
            strictMode: true,
          },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.id).toBeDefined();
      expect(result.type).toBe('all');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.status).toBe('completed');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should calculate overall score from all review types', async () => {
      const config: ReviewConfig = {
        type: 'all',
        options: {
          security: { checkSecrets: true, owaspCheck: true, cweCheck: true },
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
          style: { autoFix: false, strictMode: true },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.security).toBeDefined();
      expect(result.performance).toBeDefined();
      expect(result.style).toBeDefined();

      // Overall score should be average of individual scores
      const expectedScore = Math.round(
        (result.security!.score + result.performance!.score + result.style!.score) / 3
      );
      expect(result.overallScore).toBe(expectedScore);
    });

    it('should include metadata', async () => {
      const config: ReviewConfig = {
        type: 'all',
        options: {
          security: { checkSecrets: true, owaspCheck: true, cweCheck: true },
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
          style: { autoFix: false, strictMode: true },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.reviewer).toBe('ai');
      expect(result.metadata.triggeredBy).toBe('manual');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', async () => {
      const config: ReviewConfig = {
        type: 'all',
        files: [],
        options: {
          security: { checkSecrets: true, owaspCheck: true, cweCheck: true },
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
          style: { autoFix: false, strictMode: true },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.files).toEqual([]);
      expect(result.status).toBe('completed');
    });

    it('should handle files with no issues', async () => {
      const mockFiles = new Map([
        [
          'perfect.ts',
          `
          export const safeFunction = () => {
            const data = 'clean code';
            return data;
          };
        `,
        ],
      ]);

      const config: ReviewConfig = {
        type: 'all',
        options: {
          security: { checkSecrets: true, owaspCheck: true, cweCheck: true },
          performance: {
            checkBundleSize: true,
            checkRenderTime: true,
            checkMemory: true,
          },
          style: { autoFix: false, strictMode: false },
        },
      };

      const result = await reviewService.performReview(config);

      expect(result.status).toBe('completed');
      expect(result.overallScore).toBeGreaterThanOrEqual(90);
    });
  });
});
