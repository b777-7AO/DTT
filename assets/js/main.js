/* DTT · shared behaviour: partial includes, navigation, footer year */

(function () {
  // ---- Include header/footer partials -------------------------------------
  // Each page sets data-root ("" at root, "../" one level deep) so links inside
  // the shared partials resolve correctly regardless of folder depth.
  async function includePartials() {
    const slots = document.querySelectorAll('[data-include]');
    await Promise.all([...slots].map(async (slot) => {
      const url = slot.getAttribute('data-include');
      const root = slot.getAttribute('data-root') || '';
      try {
        const res = await fetch(url);
        let html = await res.text();
        if (root) html = rewriteLinks(html, root);
        slot.outerHTML = html;
      } catch (e) {
        console.error('Include failed:', url, e);
      }
    }));
    afterInclude();
  }

  // Prepend the root prefix to relative href/src (skip absolute, anchor, mailto, tel).
  function rewriteLinks(html, root) {
    return html.replace(/(href|src)="([^"]*)"/g, (m, attr, val) => {
      if (/^(https?:|#|mailto:|tel:|\/)/.test(val)) return m;
      return `${attr}="${root}${val}"`;
    });
  }

  function afterInclude() {
    // Mobile nav toggle
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
    // Header shadow once the page is scrolled
    const header = document.querySelector('header.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    // Mark the current top-level nav item
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav.main-nav > ul > li > a').forEach((a) => {
      const target = (a.getAttribute('href') || '').split('/').pop().split('#')[0];
      if (target && target === here && !a.getAttribute('href').includes('#')) a.parentElement.classList.add('active');
    });
    // Current year in footer
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', includePartials);
})();
