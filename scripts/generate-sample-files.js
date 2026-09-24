import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function createSampleEpub() {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.folder('META-INF').file(
    'container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const oebps = zip.folder('OEBPS');
  oebps.file(
    'stylesheet.css',
    `body { font-family: Merriweather, Georgia, serif; line-height: 1.8; padding: 2rem; color: #2a2724; }
     h1 { text-align: center; color: #b07843; margin-bottom: 2rem; }
     p { margin-bottom: 1.25rem; text-indent: 1.5em; }`
  );

  oebps.file(
    'ch1.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter 1: The Library of Alexandria</title><link rel="stylesheet" type="text/css" href="stylesheet.css"/></head>
<body>
  <h1>Chapter 1: The Forgotten Manuscript</h1>
  <p>The dawn spilled amber light across the weathered stones of the ancient scriptorium. Scholars in deep contemplation walked through corridors lined with millions of parchment scrolls.</p>
  <p>Evelyn traced her fingertips across the embossed leather binding. Within these leaves lay secrets older than empires, waiting for a reader with the patience to unlock them.</p>
</body>
</html>`
  );

  oebps.file(
    'content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Sample Storizine Edition</dc:title>
    <dc:creator>Evelyn Vance</dc:creator>
    <dc:identifier id="pub-id">urn:uuid:storizine-sample-1</dc:identifier>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="style" href="stylesheet.css" media-type="text/css"/>
    <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="toc" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="toc">
    <itemref idref="ch1"/>
  </spine>
</package>`
  );

  oebps.file(
    'toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="urn:uuid:storizine-sample-1"/></head>
  <docTitle><text>Sample Storizine Edition</text></docTitle>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel><text>Chapter 1: The Forgotten Manuscript</text></navLabel>
      <content src="ch1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`
  );

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(publicDir, 'sample.epub'), buffer);
  console.log('sample.epub generated');
}

// Generate minimal valid PDF
function createSamplePdf() {
  // A minimal valid single-page PDF binary
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 24 Tf
100 700 Td
(Storizine Collector PDF Reader) Tj
0 -40 Td
/F1 14 Tf
(Rendered with Mozilla PDF.js layout engine.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000405 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
479
%%EOF`;

  fs.writeFileSync(path.join(publicDir, 'sample.pdf'), pdfContent);
  console.log('sample.pdf generated');
}

createSampleEpub();
createSamplePdf();
