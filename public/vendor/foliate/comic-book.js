// Foliate.js Core - Comic Book Module (Vendored for Foliate Reader)
// Handles CBZ, CBR, and archive image collections.

export class FoliateComicBook {
  constructor(entries = []) {
    this.entries = entries; // array of image URLs or Blobs
    this.currentIndex = 0;
  }

  static async load(input) {
    if (!window.JSZip && typeof JSZip === 'undefined') {
      throw new Error('JSZip is required to unpack CBZ archives.');
    }
    const zip = await (window.JSZip || JSZip).loadAsync(input);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
    const imageFiles = [];

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        const lower = relativePath.toLowerCase();
        if (imageExtensions.some((ext) => lower.endsWith(ext)) && !lower.startsWith('__macosx')) {
          imageFiles.push(zipEntry);
        }
      }
    });

    imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const imageUrls = [];
    for (const file of imageFiles) {
      const blob = await file.async('blob');
      imageUrls.push(URL.createObjectURL(blob));
    }

    return new FoliateComicBook(imageUrls);
  }

  getTotalPages() {
    return this.entries.length;
  }

  getPage(index) {
    return this.entries[index] || null;
  }
}
