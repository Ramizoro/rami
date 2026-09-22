// Shared nav injection + theme toggle + particle background. Include on every page after config.js.
// One icon per nav label — add an entry here when a new nav link needs one.
const NAV_ICONS = {
  Home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  Projects: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  Research: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  Experience: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  CV: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
};
const NAV_ICON_TAG = label => `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_ICONS[label] || ''}</svg>`;
const GITHUB_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>';

document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.SITE_CONFIG;
  const saved = localStorage.getItem('rm-theme') || cfg.default_theme;
  document.documentElement.setAttribute('data-theme', saved);

  const current = document.body.getAttribute('data-page') || '';
  const links = cfg.nav_links.map(l => {
    const active = l.url.replace('.html', '') === current ? ' active' : '';
    return `<li><a href="${l.url}" class="nav-link${active}">${NAV_ICON_TAG(l.label)}<span>${l.label}</span></a></li>`;
  }).join('');

  const navEl = document.getElementById('site-nav');
  if (navEl) {
    navEl.innerHTML = `<div class="nav-inner"><ul class="nav-links">${links}</ul><a class="nav-github" href="https://github.com/${cfg.github}" target="_blank" rel="noopener" aria-label="GitHub">${GITHUB_ICON}<span>GitHub</span></a><button class="theme-toggle" id="theme-btn" aria-label="Toggle dark mode"><span id="theme-icon">${saved === 'dark' ? '☀️' : '🌙'}</span></button></div>`;
    document.getElementById('theme-btn').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('rm-theme', next);
      document.getElementById('theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
      if (window._pInit) window._pInit();
    });
  }
});

// ---- Particle background: proximity graph, mouse repel, drag a node then snap back on release ----
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas || !window.SITE_CONFIG || !window.SITE_CONFIG.particle_enabled) return;
  const ctx = canvas.getContext('2d');
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  const mouse = { x: -9999, y: -9999 };
  const MOUSE_R = 140, CONNECT_D = 180, MAX_SPD = 2.8, PICK_R = 16;
  let pts = [];
  let dragging = null;

  function init() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const cols = ['--brand', '--research', '--projects', '--work', '--teaching'].map(cssVar);
    pts = Array.from({ length: window.SITE_CONFIG.particle_count || 45 }, () => {
      const vx = (Math.random() - .5) * .45, vy = (Math.random() - .5) * .45;
      const x = Math.random() * canvas.width, y = Math.random() * canvas.height;
      return { x, y, homeX: x, homeY: y, vx, vy, baseVx: vx, baseVy: vy, r: Math.random() * 1.8 + 2.2, c: cols[Math.floor(Math.random() * cols.length)], twPhase: Math.random() * Math.PI * 2, twSpeed: 0.015 + Math.random() * 0.02 };
    });
  }
  window._pInit = init;
  init();
  window.addEventListener('resize', init);
  new MutationObserver(init).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function nodeAt(x, y) {
    let closest = null, closestD = PICK_R;
    for (const p of pts) { const d = Math.hypot(p.x - x, p.y - y); if (d < closestD) { closest = p; closestD = d; } }
    return closest;
  }
  canvas.style.pointerEvents = 'auto';
  canvas.addEventListener('pointerdown', e => {
    const hit = nodeAt(e.clientX, e.clientY);
    if (hit) { dragging = hit; canvas.style.cursor = 'grabbing'; }
  });
  window.addEventListener('pointermove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (!dragging) canvas.style.cursor = nodeAt(e.clientX, e.clientY) ? 'grab' : 'default';
    if (dragging) { dragging.x = e.clientX; dragging.y = e.clientY; }
  });
  window.addEventListener('pointerup', () => {
    if (dragging) { dragging.x = dragging.homeX; dragging.y = dragging.homeY; dragging.vx = dragging.baseVx; dragging.vy = dragging.baseVy; }
    dragging = null;
    canvas.style.cursor = 'default';
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  let t = 0;
  function tick() {
    t++;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECT_D) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = isDark ? `rgba(220,215,255,${(1 - d / CONNECT_D) * .85})` : `rgba(35,28,55,${(1 - d / CONNECT_D) * .55})`; ctx.lineWidth = isDark ? 1 : .7; ctx.stroke(); }
    }
    const mActive = mouse.x > -1000;
    if (mActive) {
      pts.forEach(p => {
        if (p === dragging) return;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) {
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(124,58,237,${(1 - d / MOUSE_R) * .55})`; ctx.lineWidth = .9; ctx.stroke();
          if (d > 0) { const f = (MOUSE_R - d) / MOUSE_R * .35; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        } else { p.vx += (p.baseVx - p.vx) * .02; p.vy += (p.baseVy - p.vy) * .02; }
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy); if (spd > MAX_SPD) { p.vx = p.vx / spd * MAX_SPD; p.vy = p.vy / spd * MAX_SPD; }
      });
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = cssVar('--brand'); ctx.globalAlpha = .7; ctx.fill(); ctx.globalAlpha = 1;
    }
    pts.forEach(p => {
      const twinkle = isDark ? 0.45 + 0.55 * Math.sin(t * p.twSpeed + p.twPhase) : 1;
      ctx.shadowColor = p.c; ctx.shadowBlur = isDark ? 10 * twinkle : 5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p === dragging ? p.r * 1.8 : p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = .92 * twinkle; ctx.fill(); ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (p !== dragging) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
    });
    requestAnimationFrame(tick);
  }
  tick();
})();
