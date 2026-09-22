// Renders project cards from assets/data/projects.json into #project-grid.
// To add/remove a project: edit that JSON file only — no HTML changes needed.
// Set "hidden": true on an entry to keep it out of the grid without deleting it (e.g. unlaunched work).
fetch('assets/data/projects.json')
  .then(r => r.json())
  .then(projects => {
    const grid = document.getElementById('project-grid');
    if (!grid) return;
    grid.innerHTML = projects.filter(p => !p.hidden).map(p => {
      const image = p.image ? `<img class="card-image" src="${p.image}" alt="" loading="lazy">` : '';
      const tags = (p.tags || []).map(t => `<span class="tag-chip">${t}</span>`).join('');
      const link = p.link ? `<a href="${p.link.url}" class="card-link">${p.link.label} →</a>` : '';
      return `<article class="card card--${p.category}">
        ${image}
        <span class="card-tag">${p.tag}</span>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-desc">${p.description}</p>
        <div class="tag-row">${tags}</div>
        ${link}
      </article>`;
    }).join('');
  })
  .catch(err => console.error('Could not load projects.json', err));
