// Movement intent bar + LLM Task scaffold (Builder audience).

import { callLLM } from '../llm/client.js';

const SCAFFOLDS = {
  up: 'This matters because ___',
  down: 'Do this: ___ in ___',
  wide: 'Check whether ___ also applies to ___',
};

const HINTS = {
  up: 'Move Up — explain why, purpose, or impact.',
  down: 'Move Down — name action, location, or exact detail.',
  wide: 'Move Wide — check related cases or repeated patterns.',
  builder: 'Builder lens: Location → Target → Action → Constraint.',
  operator: 'Operator lens: Process → Bottleneck → Cause → Action.',
  business: 'Business lens: Area → Outcome → Pain → Priority.',
  reader: 'Reader lens: Frame → Point → Reason → Bridge.',
};

let selectedMove = null;
let selectedAudience = 'builder';

export function wireMovementBar() {
  const bar = document.getElementById('sc-movement-bar');
  if (!bar) return;

  bar.querySelectorAll('input[name="sc-move"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        selectedMove = radio.value;
        updateHint();
        insertScaffold(radio.value);
      }
    });
  });

  const aud = document.getElementById('sc-audience');
  if (aud) {
    aud.addEventListener('change', () => {
      selectedAudience = aud.value;
      updateHint();
      updateLlmScaffoldVisibility();
    });
  }

  document.getElementById('sc-scaffold-insert')?.addEventListener('click', insertLlmScaffold);
  document.getElementById('sc-scaffold-generate')?.addEventListener('click', generateLlmScaffold);
}

export function updateMovementBarVisibility(text) {
  const bar = document.getElementById('sc-movement-bar');
  const hint = document.getElementById('sc-movement-hint');
  if (!bar) return;
  const trimmed = text.trim();
  const show = trimmed.length > 0 && (
    (trimmed.match(/[.!?]/g)?.length >= 1) || trimmed.split(/\s+/).length >= 8
  );
  bar.hidden = !show;
  updateLlmScaffoldVisibility();
  if (hint && show && !selectedMove) {
    hint.textContent = 'What should your next sentence do?';
  }
}

function updateLlmScaffoldVisibility() {
  const block = document.getElementById('sc-llm-scaffold');
  const bar = document.getElementById('sc-movement-bar');
  if (!block || !bar) return;
  block.hidden = bar.hidden || selectedAudience !== 'builder';
}

function updateHint() {
  const hint = document.getElementById('sc-movement-hint');
  if (!hint) return;
  const moveHint = selectedMove ? HINTS[selectedMove] : 'What should your next sentence do?';
  const audHint = HINTS[selectedAudience] || '';
  hint.textContent = selectedMove ? `${moveHint} (${audHint})` : 'What should your next sentence do?';
}

function insertScaffold(move) {
  const scaffold = SCAFFOLDS[move];
  if (!scaffold) return;
  const input = document.getElementById('sc-input');
  if (!input) return;
  const prefix = input.value.length && !input.value.endsWith('\n') ? '\n' : '';
  input.value += prefix + scaffold;
  input.focus();
  const idx = input.value.indexOf('___');
  if (idx !== -1) input.setSelectionRange(idx, idx + 3);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function scaffoldFields() {
  return {
    location: document.getElementById('sc-scaffold-location')?.value.trim() || '___',
    target: document.getElementById('sc-scaffold-target')?.value.trim() || '___',
    action: document.getElementById('sc-scaffold-action')?.value.trim() || '___',
    constraint: document.getElementById('sc-scaffold-constraint')?.value.trim() || '___',
  };
}

function buildScaffoldText(f) {
  return `In ${f.location}, ${f.target} should ${f.action}. Constraint: ${f.constraint}.`;
}

function insertLlmScaffold() {
  const text = buildScaffoldText(scaffoldFields());
  const input = document.getElementById('sc-input');
  if (!input) return;
  const prefix = input.value.length && !input.value.endsWith('\n') ? '\n' : '';
  input.value += prefix + text;
  input.focus();
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function generateLlmScaffold() {
  const btn = document.getElementById('sc-scaffold-generate');
  const status = document.getElementById('sc-scaffold-status');
  const input = document.getElementById('sc-input');
  if (!input) return;

  const f = scaffoldFields();
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Generating…';
  }
  if (status) {
    status.textContent = 'AI is drafting a task sentence from your scaffold fields.';
    status.hidden = false;
  }

  try {
    const result = await callLLM({
      type: 'task-scaffold',
      text: JSON.stringify(f),
      context: input.value.slice(-500),
    });
    const prefix = input.value.length && !input.value.endsWith('\n') ? '\n' : '';
    input.value += prefix + result.trim();
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (status) status.textContent = 'Scaffold sentence inserted. Edit to match your truth.';
  } catch (err) {
    const msg = typeof err === 'string' ? err : (err?.message || String(err));
    if (status) {
      status.innerHTML = `AI unavailable: ${msg}. Use Insert scaffold or keep writing manually.`;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Generate with AI';
    }
  }
}

export function getSelectedMove() {
  return selectedMove;
}

export function getSelectedAudience() {
  return selectedAudience;
}
