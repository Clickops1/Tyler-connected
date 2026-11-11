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
