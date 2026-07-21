import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const embeddedPath = path.join(__dirname, '../src/data/embeddedEsvData.json');
const initialVersesPath = path.join(__dirname, '../src/data/initialMemoryVerses.js');

function fixPunctuationSpacing(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/([;:,!\?])([A-Za-z])/g, '$1 $2')
    .replace(/\.([A-Z])/g, '. $1');
}

// 1. Fix embedded ESV data
let embeddedData = JSON.parse(fs.readFileSync(embeddedPath, 'utf8'));
let embeddedFixedCount = 0;

for (const book of Object.keys(embeddedData)) {
  for (const chapter of Object.keys(embeddedData[book])) {
    for (const verseNum of Object.keys(embeddedData[book][chapter])) {
      const original = embeddedData[book][chapter][verseNum];
      const fixed = fixPunctuationSpacing(original);
      if (fixed !== original) {
        embeddedFixedCount++;
        embeddedData[book][chapter][verseNum] = fixed;
      }
    }
  }
}

fs.writeFileSync(embeddedPath, JSON.stringify(embeddedData, null, 2), 'utf8');
console.log(`Fixed missing spaces in ${embeddedFixedCount} embedded ESV verses!`);

// 2. Re-populate initial memory verses with clean text and no "(Whole Chapter)"
const initialVersesContent = fs.readFileSync(initialVersesPath, 'utf8');
const arrayMatch = initialVersesContent.match(/export const INITIAL_MEMORY_VERSES = (\[[\s\S]*\]);/);
if (arrayMatch) {
  const verses = JSON.parse(arrayMatch[1]);
  let versesFixedCount = 0;

  function normalizeBook(bookRaw) {
    const b = bookRaw.trim().toLowerCase();
    if (b.startsWith("psalm") || b.startsWith("ps")) return "Psalm";
    if (b.startsWith("isaiah") || b.startsWith("isa")) return "Isaiah";
    if (b.startsWith("matthew") || b.startsWith("mat")) return "Matthew";
    if (b.startsWith("john")) return "John";
    if (b.startsWith("romans") || b.startsWith("rom")) return "Romans";
    if (b.includes("1 cor")) return "1 Corinthians";
    if (b.includes("2 cor")) return "2 Corinthians";
    if (b.startsWith("philippians") || b.startsWith("phil")) return "Philippians";
    if (b.startsWith("hebrews") || b.startsWith("heb")) return "Hebrews";
    return bookRaw.trim();
  }

  verses.forEach(v => {
    let text = fixPunctuationSpacing(v.text);
    let ref = v.reference ? v.reference.replace(/\s*\(Whole Chapter\)/gi, '').trim() : v.reference;
    v.reference = ref;

    if (v.note === "Full Chapter Memorization" || ref.includes("Psalm") || ref.includes("Matthew") || ref.includes("Romans") || ref.includes("1 Corinthians") || ref.includes("2 Corinthians") || ref.includes("Philippians") || ref.includes("Hebrews") || ref.includes("Isaiah") || ref.includes("John")) {
      const match = ref.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+)$/);
      if (match) {
        const bookCanonical = normalizeBook(match[1]);
        const chapter = match[2];

        if (embeddedData[bookCanonical] && embeddedData[bookCanonical][chapter]) {
          const chapterVerses = embeddedData[bookCanonical][chapter];
          const verseNumbers = Object.keys(chapterVerses).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
          text = verseNumbers.map(vNum => chapterVerses[vNum].trim()).join(' ');
        }
      }
    }
    v.text = text;
    versesFixedCount++;
  });

  const newContent = `export const INITIAL_MEMORY_VERSES = ${JSON.stringify(verses, null, 2)};\n`;
  fs.writeFileSync(initialVersesPath, newContent, 'utf8');
  console.log(`Updated ${versesFixedCount} initial memory verses!`);
}
