/* haome525 Navigation — nav.js */
(function() {
  'use strict';

  let DATA = { categories: [], sites: [] };
  let currentCat = 'all';
  let searchEngine = 'local';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  async function init() {
    try {
      const res = await fetch('data.json');
      DATA = await res.json();
    } catch (e) {
      console.error('Failed to load data.json', e);
      return;
    }
    renderCatBar();
    renderGrid();
    bindEvents();
  }

  function renderCatBar() {
    const bar = $('#catBar');
    let html = '<button class="cat-btn active" data-cat="all">全部</button>';
    DATA.categories.forEach(c => {
      html += `<button class="cat-btn" data-cat="${c.id}">${c.icon} ${c.name}</button>`;
    });
    bar.innerHTML = html;
  }

  function getSites() {
    let sites = DATA.sites;
    if (currentCat !== 'all') {
      sites = sites.filter(s => s.cat === currentCat);
    }
    const q = $('#searchInput').value.trim().toLowerCase();
    if (q) {
      sites = sites.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return sites;
  }

  function renderGrid() {
    const sites = getSites();
    const grid = $('#grid');
    const empty = $('#empty');
    const stats = $('#stats');

    if (sites.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      stats.textContent = '';
      return;
    }

    empty.style.display = 'none';
    const total = DATA.sites.length;
    stats.textContent = currentCat === 'all'
      ? `共 ${total} 个工具，当前显示 ${sites.length} 个`
      : `当前分类 ${sites.length} 个工具`;

    grid.innerHTML = sites.map((s, i) => `
      <a class="card" href="${s.url}" target="_blank" rel="noopener" style="animation-delay:${i * 30}ms">
        <div class="card-icon">${s.icon}</div>
        <div class="card-name">${s.name}</div>
        <div class="card-desc">${s.desc}</div>
        <div class="card-tags">
          ${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          ${s.hot ? '<span class="tag" style="background:var(--accent);color:#fff">HOT</span>' : ''}
        </div>
      </a>
    `).join('');
  }

  function bindEvents() {
    $('#catBar').addEventListener('click', e => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;
      $$('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      renderGrid();
    });

    let debounce;
    $('#searchInput').addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (searchEngine === 'local') {
          renderGrid();
        }
      }, 200);
    });

    $('#searchInput').addEventListener('keydown', e => {
      if (e.key === 'Enter' && searchEngine !== 'local') {
        const q = $('#searchInput').value.trim();
        if (!q) return;
        const urls = { bing: 'https://www.bing.com/search?q=', google: 'https://www.google.com/search?q=' };
        window.open(urls[searchEngine] + encodeURIComponent(q), '_blank');
      }
    });

    $$('.engine-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.engine-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        searchEngine = btn.dataset.engine;
        if (searchEngine === 'local') {
          renderGrid();
        }
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        $('#searchInput').focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
