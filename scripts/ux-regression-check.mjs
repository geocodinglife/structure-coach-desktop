#!/usr/bin/env node
/**
 * Lightweight UX regression checks (no DOM). Run: node scripts/ux-regression-check.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsFiles = [
  'src/ui/chip-defs.js',
  'src/ui/coach.js',
  'src/ui/positive.js',
  'src/ui/movement.js',
  'src/ui/persistence.js',
  'src/ui/structure-map.js',
  'src/ui/panel.js',
  'src/ui/overlays/compare.js',
  'src/ui/overlays/fix.js',
  'src/ui/drawer.js',
];

let failed = 0;

for (const f of jsFiles) {
  try {
    execSync(`node --check "${join(root, f)}"`, { stdio: 'pipe' });
  } catch {
    console.error('FAIL syntax:', f);
    failed++;
  }
}

const compareSrc = readFileSync(join(root, 'src/ui/overlays/compare.js'), 'utf8');
const checks = [
  ['Discard invalidates in-flight LLM', /activeRequestId\s*\+/],
  ['Request id guard on LLM result', /requestId\s*!==\s*activeRequestId/],
  ['Flush before LLM', /flushPersistWorkshop\(\)/],
  ['Source snapshot variable', /compareSourceText/],
  ['AI writes to separate lane', /aiEl\.value\s*=\s*result/],
  ['Hide preserves session', /compareHasSession\s*=\s*true[\s\S]*hideCompare/],
];

for (const [name, re] of checks) {
  if (!re.test(compareSrc)) {
    console.error('FAIL compare:', name);
    failed++;
  }
}

const persistSrc = readFileSync(join(root, 'src/ui/persistence.js'), 'utf8');
if (!/export function flushWorkshopDraft/.test(persistSrc)) {
  console.error('FAIL persistence: flushWorkshopDraft missing');
  failed++;
}

const fixSrc = readFileSync(join(root, 'src/ui/overlays/fix.js'), 'utf8');
const openFixBody = fixSrc.match(/export function openFixOverlay[\s\S]*?\n}/)?.[0] || '';
const fixChecks = [
  ['Manual edit preserved', /cached\.userText/.test(fixSrc)],
  ['Close cancels via session ref', /session !== sessionRef/.test(fixSrc)],
  ['No auto-generate on open', !/callLLM/.test(openFixBody)],
];
for (const [name, ok] of fixChecks) {
  if (!ok) {
    console.error('FAIL fix:', name);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log('UX regression static checks passed (' + jsFiles.length + ' files).');
