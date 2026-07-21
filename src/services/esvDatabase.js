import embeddedData from '../data/embeddedEsvData.json';
import { cleanScriptureText } from '../utils/textNormalizer';

/**
 * Embedded ESV Database Manager
 * Loads embedded ESV dataset directly without requiring file uploads.
 */

class ESVDatabase {
  constructor() {
    this.verseMap = new Map();
    this.initEmbeddedData();
  }

  initEmbeddedData() {
    let count = 0;
    if (embeddedData && typeof embeddedData === 'object') {
      for (const book in embeddedData) {
        for (const ch in embeddedData[book]) {
          for (const v in embeddedData[book][ch]) {
            const rawText = embeddedData[book][ch][v];
            if (typeof rawText === 'string') {
              const text = cleanScriptureText(rawText);
              const cleanBook = book.trim();
              const key = `${cleanBook} ${ch}:${v}`.toLowerCase();
              this.verseMap.set(key, text.trim());
              count++;
            }
          }
        }
      }
    }
    console.log(`Loaded ${count} embedded ESV verses into memory!`);
  }

  getVerseCount() {
    return this.verseMap.size;
  }

  hasData() {
    return this.verseMap.size > 0;
  }

  /**
   * Normalizes book names (e.g. "Gen" -> "Genesis", "Ps" -> "Psalm", "Rom" -> "Romans")
   */
  normalizeBookName(bookRaw) {
    if (!bookRaw) return "";
    const b = bookRaw.trim().toLowerCase();
    
    if (b.startsWith("gen")) return "Genesis";
    if (b.startsWith("ex")) return "Exodus";
    if (b.startsWith("lev")) return "Leviticus";
    if (b.startsWith("num")) return "Numbers";
    if (b.startsWith("deut")) return "Deuteronomy";
    if (b.startsWith("josh")) return "Joshua";
    if (b.startsWith("judg")) return "Judges";
    if (b.startsWith("ruth")) return "Ruth";
    if (b.includes("1 sam") || b.includes("1 sa")) return "1 Samuel";
    if (b.includes("2 sam") || b.includes("2 sa")) return "2 Samuel";
    if (b.includes("1 kin") || b.includes("1 ki")) return "1 Kings";
    if (b.includes("2 kin") || b.includes("2 ki")) return "2 Kings";
    if (b.includes("1 chr") || b.includes("1 chron")) return "1 Chronicles";
    if (b.includes("2 chr") || b.includes("2 chron")) return "2 Chronicles";
    if (b.startsWith("ezr")) return "Ezra";
    if (b.startsWith("neh")) return "Nehemiah";
    if (b.startsWith("est")) return "Esther";
    if (b.startsWith("job")) return "Job";
    if (b.startsWith("ps")) return "Psalm";
    if (b.startsWith("prov")) return "Proverbs";
    if (b.startsWith("eccl")) return "Ecclesiastes";
    if (b.startsWith("song")) return "Song of Solomon";
    if (b.startsWith("isa")) return "Isaiah";
    if (b.startsWith("jer")) return "Jeremiah";
    if (b.startsWith("lam")) return "Lamentations";
    if (b.startsWith("ezek")) return "Ezekiel";
    if (b.startsWith("dan")) return "Daniel";
    if (b.startsWith("hos")) return "Hosea";
    if (b.startsWith("joel")) return "Joel";
    if (b.startsWith("amos")) return "Amos";
    if (b.startsWith("obad")) return "Obadiah";
    if (b.startsWith("jon")) return "Jonah";
    if (b.startsWith("mic")) return "Micah";
    if (b.startsWith("nah")) return "Nahum";
    if (b.startsWith("hab")) return "Habakkuk";
    if (b.startsWith("zeph")) return "Zephaniah";
    if (b.startsWith("hag")) return "Haggai";
    if (b.startsWith("zech")) return "Zechariah";
    if (b.startsWith("mal")) return "Malachi";
    if (b.startsWith("mat")) return "Matthew";
    if (b.startsWith("mark") || b.startsWith("mk")) return "Mark";
    if (b.startsWith("luke") || b.startsWith("lk")) return "Luke";
    if (b.startsWith("john") || b.startsWith("jn")) return "John";
    if (b.startsWith("act")) return "Acts";
    if (b.startsWith("rom")) return "Romans";
    if (b.includes("1 cor")) return "1 Corinthians";
    if (b.includes("2 cor")) return "2 Corinthians";
    if (b.startsWith("gal")) return "Galatians";
    if (b.startsWith("eph")) return "Ephesians";
    if (b.startsWith("phil")) return "Philippians";
    if (b.startsWith("col")) return "Colossians";
    if (b.includes("1 thess")) return "1 Thessalonians";
    if (b.includes("2 thess")) return "2 Thessalonians";
    if (b.includes("1 tim")) return "1 Timothy";
    if (b.includes("2 tim")) return "2 Timothy";
    if (b.startsWith("tit")) return "Titus";
    if (b.startsWith("philem")) return "Philemon";
    if (b.startsWith("heb")) return "Hebrews";
    if (b.startsWith("jas") || b.startsWith("james")) return "James";
    if (b.includes("1 pet")) return "1 Peter";
    if (b.includes("2 pet")) return "2 Peter";
    if (b.includes("1 jn") || b.includes("1 john")) return "1 John";
    if (b.includes("2 jn") || b.includes("2 john")) return "2 John";
    if (b.includes("3 jn") || b.includes("3 john")) return "3 John";
    if (b.startsWith("jude")) return "Jude";
    if (b.startsWith("rev")) return "Revelation";

    return bookRaw.trim();
  }

  /**
   * Looks up a passage reference in embedded ESV data and formats rich HTML with chapter & verse numbers in paragraph blocks
   */
  lookupPassage(passageRef) {
    if (!this.hasData() || !passageRef) return null;

    const cleanRef = passageRef.trim();

    // 1. Direct exact single verse lookup (e.g. "John 3:16" or "Gen 1:1")
    const singleMatch = cleanRef.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+):(\d+)$/);
    if (singleMatch) {
      const bookRaw = singleMatch[1];
      const bookCanonical = this.normalizeBookName(bookRaw);
      const chapter = singleMatch[2];
      const v = singleMatch[3];

      const keysToTry = [
        `${bookCanonical} ${chapter}:${v}`.toLowerCase(),
        `${bookRaw} ${chapter}:${v}`.toLowerCase(),
        cleanRef.toLowerCase()
      ];

      let verseText = null;
      for (const k of keysToTry) {
        if (this.verseMap.has(k)) {
          verseText = this.verseMap.get(k);
          break;
        }
      }

      if (verseText) {
        const html = `<div class="esv-biblegateway-passage font-serif text-lg leading-relaxed text-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-6">
            <h2 class="text-2xl font-bold font-serif text-amber-400">${bookCanonical} ${chapter}:${v} (ESV)</h2>
            <span class="text-xs text-slate-400 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Embedded ESV Bank</span>
          </div>
          <p class="mb-4 leading-relaxed font-serif text-slate-200">
            <span class="verse-inline inline mr-1" data-verse="${v}"><sup class="text-xs font-sans font-bold text-amber-400/90 mr-1 ml-0.5 select-none">${v}</sup>${verseText}</span>
          </p>
        </div>`;

        return {
          reference: `${bookCanonical} ${chapter}:${v}`,
          text: verseText,
          html,
          verses: [{ verseNum: v, text: verseText }],
          source: 'Embedded ESV Bank'
        };
      }
    }

    // 2. Range match (e.g. "Gen 1:1-3" or "Ps 1:1-3" or "Judges 11:20-27")
    const rangeMatch = cleanRef.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+):(\d+)-(\d+)$/);
    if (rangeMatch) {
      const bookRaw = rangeMatch[1];
      const bookCanonical = this.normalizeBookName(bookRaw);
      const chapter = rangeMatch[2];
      const startV = parseInt(rangeMatch[3], 10);
      const endV = parseInt(rangeMatch[4], 10);

      let foundVerses = [];
      let combinedText = [];

      for (let v = startV; v <= endV; v++) {
        const keysToTry = [
          `${bookCanonical} ${chapter}:${v}`.toLowerCase(),
          `${bookRaw} ${chapter}:${v}`.toLowerCase()
        ];

        let verseText = null;
        for (const k of keysToTry) {
          if (this.verseMap.has(k)) {
            verseText = this.verseMap.get(k);
            break;
          }
        }

        if (verseText) {
          foundVerses.push({ verseNum: v.toString(), text: verseText });
          combinedText.push(verseText);
        }
      }

      if (foundVerses.length > 0) {
        const verseHtml = foundVerses.map(v => 
          `<span class="verse-inline inline mr-1" data-verse="${v.verseNum}"><sup class="text-xs font-sans font-bold text-amber-400/90 mr-1 ml-0.5 select-none">${v.verseNum}</sup>${v.text}</span>`
        ).join(' ');

        const displayRef = `${bookCanonical} ${chapter}:${startV}-${endV}`;

        const html = `<div class="esv-biblegateway-passage font-serif text-lg leading-relaxed text-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-6">
            <h2 class="text-2xl font-bold font-serif text-amber-400">${displayRef} (ESV)</h2>
            <span class="text-xs text-slate-400 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Embedded ESV Bank</span>
          </div>
          <p class="mb-4 leading-relaxed font-serif text-slate-200">
            <span class="text-2xl font-bold font-sans text-amber-400 mr-2 border-b-2 border-amber-400/50 pb-0.5">${chapter}</span>
            ${verseHtml}
          </p>
        </div>`;

        return {
          reference: displayRef,
          text: combinedText.join("\n"),
          html: html,
          verses: foundVerses,
          source: 'Embedded ESV Bank'
        };
      }
    }

    // 3. Whole chapter match (e.g. "Gen 1", "Ps 1", "Ps 19", "Rom 8")
    const chapterMatch = cleanRef.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+)$/);
    if (chapterMatch) {
      const bookRaw = chapterMatch[1];
      const bookCanonical = this.normalizeBookName(bookRaw);
      const chapter = chapterMatch[2];

      let foundVerses = [];
      let combinedText = [];

      for (let v = 1; v <= 200; v++) {
        const keysToTry = [
          `${bookCanonical} ${chapter}:${v}`.toLowerCase(),
          `${bookRaw} ${chapter}:${v}`.toLowerCase()
        ];

        let verseText = null;
        for (const k of keysToTry) {
          if (this.verseMap.has(k)) {
            verseText = this.verseMap.get(k);
            break;
          }
        }

        if (verseText) {
          foundVerses.push({ verseNum: v.toString(), text: verseText });
          combinedText.push(verseText);
        } else if (v > 10 && foundVerses.length > 0) {
          const nextKeys = [
            `${bookCanonical} ${chapter}:${v+1}`.toLowerCase(),
            `${bookRaw} ${chapter}:${v+1}`.toLowerCase()
          ];
          if (!nextKeys.some(k => this.verseMap.has(k))) {
            break;
          }
        }
      }

      if (foundVerses.length > 0) {
        const verseHtml = foundVerses.map(v => 
          `<span class="verse-inline inline mr-1" data-verse="${v.verseNum}"><sup class="text-xs font-sans font-bold text-amber-400/90 mr-1 ml-0.5 select-none">${v.verseNum}</sup>${v.text}</span>`
        ).join(' ');

        const displayRef = `${bookCanonical} ${chapter}`;

        const html = `<div class="esv-biblegateway-passage font-serif text-lg leading-relaxed text-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-6">
            <h2 class="text-2xl font-bold font-serif text-amber-400">${displayRef} (ESV)</h2>
            <span class="text-xs text-slate-400 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Embedded ESV Bank</span>
          </div>
          <p class="mb-4 leading-relaxed font-serif text-slate-200">
            <span class="text-2xl font-bold font-sans text-amber-400 mr-2 border-b-2 border-amber-400/50 pb-0.5">${chapter}</span>
            ${verseHtml}
          </p>
        </div>`;

        return {
          reference: displayRef,
          text: combinedText.join("\n"),
          html: html,
          verses: foundVerses,
          source: 'Embedded ESV Bank'
        };
      }
    }

    // 4. Multi-chapter range match (e.g. "Gen 16-18", "Genesis 16-18", "Ex 1-3", "Matt 5-7")
    const multiChapterMatch = cleanRef.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+)\s*[-–—]\s*(\d+)$/);
    if (multiChapterMatch) {
      const bookRaw = multiChapterMatch[1];
      const bookCanonical = this.normalizeBookName(bookRaw);
      const startCh = parseInt(multiChapterMatch[2], 10);
      const endCh = parseInt(multiChapterMatch[3], 10);

      let foundVerses = [];
      let combinedText = [];
      let chapterBlocksHtml = [];

      for (let ch = startCh; ch <= endCh; ch++) {
        let chVerses = [];
        for (let v = 1; v <= 200; v++) {
          const keysToTry = [
            `${bookCanonical} ${ch}:${v}`.toLowerCase(),
            `${bookRaw} ${ch}:${v}`.toLowerCase()
          ];

          let verseText = null;
          for (const k of keysToTry) {
            if (this.verseMap.has(k)) {
              verseText = this.verseMap.get(k);
              break;
            }
          }

          if (verseText) {
            chVerses.push({ verseNum: v.toString(), text: verseText });
            foundVerses.push({ verseNum: `${ch}:${v}`, text: verseText });
            combinedText.push(verseText);
          } else if (v > 10 && chVerses.length > 0) {
            const nextKeys = [
              `${bookCanonical} ${ch}:${v+1}`.toLowerCase(),
              `${bookRaw} ${ch}:${v+1}`.toLowerCase()
            ];
            if (!nextKeys.some(k => this.verseMap.has(k))) {
              break;
            }
          }
        }

        if (chVerses.length > 0) {
          const chVerseHtml = chVerses.map(v => 
            `<span class="verse-inline inline mr-1" data-verse="${ch}:${v.verseNum}"><sup class="text-xs font-sans font-bold text-amber-400/90 mr-1 ml-0.5 select-none">${v.verseNum}</sup>${v.text}</span>`
          ).join(' ');

          chapterBlocksHtml.push(`
            <div class="mb-6">
              <p class="mb-4 leading-relaxed font-serif text-slate-200">
                <span class="text-2xl font-bold font-sans text-amber-400 mr-2 border-b-2 border-amber-400/50 pb-0.5">${ch}</span>
                ${chVerseHtml}
              </p>
            </div>
          `);
        }
      }

      if (foundVerses.length > 0) {
        const displayRef = `${bookCanonical} ${startCh}–${endCh}`;

        const html = `<div class="esv-biblegateway-passage font-serif text-lg leading-relaxed text-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-6">
            <h2 class="text-2xl font-bold font-serif text-amber-400">${displayRef} (ESV)</h2>
            <span class="text-xs text-slate-400 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Embedded ESV Bank</span>
          </div>
          ${chapterBlocksHtml.join('')}
        </div>`;

        return {
          reference: displayRef,
          text: combinedText.join("\n"),
          html: html,
          verses: foundVerses,
          source: 'Embedded ESV Bank'
        };
      }
    }

    // 5. Cross-chapter verse range match (e.g. "Gen 16:1-18:20")
    const crossChapterMatch = cleanRef.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+):(\d+)\s*[-–—]\s*(\d+):(\d+)$/);
    if (crossChapterMatch) {
      const bookRaw = crossChapterMatch[1];
      const bookCanonical = this.normalizeBookName(bookRaw);
      const startCh = parseInt(crossChapterMatch[2], 10);
      const startV = parseInt(crossChapterMatch[3], 10);
      const endCh = parseInt(crossChapterMatch[4], 10);
      const endV = parseInt(crossChapterMatch[5], 10);

      let foundVerses = [];
      let combinedText = [];
      let chapterBlocksHtml = [];

      for (let ch = startCh; ch <= endCh; ch++) {
        let chVerses = [];
        const vStart = (ch === startCh) ? startV : 1;
        const vEnd = (ch === endCh) ? endV : 200;

        for (let v = vStart; v <= vEnd; v++) {
          const keysToTry = [
            `${bookCanonical} ${ch}:${v}`.toLowerCase(),
            `${bookRaw} ${ch}:${v}`.toLowerCase()
          ];

          let verseText = null;
          for (const k of keysToTry) {
            if (this.verseMap.has(k)) {
              verseText = this.verseMap.get(k);
              break;
            }
          }

          if (verseText) {
            chVerses.push({ verseNum: v.toString(), text: verseText });
            foundVerses.push({ verseNum: `${ch}:${v}`, text: verseText });
            combinedText.push(verseText);
          } else if (v > 10 && chVerses.length > 0 && ch === endCh) {
            break;
          }
        }

        if (chVerses.length > 0) {
          const chVerseHtml = chVerses.map(v => 
            `<span class="verse-inline inline mr-1" data-verse="${ch}:${v.verseNum}"><sup class="text-xs font-sans font-bold text-amber-400/90 mr-1 ml-0.5 select-none">${v.verseNum}</sup>${v.text}</span>`
          ).join(' ');

          chapterBlocksHtml.push(`
            <div class="mb-6">
              <p class="mb-4 leading-relaxed font-serif text-slate-200">
                <span class="text-2xl font-bold font-sans text-amber-400 mr-2 border-b-2 border-amber-400/50 pb-0.5">${ch}</span>
                ${chVerseHtml}
              </p>
            </div>
          `);
        }
      }

      if (foundVerses.length > 0) {
        const displayRef = `${bookCanonical} ${startCh}:${startV}–${endCh}:${endV}`;

        const html = `<div class="esv-biblegateway-passage font-serif text-lg leading-relaxed text-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-6">
            <h2 class="text-2xl font-bold font-serif text-amber-400">${displayRef} (ESV)</h2>
            <span class="text-xs text-slate-400 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Embedded ESV Bank</span>
          </div>
          ${chapterBlocksHtml.join('')}
        </div>`;

        return {
          reference: displayRef,
          text: combinedText.join("\n"),
          html: html,
          verses: foundVerses,
          source: 'Embedded ESV Bank'
        };
      }
    }

    return null;
  }
}

export const esvDb = new ESVDatabase();
