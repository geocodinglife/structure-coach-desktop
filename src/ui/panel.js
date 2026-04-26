// Mounts the main panel into a root element. Owns the editor + highlight layer + toolbar wiring.
// TODO: port openPanel/updateUI from extension content.js, swap panel-as-overlay for panel-as-window.

export function mountPanel(root) {
  if (!root) return;
  root.innerHTML = `
    <div id="sc-shell">
      <header id="sc-titlebar">Structure Coach</header>
      <main id="sc-placeholder">
        <p>Scaffold ready — modules will land here next.</p>
      </main>
    </div>
  `;
}
