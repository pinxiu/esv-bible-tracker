/**
 * Maps Bible passage references to rich external commentary links with default search query pre-populated.
 */

const BOOK_SLUGS = {
  "Genesis": "genesis", "Gen": "genesis",
  "Exodus": "exodus", "Ex": "exodus",
  "Leviticus": "leviticus", "Lev": "leviticus",
  "Numbers": "numbers", "Num": "numbers",
  "Deuteronomy": "deuteronomy", "Deut": "deuteronomy",
  "Joshua": "joshua", "Josh": "joshua",
  "Judges": "judges",
  "Ruth": "ruth",
  "1 Samuel": "1-samuel", "1 Sam": "1-samuel", "1 Sa": "1-samuel",
  "2 Samuel": "2-samuel", "2 Sam": "2-samuel",
  "1 Kings": "1-kings", "1 Kin": "1-kings",
  "2 Kings": "2-kings", "2 Kin": "2-kings",
  "1 Chronicles": "1-chronicles", "1 Chr": "1-chronicles", "1 Chron": "1-chronicles",
  "2 Chronicles": "2-chronicles", "2 Chr": "2-chronicles",
  "Ezra": "ezra",
  "Nehemiah": "nehemiah", "Neh": "nehemiah",
  "Esther": "esther",
  "Job": "job",
  "Psalm": "psalms", "Psalms": "psalms", "Ps": "psalms",
  "Proverbs": "proverbs", "Prov": "proverbs",
  "Ecclesiastes": "ecclesiastes", "Eccl": "ecclesiastes",
  "Song of Solomon": "song-of-solomon", "Song of Sol": "song-of-solomon",
  "Isaiah": "isaiah", "Isa": "isaiah",
  "Jeremiah": "jeremiah", "Jer": "jeremiah",
  "Lamentations": "lamentations",
  "Ezekiel": "ezekiel",
  "Daniel": "daniel",
  "Hosea": "hosea",
  "Joel": "joel",
  "Amos": "amos",
  "Obadiah": "obadiah",
  "Jonah": "jonah",
  "Micah": "micah",
  "Nahum": "nahum",
  "Habakkuk": "habakkuk",
  "Zephaniah": "zephaniah",
  "Haggai": "haggai",
  "Zechariah": "zechariah",
  "Malachi": "malachi",
  "Matthew": "matthew", "Matt": "matthew", "Mat": "matthew",
  "Mark": "mark", "Mk": "mark",
  "Luke": "luke", "Lk": "luke",
  "John": "john", "Jn": "john",
  "Acts": "acts",
  "Romans": "romans", "Rom": "romans",
  "1 Corinthians": "1-corinthians", "1 Cor": "1-corinthians",
  "2 Corinthians": "2-corinthians", "2 Cor": "2-corinthians",
  "Galatians": "galatians", "Gal": "galatians",
  "Ephesians": "ephesians", "Eph": "ephesians",
  "Philippians": "philippians", "Phil": "philippians",
  "Colossians": "colossians", "Col": "colossians",
  "1 Thessalonians": "1-thessalonians", "1 Thess": "1-thessalonians",
  "2 Thessalonians": "2-thessalonians", "2 Thess": "2-thessalonians",
  "1 Timothy": "1-timothy", "1 Tim": "1-timothy",
  "2 Timothy": "2-timothy", "2 Tim": "2-timothy",
  "Titus": "titus",
  "Philemon": "philemon",
  "Hebrews": "hebrews", "Heb": "hebrews",
  "James": "james", "Jas": "james",
  "1 Peter": "1-peter", "1 Pet": "1-peter",
  "2 Peter": "2-peter",
  "1 John": "1-john", "1 Jn": "1-john",
  "2 John": "2-john", "2 Jn": "2-john",
  "3 John": "3-john", "3 Jn": "3-john",
  "Jude": "jude",
  "Revelation": "revelation", "Rev": "revelation"
};

export function parsePassageRef(passageRef) {
  if (!passageRef) return { book: "Genesis", slug: "genesis", startChapter: 1, startVerse: 1, endChapter: 1 };
  const clean = passageRef.trim();
  const match = clean.match(/^((?:\d\s+)?[A-Za-z\s]+?)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/);
  if (match) {
    const bookRaw = match[1].trim();
    const startChapter = parseInt(match[2], 10);
    const startVerse = match[3] ? parseInt(match[3], 10) : 1;
    const endChapter = match[4] ? parseInt(match[4], 10) : startChapter;
    const slug = BOOK_SLUGS[bookRaw] || bookRaw.toLowerCase().replace(/\s+/g, '-');
    return { book: bookRaw, slug, startChapter, startVerse, endChapter };
  }
  return { book: clean, slug: clean.toLowerCase().replace(/\s+/g, '-'), startChapter: 1, startVerse: 1, endChapter: 1 };
}

/**
 * Generates direct external commentary links for any passage reference
 */
export function getCommentaryLinks(passageRef) {
  const { slug, startChapter, startVerse } = parsePassageRef(passageRef);
  const formattedRef = encodeURIComponent(passageRef);

  // Direct Bible Hub Commentary URL (e.g., https://biblehub.com/commentaries/genesis/1-1.htm or https://biblehub.com/commentaries/john/3-16.htm)
  const bibleHubDirectUrl = `https://biblehub.com/commentaries/${slug}/${startChapter}-${startVerse || 1}.htm`;

  return [
    {
      name: "Enduring Word (David Guzik)",
      description: `Search David Guzik's verse-by-verse commentary for "${passageRef}"`,
      url: `https://enduringword.com/?s=${formattedRef}`,
      tag: "Recommended",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300"
    },
    {
      name: "Blue Letter Bible Commentary",
      description: `Comprehensive search & interlinear tools for "${passageRef}"`,
      url: `https://www.blueletterbible.org/search/search.cfm?Criteria=${formattedRef}&t=ESV`,
      tag: "In-Depth",
      color: "from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-300"
    },
    {
      name: "BibleRef Verse Commentary",
      description: `Clear modern verse-by-verse commentary pre-searched for "${passageRef}"`,
      url: `https://www.bibleref.com/search.html?q=${formattedRef}`,
      tag: "Modern",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300"
    },
    {
      name: "Bible Hub Multi-Commentary Suite",
      description: `Direct parallel commentaries (Barnes, Gill, Benson) for "${passageRef}"`,
      url: bibleHubDirectUrl,
      tag: "Parallel Studies",
      color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300"
    },
    {
      name: "GotQuestions Bible Study",
      description: `Theological Q&A & background insights pre-searched for "${passageRef}"`,
      url: `https://www.gotquestions.org/search.php?zoom_query=${formattedRef}`,
      tag: "Q&A Insights",
      color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-300"
    }
  ];
}
