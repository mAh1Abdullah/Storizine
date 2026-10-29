// Foliate.js Core - EPUB Module (Vendored for Foliate Reader)
// Handles container.xml, OPF packaging, manifest, spine items, and CFI resolution.

export class FoliateEPUB {
  constructor(zipInstance) {
    this.zip = zipInstance;
    this.metadata = {};
    this.manifest = new Map();
    this.spine = [];
    this.toc = [];
    this.rootFileDir = '';
  }

  static async load(input) {
    let zip;
    if (window.JSZip) {
      zip = await window.JSZip.loadAsync(input);
    } else if (typeof JSZip !== 'undefined') {
      zip = await JSZip.loadAsync(input);
    } else {
      throw new Error('JSZip is required to parse EPUB binaries.');
    }

    const epub = new FoliateEPUB(zip);
    await epub.init();
    return epub;
  }

  async init() {
    // 1. Read META-INF/container.xml
    const containerXml = await this.zip.file('META-INF/container.xml')?.async('text');
    if (!containerXml) {
      throw new Error('Invalid EPUB: Missing META-INF/container.xml');
    }

    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'application/xml');
    const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
    if (!rootfilePath) {
      throw new Error('Invalid EPUB: No rootfile in container.xml');
    }

    this.rootFilePath = rootfilePath;
    const lastSlash = rootfilePath.lastIndexOf('/');
    this.rootFileDir = lastSlash >= 0 ? rootfilePath.substring(0, lastSlash + 1) : '';

    // 2. Read OPF
    const opfXml = await this.zip.file(rootfilePath)?.async('text');
    if (!opfXml) {
      throw new Error(`Invalid EPUB: Missing OPF file at ${rootfilePath}`);
    }

    const opfDoc = parser.parseFromString(opfXml, 'application/xml');
    this.parseMetadata(opfDoc);
    this.parseManifest(opfDoc);
    this.parseSpine(opfDoc);
    await this.parseTOC(opfDoc);
  }

  parseMetadata(doc) {
    const meta = doc.querySelector('metadata');
    if (!meta) return;

    this.metadata = {
      title: meta.querySelector('title')?.textContent?.trim() || 'Untitled',
      creator: meta.querySelector('creator')?.textContent?.trim() || 'Unknown Author',
      language: meta.querySelector('language')?.textContent?.trim() || 'en',
      publisher: meta.querySelector('publisher')?.textContent?.trim() || '',
      identifier: meta.querySelector('identifier')?.textContent?.trim() || '',
      description: meta.querySelector('description')?.textContent?.trim() || '',
    };
  }

  parseManifest(doc) {
    const items = doc.querySelectorAll('manifest > item');
    for (const item of items) {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');
      if (id && href) {
        this.manifest.set(id, {
          id,
          href: this.resolvePath(href),
          mediaType,
        });
      }
    }
  }

  parseSpine(doc) {
    const spineItems = doc.querySelectorAll('spine > itemref');
    for (const item of spineItems) {
      const idref = item.getAttribute('idref');
      const linear = item.getAttribute('linear') !== 'no';
      const manifestItem = this.manifest.get(idref);
      if (manifestItem) {
        this.spine.push({
          idref,
          href: manifestItem.href,
          linear,
        });
      }
    }
  }

  async parseTOC(opfDoc) {
    // Check EPUB 3 Navigation Document first
    let navItem = Array.from(this.manifest.values()).find(
      (item) => item.mediaType === 'application/xhtml+xml' && item.id.toLowerCase().includes('nav')
    );

    if (navItem) {
      const navHtml = await this.zip.file(navItem.href)?.async('text');
      if (navHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(navHtml, 'application/xhtml+xml');
        const links = doc.querySelectorAll('nav[epub\\:type="toc"] ol li a, nav#toc ol li a');
        for (const link of links) {
          const href = link.getAttribute('href');
          const title = link.textContent?.trim();
          if (href && title) {
            this.toc.push({ title, href: this.resolvePath(href, navItem.href) });
          }
        }
      }
    }

    // Fallback to EPUB 2 NCX
    if (this.toc.length === 0) {
      const ncxItem = Array.from(this.manifest.values()).find(
        (item) => item.mediaType === 'application/x-dtbncx+xml' || item.id === 'ncx'
      );
      if (ncxItem) {
        const ncxXml = await this.zip.file(ncxItem.href)?.async('text');
        if (ncxXml) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(ncxXml, 'application/xml');
          const navPoints = doc.querySelectorAll('navPoint');
          for (const np of navPoints) {
            const title = np.querySelector('text')?.textContent?.trim();
            const src = np.querySelector('content')?.getAttribute('src');
            if (title && src) {
              this.toc.push({ title, href: this.resolvePath(src, ncxItem.href) });
            }
          }
        }
      }
    }
  }

  resolvePath(relative, base = this.rootFileDir) {
    if (!relative) return '';
    if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
    const parts = (base.endsWith('/') ? base : base + '/').split('/').filter(Boolean);
    parts.pop(); // remove current file name
    const relParts = relative.split('/');
    for (const p of relParts) {
      if (p === '.' || !p) continue;
      if (p === '..') parts.pop();
      else parts.push(p);
    }
    return parts.join('/');
  }

  async loadSection(href) {
    const file = this.zip.file(href);
    if (!file) {
      throw new Error(`Section not found: ${href}`);
    }
    const html = await file.async('text');
    return html;
  }
}
