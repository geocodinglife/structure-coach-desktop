import { mountPanel } from './ui/panel.js';

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('sc-root');
  mountPanel(root);
});
