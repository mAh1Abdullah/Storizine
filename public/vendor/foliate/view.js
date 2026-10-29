// Foliate.js Core - View Module (Vendored for Foliate Reader)
// Implements the <foliate-view> custom element and pagination coordinator.

import { FoliateEPUB } from './epub.js';
import { FoliateComicBook } from './comic-book.js';
import { FoliateFixedLayout } from './fixed-layout.js';

export class FoliateView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.book = null;
    this.bookType = 'text'; // 'epub' | 'pdf' | 'comic' | 'text'
    this.currentIndex = 0;
    this.totalPages = 1;
    this.percentage = 0;
    this.cfi = '';
    this.flow = 'paginated'; // 'paginated' | 'continuous'
    this.theme = {
      bg: '#fbf9ee',
      text: '#2a2724',
      fontSize: 22,
      lineHeight: 1.65,
      fontFamily: 'Merriweather',
      marginPadding: 44,
      link: '#b07843',
      selection: 'rgba(212, 163, 115, 0.35)',
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: var(--foliate-bg, #fbf9ee);
          color: var(--foliate-text, #2a2724);
          user-select: text;
        }
        #container {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        .foliate-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px var(--foliate-padding, 44px) 120px var(--foliate-padding, 44px);
          font-family: var(--foliate-font, 'Merriweather', Georgia, serif);
          font-size: var(--foliate-font-size, 22pt);
          line-height: var(--foliate-line-height, 1.65);
          transition: background-color 0.2s, color 0.2s;
        }
        .foliate-content h1 {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.8em;
          text-align: center;
          margin-bottom: 1.5em;
          color: var(--foliate-link, #b07843);
        }
        .foliate-content h2 {
          font-size: 1.3em;
          margin-top: 1.8em;
          margin-bottom: 0.8em;
          color: var(--foliate-link, #b07843);
        }
        .foliate-content p {
          margin-bottom: 1.4em;
          text-indent: 1.8em;
          text-align: justify;
          hyphens: auto;
        }
        .foliate-content p:first-of-type {
          text-indent: 0;
        }
        .foliate-content p:first-of-type::first-letter {
          float: left;
          font-family: 'Cinzel', serif;
          font-size: 3.2em;
          line-height: 0.8;
          padding-top: 4px;
          padding-right: 8px;
          padding-bottom: 4px;
          color: var(--foliate-link, #b07843);
          font-weight: bold;
        }
        ::selection {
          background: var(--foliate-selection, rgba(212, 163, 115, 0.35));
        }
        .foliate-highlight-yellow { background-color: rgba(251, 191, 36, 0.45); border-bottom: 2px solid #f59e0b; }
        .foliate-highlight-green { background-color: rgba(52, 211, 153, 0.45); border-bottom: 2px solid #10b981; }
        .foliate-highlight-blue { background-color: rgba(56, 189, 248, 0.45); border-bottom: 2px solid #0284c7; }
        .foliate-highlight-pink { background-color: rgba(244, 114, 182, 0.45); border-bottom: 2px solid #ec4899; }
        #comic-view {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        #comic-view img {
          max-width: 95%;
          max-height: 95%;
          object-fit: contain;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          border-radius: 4px;
        }
      </style>
      <div id="container">
        <div id="content" class="foliate-content"></div>
      </div>
    `;

    this.container = this.shadowRoot.getElementById('container');
    this.contentEl = this.shadowRoot.getElementById('content');

    // Selection listener
    this.shadowRoot.addEventListener('mouseup', this.handleSelection.bind(this));
    this.shadowRoot.addEventListener('touchend', this.handleSelection.bind(this));

    // Scroll listener for continuous progress tracking
    this.container.addEventListener('scroll', () => {
      if (this.flow === 'continuous' || this.bookType === 'text') {
        const total = this.container.scrollHeight - this.container.clientHeight;
        if (total > 0) {
          const current = this.container.scrollTop;
          this.percentage = Math.min(100, Math.round((current / total) * 100));
          this.cfi = `scroll-${Math.round(current)}`;
          this.dispatchRelocate();
        }
      }
    });
  }

  connectedCallback() {
    this.applyTheme();
  }

  setTheme(themeObj) {
    this.theme = { ...this.theme, ...themeObj };
    this.applyTheme();
  }

  applyTheme() {
    this.style.setProperty('--foliate-bg', this.theme.bg || '#fbf9ee');
    this.style.setProperty('--foliate-text', this.theme.text || '#2a2724');
    this.style.setProperty('--foliate-font-size', `${this.theme.fontSize || 22}pt`);
    this.style.setProperty('--foliate-line-height', `${this.theme.lineHeight || 1.65}`);
    this.style.setProperty('--foliate-font', `${this.theme.fontFamily || 'Merriweather'}, Georgia, serif`);
    this.style.setProperty('--foliate-padding', `${this.theme.marginPadding || 44}px`);
    this.style.setProperty('--foliate-link', this.theme.link || '#b07843');
    this.style.setProperty('--foliate-selection', this.theme.selection || 'rgba(212, 163, 115, 0.35)');
  }

  setFlow(flow) {
    this.flow = flow;
    if (flow === 'paginated') {
      this.container.style.overflowY = 'hidden';
    } else {
      this.container.style.overflowY = 'auto';
    }
  }

  async open(bookSource, type = 'text') {
    this.bookType = type;
    try {
      if (type === 'epub' && bookSource instanceof FoliateEPUB) {
        this.book = bookSource;
        this.totalPages = this.book.spine.length || 1;
        await this.renderEpubSpine(0);
      } else if (type === 'comic' && bookSource instanceof FoliateComicBook) {
        this.book = bookSource;
        this.totalPages = this.book.getTotalPages() || 1;
        this.renderComicPage(0);
      } else if (typeof bookSource === 'string') {
        this.renderTextOrMarkdown(bookSource);
      } else if (bookSource?.content) {
        this.renderTextOrMarkdown(bookSource.content, bookSource.title, bookSource.author);
      }

      this.dispatchEvent(new CustomEvent('load', {
        detail: {
          title: this.book?.metadata?.title || 'Storizine Edition',
          author: this.book?.metadata?.creator || 'Author',
          totalPages: this.totalPages,
        },
      }));
    } catch (err) {
      console.error('Foliate open error', err);
      this.dispatchEvent(new CustomEvent('renderer-error', { detail: { message: err.message } }));
    }
  }

  async renderEpubSpine(index) {
    if (!this.book || !this.book.spine[index]) return;
    this.currentIndex = index;
    const item = this.book.spine[index];
    const html = await this.book.loadSection(item.href);
    this.contentEl.innerHTML = html;
    this.container.scrollTop = 0;
    this.percentage = Math.round(((index + 1) / this.totalPages) * 100);
    this.cfi = `epubcfi(/6/${(index + 1) * 2}[${item.idref}]!/4/1:0)`;
    this.dispatchRelocate();
  }

  renderComicPage(index) {
    if (!this.book) return;
    this.currentIndex = index;
    const imageUrl = this.book.getPage(index);
    this.contentEl.innerHTML = `
      <div id="comic-view">
        <img src="${imageUrl}" alt="Page ${index + 1}" />
      </div>
    `;
    this.percentage = Math.round(((index + 1) / this.totalPages) * 100);
    this.cfi = `comic-page-${index + 1}`;
    this.dispatchRelocate();
  }

  renderTextOrMarkdown(text, title = '', author = '') {
    const paragraphs = text
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => {
        if (p.startsWith('# ')) {
          return `<h1>${p.replace('# ', '')}</h1>`;
        } else if (p.startsWith('## ')) {
          return `<h2>${p.replace('## ', '')}</h2>`;
        }
        return `<p>${p}</p>`;
      })
      .join('');

    const headingHtml = title ? `<h1>${title}</h1>` : '';
    const authorHtml = author ? `<p style="text-align:center; font-style:italic; opacity:0.8;">By ${author}</p>` : '';

    this.contentEl.innerHTML = `${headingHtml}${authorHtml}${paragraphs}`;
    this.container.scrollTop = 0;
    this.totalPages = Math.max(1, Math.ceil(text.length / 1500));
    this.percentage = 0;
    this.cfi = 'page-1';
    this.dispatchRelocate();
  }

  next() {
    if (this.bookType === 'epub') {
      if (this.currentIndex < this.totalPages - 1) {
        this.renderEpubSpine(this.currentIndex + 1);
        return true;
      }
    } else if (this.bookType === 'comic') {
      if (this.currentIndex < this.totalPages - 1) {
        this.renderComicPage(this.currentIndex + 1);
        return true;
      }
    } else {
      const step = this.container.clientHeight * 0.85;
      this.container.scrollBy({ top: step, behavior: 'smooth' });
      return true;
    }
    return false;
  }

  prev() {
    if (this.bookType === 'epub') {
      if (this.currentIndex > 0) {
        this.renderEpubSpine(this.currentIndex - 1);
        return true;
      }
    } else if (this.bookType === 'comic') {
      if (this.currentIndex > 0) {
        this.renderComicPage(this.currentIndex - 1);
        return true;
      }
    } else {
      const step = this.container.clientHeight * 0.85;
      this.container.scrollBy({ top: -step, behavior: 'smooth' });
      return true;
    }
    return false;
  }

  goTo(target) {
    if (typeof target === 'number') {
      if (target >= 0 && target <= 100) {
        // Percentage jump
        const maxScroll = this.container.scrollHeight - this.container.clientHeight;
        this.container.scrollTo({ top: (target / 100) * maxScroll, behavior: 'smooth' });
      }
    } else if (typeof target === 'string') {
      if (target.startsWith('scroll-')) {
        const top = parseInt(target.replace('scroll-', ''), 10);
        if (!isNaN(top)) this.container.scrollTo({ top, behavior: 'smooth' });
      } else if (target.startsWith('comic-page-')) {
        const page = parseInt(target.replace('comic-page-', ''), 10) - 1;
        if (!isNaN(page)) this.renderComicPage(page);
      }
    }
  }

  handleSelection() {
    const sel = this.shadowRoot.getSelection ? this.shadowRoot.getSelection() : window.getSelection();
    const str = sel?.toString().trim();
    if (!str || str.length === 0) return;

    const range = sel?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();

    this.dispatchEvent(new CustomEvent('select', {
      detail: {
        text: str,
        cfiRange: `sel-${Date.now()}`,
        rect: rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null,
      },
    }));
  }

  dispatchRelocate() {
    this.dispatchEvent(new CustomEvent('relocate', {
      detail: {
        cfi: this.cfi,
        percentage: this.percentage,
        page: this.currentIndex + 1,
        totalPages: this.totalPages,
      },
    }));
  }
}

if (!customElements.get('foliate-view')) {
  customElements.define('foliate-view', FoliateView);
}
