#!/usr/bin/env tsx

/**
 * Keyword Verification Script
 *
 * Verifies that all comprehensive keywords from Issue #386 are properly
 * implemented in the Next.js metadata.
 *
 * Usage:
 *   npm run verify:keywords
 *   tsx scripts/verify-keywords.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Expected keywords from Vite version (Issue #386)
const EXPECTED_KEYWORDS = [
  // Competitive Keywords (CRITICAL)
  'Cursor alternative',
  'Windsurf competitor',
  'Copilot alternative',

  // Trending/Aesthetic
  'vibe coding',
  'flow state programming',
  'aesthetic IDE',
  'zen coding',
  'lo-fi coding environment',

  // DX/Productivity
  'DX-first development',
  '10x developer tools',
  'multiplayer coding',
  'ship faster',
  'instant dev environment',

  // Technology Specific - LLM/AI
  'LLM-powered IDE',
  'GPT-4 coding assistant',
  'Claude coding',

  // Technology Specific - Frameworks
  'React 19 IDE',
  'TypeScript IDE',
  'Next.js development',
  'open source IDE',

  // Developer Wellness
  'indie hacker tools',
  'developer wellness',
  'mindful coding',
  'distraction-free IDE',

  // Primary competitive keywords
  'AI code editor',
  'AI coding assistant',
  'agentic IDE',
  'AI-powered IDE',
  'AI-powered development',
  'code completion',
  'AI autocomplete',
  'codebase understanding',
  'AI pair programming',
  'prompt to code',
  'prompt-driven development',
  'full-stack AI',
  'developer productivity',
  'code generation',
  'multi-agent AI',
  'AI code completion',

  // Quantum differentiators
  'quantum-enhanced IDE',
  'quantum neural networks',
  'quantum software development',
  'quantum computing IDE',
  'quantum programming',
  'quantum IDE',

  // Product-specific
  'ZeroDB vector database',
  'vector database',
  'AI Kit NPM packages',
  'AI Kit packages',
  'embeddings API',
  'embeddings',
  'semantic search',
  'vector database for developers',
  'AI agent swarm',
  'multi-agent development',

  // Action keywords
  'build apps with AI',
  'AI website builder',
  'AI app builder',
  'no-code AI development',

  // Brand
  'AI Native Studio',
];

interface VerificationResult {
  passed: boolean;
  totalExpected: number;
  totalFound: number;
  missingKeywords: string[];
  extraKeywords: string[];
  inMetadataKeywords: boolean;
  inOtherKeywords: boolean;
  keywordDensity?: number;
}

class KeywordVerifier {
  private layoutPath: string;
  private layoutContent: string;

  constructor() {
    this.layoutPath = join(process.cwd(), 'app', 'layout.tsx');
    try {
      this.layoutContent = readFileSync(this.layoutPath, 'utf-8');
    } catch (error) {
      console.error(`❌ Error reading ${this.layoutPath}`);
      throw error;
    }
  }

  /**
   * Extract keywords from the metadata.keywords array
   */
  private extractMetadataKeywords(): string[] {
    const keywordsMatch = this.layoutContent.match(
      /keywords:\s*\[([\s\S]*?)\]/
    );

    if (!keywordsMatch) {
      return [];
    }

    const keywordsBlock = keywordsMatch[1];
    const keywords = keywordsBlock
      .split('\n')
      .map(line => {
        // Extract content between quotes
        const match = line.match(/['"](.+?)['"]/);
        return match ? match[1] : null;
      })
      .filter((k): k is string => k !== null && k.trim() !== '');

    return keywords;
  }

  /**
   * Extract keywords from metadata.other.keywords string
   */
  private extractOtherKeywords(): string[] {
    const otherMatch = this.layoutContent.match(
      /other:\s*\{[\s\S]*?'keywords':\s*['"](.+?)['"]/
    );

    if (!otherMatch) {
      return [];
    }

    return otherMatch[1]
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
  }

  /**
   * Calculate keyword density in description and abstract
   */
  private calculateKeywordDensity(keywords: string[]): number {
    const descMatch = this.layoutContent.match(/description:\s*['"](.+?)['"]/);
    const abstractMatch = this.layoutContent.match(/'abstract':\s*['"](.+?)['"]/);

    if (!descMatch && !abstractMatch) {
      return 0;
    }

    const text = [
      descMatch ? descMatch[1] : '',
      abstractMatch ? abstractMatch[1] : '',
    ].join(' ').toLowerCase();

    const totalWords = text.split(/\s+/).length;
    let keywordCount = 0;

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = text.match(regex);
      if (matches) {
        keywordCount += matches.length;
      }
    });

    return totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
  }

  /**
   * Run complete verification
   */
  public verify(): VerificationResult {
    console.log('🔍 Verifying keyword implementation...\n');

    // Extract keywords from both locations
    const metadataKeywords = this.extractMetadataKeywords();
    const otherKeywords = this.extractOtherKeywords();

    console.log(`📊 Keywords found in metadata.keywords: ${metadataKeywords.length}`);
    console.log(`📊 Keywords found in metadata.other.keywords: ${otherKeywords.length}\n`);

    // Combine all found keywords
    const allFoundKeywords = new Set([...metadataKeywords, ...otherKeywords]);

    // Find missing and extra keywords
    const missingKeywords = EXPECTED_KEYWORDS.filter(
      k => !allFoundKeywords.has(k)
    );
    const extraKeywords = Array.from(allFoundKeywords).filter(
      k => !EXPECTED_KEYWORDS.includes(k)
    );

    // Calculate keyword density
    const density = this.calculateKeywordDensity(Array.from(allFoundKeywords));

    const result: VerificationResult = {
      passed: missingKeywords.length === 0,
      totalExpected: EXPECTED_KEYWORDS.length,
      totalFound: allFoundKeywords.size,
      missingKeywords,
      extraKeywords,
      inMetadataKeywords: metadataKeywords.length > 0,
      inOtherKeywords: otherKeywords.length > 0,
      keywordDensity: density,
    };

    return result;
  }

  /**
   * Print verification results
   */
  public printResults(result: VerificationResult): void {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                KEYWORD VERIFICATION REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Status
    if (result.passed) {
      console.log('✅ PASSED - All expected keywords are implemented\n');
    } else {
      console.log('❌ FAILED - Some keywords are missing\n');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   Expected keywords: ${result.totalExpected}`);
    console.log(`   Found keywords:    ${result.totalFound}`);
    console.log(`   Missing keywords:  ${result.missingKeywords.length}`);
    console.log(`   Extra keywords:    ${result.extraKeywords.length}\n`);

    // Implementation status
    console.log('📍 Implementation Status:');
    console.log(`   metadata.keywords:       ${result.inMetadataKeywords ? '✅' : '❌'}`);
    console.log(`   metadata.other.keywords: ${result.inOtherKeywords ? '✅' : '❌'}\n`);

    // Keyword density
    if (result.keywordDensity !== undefined) {
      const densityStatus =
        result.keywordDensity >= 2 && result.keywordDensity <= 3
          ? '✅ Optimal'
          : result.keywordDensity > 3
            ? '⚠️  High (risk of keyword stuffing)'
            : '⚠️  Low';
      console.log('📈 Keyword Density:');
      console.log(`   ${result.keywordDensity.toFixed(2)}% ${densityStatus}\n`);
    }

    // Missing keywords (if any)
    if (result.missingKeywords.length > 0) {
      console.log('❌ Missing Keywords:');
      result.missingKeywords.forEach(k => {
        console.log(`   - "${k}"`);
      });
      console.log('');
    }

    // Extra keywords (informational)
    if (result.extraKeywords.length > 0) {
      console.log('ℹ️  Extra Keywords (not in expected list):');
      result.extraKeywords.slice(0, 10).forEach(k => {
        console.log(`   - "${k}"`);
      });
      if (result.extraKeywords.length > 10) {
        console.log(`   ... and ${result.extraKeywords.length - 10} more`);
      }
      console.log('');
    }

    // Recommendations
    console.log('💡 Recommendations:');
    if (!result.passed) {
      console.log('   1. Add missing keywords to metadata.keywords array');
      console.log('   2. Update metadata.other.keywords string');
    }
    if (!result.inMetadataKeywords) {
      console.log('   1. Implement metadata.keywords array in layout.tsx');
    }
    if (!result.inOtherKeywords) {
      console.log('   2. Add metadata.other.keywords for legacy support');
    }
    if (result.keywordDensity && result.keywordDensity > 3) {
      console.log('   3. Reduce keyword density to avoid over-optimization');
    }
    if (result.keywordDensity && result.keywordDensity < 2) {
      console.log('   3. Incorporate more keywords naturally in content');
    }
    console.log('');

    console.log('═══════════════════════════════════════════════════════════\n');
  }

  /**
   * Check if build is needed
   */
  public async checkBuild(): Promise<boolean> {
    console.log('🔨 Checking if Next.js build is needed...\n');

    // For now, just recommend manual verification
    console.log('💡 To verify keywords in production build:');
    console.log('   1. Run: npm run build');
    console.log('   2. Run: npm start');
    console.log('   3. Open: http://localhost:3000');
    console.log('   4. View source (Ctrl+U / Cmd+Option+U)');
    console.log('   5. Search for <meta name="keywords">\n');

    return true;
  }
}

// Main execution
async function main() {
  try {
    const verifier = new KeywordVerifier();
    const result = verifier.verify();
    verifier.printResults(result);

    await verifier.checkBuild();

    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Verification failed with error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { KeywordVerifier, EXPECTED_KEYWORDS };
export type { VerificationResult };
