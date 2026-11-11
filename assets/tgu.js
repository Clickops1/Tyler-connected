/* The Great Unknown Liquidation: small theme behaviours. Loaded with defer after Dawn's pubsub.js. */
(() => {
  // ---------- Retail-vs-our-price box: refresh when the shopper picks another variant ----------
  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
      if (!data || !data.html) return;
      const id = `TguCompare-${data.sectionId}`;
      const fresh = data.html.getElementById(id);
      const current = document.getElementById(id);
      if (fresh && current) current.innerHTML = fresh.innerHTML;
    });
  }

  // ---------- Recently viewed ----------
  const KEY = 'tgu:recently-viewed';
  const MAX = 12;

  const read = () => {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(list) ? list.filter((h) => typeof h === 'string') : [];
    } catch (e) {
      return [];
    }
  };
  const write = (list) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    } catch (e) {
      /* storage blocked: the strip simply stays hidden */
    }
  };

  const money = (cents) => {
    const currency = (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD';
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency }).format(cents / 100);
    } catch (e) {
      return `$${(cents / 100).toFixed(2)}`;
    }
  };

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const imageUrl = (src, width) => {
    if (!src) return '';
    const url = src.startsWith('//') ? `https:${src}` : src;
    return url + (url.includes('?') ? '&' : '?') + `width=${width}`;
  };

  class TguRecentlyViewed extends HTMLElement {
    connectedCallback() {
      const current = this.dataset.currentHandle;
      let list = read();
      if (current) {
        list = [current, ...list.filter((h) => h !== current)];
        write(list);
      }
      const toShow = list.filter((h) => h !== current).slice(0, Number(this.dataset.limit || 6));
      if (toShow.length === 0) return;
      this.render(toShow);
    }

    async render(handles) {
      const root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
      const results = await Promise.all(
        handles.map((h) =>
          fetch(`${root}products/${encodeURIComponent(h)}.js`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );
      const products = results.filter(Boolean);
      // Drop handles that no longer exist (deleted or unpublished products)
      const valid = new Set(products.map((p) => p.handle));
      write(read().filter((h) => valid.has(h) || h === this.dataset.currentHandle));
      if (products.length === 0) return;

      const grid = this.querySelector('[data-tgu-recent-grid]');
      grid.innerHTML = products
        .map((p) => {
          const img = p.featured_image
            ? `<img src="${escapeHtml(imageUrl(p.featured_image, 480))}" alt="${escapeHtml(p.title)}" loading="lazy" width="480" height="480">`
            : '<span class="tgu-recent__noimg" aria-hidden="true"></span>';
          const sale = p.compare_at_price && p.compare_at_price > p.price;
          const price = `<span class="tgu-recent__price">${money(p.price)}</span>${
            sale ? ` <s class="tgu-recent__was">${money(p.compare_at_price)}</s>` : ''
          }`;
          const status = p.available ? '' : `<span class="badge tgu-badge--condition tgu-recent__sold">${escapeHtml(this.dataset.soldLabel || 'Sold')}</span>`;
          return `<li class="tgu-recent__item">
              <a class="tgu-recent__link" href="${escapeHtml(p.url)}">
                <span class="tgu-recent__media">${img}${status}</span>
                <span class="tgu-recent__title">${escapeHtml(p.title)}</span>
                <span class="tgu-recent__prices">${price}</span>
              </a>
            </li>`;
        })
        .join('');
      this.hidden = false;
    }
  }
  if (!customElements.get('tgu-recently-viewed')) customElements.define('tgu-recently-viewed', TguRecentlyViewed);
})();

/* ---------- Next drop countdown ---------- */
(() => {
  class TguDropCountdown extends HTMLElement {
    connectedCallback() {
      const raw = (this.dataset.date || '').trim();
      this.target = raw ? Date.parse(raw) : NaN;
      if (Number.isNaN(this.target)) return; // no real date: no countdown
      this.nums = {};
      this.querySelectorAll('[data-unit]').forEach((el) => (this.nums[el.dataset.unit] = el));
      this.tick();
      this.timer = setInterval(() => this.tick(), 1000);
    }
    disconnectedCallback() {
      clearInterval(this.timer);
    }
    setLive(live) {
      this.querySelectorAll('[data-state-upcoming]').forEach((el) => (el.hidden = live));
      this.querySelectorAll('[data-state-live]').forEach((el) => (el.hidden = !live));
    }
    tick() {
      let s = Math.max(0, Math.floor((this.target - Date.now()) / 1000));
      if (s === 0) {
        this.setLive(true);
        clearInterval(this.timer);
        return;
      }
      this.setLive(false);
      const parts = { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
      for (const [k, v] of Object.entries(parts)) {
        const el = this.nums[k];
        if (!el) continue;
        const text = String(v).padStart(2, '0');
        if (el.textContent !== text) {
          el.textContent = text;
          el.classList.remove('is-flipping');
          void el.offsetWidth;
          el.classList.add('is-flipping');
        }
      }
    }
  }
  if (!customElements.get('tgu-drop-countdown')) customElements.define('tgu-drop-countdown', TguDropCountdown);
})();

/* ---------- Finds videos: play muted only while on screen ---------- */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const init = () => {
    const videos = document.querySelectorAll('.tgu-reel__video, .tgu-hero__video');
    if (!videos.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting && !reduce) v.play().catch(() => {});
        else v.pause();
      }),
      { threshold: 0.35 }
    );
    videos.forEach((v) => { v.muted = true; io.observe(v); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ---------- Mystery box reveal ---------- */
(() => {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tgu-reveal]');
    if (!btn) return;
    const box = btn.closest('.tgu-teaser__art');
    const open = box.classList.toggle('is-open');
    btn.setAttribute('aria-pressed', open ? 'true' : 'false');
    btn.textContent = open ? btn.dataset.closeLabel : btn.dataset.openLabel;
  });
})();

/* ---------- FAQ: live search + current-topic highlight ---------- */
(() => {
  class TguFaq extends HTMLElement {
    connectedCallback() {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
      else this.init();
    }
    init() {
      this.items = [...this.querySelectorAll('[data-faq-item]')];
      this.groups = [...this.querySelectorAll('[data-faq-group]')];
      this.empty = this.querySelector('[data-faq-empty]');
      this.querySelectorAll('[data-faq-search]').forEach((input) =>
        input.addEventListener('input', () => this.filter(input.value))
      );
      this.links = [...this.querySelectorAll('[data-faq-link]')];
      if (this.links.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => entries.forEach((e) => {
            if (!e.isIntersecting) return;
            this.links.forEach((l) => l.toggleAttribute('aria-current', l.getAttribute('href') === `#${e.target.id}`));
          }),
          { rootMargin: '-30% 0px -60% 0px' }
        );
        this.groups.filter((g) => g.id).forEach((g) => io.observe(g));
      }
      // Open a question linked directly, e.g. /pages/faq#faq-visiting
      if (location.hash) {
        const target = this.querySelector(location.hash.replace(/[^#\w-]/g, ''));
        const first = target && target.querySelector('details');
        if (first) first.open = true;
      }
    }
    filter(raw) {
      const q = raw.trim().toLowerCase();
      let shown = 0;
      this.items.forEach((item) => {
        const match = !q || item.textContent.toLowerCase().includes(q);
        item.hidden = !match;
        if (match) shown += 1;
        if (q && match) item.open = true;
        if (!q) item.open = false;
      });
      this.groups.forEach((g) => {
        g.hidden = !g.querySelector('[data-faq-item]:not([hidden])');
      });
      if (this.empty) this.empty.hidden = shown > 0;
    }
  }
  if (!customElements.get('tgu-faq')) customElements.define('tgu-faq', TguFaq);
})();
