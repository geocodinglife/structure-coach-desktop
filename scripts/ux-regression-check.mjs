#!/usr/bin/env node
/**
 * Lightweight UX regression checks (no DOM). Run: npm run check:ux
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsFiles = [
  'src/analysis/sentence-roles.js',
  'src/ui/chip-defs.js',
  'src/ui/coach.js',
  'src/ui/positive.js',
  'src/ui/movement.js',
  'src/ui/persistence.js',
  'src/ui/structure-map.js',
  'src/ui/structure-signals.js',
  'src/ui/apply-editor.js',
  'src/ui/panel.js',
  'src/ui/overlays/compare.js',
  'src/ui/overlays/fix.js',
  'src/ui/drawer.js',
  'src/llm/prompts.js',
  'src/llm/client.js',
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
const compareChecks = [
  ['Discard invalidates in-flight LLM', /activeRequestId\s*\+/],
  ['Request id guard', /requestId\s*!==\s*activeRequestId/],
  ['Flush before LLM', /flushPersistWorkshop\(\)/],
  ['Apply to editor export', /export function openWorkshopApply/],
  ['Source snapshot', /compareSourceText/],
];

for (const [name, re] of compareChecks) {
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
if (!/cached\.userText/.test(fixSrc)) failed++, console.error('FAIL fix: manual edit');
if (!/session !== sessionRef/.test(fixSrc)) failed++, console.error('FAIL fix: session cancel');
if (/callLLM/.test(openFixBody)) failed++, console.error('FAIL fix: auto-generate on open');
if (!/Apply to editor/.test(fixSrc)) failed++, console.error('FAIL fix: apply button');

const rolesSrc = readFileSync(join(root, 'src/analysis/sentence-roles.js'), 'utf8');
if (!/export function analyzeSentenceStructure/.test(rolesSrc)) {
  failed++;
  console.error('FAIL sentence-roles: analyzeSentenceStructure');
}

const applySrc = readFileSync(join(root, 'src/ui/apply-editor.js'), 'utf8');
if (!/export function undoLastApply/.test(applySrc)) {
  failed++;
  console.error('FAIL apply-editor: undo');
}

const movementSrc = readFileSync(join(root, 'src/ui/movement.js'), 'utf8');
if (!/task-scaffold/.test(movementSrc) && !/Generate with AI/.test(movementSrc)) {
  failed++;
  console.error('FAIL movement: LLM scaffold');
}

const promptsSrc = readFileSync(join(root, 'src/llm/prompts.js'), 'utf8');
if (!/buildTaskScaffoldPrompt/.test(promptsSrc)) {
  failed++;
  console.error('FAIL prompts: task scaffold');
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log('UX regression static checks passed (' + jsFiles.length + ' files).');
