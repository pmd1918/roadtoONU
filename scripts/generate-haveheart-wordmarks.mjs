#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import * as fontkit from 'fontkit';

const cwd = process.cwd();
const fontPath = path.join(cwd, 'public/fonts/HaveHeart-subset.woff2');

const outputs = [
  {
    text: 'All Roads Lead to Ada',
    outputPath: path.join(cwd, 'public/images/wordmarks/all-roads-lead-to-ada.svg'),
  },
  {
    text: '100 Years of Brotherhood',
    outputPath: path.join(cwd, 'public/images/wordmarks/100-years-of-brotherhood.svg'),
  },
];

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildSvg(font, text) {
  const run = font.layout(text);
  const glyphEntries = [];

  let penX = 0;
  let penY = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  run.glyphs.forEach((glyph, index) => {
    const pos = run.positions[index];
    const x = penX + pos.xOffset;
    const y = penY + pos.yOffset;
    const bbox = glyph.bbox;
    const d = glyph.path.toSVG();

    glyphEntries.push({ d, x, y });

    if (bbox) {
      minX = Math.min(minX, x + bbox.minX);
      minY = Math.min(minY, y + bbox.minY);
      maxX = Math.max(maxX, x + bbox.maxX);
      maxY = Math.max(maxY, y + bbox.maxY);
    }

    penX += pos.xAdvance;
    penY += pos.yAdvance;
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    throw new Error(`Could not compute bounds for "${text}"`);
  }

  const width = Math.max(1, Math.ceil(maxX - minX));
  const height = Math.max(1, Math.ceil(maxY - minY));

  const paths = glyphEntries
    .map((entry) => {
      const tx = entry.x - minX;
      const ty = maxY - entry.y;
      return `<path d="${entry.d}" transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(1 -1)" />`;
    })
    .join('\n    ');

  const label = escapeXml(text);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title">
  <title id="title">${label}</title>
  <g fill="currentColor">
    ${paths}
  </g>
</svg>
`;
}

async function main() {
  const font = fontkit.openSync(fontPath);
  for (const item of outputs) {
    const svg = buildSvg(font, item.text);
    await fs.mkdir(path.dirname(item.outputPath), { recursive: true });
    await fs.writeFile(item.outputPath, svg, 'utf8');
    console.log(`Generated ${path.relative(cwd, item.outputPath)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
