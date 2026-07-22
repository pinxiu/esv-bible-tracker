import { esvDb } from './esvDatabase';
import { cleanScriptureText, canonicalizeReference } from '../utils/textNormalizer';

// Cache for fetched passages
const passageCache = new Map();

/**
 * Normalizes passage reference for Bible Gateway search
 */
export function normalizePassageRef(ref) {
  if (!ref) return "";
  return canonicalizeReference(ref);
}

/**
 * Extracts exact verse-by-verse array from Bible Gateway HTML
 */
export function extractVersesFromGatewayHtml(htmlContent) {
  if (!htmlContent) return [];

  let raw = htmlContent;
  for (const cutoff of ['<div class="passage-scroller', '<div class="footnotes', '<div class="crossrefs', '<div class="publisher-info']) {
    const cPos = raw.indexOf(cutoff);
    if (cPos !== -1) raw = raw.substring(0, cPos);
  }

  const pattern = /<span[^>]*class=["']text [^"']*-[0-9]+-([0-9]+)["'][^>]*>([\s\S]*?)<\/span>/g;
  let match;
  const versesMap = new Map();

  while ((match = pattern.exec(raw)) !== null) {
    const verseNum = match[1];
    const spanHtml = match[2];

    let cleanV = spanHtml.replace(/<sup class=["']versenum["']>[\s\S]*?<\/sup>/gi, '');
    cleanV = cleanV.replace(/<sup class=["'](footnote|crossreference)["']>[\s\S]*?<\/sup>/gi, '');
    cleanV = cleanV.replace(/<[^>]+>/g, ' ');
    cleanV = cleanScriptureText(cleanV);

    if (cleanV) {
      if (!versesMap.has(verseNum)) {
        versesMap.set(verseNum, []);
      }
      versesMap.get(verseNum).push(cleanV);
    }
  }

  const result = [];
  versesMap.forEach((parts, verseNum) => {
    result.push({
      verseNum,
      text: parts.join(' ').trim()
    });
  });

  return result;
}

/**
 * Cleans HTML content returned from Bible Gateway for ESV while removing vertical lines, extra empty lines, and "Read full chapter" footers
 */
function cleanBibleGatewayHtml(htmlContent, passageRef) {
  if (!htmlContent) return null;

  let cleaned = htmlContent;

  const scrollerPos = cleaned.indexOf('<div class="passage-scroller');
  if (scrollerPos !== -1) {
    cleaned = cleaned.substring(0, scrollerPos);
  }
  const copyrightPos = cleaned.indexOf('<div class="copyright-table');
  if (copyrightPos !== -1) {
    cleaned = cleaned.substring(0, copyrightPos);
  }

  cleaned = cleaned.replace(/<sup class=["']crossreference["'][\s\S]*?<\/sup>/gi, '');
  cleaned = cleaned.replace(/<div class=["']crossrefs["'][\s\S]*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<a class=["']crossreference-link["'][\s\S]*?<\/a>/gi, '');

  // Strip all "Read full chapter" links and containers (case-insensitive)
  cleaned = cleaned.replace(/<a[^>]*class=["'][^"']*full-chap-[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*full-chap-[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<p[^>]*class=["'][^"']*full-chap-[^"']*["'][^>]*>[\s\S]*?<\/p>/gi, '');
  cleaned = cleaned.replace(/<a[^>]*>[\s\S]*?read\s+full\s+chapter[\s\S]*?<\/a>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*>[\s\S]*?read\s+full\s+chapter[\s\S]*?<\/div>/gi, '');
  cleaned = cleaned.replace(/read\s+full\s+chapter/gi, '');

  // Clean Passage Subtitles (NO vertical line prefix)
  cleaned = cleaned.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '<h3 class="text-xl font-serif font-bold text-amber-300 mt-4 mb-2 border-b border-slate-800/80 pb-1">$1</h3>');
  cleaned = cleaned.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '<h4 class="text-lg font-serif font-bold text-amber-200 mt-3 mb-1.5">$1</h4>');

  // Poetry & Psalms line breaks and indents (Compact without empty line gap)
  cleaned = cleaned.replace(/<span class=["']line["']>([\s\S]*?)<\/span>/gi, '<span class="line block font-serif my-0.5">$1</span>');
  cleaned = cleaned.replace(/<p class=["']line["']>([\s\S]*?)<\/p>/gi, '<span class="line block font-serif my-0.5">$1</span>');
  cleaned = cleaned.replace(/<span class=["']indent-1["']>([\s\S]*?)<\/span>/gi, '<span class="indent-1 block pl-6 font-serif text-slate-200 my-0.5">$1</span>');
  cleaned = cleaned.replace(/<span class=["']indent-2["']>([\s\S]*?)<\/span>/gi, '<span class="indent-2 block pl-12 font-serif text-slate-200 my-0.5">$1</span>');

  // Chapter & Verse numbers
  cleaned = cleaned.replace(/<span class=["']chapternum["']>([\s\S]*?)<\/span>/gi, '<span class="text-2xl font-bold font-sans text-amber-400 mr-2 border-b-2 border-amber-400/50 pb-0.5">$1</span>');
  cleaned = cleaned.replace(/<sup class=["']versenum["']>([\s\S]*?)<\/sup>/gi, '<sup class="text-xs font-sans font-bold text-amber-400/90 mr-1.5 ml-1 select-none">$1</sup>');

  // Extract Footnotes into interactive popover data attributes & remove bottom footer section
  const footnotesMap = {};
  const fnContainerMatch = cleaned.match(/<div class=["']footnotes["']>([\s\S]*?)<\/div>/i);
  if (fnContainerMatch) {
    const fnInner = fnContainerMatch[1];
    const liRegex = /<li id=["']([^"']+)["']>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = liRegex.exec(fnInner)) !== null) {
      const fnId = m[1];
      const body = m[2];
      let refText = passageRef;
      const refMatch = body.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
      if (refMatch) refText = refMatch[1].replace(/<[^>]+>/g, '').trim();
      const textOnly = body.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '').replace(/<[^>]+>/g, '').trim();
      const letterMatch = fnId.match(/([a-z]+)$/i);
      const letter = letterMatch ? letterMatch[1] : 'note';

      footnotesMap[fnId] = {
        id: fnId,
        letter,
        ref: refText || passageRef,
        text: textOnly
      };
    }
  }

  // Replace footnote markers in text with interactive popover badges (superscript style, no background)
  cleaned = cleaned.replace(/<sup[^>]*data-fn=["']#?([^"']+)["'][^>]*>\[\s*<a[^>]*>\s*([a-z0-9]+)\s*<\/a>\s*\]<\/sup>/gi, (match, fnId, letter) => {
    const cleanLetter = letter.trim();
    const fnObj = footnotesMap[fnId] || { letter: cleanLetter, text: "Translation note", ref: passageRef };
    const cleanFnLetter = (fnObj.letter || cleanLetter).trim();
    const escapedText = encodeURIComponent(fnObj.text);
    return `<span class="esv-fn-badge align-super text-[0.7em] font-sans font-bold text-amber-400 hover:text-amber-300 cursor-pointer select-none mx-0.5 px-0.5" data-fn-letter="${cleanFnLetter}" data-fn-text="${escapedText}" data-fn-ref="${fnObj.ref}">[${cleanFnLetter}]</span>`;
  });

  cleaned = cleaned.replace(/<a href=["']#?([^"']+)["'] title=["']See footnote ([a-z0-9]+)["']>\s*([a-z0-9]+)\s*<\/a>/gi, (match, fnId, letter, innerLetter) => {
    const cleanLetter = (innerLetter || letter).trim();
    const fnObj = footnotesMap[fnId] || { letter: cleanLetter, text: "Translation note", ref: passageRef };
    const cleanFnLetter = (fnObj.letter || cleanLetter).trim();
    const escapedText = encodeURIComponent(fnObj.text);
    return `<span class="esv-fn-badge align-super text-[0.7em] font-sans font-bold text-amber-400 hover:text-amber-300 cursor-pointer select-none mx-0.5 px-0.5" data-fn-letter="${cleanFnLetter}" data-fn-text="${escapedText}" data-fn-ref="${fnObj.ref}">[${cleanFnLetter}]</span>`;
  });

  // Remove bottom <div class="footnotes"> section completely (no bottom footer!)
  cleaned = cleaned.replace(/<div class=["']footnotes["']>([\s\S]*?)<\/div>/gi, '');

  // Remove extra empty paragraphs, empty breaks, or standalone <br/> gaps inside poetry
  cleaned = cleaned.replace(/<p>\s*(&nbsp;|<br\s*\/?>)*\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '');

  // Fix missing spaces after inline punctuation ONLY when on the same line (preserves line breaks & poetry lines 100%)
  cleaned = cleaned.replace(/([;:,!\?\.\)\]”"’']+)(?=[A-Za-z])/g, '$1 ');

  const displayTitle = canonicalizeReference(passageRef);

  return `<div class="esv-biblegateway-passage font-serif text-lg leading-relaxed text-slate-200 space-y-2">
    <div class="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
      <h2 class="text-2xl font-bold font-serif text-amber-400">${displayTitle} (ESV)</h2>
      <span class="text-xs text-slate-400 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Bible Gateway ESV</span>
    </div>
    ${cleaned}
  </div>`;

  return `<div class="esv-biblegateway-passage font-serif text-lg leading-relaxed text-slate-200 space-y-2">
    <div class="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
      <h2 class="text-2xl font-bold font-serif text-amber-400">${passageRef} (ESV)</h2>
      <span class="text-xs text-slate-400 font-sans bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Bible Gateway ESV</span>
    </div>
    ${cleaned}
  </div>`;
}

/**
 * Fetches Bible passage text. Defaults to Bible Gateway ESV (online) unless forceUseEmbedded is true.
 */
export async function fetchPassage(passageRef, esvApiKey = '', forceUseEmbedded = false) {
  const cleanRef = normalizePassageRef(passageRef);
  const cacheKey = `${cleanRef}_${forceUseEmbedded ? 'embedded' : 'gateway'}`;

  if (passageCache.has(cacheKey)) {
    if (window.debugLogger) {
      window.debugLogger.addLog('info', `Cache hit for passage: ${cleanRef} [${forceUseEmbedded ? 'embedded' : 'gateway'}]`);
    }
    return passageCache.get(cacheKey);
  }

  // 1. If user explicitly toggled to use embedded bank, lookup local database first
  if (forceUseEmbedded) {
    if (window.debugLogger) {
      window.debugLogger.addLog('info', `Querying offline ESV database: ${cleanRef}`);
    }
    const localData = esvDb.lookupPassage(cleanRef);
    if (localData) {
      if (window.debugLogger) {
        window.debugLogger.addLog('info', `Successfully loaded offline ESV data for ${cleanRef}`);
      }
      passageCache.set(cacheKey, localData);
      return localData;
    }
  }

  // 2. Official ESV API (if user entered custom token in Settings)
  if (esvApiKey && esvApiKey.length > 5) {
    try {
      if (window.debugLogger) {
        window.debugLogger.addLog('info', `Sending network request to Official ESV API: ${cleanRef}`);
      }
      const response = await fetch(
        `https://api.esv.org/v3/passage/html/?q=${encodeURIComponent(cleanRef)}&include-footnotes=true&include-headings=true`,
        { headers: { Authorization: `Token ${esvApiKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.passages && data.passages.length > 0) {
          const result = {
            reference: data.query || cleanRef,
            html: data.passages.join(''),
            source: 'Official ESV API'
          };
          if (window.debugLogger) {
            window.debugLogger.addLog('info', `Received official ESV API response for ${cleanRef} (source: ${result.source})`);
          }
          passageCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (e) {
      if (window.debugLogger) {
        window.debugLogger.addLog('warn', `ESV API fetch failed, trying Bible Gateway fallback`, e.message);
      }
      console.warn('ESV API fetch failed, trying Bible Gateway fallback', e);
    }
  }

  // 3. DEFAULT: Fetch from Bible Gateway for complete HTML (with subtitles, paragraphs, footnotes [a], [b], etc.)
  try {
    const bgUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(cleanRef)}&version=ESV`;
    if (window.debugLogger) {
      window.debugLogger.addLog('info', `Sending network request to Bible Gateway: ${cleanRef} (URL: ${bgUrl})`);
    }
    const response = await fetch(bgUrl);
    if (response.ok) {
      const htmlText = await response.text();
      
      const marker = 'result-text-style-normal text-html';
      const pos = htmlText.indexOf(marker);
      if (pos !== -1) {
        const startPos = htmlText.indexOf('>', pos) + 1;
        let endPos = htmlText.indexOf('<!--publisher-info-->', startPos);
        if (endPos === -1) endPos = htmlText.indexOf('<div class="publisher-info', startPos);
        if (endPos === -1) endPos = startPos + 40000;

        const rawPassageHtml = htmlText.substring(startPos, endPos);
        const formattedHtml = cleanBibleGatewayHtml(rawPassageHtml, cleanRef);
        const parsedVerses = extractVersesFromGatewayHtml(rawPassageHtml);

        if (formattedHtml) {
          const result = {
            reference: cleanRef,
            html: formattedHtml,
            verses: parsedVerses,
            source: 'Bible Gateway (ESV)'
          };
          if (window.debugLogger) {
            window.debugLogger.addLog('info', `Loaded passage from Bible Gateway: ${cleanRef} (Length: ${formattedHtml.length} chars)`);
          }
          passageCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (e) {
    if (window.debugLogger) {
      window.debugLogger.addLog('warn', `Bible Gateway fetch failed, using embedded DB fallback`, e.message);
    }
    console.warn('Bible Gateway fetch failed, using embedded DB fallback', e);
  }

  // 4. Fallback to embedded ESV Bank if Bible Gateway is offline
  if (window.debugLogger) {
    window.debugLogger.addLog('info', `Using embedded offline ESV Bank fallback for ${cleanRef}`);
  }
  const fallbackLocalData = esvDb.lookupPassage(cleanRef);
  if (fallbackLocalData) {
    passageCache.set(cacheKey, fallbackLocalData);
    return fallbackLocalData;
  }

  return {
    reference: cleanRef,
    html: `<div class="p-6 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-300">
      <h3 class="text-xl font-serif text-amber-400 mb-3">${cleanRef} (ESV)</h3>
      <p class="leading-relaxed font-serif text-lg mb-4">"The word of God is living and active, sharper than any two-edged sword..." (Hebrews 4:12)</p>
      <p class="text-xs text-slate-400 font-sans">Connecting to Bible Gateway ESV for ${cleanRef}...</p>
    </div>`,
    source: 'Fallback'
  };
}
