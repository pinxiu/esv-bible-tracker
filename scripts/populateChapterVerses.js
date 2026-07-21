import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const embeddedPath = path.join(__dirname, '../src/data/embeddedEsvData.json');
const initialVersesPath = path.join(__dirname, '../src/data/initialMemoryVerses.js');

const embeddedData = JSON.parse(fs.readFileSync(embeddedPath, 'utf8'));
const initialVersesContent = fs.readFileSync(initialVersesPath, 'utf8');

// Parse array from initialMemoryVerses.js
const arrayMatch = initialVersesContent.match(/export const INITIAL_MEMORY_VERSES = (\[[\s\S]*\]);/);
if (!arrayMatch) {
  console.error("Could not match INITIAL_MEMORY_VERSES array!");
  process.exit(1);
}

const verses = JSON.parse(arrayMatch[1]);

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

let updatedCount = 0;

verses.forEach(v => {
  if (v.reference && (v.reference.includes("(Whole Chapter)") || v.note === "Full Chapter Memorization")) {
    const cleanRef = v.reference.replace(/\s*\(Whole Chapter\)/gi, '').trim();
    v.reference = cleanRef;

    // Lookup chapter in embedded ESV dataset
    const match = cleanRef.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+)$/);
    if (match) {
      const bookCanonical = normalizeBook(match[1]);
      const chapter = match[2];

      if (embeddedData[bookCanonical] && embeddedData[bookCanonical][chapter]) {
        const chapterVerses = embeddedData[bookCanonical][chapter];
        const verseNumbers = Object.keys(chapterVerses).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        const fullChapterText = verseNumbers.map(vNum => chapterVerses[vNum].trim()).join(' ');

        if (fullChapterText && fullChapterText.length > 20) {
          v.text = fullChapterText;
          updatedCount++;
          console.log(`Updated ${cleanRef}: ${fullChapterText.substring(0, 50)}...`);
        }
      } else {
        console.warn(`Could not find embedded data for ${bookCanonical} ${chapter}`);
      }
    }
  }
});

const newContent = `export const INITIAL_MEMORY_VERSES = ${JSON.stringify(verses, null, 2)};\n`;
fs.writeFileSync(initialVersesPath, newContent, 'utf8');

console.log(`Successfully populated ${updatedCount} chapter memorization targets with actual ESV text!`);
