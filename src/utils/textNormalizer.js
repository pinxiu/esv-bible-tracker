/**
 * Ensures proper spacing after punctuation (e.g., "Praise the LORD!Praise" -> "Praise the LORD! Praise", "waters;he" -> "waters; he")
 */
export function fixPunctuationSpacing(text) {
  if (!text || typeof text !== 'string') return text;
  let clean = text;
  clean = clean.replace(/([;:,!\?\.\)\]”"’]+)([A-Za-z])/g, '$1 $2');
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
}

export function cleanScriptureText(text) {
  if (!text) return "";
  let clean = text;

  // Cut off common trailing footers, links, or study note headers
  clean = clean.replace(/Read full chapter[\s\S]*$/gi, '');
  clean = clean.replace(/ESV Translation Footnotes[\s\S]*$/gi, '');
  clean = clean.replace(/Footnotes[\s\S]*$/gi, '');
  clean = clean.replace(/^Bible Gateway ESV\s*/gi, '');
  clean = clean.replace(/^ESV\s*/gi, '');

  // Strip footnote markers [a], [b], [1], [2] and cross references (A), (B)
  clean = clean.replace(/\[\s*[a-z0-9]+\s*\]/gi, "");
  clean = clean.replace(/\([A-Z0-9]+\)/g, "");

  // Convert all em-dashes (—) and en-dashes (–) to double short dash (--) and strip surrounding spaces
  clean = clean.replace(/\s*[—–]\s*/g, "--");
  clean = clean.replace(/\s*--\s*/g, "--");

  // Fix missing spaces after punctuation
  clean = fixPunctuationSpacing(clean);

  // Strip standalone leading numbers (e.g. chapter numbers "4 " or verse numbers "1 ")
  clean = clean.replace(/^\d+\s+/, "");
  // Strip standalone numbers inside text
  clean = clean.replace(/\s+\d+\s+/g, " ");

  // Collapse multiple spaces
  clean = clean.replace(/\s+/g, " ").trim();

  // Strip outer quotes if wrapping the entire passage text
  if (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith('“') && clean.endsWith('”')) ||
    (clean.startsWith('“') && clean.endsWith('"')) ||
    (clean.startsWith('"') && clean.endsWith('”')) ||
    (clean.startsWith('\'') && clean.endsWith('\'')) ||
    (clean.startsWith('‘') && clean.endsWith('’'))
  ) {
    clean = clean.slice(1, -1).trim();
  }

  return clean;
}

/**
 * Auto-corrects book abbreviations, shorthand, and casing into standard full ESV book names
 * e.g. "gen 1:1" -> "Genesis 1:1", "2 john" -> "2 John 1", "2 cor 4" -> "2 Corinthians 4"
 */
export function canonicalizeReference(refStr) {
  if (!refStr || typeof refStr !== 'string') return refStr;

  const raw = refStr.trim();
  
  // Single-chapter books list
  const singleChapterBooks = ['obadiah', 'philemon', '2 john', '3 john', 'jude'];

  // Check if reference is just a book name like "2 john" or "jude" or "obadiah"
  const singleBookLower = raw.toLowerCase();
  for (const scb of singleChapterBooks) {
    if (singleBookLower === scb || singleBookLower === scb.replace(/\s+/g, '')) {
      const canonicalName = scb === '2 john' ? '2 John' : scb === '3 john' ? '3 John' : scb.charAt(0).toUpperCase() + scb.slice(1);
      return `${canonicalName} 1`;
    }
  }

  const match = raw.match(/^([1-3]?\s?[A-Za-z\s]+?)\s*(\d+(?::\d+(?:-\d+)?)?.*)$/);

  let bookPart = '';
  let chapterPart = '';

  if (match) {
    bookPart = match[1].trim().toLowerCase();
    chapterPart = match[2].trim();
  } else {
    bookPart = raw.toLowerCase();
    chapterPart = '';
  }

  const bookMap = [
    { keys: ['genesis', 'gen', 'gn'], full: 'Genesis' },
    { keys: ['exodus', 'exod', 'ex'], full: 'Exodus' },
    { keys: ['leviticus', 'lev', 'lv'], full: 'Leviticus' },
    { keys: ['numbers', 'num', 'numb', 'nm'], full: 'Numbers' },
    { keys: ['deuteronomy', 'deut', 'deutero', 'dt'], full: 'Deuteronomy' },
    { keys: ['joshua', 'josh'], full: 'Joshua' },
    { keys: ['judges', 'judg'], full: 'Judges' },
    { keys: ['ruth'], full: 'Ruth' },
    { keys: ['1 samuel', '1 sam', '1sa', '1sam'], full: '1 Samuel' },
    { keys: ['2 samuel', '2 sam', '2sa', '2sam'], full: '2 Samuel' },
    { keys: ['1 kings', '1 ki', '1kin', '1k'], full: '1 Kings' },
    { keys: ['2 kings', '2 ki', '2kin', '2k'], full: '2 Kings' },
    { keys: ['1 chronicles', '1 chr', '1 chron'], full: '1 Chronicles' },
    { keys: ['2 chronicles', '2 chr', '2 chron'], full: '2 Chronicles' },
    { keys: ['ezra'], full: 'Ezra' },
    { keys: ['nehemiah', 'neh'], full: 'Nehemiah' },
    { keys: ['esther', 'est'], full: 'Esther' },
    { keys: ['job'], full: 'Job' },
    { keys: ['psalm', 'psalms', 'ps', 'psa'], full: 'Psalm' },
    { keys: ['proverbs', 'prov'], full: 'Proverbs' },
    { keys: ['ecclesiastes', 'eccl'], full: 'Ecclesiastes' },
    { keys: ['song of solomon', 'song'], full: 'Song of Solomon' },
    { keys: ['isaiah', 'isa'], full: 'Isaiah' },
    { keys: ['jeremiah', 'jer'], full: 'Jeremiah' },
    { keys: ['lamentations', 'lam'], full: 'Lamentations' },
    { keys: ['ezekiel', 'ezek'], full: 'Ezekiel' },
    { keys: ['daniel', 'dan'], full: 'Daniel' },
    { keys: ['hosea', 'hos'], full: 'Hosea' },
    { keys: ['joel'], full: 'Joel' },
    { keys: ['amos'], full: 'Amos' },
    { keys: ['obadiah', 'obad'], full: 'Obadiah' },
    { keys: ['jonah', 'jon'], full: 'Jonah' },
    { keys: ['micah', 'mic'], full: 'Micah' },
    { keys: ['nahum', 'nah'], full: 'Nahum' },
    { keys: ['habakkuk', 'hab'], full: 'Habakkuk' },
    { keys: ['zephaniah', 'zeph'], full: 'Zephaniah' },
    { keys: ['haggai', 'hag'], full: 'Haggai' },
    { keys: ['zechariah', 'zech'], full: 'Zechariah' },
    { keys: ['malachi', 'mal'], full: 'Malachi' },
    { keys: ['matthew', 'mat', 'matt', 'mt'], full: 'Matthew' },
    { keys: ['mark', 'mk'], full: 'Mark' },
    { keys: ['luke', 'lk'], full: 'Luke' },
    { keys: ['john', 'jn'], full: 'John' },
    { keys: ['acts'], full: 'Acts' },
    { keys: ['romans', 'rom', 'rm'], full: 'Romans' },
    { keys: ['1 corinthians', '1 cor', '1cor'], full: '1 Corinthians' },
    { keys: ['2 corinthians', '2 cor', '2cor'], full: '2 Corinthians' },
    { keys: ['galatians', 'gal', 'gl'], full: 'Galatians' },
    { keys: ['ephesians', 'eph', 'ep'], full: 'Ephesians' },
    { keys: ['philippians', 'phil', 'php'], full: 'Philippians' },
    { keys: ['colossians', 'col', 'cl'], full: 'Colossians' },
    { keys: ['1 thessalonians', '1 thess'], full: '1 Thessalonians' },
    { keys: ['2 thessalonians', '2 thess'], full: '2 Thessalonians' },
    { keys: ['1 timothy', '1 tim'], full: '1 Timothy' },
    { keys: ['2 timothy', '2 tim'], full: '2 Timothy' },
    { keys: ['titus', 'tit'], full: 'Titus' },
    { keys: ['philemon', 'philem'], full: 'Philemon' },
    { keys: ['hebrews', 'heb', 'hb'], full: 'Hebrews' },
    { keys: ['james', 'jas', 'jm'], full: 'James' },
    { keys: ['1 peter', '1 pet'], full: '1 Peter' },
    { keys: ['2 peter', '2 pet'], full: '2 Peter' },
    { keys: ['1 john', '1 jn'], full: '1 John' },
    { keys: ['2 john', '2 jn'], full: '2 John' },
    { keys: ['3 john', '3 jn'], full: '3 John' },
    { keys: ['jude'], full: 'Jude' },
    { keys: ['revelation', 'rev', 'rv'], full: 'Revelation' }
  ];

  for (const entry of bookMap) {
    if (entry.keys.some(k => bookPart === k || bookPart.startsWith(k))) {
      let finalFull = entry.full;

      if (!chapterPart) {
        return `${finalFull} 1`;
      }

      // Single chapter book handling
      if (['Obadiah', 'Philemon', '2 John', '3 John', 'Jude'].includes(finalFull)) {
        if (!chapterPart.includes(':') && parseInt(chapterPart, 10) > 1) {
          return `${finalFull} 1:${chapterPart}`;
        }
      }

      return `${finalFull} ${chapterPart}`;
    }
  }

  return raw;
}

export function normalizeText(text, options = {}) {
  const {
    ignoreCaps = true,
    ignorePunctuation = true,
    ignoreSpaces = true
  } = options;

  let result = cleanScriptureText(text);

  if (ignoreCaps) {
    result = result.toLowerCase();
  }

  if (ignorePunctuation) {
    result = result.replace(/[.,/#!$%^&*;:{}=\-_`~()'"“”‘’?—]/g, "");
  }

  if (ignoreSpaces) {
    result = result.replace(/\s+/g, " ").trim();
  }

  return result;
}

export function generateStageDisplay(verseText, stage) {
  const cleanedText = cleanScriptureText(verseText);
  if (!cleanedText) return "";
  
  const words = cleanedText.split(/(\s+)/);

  switch (stage) {
    case 1:
      return cleanedText;
    case 2:
      let wordCount = 0;
      return words.map(w => {
        if (/^\s+$/.test(w)) return w;
        wordCount++;
        if (wordCount % 2 === 0) {
          return w.replace(/[a-zA-Z]/g, "_");
        }
        return w;
      }).join('');
    case 3:
      return words.map(w => {
        if (/^\s+$/.test(w)) return w;
        return w.replace(/^([a-zA-Z])([a-zA-Z]+)/, (match, p1, p2) => p1 + "•".repeat(Math.min(p2.length, 3)));
      }).join('');
    case 4:
      return words.map(w => {
        if (/^\s+$/.test(w)) return w;
        return w.replace(/[a-zA-Z]/g, "_");
      }).join('');
    default:
      return cleanedText;
  }
}

export function validateVerseInput(userInput, referenceText, options = {}) {
  const normUser = normalizeText(userInput, options);
  const normRef = normalizeText(referenceText, options);

  const isExactMatch = normUser === normRef;
  const isPartialMatch = normRef.startsWith(normUser);
  
  let accuracy = 0;
  if (normUser.length > 0) {
    let matchCount = 0;
    const minLen = Math.min(normUser.length, normRef.length);
    for (let i = 0; i < minLen; i++) {
      if (normUser[i] === normRef[i]) matchCount++;
    }
    accuracy = Math.round((matchCount / Math.max(normUser.length, normRef.length)) * 100);
  }

  return {
    isExactMatch,
    isPartialMatch,
    accuracy,
    userLength: normUser.length,
    refLength: normRef.length
  };
}

/**
 * Sorts array of verse objects alphabetically by reference (Book name, chapter, verse)
 */
export function sortVersesAlphabetically(versesList) {
  if (!Array.isArray(versesList)) return [];
  return [...versesList].sort((a, b) => {
    const refA = a.reference || '';
    const refB = b.reference || '';

    const matchA = refA.match(/^([1-3]?\s?[A-Za-z\s]+?)\s+(\d+)(?::(\d+))?/);
    const matchB = refB.match(/^([1-3]?\s?[A-Za-z\s]+?)\s+(\d+)(?::(\d+))?/);

    if (matchA && matchB) {
      const bookA = matchA[1].trim();
      const bookB = matchB[1].trim();
      const chapA = parseInt(matchA[2], 10);
      const chapB = parseInt(matchB[2], 10);
      const verseA = matchA[3] ? parseInt(matchA[3], 10) : 0;
      const verseB = matchB[3] ? parseInt(matchB[3], 10) : 0;

      const bookComp = bookA.localeCompare(bookB);
      if (bookComp !== 0) return bookComp;

      if (chapA !== chapB) return chapA - chapB;
      return verseA - verseB;
    }

    return refA.localeCompare(refB);
  });
}

/**
 * Smart reference matching for quick-jump search
 * e.g. "ps 1" matches "Psalm 1:1-6", "mat 5" matches "Matthew 5:1-12", "2 john" matches "2 John 1"
 */
export function matchesReference(targetRef, searchStr) {
  if (!targetRef || !searchStr) return false;
  const cleanSearch = searchStr.trim().toLowerCase();
  const cleanTarget = targetRef.trim().toLowerCase();

  // 1. Direct substring match
  if (cleanTarget.includes(cleanSearch)) return true;

  // 2. Canonicalized string match
  const canonSearch = canonicalizeReference(searchStr).toLowerCase();
  const canonTarget = canonicalizeReference(targetRef).toLowerCase();

  if (canonTarget.includes(canonSearch) || canonSearch.includes(canonTarget)) return true;

  // 3. Book + Chapter matching (e.g. "ps 1" vs "Psalm 1:1-6")
  const targetMatch = cleanTarget.match(/^([1-3]?\s?[a-z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);
  const searchMatch = cleanSearch.match(/^([1-3]?\s?[a-z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);

  if (targetMatch && searchMatch) {
    const targetBook = canonicalizeReference(targetMatch[1]).toLowerCase();
    const searchBook = canonicalizeReference(searchMatch[1]).toLowerCase();
    const targetChap = targetMatch[2];
    const searchChap = searchMatch[2];

    if (targetBook === searchBook && targetChap === searchChap) {
      return true;
    }
  }

  // 4. Book only matching (e.g. "ps" or "psalm" matches "Psalm 16:2-3")
  const searchBookOnlyMatch = cleanSearch.match(/^([1-3]?\s?[a-z\s]+)$/);
  if (searchBookOnlyMatch) {
    const searchBookCanon = canonicalizeReference(searchBookOnlyMatch[1]).toLowerCase();
    if (canonTarget.startsWith(searchBookCanon)) return true;
  }

  return false;
}

