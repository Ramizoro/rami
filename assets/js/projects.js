// Renders project cards from assets/data/projects.json into #project-grid.
// To add/remove a project: edit that JSON file only — no HTML changes needed.
// Set "hidden": true on an entry to keep it out of the grid without deleting it (e.g. unlaunched work).
// Each entry's "links" is a list of {type, url} — type picks the icon: github | paper | blog | demo.
// Leave "image" empty to fall back to a generated placeholder in the project's category color.

const LINK_ICONS = {
  github: '<path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>',
  paper: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 2v6h6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 13h8M8 17h8M8 9h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  blog: '<path d="M4 19.5V7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13.5a.5.5 0 0 1-.79.41L16 18H6a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  demo: '<path d="M14 3h7v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 14 21 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M19 14v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
};
const LINK_LABELS = { github: 'GitHub', paper: 'Paper', blog: 'Blog', demo: 'Demo' };

function linkIcon(type) {
  const viewBox = type === 'github' ? '0 0 24 24' : '0 0 24 24';
  const fill = type === 'github' ? 'currentColor' : 'none';
  return `<svg viewBox="${viewBox}" width="14" height="14" fill="${fill}" aria-hidden="true">${LINK_ICONS[type] || ''}</svg>`;
}

// No image provided: generate a simple placeholder in the project's category color instead of leaving it blank.
function placeholder(category) {
  return `<div class="card-image card-image--placeholder card--${category}">
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M8 4 4 8l4 4M16 4l4 4-4 4M14 3l-4 18" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>`;
}

fetch('assets/data/projects.json')
  .then(r => r.json())
  .then(projects => {
    const grid = document.getElementById('project-grid');
    if (!grid) return;
    grid.innerHTML = projects.filter(p => !p.hidden).map(p => {
      const image = p.image ? `<img class="card-image" src="${p.image}" alt="" loading="lazy">` : placeholder(p.category);
      const tags = (p.tags || []).map(t => `<span class="tag-chip">${t}</span>`).join('');
      const links = (p.links || []).map(l => {
        const broken = !l.url;
        return broken
          ? `<a href="#" class="card-link-icon is-broken" data-broken-label="${LINK_LABELS[l.type] || l.type}" aria-label="${LINK_LABELS[l.type] || l.type} not available yet">${linkIcon(l.type)}<span>${LINK_LABELS[l.type] || l.type}</span></a>`
          : `<a href="${l.url}" class="card-link-icon" target="_blank" rel="noopener" aria-label="${LINK_LABELS[l.type] || l.type}">${linkIcon(l.type)}<span>${LINK_LABELS[l.type] || l.type}</span></a>`;
      }).join('');
      return `<article class="card card--${p.category}">
        ${image}
        <span class="card-tag">${p.tag}</span>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-desc">${p.description}</p>
        <div class="tag-row">${tags}</div>
        <div class="card-links">${links}</div>
      </article>`;
    }).join('');
  })
  .catch(err => console.error('Could not load projects.json', err));

// Broken/not-yet-available links (empty "url") pop up a little emoji bubble instead of navigating.
document.addEventListener('click', e => {
  const link = e.target.closest('.is-broken');
  if (!link) return;
  e.preventDefault();
  const bubble = document.createElement('div');
  bubble.className = 'broken-link-bubble';
  bubble.textContent = `🚧 ${link.dataset.brokenLabel} coming soon`;
  const rect = link.getBoundingClientRect();
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top + window.scrollY - 8}px`;
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 1600);
});
