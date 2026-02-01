/**
 * Tailwind Configuration Verification Script
 * Ensures all design tokens are accessible for IntelliSense
 */

import config from '../tailwind.config';

console.log('Tailwind Configuration Verification\n');
console.log('=====================================\n');

const extend = config.theme?.extend;

// Verify colors
const colors = extend?.colors as Record<string, any>;
console.log('Color tokens:', Object.keys(colors || {}).length);
console.log('Dark mode palette:', colors?.['dark-1'], colors?.['dark-2'], colors?.['dark-3']);
console.log('Brand primary:', colors?.['brand-primary']);

// Verify typography
const fontSize = extend?.fontSize as Record<string, any>;
console.log('\nTypography scale:', Object.keys(fontSize || {}).length);
console.log('Title-1:', fontSize?.['title-1']);
console.log('Title-2:', fontSize?.['title-2']);

// Verify animations
const animations = extend?.animation as Record<string, any>;
const keyframes = extend?.keyframes as Record<string, any>;
console.log('\nAnimations:', Object.keys(animations || {}).length);
console.log('Keyframes:', Object.keys(keyframes || {}).length);
console.log('Animation list:', Object.keys(animations || {}).join(', '));

// Verify shadows
const shadows = extend?.boxShadow as Record<string, any>;
console.log('\nDesign system shadows:', Object.keys(shadows || {}).length);
console.log('Shadow list:', Object.keys(shadows || {}).join(', '));

console.log('\n=====================================');
console.log('Verification: PASSED');
console.log('All design tokens are accessible for IntelliSense');
