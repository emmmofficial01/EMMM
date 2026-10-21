/* EMMM Phase 6: Decap CMS live content bridge. */
(async () => {
  'use strict';
  let data;
  try {
    const response = await fetch('/site-content.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Content HTTP ' + response.status);
    data = await response.json();
  } catch (error) { console.warn('EMMM CMS: existing content retained', error); return; }
  const $ = id => document.getElementById(id);
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  };
  const safeLink = value => {
    if (!value) return null;
    try {
      const url = new URL(String(value), location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  };
  const safeImage = value => {
    if (typeof value !== 'string') return null;
    const path = value.trim();
    if (/^\/?assets\//i.test(path)) return '/' + path.replace(/^\//, '');
    if (/^https:\/\//i.test(path)) return path;
    return null;
  };
  const link = (text, url, cls = 'btn secondary') => {
    const href = safeLink(url);
    if (!href) return null;
    const a = node('a', cls, text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  };
  const put = (id, value) => { const el = $(id); if (el && value) el.textContent = value; };
  if (document.body.dataset.page === 'home') {
    if (data.announcement) {
      const track = $('headline-track');
      if (track) {
        track.replaceChildren();
        for (let i = 0; i < 2; i++) track.append(node('span', '', data.announcement + ' · ' + data.announcement + ' · '));
      }
    }
    put('announcement-title', data.countdownTitle);
    put('announcement-description', data.announcementDescription);
    put('announcement-category', data.announcementCategory);
    put('announcement-date', data.countdownDate ? new Date(data.countdownDate).toLocaleDateString('en-CA', {month:'short', day:'numeric', timeZone:'America/Toronto'}).toUpperCase() : null);
    put('announcement-link', data.announcementButton);
    const loc = document.querySelector('#announcement-banner .announcement-side-bottom');
    if (loc && data.announcementLocation) loc.textContent = data.announcementLocation;
    const cta = $('announcement-link');
    if (cta && safeLink(data.announcementLink)) { cta.href = safeLink(data.announcementLink); cta.hidden = false; }
    if (data.countdownDate) {
      const time = Date.parse(data.countdownDate);
      if (Number.isFinite(time)) window.EMMM_CMS_COUNTDOWN_TARGET = time;
    }
  }
  function renderList(target, items, type) {
    const holder = $(target);
    if (!holder || !Array.isArray(items)) return;
    holder.replaceChildren();
    let count = 0;
    for (const item of items) {
      if (!item || !item.title) continue;
      const card = node('article', 'upgrade-card');
      const image = safeImage(item.image);
      if (image) {
        const wrap = node('div', 'flyer-wrap');
        const img = node('img'); img.src = image; img.alt = item.title; img.loading = 'lazy';
        img.style.cssText = 'width:100%;max-height:320px;object-fit:contain';
        wrap.append(img); card.append(wrap);
      }
      const body = node('div', 'upgrade-body');
      const meta = type === 'music' ? [item.type, item.year].filter(Boolean).join(' · ') :
                   type === 'events' ? [item.date, item.venue].filter(Boolean).join(' · ') : item.date;
      if (meta) body.append(node('span', 'eyebrow', meta));
      body.append(node('h3', '', item.title));
      const detail = type === 'music' ? '' : (item.description || item.artists || '');
      if (detail) body.append(node('p', '', detail));
      if (type === 'music') {
        const options = [['SPOTIFY ↗', item.spotify], ['APPLE MUSIC ↗', item.apple], ['YOUTUBE ↗', item.youtube]];
        for (const [label, url] of options) { const a = link(label, url); if (a) body.append(a); }
      } else if (type === 'events') {
        const a = link('EVENT DETAILS / TICKETS ↗', item.url);
        if (a) body.append(a);
      }
      card.append(body); holder.append(card); count++;
    }
    const section = holder.closest('.cms-section');
    if (section) section.hidden = count === 0;
  }
  renderList('cms-music', data.releases, 'music');
  renderList('cms-events', data.events, 'events');
  renderList('cms-episodes', data.episodes, 'episodes');
  if (Array.isArray(data.news)) {
    const normalized = value => String(value || '').replace(/[’']/g, "'").toUpperCase();
    for (const section of document.querySelectorAll('[data-news-brand]')) {
      const target = section.querySelector('.news-items');
      if (!target) continue;
      const items = data.news.filter(n => n && n.title && normalized(n.brand) === normalized(section.dataset.newsBrand));
      if (!items.length) continue;
      target.replaceChildren();
      for (const item of items) {
        const article = node('article');
        const a = link(item.title + ' ↗', item.url, '');
        article.append(a || node('strong', '', item.title));
        target.append(article);
      }
    }
  }
})();
