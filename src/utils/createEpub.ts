import JSZip from 'jszip';

export interface EpubChapter {
  title: string;
  content: string;
}

export async function createEpubBlob(title: string, author: string, chapters: EpubChapter[]): Promise<ArrayBuffer> {
  const zip = new JSZip();

  // 1. mimetype (must be uncompressed and first file in zip according to EPUB spec)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.folder('META-INF')!.file(
    'container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const oebps = zip.folder('OEBPS')!;

  // 3. CSS stylesheet
  oebps.file(
    'stylesheet.css',
    `body {
  font-family: Merriweather, Georgia, serif;
  line-height: 1.6;
  padding: 1rem 2rem;
  margin: 0 auto;
  max-width: 800px;
}
h1, h2, h3 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}
p {
  margin-bottom: 1.25rem;
  text-indent: 1.5em;
}
p.no-indent {
  text-indent: 0;
}
.chapter-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ebd9c5;
}
.author {
  font-style: italic;
  opacity: 0.8;
}`
  );

  // Generate chapters HTML
  let manifestItems = `
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="stylesheet.css" media-type="text/css"/>`;
  let spineItems = '';
  let navPoints = '';

  chapters.forEach((ch, idx) => {
    const filename = `chapter_${idx + 1}.xhtml`;
    const paragraphs = ch.content
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, pIdx) => `<p class="${pIdx === 0 ? 'no-indent' : ''}">${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
      .join('\n');

    const chapterHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
<head>
  <title>${ch.title}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <div class="chapter-header">
    <h2>${ch.title}</h2>
    <div class="author">${author}</div>
  </div>
  <div class="chapter-body">
    ${paragraphs}
  </div>
</body>
</html>`;

    oebps.file(filename, chapterHtml);

    manifestItems += `\n    <item id="ch${idx + 1}" href="${filename}" media-type="application/xhtml+xml"/>`;
    spineItems += `\n    <itemref idref="ch${idx + 1}"/>`;
    navPoints += `\n    <navPoint id="np${idx + 1}" playOrder="${idx + 1}">
      <navLabel><text>${ch.title}</text></navLabel>
      <content src="${filename}"/>
    </navPoint>`;
  });

  // 4. content.opf
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title.replace(/&/g, '&amp;')}</dc:title>
    <dc:creator>${author.replace(/&/g, '&amp;')}</dc:creator>
    <dc:identifier id="BookID">urn:uuid:storizine-${Date.now()}</dc:identifier>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>${manifestItems}
  </manifest>
  <spine toc="ncx">${spineItems}
  </spine>
</package>`;

  oebps.file('content.opf', contentOpf);

  // 5. toc.ncx
  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:storizine-${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${title.replace(/&/g, '&amp;')}</text></docTitle>
  <navMap>${navPoints}
  </navMap>
</ncx>`;

  oebps.file('toc.ncx', tocNcx);

  return await zip.generateAsync({ type: 'arraybuffer' });
}
