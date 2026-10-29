// Foliate.js Core - Fixed Layout Module (Vendored for Foliate Reader)
// Handles fixed dimensions, viewports, spreads, and paginated coordinate transforms.

export class FoliateFixedLayout {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      spread: options.spread || 'auto', // 'auto' | 'none' | 'both'
      margin: options.margin || 20,
      ...options,
    };
    this.currentSpread = 0;
    this.pages = [];
  }

  setPages(pages) {
    this.pages = pages;
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.overflow = 'hidden';

    const page = this.pages[this.currentSpread];
    if (page) {
      const pageEl = document.createElement('div');
      pageEl.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
      pageEl.style.borderRadius = '4px';
      pageEl.style.maxWidth = '90%';
      pageEl.style.maxHeight = '90%';
      pageEl.style.overflow = 'hidden';

      if (typeof page === 'string') {
        pageEl.innerHTML = page;
      } else if (page instanceof HTMLElement) {
        pageEl.appendChild(page);
      }
      wrapper.appendChild(pageEl);
    }
    this.container.appendChild(wrapper);
  }

  next() {
    if (this.currentSpread < this.pages.length - 1) {
      this.currentSpread++;
      this.render();
      return true;
    }
    return false;
  }

  prev() {
    if (this.currentSpread > 0) {
      this.currentSpread--;
      this.render();
      return true;
    }
    return false;
  }

  goTo(index) {
    if (index >= 0 && index < this.pages.length) {
      this.currentSpread = index;
      this.render();
      return true;
    }
    return false;
  }
}
