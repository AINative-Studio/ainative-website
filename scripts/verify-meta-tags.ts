#!/usr/bin/env ts-node

/**
 * Meta Tags Verification Script
 *
 * Verifies that all required meta tags from Issue #385 are present
 * in the production build HTML output.
 *
 * Usage:
 *   npm run build && npm run start &
 *   ts-node scripts/verify-meta-tags.ts
 *
 * Or use Node directly:
 *   npm run build && npm run start &
 *   node --loader ts-node/esm scripts/verify-meta-tags.ts
 */

import * as http from 'http';
import * as https from 'https';

interface MetaTagCheck {
  name: string;
  pattern: RegExp;
  required: boolean;
  description: string;
}

const META_TAGS: MetaTagCheck[] = [
  // Basic SEO
  {
    name: 'Title',
    pattern: /<title>.*AI Native Studio.*<\/title>/,
    required: true,
    description: 'Page title with brand name',
  },
  {
    name: 'Description',
    pattern: /<meta name="description" content=".*"/,
    required: true,
    description: 'Meta description',
  },
  {
    name: 'Keywords (new format)',
    pattern: /<meta name="keywords" content=".*"/,
    required: true,
    description: 'Meta keywords',
  },

  // Authorship
  {
    name: 'Author',
    pattern: /<meta name="author" content="AI Native Studio"/,
    required: true,
    description: 'Author meta tag',
  },
  {
    name: 'Creator',
    pattern: /<meta name="creator" content="AI Native Studio"/,
    required: true,
    description: 'Creator meta tag',
  },
  {
    name: 'Publisher',
    pattern: /<meta name="publisher" content="AI Native Studio"/,
    required: true,
    description: 'Publisher meta tag',
  },

  // Extended meta tags (Issue #385)
  {
    name: 'Language',
    pattern: /<meta name="language" content="English"/,
    required: true,
    description: 'Language declaration',
  },
  {
    name: 'Revisit After',
    pattern: /<meta name="revisit-after" content="7 days"/,
    required: true,
    description: 'Crawl frequency suggestion',
  },
  {
    name: 'Rating',
    pattern: /<meta name="rating" content="general"/,
    required: true,
    description: 'Content rating',
  },
  {
    name: 'Distribution',
    pattern: /<meta name="distribution" content="global"/,
    required: true,
    description: 'Distribution scope',
  },
  {
    name: 'Copyright',
    pattern: /<meta name="copyright" content="© 2025 AI Native Studio\. All rights reserved\."/,
    required: true,
    description: 'Copyright notice',
  },
  {
    name: 'Generator',
    pattern: /<meta name="generator" content="AI Native Studio"/,
    required: true,
    description: 'Generator/platform',
  },
  {
    name: 'Abstract',
    pattern: /<meta name="abstract" content=".*quantum computing.*vector databases.*AI agents.*"/,
    required: true,
    description: 'Extended description for legacy crawlers',
  },
  {
    name: 'Article Publisher',
    pattern: /<meta name="article:publisher" content="AI Native Studio"/,
    required: true,
    description: 'Article publisher (OG extension)',
  },
  {
    name: 'Article Author',
    pattern: /<meta name="article:author" content="AI Native Studio"/,
    required: true,
    description: 'Article author (OG extension)',
  },

  // Open Graph
  {
    name: 'OG Type',
    pattern: /<meta property="og:type" content="website"/,
    required: true,
    description: 'Open Graph type',
  },
  {
    name: 'OG Title',
    pattern: /<meta property="og:title" content=".*AI Native Studio.*"/,
    required: true,
    description: 'Open Graph title',
  },
  {
    name: 'OG Description',
    pattern: /<meta property="og:description" content=".*"/,
    required: true,
    description: 'Open Graph description',
  },
  {
    name: 'OG Image',
    pattern: /<meta property="og:image" content=".*card\.png"/,
    required: true,
    description: 'Open Graph image',
  },
  {
    name: 'OG URL',
    pattern: /<meta property="og:url" content=".*ainative\.studio.*"/,
    required: true,
    description: 'Open Graph URL',
  },

  // Twitter Cards
  {
    name: 'Twitter Card',
    pattern: /<meta name="twitter:card" content="summary_large_image"/,
    required: true,
    description: 'Twitter card type',
  },
  {
    name: 'Twitter Site',
    pattern: /<meta name="twitter:site" content="@AINativeStudio"/,
    required: true,
    description: 'Twitter site handle',
  },
  {
    name: 'Twitter Image',
    pattern: /<meta name="twitter:image" content=".*card\.png"/,
    required: true,
    description: 'Twitter card image',
  },

  // Mobile & PWA
  {
    name: 'Theme Color',
    pattern: /<meta name="theme-color" content="#4B6FED"/,
    required: true,
    description: 'Browser theme color',
  },
  {
    name: 'Mobile Web App Capable',
    pattern: /<meta name="mobile-web-app-capable" content="yes"/,
    required: true,
    description: 'Mobile web app capability',
  },
  {
    name: 'Apple Mobile Web App Title',
    pattern: /<meta name="apple-mobile-web-app-title" content="AI Native Studio"/,
    required: true,
    description: 'iOS app title',
  },

  // Canonical
  {
    name: 'Canonical Link',
    pattern: /<link rel="canonical" href=".*ainative\.studio.*"/,
    required: true,
    description: 'Canonical URL',
  },

  // Icons & Manifest
  {
    name: 'Favicon',
    pattern: /<link rel="icon" href=".*code_simple_logo\.jpg"/,
    required: true,
    description: 'Favicon',
  },
  {
    name: 'Manifest',
    pattern: /<link rel="manifest" href="\/manifest\.json"/,
    required: true,
    description: 'PWA manifest',
  },

  // Robots
  {
    name: 'Robots Index',
    pattern: /<meta name="robots" content=".*index.*"/,
    required: true,
    description: 'Robots indexing directive',
  },
];

async function fetchHTML(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function verifyMetaTags(url: string = 'http://localhost:3000'): Promise<void> {
  console.log('\n🔍 Meta Tags Verification Script');
  console.log('=' .repeat(60));
  console.log(`Fetching HTML from: ${url}\n`);

  let html: string;

  try {
    html = await fetchHTML(url);
  } catch (error) {
    console.error('❌ Error: Failed to fetch HTML');
    console.error('   Make sure the development server is running:');
    console.error('   npm run dev');
    console.error('   OR');
    console.error('   npm run build && npm run start');
    process.exit(1);
  }

  const results: { passed: MetaTagCheck[]; failed: MetaTagCheck[] } = {
    passed: [],
    failed: [],
  };

  // Check each meta tag
  for (const check of META_TAGS) {
    if (check.pattern.test(html)) {
      results.passed.push(check);
    } else if (check.required) {
      results.failed.push(check);
    }
  }

  // Display results
  console.log('✅ Passed Meta Tags:');
  console.log('-'.repeat(60));
  results.passed.forEach((tag, index) => {
    console.log(`${index + 1}. ${tag.name}`);
    console.log(`   ${tag.description}`);
  });

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Meta Tags:');
    console.log('-'.repeat(60));
    results.failed.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag.name} (REQUIRED)`);
      console.log(`   ${tag.description}`);
      console.log(`   Pattern: ${tag.pattern}`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total Checks: ${META_TAGS.length}`);
  console.log(`   ✅ Passed: ${results.passed.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   📈 Success Rate: ${((results.passed.length / META_TAGS.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  // Exit code
  if (results.failed.length > 0) {
    console.log('\n⚠️  Some required meta tags are missing!');
    console.log('   Review app/layout.tsx and ensure all tags are properly configured.\n');
    process.exit(1);
  } else {
    console.log('\n🎉 All required meta tags are present!\n');
    process.exit(0);
  }
}

// Extended verification with HTML output
async function verifyAndExtract(url: string = 'http://localhost:3000'): Promise<void> {
  console.log('\n📋 Extracting All Meta Tags from HTML');
  console.log('=' .repeat(60));

  try {
    const html = await fetchHTML(url);

    // Extract all meta tags
    const metaTagRegex = /<meta[^>]+>/g;
    const metaTags = html.match(metaTagRegex) || [];

    console.log(`\nFound ${metaTags.length} meta tags:\n`);
    metaTags.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag}`);
    });

    // Extract all link tags
    const linkTagRegex = /<link[^>]+>/g;
    const linkTags = html.match(linkTagRegex) || [];

    console.log(`\n\nFound ${linkTags.length} link tags:\n`);
    linkTags.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag}`);
    });

    console.log('\n' + '='.repeat(60) + '\n');

    // Now run the verification
    await verifyMetaTags(url);
  } catch (error) {
    console.error('Error during extraction:', error);
    process.exit(1);
  }
}

// CLI Arguments
const args = process.argv.slice(2);
const url = args[0] || 'http://localhost:3000';
const extractMode = args.includes('--extract') || args.includes('-e');

// Run verification
if (extractMode) {
  verifyAndExtract(url);
} else {
  verifyMetaTags(url);
}
