// Movement intent bar — Move Up / Down / Wide (UX slice 3).

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
    });
  }
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
  if (hint && show && !selectedMove) {
    hint.textContent = 'What should your next sentence do?';
  }
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

export function getSelectedMove() {
  return selectedMove;
}
