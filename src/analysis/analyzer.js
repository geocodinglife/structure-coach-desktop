// Top-level text analyzer. Returns highlighted HTML, per-rule stats, and per-sentence stats.

import { PARAMEDIC_RULES, FLOW_RULE } from './rules.js';
import { buildPosContext } from './nlp-context.js';
import { computeFlowFlags } from './flow.js';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function collectMatches(rule, text, ctx) {
  if (rule.find) {
    try { return rule.find(text, ctx) || []; } catch { return []; }
  }
  if (!rule.pattern) return [];
  const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
  const out = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (rule.filter && !rule.filter(m[0], ctx)) continue;
    out.push({ text: m[0], index: m.index });
  }
  return out;
}

export function analyzeText(text) {
  if (!text) return { html: '', stats: [], sentences: [] };
  const ctx = buildPosContext(text);

  const perRuleMatches = PARAMEDIC_RULES.map(rule => ({
    rule,
    matches: collectMatches(rule, text, ctx),
  }));

  const stats = perRuleMatches.map(({ rule, matches }) => {
    const wordCounts = {};
    matches.forEach(m => {
      const w = m.text.toLowerCase().trim();
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });
    return { name: rule.name, count: matches.length, cls: rule.cls, wordCounts };
  });

  const sentenceTexts = text
    .split(/(?<=[.!?])\s+|(?<=\n)\s*/)
    .filter(s => s.trim().length > 0);
  const sentences = sentenceTexts.map(sText => ({
    text: sText,
    stats: PARAMEDIC_RULES.map(rule => ({
      name: rule.name,
      count: collectMatches(rule, sText, ctx).length,
      cls: rule.cls,
    })),
  }));

  // Flatten spans; dedup overlaps, prefer longer match at the same position
  const spans = [];
  perRuleMatches.forEach(({ rule, matches }) => {
    matches.forEach(m => {
      spans.push({ start: m.index, end: m.index + m.text.length, cls: rule.cls, text: m.text });
    });
  });
  spans.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const filtered = [];
  for (const s of spans) {
    if (!filtered.some(u => s.start < u.end && s.end > u.start)) filtered.push(s);
  }

  let html = '';
  let cursor = 0;
  for (const s of filtered) {
    html += escapeHtml(text.slice(cursor, s.start));
    html += `<mark class="${s.cls}">${escapeHtml(s.text)}</mark>`;
    cursor = s.end;
  }
  html += escapeHtml(text.slice(cursor));
  html = html.replace(/\n/g, '<br>') + '\n';

  // Inter-sentence flow flags
  const flowFlags = computeFlowFlags(sentences.map(s => s.text));
  sentences.forEach((s, i) => {
    s.stats.push({ name: FLOW_RULE.name, count: flowFlags[i] ? 1 : 0, cls: FLOW_RULE.cls });
  });
  const flowTotal = flowFlags.filter(Boolean).length;
  stats.push({ name: FLOW_RULE.name, count: flowTotal, cls: FLOW_RULE.cls, wordCounts: {} });

  return { html, stats, sentences };
}

export { escapeHtml };
