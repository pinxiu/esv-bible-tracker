// Structured 52-week Bible Reading Plan dataset based on the user's exact schedule
// Dates are stored as MM/DD strings with full year calculations (2026/2027)

export const BIBLE_PLAN = [
  // Week 1
  { id: "1-1", week: 1, date: "7/13", year: 2026, text: "Genesis 1-2; Psalm 19; Mark 1", passages: ["Genesis 1-2", "Psalm 19", "Mark 1"] },
  { id: "1-2", week: 1, date: "7/14", year: 2026, text: "Genesis 3-5; Mark 2", passages: ["Genesis 3-5", "Mark 2"] },
  { id: "1-3", week: 1, date: "7/15", year: 2026, text: "Genesis 6-8; Psalm 104; Mark 3", passages: ["Genesis 6-8", "Psalm 104", "Mark 3"] },
  { id: "1-4", week: 1, date: "7/16", year: 2026, text: "Genesis 9-11; Mark 4", passages: ["Genesis 9-11", "Mark 4"] },
  { id: "1-5", week: 1, date: "7/17", year: 2026, text: "Genesis 12-15; Psalm 148; Mark 5", passages: ["Genesis 12-15", "Psalm 148", "Mark 5"] },

  // Week 2
  { id: "2-1", week: 2, date: "7/20", year: 2026, text: "Genesis 16-18; Mark 6", passages: ["Genesis 16-18", "Mark 6"] },
  { id: "2-2", week: 2, date: "7/21", year: 2026, text: "Genesis 19-20; Psalm 1; Mark 7", passages: ["Genesis 19-20", "Psalm 1", "Mark 7"] },
  { id: "2-3", week: 2, date: "7/22", year: 2026, text: "Genesis 21-23; Psalm 107; Mark 8", passages: ["Genesis 21-23", "Psalm 107", "Mark 8"] },
  { id: "2-4", week: 2, date: "7/23", year: 2026, text: "Genesis 24-25; Psalm 4; Mark 9", passages: ["Genesis 24-25", "Psalm 4", "Mark 9"] },
  { id: "2-5", week: 2, date: "7/24", year: 2026, text: "Genesis 26-27; Mark 10", passages: ["Genesis 26-27", "Mark 10"] },

  // Week 3
  { id: "3-1", week: 3, date: "7/27", year: 2026, text: "Genesis 28-29; Mark 11", passages: ["Genesis 28-29", "Mark 11"] },
  { id: "3-2", week: 3, date: "7/28", year: 2026, text: "Genesis 30-31; Psalm 11; Mark 12", passages: ["Genesis 30-31", "Psalm 11", "Mark 12"] },
  { id: "3-3", week: 3, date: "7/29", year: 2026, text: "Genesis 32-34; Psalm 145; Mark 13", passages: ["Genesis 32-34", "Psalm 145", "Mark 13"] },
  { id: "3-4", week: 3, date: "7/30", year: 2026, text: "Genesis 35-37; Psalm 12; Mark 14", passages: ["Genesis 35-37", "Psalm 12", "Mark 14"] },
  { id: "3-5", week: 3, date: "7/31", year: 2026, text: "Genesis 38-40; Mark 15", passages: ["Genesis 38-40", "Mark 15"] },

  // Week 4
  { id: "4-1", week: 4, date: "8/3", year: 2026, text: "Genesis 41-42; Mark 16", passages: ["Genesis 41-42", "Mark 16"] },
  { id: "4-2", week: 4, date: "8/4", year: 2026, text: "Genesis 43-44; Psalm 24; Galatians 1", passages: ["Genesis 43-44", "Psalm 24", "Galatians 1"] },
  { id: "4-3", week: 4, date: "8/5", year: 2026, text: "Genesis 45-46; Psalm 108; Galatians 2", passages: ["Genesis 45-46", "Psalm 108", "Galatians 2"] },
  { id: "4-4", week: 4, date: "8/6", year: 2026, text: "Genesis 47-48; Psalm 25; Galatians 3", passages: ["Genesis 47-48", "Psalm 25", "Galatians 3"] },
  { id: "4-5", week: 4, date: "8/7", year: 2026, text: "Genesis 49-50; Galatians 4", passages: ["Genesis 49-50", "Galatians 4"] },

  // Week 5
  { id: "5-1", week: 5, date: "8/10", year: 2026, text: "Exodus 1-3; Galatians 5", passages: ["Exodus 1-3", "Galatians 5"] },
  { id: "5-2", week: 5, date: "8/11", year: 2026, text: "Exodus 4-6; Galatians 6", passages: ["Exodus 4-6", "Galatians 6"] },
  { id: "5-3", week: 5, date: "8/12", year: 2026, text: "Exodus 7-9; Psalm 105; Ephesians 1", passages: ["Exodus 7-9", "Psalm 105", "Ephesians 1"] },
  { id: "5-4", week: 5, date: "8/13", year: 2026, text: "Exodus 10-12; Ephesians 2", passages: ["Exodus 10-12", "Ephesians 2"] },
  { id: "5-5", week: 5, date: "8/14", year: 2026, text: "Exodus 13-15; Psalm 114; Ephesians 3", passages: ["Exodus 13-15", "Psalm 114", "Ephesians 3"] },

  // Week 6
  { id: "6-1", week: 6, date: "8/17", year: 2026, text: "Exodus 16-18; Ephesians 4", passages: ["Exodus 16-18", "Ephesians 4"] },
  { id: "6-2", week: 6, date: "8/18", year: 2026, text: "Exodus 19-21; Psalm 33; Ephesians 5", passages: ["Exodus 19-21", "Psalm 33", "Ephesians 5"] },
  { id: "6-3", week: 6, date: "8/19", year: 2026, text: "Exodus 22-24; Psalm 109; Ephesians 6", passages: ["Exodus 22-24", "Psalm 109", "Ephesians 6"] },
  { id: "6-4", week: 6, date: "8/20", year: 2026, text: "Exodus 25-27; Psalm 90; Philippians 1", passages: ["Exodus 25-27", "Psalm 90", "Philippians 1"] },
  { id: "6-5", week: 6, date: "8/21", year: 2026, text: "Exodus 28-31; Philippians 2", passages: ["Exodus 28-31", "Philippians 2"] },

  // Week 7
  { id: "7-1", week: 7, date: "8/24", year: 2026, text: "Exodus 32-34; Philippians 3", passages: ["Exodus 32-34", "Philippians 3"] },
  { id: "7-2", week: 7, date: "8/25", year: 2026, text: "Exodus 35-37; Psalm 26; Philippians 4", passages: ["Exodus 35-37", "Psalm 26", "Philippians 4"] },
  { id: "7-3", week: 7, date: "8/26", year: 2026, text: "Exodus 38-40; Hebrews 1", passages: ["Exodus 38-40", "Hebrews 1"] },
  { id: "7-4", week: 7, date: "8/27", year: 2026, text: "Leviticus 1-3; Psalm 27; Hebrews 2", passages: ["Leviticus 1-3", "Psalm 27", "Hebrews 2"] },
  { id: "7-5", week: 7, date: "8/28", year: 2026, text: "Leviticus 4-7; Hebrews 3", passages: ["Leviticus 4-7", "Hebrews 3"] },

  // Week 8
  { id: "8-1", week: 8, date: "8/31", year: 2026, text: "Leviticus 8-11; Psalm 110; Hebrews 4", passages: ["Leviticus 8-11", "Psalm 110", "Hebrews 4"] },
  { id: "8-2", week: 8, date: "9/1", year: 2026, text: "Leviticus 12-14; Psalm 111; Hebrews 5", passages: ["Leviticus 12-14", "Psalm 111", "Hebrews 5"] },
  { id: "8-3", week: 8, date: "9/2", year: 2026, text: "Leviticus 15-18; Psalm 31; Hebrews 6", passages: ["Leviticus 15-18", "Psalm 31", "Hebrews 6"] },
  { id: "8-4", week: 8, date: "9/3", year: 2026, text: "Leviticus 19-20; Hebrews 7", passages: ["Leviticus 19-20", "Hebrews 7"] },
  { id: "8-5", week: 8, date: "9/4", year: 2026, text: "Leviticus 21-23; Hebrews 8", passages: ["Leviticus 21-23", "Hebrews 8"] },

  // Week 9
  { id: "9-1", week: 9, date: "9/7", year: 2026, text: "Leviticus 24-25; Psalm 81; Hebrews 9", passages: ["Leviticus 24-25", "Psalm 81", "Hebrews 9"] },
  { id: "9-2", week: 9, date: "9/8", year: 2026, text: "Leviticus 26-27; Psalm 112; Hebrews 10", passages: ["Leviticus 26-27", "Psalm 112", "Hebrews 10"] },
  { id: "9-3", week: 9, date: "9/9", year: 2026, text: "Numbers 1-2; Psalm 64; Hebrews 11", passages: ["Numbers 1-2", "Psalm 64", "Hebrews 11"] },
  { id: "9-4", week: 9, date: "9/10", year: 2026, text: "Numbers 3-5; Hebrews 12", passages: ["Numbers 3-5", "Hebrews 12"] },
  { id: "9-5", week: 9, date: "9/11", year: 2026, text: "Numbers 6-7; Hebrews 13", passages: ["Numbers 6-7", "Hebrews 13"] },

  // Week 10
  { id: "10-1", week: 10, date: "9/14", year: 2026, text: "Numbers 8-11; Colossians 1", passages: ["Numbers 8-11", "Colossians 1"] },
  { id: "10-2", week: 10, date: "9/15", year: 2026, text: "Numbers 12-14; Psalm 28; Colossians 2", passages: ["Numbers 12-14", "Psalm 28", "Colossians 2"] },
  { id: "10-3", week: 10, date: "9/16", year: 2026, text: "Numbers 15-18; Psalm 113; Colossians 3", passages: ["Numbers 15-18", "Psalm 113", "Colossians 3"] },
  { id: "10-4", week: 10, date: "9/17", year: 2026, text: "Numbers 19-21; Colossians 4", passages: ["Numbers 19-21", "Colossians 4"] },
  { id: "10-5", week: 10, date: "9/18", year: 2026, text: "Numbers 22-25; Luke 1", passages: ["Numbers 22-25", "Luke 1"] },

  // Week 11
  { id: "11-1", week: 11, date: "9/21", year: 2026, text: "Numbers 26-29; Luke 2", passages: ["Numbers 26-29", "Luke 2"] },
  { id: "11-2", week: 11, date: "9/22", year: 2026, text: "Numbers 30-33; Psalm 35; Luke 3", passages: ["Numbers 30-33", "Psalm 35", "Luke 3"] },
  { id: "11-3", week: 11, date: "9/23", year: 2026, text: "Numbers 34-36; Luke 4", passages: ["Numbers 34-36", "Luke 4"] },
  { id: "11-4", week: 11, date: "9/24", year: 2026, text: "Deuteronomy 1-3; Psalm 36; Luke 5", passages: ["Deuteronomy 1-3", "Psalm 36", "Luke 5"] },
  { id: "11-5", week: 11, date: "9/25", year: 2026, text: "Deuteronomy 4-5; Luke 6", passages: ["Deuteronomy 4-5", "Luke 6"] },

  // Week 12
  { id: "12-1", week: 12, date: "9/28", year: 2026, text: "Deuteronomy 6-9; Luke 7", passages: ["Deuteronomy 6-9", "Luke 7"] },
  { id: "12-2", week: 12, date: "9/29", year: 2026, text: "Deuteronomy 10-14; Psalm 5; Luke 8", passages: ["Deuteronomy 10-14", "Psalm 5", "Luke 8"] },
  { id: "12-3", week: 12, date: "9/30", year: 2026, text: "Deuteronomy 15-18; Psalm 115; Luke 9", passages: ["Deuteronomy 15-18", "Psalm 115", "Luke 9"] },
  { id: "12-4", week: 12, date: "10/1", year: 2026, text: "Deuteronomy 19-22; Psalm 6; Luke 10", passages: ["Deuteronomy 19-22", "Psalm 6", "Luke 10"] },
  { id: "12-5", week: 12, date: "10/2", year: 2026, text: "Deuteronomy 23-26; Luke 11", passages: ["Deuteronomy 23-26", "Luke 11"] },

  // Week 13
  { id: "13-1", week: 13, date: "10/5", year: 2026, text: "Deuteronomy 27-31; Luke 12", passages: ["Deuteronomy 27-31", "Luke 12"] },
  { id: "13-2", week: 13, date: "10/6", year: 2026, text: "Deuteronomy 32-34; Psalm 13; Luke 13", passages: ["Deuteronomy 32-34", "Psalm 13", "Luke 13"] },
  { id: "13-3", week: 13, date: "10/7", year: 2026, text: "Joshua 1-4; Psalm 143; Luke 14", passages: ["Joshua 1-4", "Psalm 143", "Luke 14"] },
  { id: "13-4", week: 13, date: "10/8", year: 2026, text: "Joshua 5-8; Psalm 14; Luke 15", passages: ["Joshua 5-8", "Psalm 14", "Luke 15"] },
  { id: "13-5", week: 13, date: "10/9", year: 2026, text: "Joshua 9-13; Luke 16", passages: ["Joshua 9-13", "Luke 16"] },

  // Week 14
  { id: "14-1", week: 14, date: "10/12", year: 2026, text: "Joshua 14-17; Luke 17", passages: ["Joshua 14-17", "Luke 17"] },
  { id: "14-2", week: 14, date: "10/13", year: 2026, text: "Joshua 18-21; Psalm 15; Luke 18", passages: ["Joshua 18-21", "Psalm 15", "Luke 18"] },
  { id: "14-3", week: 14, date: "10/14", year: 2026, text: "Joshua 22-24; Psalm 116; Luke 19", passages: ["Joshua 22-24", "Psalm 116", "Luke 19"] },
  { id: "14-4", week: 14, date: "10/15", year: 2026, text: "Judges 1-3; Psalm 16; Luke 20", passages: ["Judges 1-3", "Psalm 16", "Luke 20"] },
  { id: "14-5", week: 14, date: "10/16", year: 2026, text: "Judges 4-6; Luke 21", passages: ["Judges 4-6", "Luke 21"] },

  // Week 15
  { id: "15-1", week: 15, date: "10/19", year: 2026, text: "Judges 7-8; Luke 22", passages: ["Judges 7-8", "Luke 22"] },
  { id: "15-2", week: 15, date: "10/20", year: 2026, text: "Judges 9-11; Psalm 17; Luke 23", passages: ["Judges 9-11", "Psalm 17", "Luke 23"] },
  { id: "15-3", week: 15, date: "10/21", year: 2026, text: "Judges 12-16; Psalm 146; Luke 24", passages: ["Judges 12-16", "Psalm 146", "Luke 24"] },
  { id: "15-4", week: 15, date: "10/22", year: 2026, text: "Judges 17-18; Psalm 21; Acts 1", passages: ["Judges 17-18", "Psalm 21", "Acts 1"] },
  { id: "15-5", week: 15, date: "10/23", year: 2026, text: "Judges 19-21; Acts 2", passages: ["Judges 19-21", "Acts 2"] },

  // Week 16
  { id: "16-1", week: 16, date: "10/26", year: 2026, text: "Ruth 1-2; Acts 3", passages: ["Ruth 1-2", "Acts 3"] },
  { id: "16-2", week: 16, date: "10/27", year: 2026, text: "Ruth 3-4; Psalm 37; Acts 4", passages: ["Ruth 3-4", "Psalm 37", "Acts 4"] },
  { id: "16-3", week: 16, date: "10/28", year: 2026, text: "1 Samuel 1-2; Psalm 120; Acts 5", passages: ["1 Samuel 1-2", "Psalm 120", "Acts 5"] },
  { id: "16-4", week: 16, date: "10/29", year: 2026, text: "1 Samuel 3-5; Psalm 23; Acts 6", passages: ["1 Samuel 3-5", "Psalm 23", "Acts 6"] },
  { id: "16-5", week: 16, date: "10/30", year: 2026, text: "1 Samuel 6-8; Acts 7", passages: ["1 Samuel 6-8", "Acts 7"] },

  // Week 17
  { id: "17-1", week: 17, date: "11/2", year: 2026, text: "1 Samuel 9-10; Acts 8", passages: ["1 Samuel 9-10", "Acts 8"] },
  { id: "17-2", week: 17, date: "11/3", year: 2026, text: "1 Samuel 11-13; Psalm 38; Acts 9", passages: ["1 Samuel 11-13", "Psalm 38", "Acts 9"] },
  { id: "17-3", week: 17, date: "11/4", year: 2026, text: "1 Samuel 14; Psalm 124; Acts 10", passages: ["1 Samuel 14", "Psalm 124", "Acts 10"] },
  { id: "17-4", week: 17, date: "11/5", year: 2026, text: "1 Samuel 15-16; 1 Chronicles 1; Psalm 39; Acts 11", passages: ["1 Samuel 15-16", "1 Chronicles 1", "Psalm 39", "Acts 11"] },
  { id: "17-5", week: 17, date: "11/6", year: 2026, text: "1 Samuel 17; 1 Chronicles 2; Acts 12", passages: ["1 Samuel 17", "1 Chronicles 2", "Acts 12"] },

  // Week 18
  { id: "18-1", week: 18, date: "11/9", year: 2026, text: "1 Samuel 18-19; 1 Chronicles 3; Psalm 59; Acts 13", passages: ["1 Samuel 18-19", "1 Chronicles 3", "Psalm 59", "Acts 13"] },
  { id: "18-2", week: 18, date: "11/10", year: 2026, text: "1 Samuel 20; 1 Chronicles 4; Psalm 56, 57, 142; Acts 14", passages: ["1 Samuel 20", "1 Chronicles 4", "Psalm 56", "Psalm 57", "Psalm 142", "Acts 14"] },
  { id: "18-3", week: 18, date: "11/11", year: 2026, text: "1 Samuel 21-22; 1 Chronicles 5; Psalm 52; Acts 15", passages: ["1 Samuel 21-22", "1 Chronicles 5", "Psalm 52", "Acts 15"] },
  { id: "18-4", week: 18, date: "11/12", year: 2026, text: "1 Samuel 23-24; 1 Chronicles 6; Psalm 54; Acts 16", passages: ["1 Samuel 23-24", "1 Chronicles 6", "Psalm 54", "Acts 16"] },
  { id: "18-5", week: 18, date: "11/13", year: 2026, text: "1 Samuel 25; 1 Chronicles 7; Acts 17", passages: ["1 Samuel 25", "1 Chronicles 7", "Acts 17"] },

  // Week 19
  { id: "19-1", week: 19, date: "11/16", year: 2026, text: "1 Samuel 26-27; 1 Chronicles 8; Acts 18", passages: ["1 Samuel 26-27", "1 Chronicles 8", "Acts 18"] },
  { id: "19-2", week: 19, date: "11/17", year: 2026, text: "1 Samuel 28-29; 1 Chronicles 9; Acts 19", passages: ["1 Samuel 28-29", "1 Chronicles 9", "Acts 19"] },
  { id: "19-3", week: 19, date: "11/18", year: 2026, text: "1 Samuel 30-31; 1 Chronicles 10; Acts 20", passages: ["1 Samuel 30-31", "1 Chronicles 10", "Acts 20"] },
  { id: "19-4", week: 19, date: "11/19", year: 2026, text: "2 Samuel 1-2; 1 Chronicles 11; Psalm 96, 106; Acts 21", passages: ["2 Samuel 1-2", "1 Chronicles 11", "Psalm 96", "Psalm 106", "Acts 21"] },
  { id: "19-5", week: 19, date: "11/20", year: 2026, text: "2 Samuel 3-5; 1 Chronicles 12; Psalm 122; Acts 22", passages: ["2 Samuel 3-5", "1 Chronicles 12", "Psalm 122", "Acts 22"] },

  // Week 20
  { id: "20-1", week: 20, date: "11/23", year: 2026, text: "2 Samuel 6; 1 Chronicles 13; Psalm 60; Acts 23", passages: ["2 Samuel 6", "1 Chronicles 13", "Psalm 60", "Acts 23"] },
  { id: "20-2", week: 20, date: "11/24", year: 2026, text: "1 Chron 14-16; Acts 24", passages: ["1 Chronicles 14-16", "Acts 24"] },
  { id: "20-3", week: 20, date: "11/25", year: 2026, text: "2 Samuel 7-8; 1 Chronicles 17; Psalm 132; Acts 25", passages: ["2 Samuel 7-8", "1 Chronicles 17", "Psalm 132", "Acts 25"] },
  { id: "20-4", week: 20, date: "11/26", year: 2026, text: "2 Samuel 9-10; 1 Chronicles 18-19; Psalm 89; Acts 26", passages: ["2 Samuel 9-10", "1 Chronicles 18-19", "Psalm 89", "Acts 26"] },
  { id: "20-5", week: 20, date: "11/27", year: 2026, text: "2 Samuel 11-12; 1 Chronicles 20; Psalm 51, 32; Acts 27", passages: ["2 Samuel 11-12", "1 Chronicles 20", "Psalm 51", "Psalm 32", "Acts 27"] },

  // Week 21
  { id: "21-1", week: 21, date: "11/30", year: 2026, text: "2 Samuel 13-14; Acts 28", passages: ["2 Samuel 13-14", "Acts 28"] },
  { id: "21-2", week: 21, date: "12/1", year: 2026, text: "2 Samuel 15-17; Psalms 3, 63; Romans 1", passages: ["2 Samuel 15-17", "Psalm 3", "Psalm 63", "Romans 1"] },
  { id: "21-3", week: 21, date: "12/2", year: 2026, text: "2 Samuel 18-20; Psalm 34; Romans 2", passages: ["2 Samuel 18-20", "Psalm 34", "Romans 2"] },
  { id: "21-4", week: 21, date: "12/3", year: 2026, text: "2 Samuel 21-23; Psalm 18; Romans 3", passages: ["2 Samuel 21-23", "Psalm 18", "Romans 3"] },
  { id: "21-5", week: 21, date: "12/4", year: 2026, text: "2 Samuel 24; 1 Chronicles 21; Romans 4", passages: ["2 Samuel 24", "1 Chronicles 21", "Romans 4"] },

  // Week 22
  { id: "22-1", week: 22, date: "12/7", year: 2026, text: "1 Chron 22-25; Psalm 78; Romans 5", passages: ["1 Chronicles 22-25", "Psalm 78", "Romans 5"] },
  { id: "22-2", week: 22, date: "12/8", year: 2026, text: "1 Kings 1; 1 Chronicles 26-28; Romans 6", passages: ["1 Kings 1", "1 Chronicles 26-28", "Romans 6"] },
  { id: "22-3", week: 22, date: "12/9", year: 2026, text: "1 Kings 2; 1 Chronicles 29; Romans 7", passages: ["1 Kings 2", "1 Chronicles 29", "Romans 7"] },
  { id: "22-4", week: 22, date: "12/10", year: 2026, text: "1 Kings 3; 2 Chronicles 1; Psalm 42; Romans 8", passages: ["1 Kings 3", "2 Chronicles 1", "Psalm 42", "Romans 8"] },
  { id: "22-5", week: 22, date: "12/11", year: 2026, text: "1 Kings 4; Proverbs 1-2; Psalm 43; Romans 9", passages: ["1 Kings 4", "Proverbs 1-2", "Psalm 43", "Romans 9"] },

  // Week 23
  { id: "23-1", week: 23, date: "12/14", year: 2026, text: "Proverbs 3-5; Romans 10", passages: ["Proverbs 3-5", "Romans 10"] },
  { id: "23-2", week: 23, date: "12/15", year: 2026, text: "Proverbs 6-7; Psalm 7; Romans 11", passages: ["Proverbs 6-7", "Psalm 7", "Romans 11"] },
  { id: "23-3", week: 23, date: "12/16", year: 2026, text: "Proverbs 8-10; Psalm 144; Romans 12", passages: ["Proverbs 8-10", "Psalm 144", "Romans 12"] },
  { id: "23-4", week: 23, date: "12/17", year: 2026, text: "Proverbs 11-13; Psalm 8; Romans 13", passages: ["Proverbs 11-13", "Psalm 8", "Romans 13"] },
  { id: "23-5", week: 23, date: "12/18", year: 2026, text: "Proverbs 14-15; Romans 14", passages: ["Proverbs 14-15", "Romans 14"] },

  // Week 24
  { id: "24-1", week: 24, date: "12/21", year: 2026, text: "Proverbs 16-18; Romans 15", passages: ["Proverbs 16-18", "Romans 15"] },
  { id: "24-2", week: 24, date: "12/22", year: 2026, text: "Proverbs 19-21; Psalm 40; Romans 16", passages: ["Proverbs 19-21", "Psalm 40", "Romans 16"] },
  { id: "24-3", week: 24, date: "12/23", year: 2026, text: "Proverbs 22-23; Psalm 117; 1 Thessalonians 1", passages: ["Proverbs 22-23", "Psalm 117", "1 Thessalonians 1"] },
  { id: "24-4", week: 24, date: "12/24", year: 2026, text: "Proverbs 24-25; Psalm 41; 1 Thessalonians 2", passages: ["Proverbs 24-25", "Psalm 41", "1 Thessalonians 2"] },
  { id: "24-5", week: 24, date: "12/25", year: 2026, text: "Proverbs 26-28; 1 Thessalonians 3", passages: ["Proverbs 26-28", "1 Thessalonians 3"] },

  // Week 25
  { id: "25-1", week: 25, date: "12/28", year: 2026, text: "Proverbs 29-31; 1 Thessalonians 4", passages: ["Proverbs 29-31", "1 Thessalonians 4"] },
  { id: "25-2", week: 25, date: "12/29", year: 2026, text: "Song of Sol 1-3; Psalm 72; 1 Thessalonians 5", passages: ["Song of Solomon 1-3", "Psalm 72", "1 Thessalonians 5"] },
  { id: "25-3", week: 25, date: "12/30", year: 2026, text: "Song of Sol 4-6; 2 Thessalonians 1", passages: ["Song of Solomon 4-6", "2 Thessalonians 1"] },
  { id: "25-4", week: 25, date: "12/31", year: 2026, text: "Song of Sol 7-8; Psalm 127; 2 Thessalonians 2", passages: ["Song of Solomon 7-8", "Psalm 127", "2 Thessalonians 2"] },
  { id: "25-5", week: 25, date: "1/1", year: 2027, text: "1 Kings 5; 2 Chronicles 2; 2 Thessalonians 3", passages: ["1 Kings 5", "2 Chronicles 2", "2 Thessalonians 3"] },

  // Week 26
  { id: "26-1", week: 26, date: "1/4", year: 2027, text: "1 Kings 6; 2 Chron 3; 1 Timothy 1", passages: ["1 Kings 6", "2 Chronicles 3", "1 Timothy 1"] },
  { id: "26-2", week: 26, date: "1/5", year: 2027, text: "1 Kings 7; 2 Chronicles 4; Psalm 44; 1 Timothy 2", passages: ["1 Kings 7", "2 Chronicles 4", "Psalm 44", "1 Timothy 2"] },
  { id: "26-3", week: 26, date: "1/6", year: 2027, text: "1 Kings 8; Psalm 30; 1 Timothy 3", passages: ["1 Kings 8", "Psalm 30", "1 Timothy 3"] },
  { id: "26-4", week: 26, date: "1/7", year: 2027, text: "2 Chronicles 5-7; Psalm 121; 1 Timothy 4", passages: ["2 Chronicles 5-7", "Psalm 121", "1 Timothy 4"] },
  { id: "26-5", week: 26, date: "1/8", year: 2027, text: "1 Kings 9; 2 Chronicles 8; 1 Timothy 5", passages: ["1 Kings 9", "2 Chronicles 8", "1 Timothy 5"] },

  // Week 27
  { id: "27-1", week: 27, date: "1/11", year: 2027, text: "1 Kings 10-11; 2 Chronicles 9; 1 Timothy 6", passages: ["1 Kings 10-11", "2 Chronicles 9", "1 Timothy 6"] },
  { id: "27-2", week: 27, date: "1/12", year: 2027, text: "Ecclesiastes 1-3; Psalm 45; 2 Timothy 1", passages: ["Ecclesiastes 1-3", "Psalm 45", "2 Timothy 1"] },
  { id: "27-3", week: 27, date: "1/13", year: 2027, text: "Ecclesiastes 4-6; Psalm 125; 2 Timothy 2", passages: ["Ecclesiastes 4-6", "Psalm 125", "2 Timothy 2"] },
  { id: "27-4", week: 27, date: "1/14", year: 2027, text: "Ecclesiastes 7-9; Psalm 46; 2 Timothy 3", passages: ["Ecclesiastes 7-9", "Psalm 46", "2 Timothy 3"] },
  { id: "27-5", week: 27, date: "1/15", year: 2027, text: "Ecclesiastes 10-12; 2 Timothy 4", passages: ["Ecclesiastes 10-12", "2 Timothy 4"] },

  // Week 28
  { id: "28-1", week: 28, date: "1/18", year: 2027, text: "1 Kings 12; 2 Chronicles 10-11; Titus 1", passages: ["1 Kings 12", "2 Chronicles 10-11", "Titus 1"] },
  { id: "28-2", week: 28, date: "1/19", year: 2027, text: "1 Kin 13-14; 2 Chronicles 12; Psalm 47; Titus 2", passages: ["1 Kings 13-14", "2 Chronicles 12", "Psalm 47", "Titus 2"] },
  { id: "28-3", week: 28, date: "1/20", year: 2027, text: "1 Kin 15; 2 Chronicles 13-14; Titus 3", passages: ["1 Kings 15", "2 Chronicles 13-14", "Titus 3"] },
  { id: "28-4", week: 28, date: "1/21", year: 2027, text: "2 Chronicles 15-16; 1 Kin 16; Philemon", passages: ["2 Chronicles 15-16", "1 Kings 16", "Philemon"] },
  { id: "28-5", week: 28, date: "1/22", year: 2027, text: "1 Kin 17-18; Psalm 119; Jude", passages: ["1 Kings 17-18", "Psalm 119", "Jude"] },

  // Week 29
  { id: "29-1", week: 29, date: "1/25", year: 2027, text: "1 Kin 19-21; 2 Chronicles 17; Psalm 129; Matthew 1", passages: ["1 Kings 19-21", "2 Chronicles 17", "Psalm 129", "Matthew 1"] },
  { id: "29-2", week: 29, date: "1/26", year: 2027, text: "1 Kings 22; 2 Chronicles 18; Matthew 2", passages: ["1 Kings 22", "2 Chronicles 18", "Matthew 2"] },
  { id: "29-3", week: 29, date: "1/27", year: 2027, text: "2 Chronicles 19-20; 2 Kin 1; Psalm 20; Matthew 3", passages: ["2 Chronicles 19-20", "2 Kings 1", "Psalm 20", "Matthew 3"] },
  { id: "29-4", week: 29, date: "1/28", year: 2027, text: "2 Kings 2-3; Psalm 48; Matthew 4", passages: ["2 Kings 2-3", "Psalm 48", "Matthew 4"] },
  { id: "29-5", week: 29, date: "1/29", year: 2027, text: "2 Kings 4-6; Matthew 5", passages: ["2 Kings 4-6", "Matthew 5"] },

  // Week 30
  { id: "30-1", week: 30, date: "2/1", year: 2027, text: "2 Kings 7-8; 2 Chronicles 21; Matthew 6", passages: ["2 Kings 7-8", "2 Chronicles 21", "Matthew 6"] },
  { id: "30-2", week: 30, date: "2/2", year: 2027, text: "2 Kings 9-10; Psalm 49; Matthew 7", passages: ["2 Kings 9-10", "Psalm 49", "Matthew 7"] },
  { id: "30-3", week: 30, date: "2/3", year: 2027, text: "2 Chronicles 22-23; 2 Kin 11; Psalm 131; Matthew 8", passages: ["2 Chronicles 22-23", "2 Kings 11", "Psalm 131", "Matthew 8"] },
  { id: "30-4", week: 30, date: "2/4", year: 2027, text: "2 Chronicles 24; 2 Kin 12; Psalm 50; Matthew 9", passages: ["2 Chronicles 24", "2 Kings 12", "Psalm 50", "Matthew 9"] },
  { id: "30-5", week: 30, date: "2/5", year: 2027, text: "Joel 1-3; Matthew 10", passages: ["Joel 1-3", "Matthew 10"] },

  // Week 31
  { id: "31-1", week: 31, date: "2/8", year: 2027, text: "Jonah 1-4; Matthew 11", passages: ["Jonah 1-4", "Matthew 11"] },
  { id: "31-2", week: 31, date: "2/9", year: 2027, text: "2 Kings 13-14; 2 Chronicles 25; Psalm 53; Matthew 12", passages: ["2 Kings 13-14", "2 Chronicles 25", "Psalm 53", "Matthew 12"] },
  { id: "31-3", week: 31, date: "2/10", year: 2027, text: "Amos 1-3; Matthew 13", passages: ["Amos 1-3", "Matthew 13"] },
  { id: "31-4", week: 31, date: "2/11", year: 2027, text: "Amos 4-6; Psalm 55; Matthew 14", passages: ["Amos 4-6", "Psalm 55", "Matthew 14"] },
  { id: "31-5", week: 31, date: "2/12", year: 2027, text: "Amos 7-9; Matthew 15", passages: ["Amos 7-9", "Matthew 15"] },

  // Week 32
  { id: "32-1", week: 32, date: "2/15", year: 2027, text: "Hosea 1-3; Matthew 16", passages: ["Hosea 1-3", "Matthew 16"] },
  { id: "32-2", week: 32, date: "2/16", year: 2027, text: "Hosea 4-6; Psalm 58; Matthew 17", passages: ["Hosea 4-6", "Psalm 58", "Matthew 17"] },
  { id: "32-3", week: 32, date: "2/17", year: 2027, text: "Hosea 7-10; Matthew 18", passages: ["Hosea 7-10", "Matthew 18"] },
  { id: "32-4", week: 32, date: "2/18", year: 2027, text: "Hosea 11-13; Matthew 19", passages: ["Hosea 11-13", "Matthew 19"] },
  { id: "32-5", week: 32, date: "2/19", year: 2027, text: "Hosea 14; 2 Chronicles 26-27; Psalm 61; Matthew 20", passages: ["Hosea 14", "2 Chronicles 26-27", "Psalm 61", "Matthew 20"] },

  // Week 33
  { id: "33-1", week: 33, date: "2/22", year: 2027, text: "2 Kings 15-16; Matthew 21", passages: ["2 Kings 15-16", "Matthew 21"] },
  { id: "33-2", week: 33, date: "2/23", year: 2027, text: "Isaiah 1-3; Psalm 9; Matthew 22", passages: ["Isaiah 1-3", "Psalm 9", "Matthew 22"] },
  { id: "33-3", week: 33, date: "2/24", year: 2027, text: "Isaiah 4-6; Matthew 23", passages: ["Isaiah 4-6", "Matthew 23"] },
  { id: "33-4", week: 33, date: "2/25", year: 2027, text: "Micah 1-4; Psalm 10; Matthew 24", passages: ["Micah 1-4", "Psalm 10", "Matthew 24"] },
  { id: "33-5", week: 33, date: "2/26", year: 2027, text: "Micah 5-7; Matthew 25", passages: ["Micah 5-7", "Matthew 25"] },

  // Week 34
  { id: "34-1", week: 34, date: "3/1", year: 2027, text: "Isaiah 7-10; Psalm 22; Matthew 26", passages: ["Isaiah 7-10", "Psalm 22", "Matthew 26"] },
  { id: "34-2", week: 34, date: "3/2", year: 2027, text: "Isaiah 11-13; Psalm 118; Matthew 27", passages: ["Isaiah 11-13", "Psalm 118", "Matthew 27"] },
  { id: "34-3", week: 34, date: "3/3", year: 2027, text: "Isaiah 14-16; Matthew 28", passages: ["Isaiah 14-16", "Matthew 28"] },
  { id: "34-4", week: 34, date: "3/4", year: 2027, text: "Isaiah 17-19; Psalm 62; 1 Corinthians 1", passages: ["Isaiah 17-19", "Psalm 62", "1 Corinthians 1"] },
  { id: "34-5", week: 34, date: "3/5", year: 2027, text: "Isaiah 20-22; 1 Corinthians 2", passages: ["Isaiah 20-22", "1 Corinthians 2"] },

  // Week 35
  { id: "35-1", week: 35, date: "3/8", year: 2027, text: "Isaiah 23-25; 1 Corinthians 3", passages: ["Isaiah 23-25", "1 Corinthians 3"] },
  { id: "35-2", week: 35, date: "3/9", year: 2027, text: "Isaiah 26-29; Psalm 65; 1 Corinthians 4", passages: ["Isaiah 26-29", "Psalm 65", "1 Corinthians 4"] },
  { id: "35-3", week: 35, date: "3/10", year: 2027, text: "Isaiah 30-32; 1 Corinthians 5", passages: ["Isaiah 30-32", "1 Corinthians 5"] },
  { id: "35-4", week: 35, date: "3/11", year: 2027, text: "Isaiah 33-35; 1 Corinthians 6", passages: ["Isaiah 33-35", "1 Corinthians 6"] },
  { id: "35-5", week: 35, date: "3/12", year: 2027, text: "2 Chronicles 28; 2 Kings 17; Psalm 66; 1 Corinthians 7", passages: ["2 Chronicles 28", "2 Kings 17", "Psalm 66", "1 Corinthians 7"] },

  // Week 36
  { id: "36-1", week: 36, date: "3/15", year: 2027, text: "2 Chronicles 29-31; 1 Corinthians 8", passages: ["2 Chronicles 29-31", "1 Corinthians 8"] },
  { id: "36-2", week: 36, date: "3/16", year: 2027, text: "2 Kings 18-19; 2 Chronicles 32; Psalm 67; 1 Corinthians 9", passages: ["2 Kings 18-19", "2 Chronicles 32", "Psalm 67", "1 Corinthians 9"] },
  { id: "36-3", week: 36, date: "3/17", year: 2027, text: "Isaiah 36-37; Psalm 123; 1 Corinthians 10", passages: ["Isaiah 36-37", "Psalm 123", "1 Corinthians 10"] },
  { id: "36-4", week: 36, date: "3/18", year: 2027, text: "2 Kings 20; Isaiah 38-40; Psalm 68; 1 Corinthians 11", passages: ["2 Kings 20", "Isaiah 38-40", "Psalm 68", "1 Corinthians 11"] },
  { id: "36-5", week: 36, date: "3/19", year: 2027, text: "Isaiah 41-44; 1 Corinthians 12", passages: ["Isaiah 41-44", "1 Corinthians 12"] },

  // Week 37
  { id: "37-1", week: 37, date: "3/22", year: 2027, text: "Isaiah 45-48; 1 Corinthians 13", passages: ["Isaiah 45-48", "1 Corinthians 13"] },
  { id: "37-2", week: 37, date: "3/23", year: 2027, text: "Isaiah 49-52; Psalm 69; 1 Corinthians 14", passages: ["Isaiah 49-52", "Psalm 69", "1 Corinthians 14"] },
  { id: "37-3", week: 37, date: "3/24", year: 2027, text: "Isaiah 53-55; Psalm 128; 1 Corinthians 15", passages: ["Isaiah 53-55", "Psalm 128", "1 Corinthians 15"] },
  { id: "37-4", week: 37, date: "3/25", year: 2027, text: "Isaiah 56-59; Psalm 70; 1 Corinthians 16", passages: ["Isaiah 56-59", "Psalm 70", "1 Corinthians 16"] },
  { id: "37-5", week: 37, date: "3/26", year: 2027, text: "Isaiah 60-63; 2 Corinthians 1", passages: ["Isaiah 60-63", "2 Corinthians 1"] },

  // Week 38
  { id: "38-1", week: 38, date: "3/29", year: 2027, text: "Isaiah 64-66; 2 Corinthians 2", passages: ["Isaiah 64-66", "2 Corinthians 2"] },
  { id: "38-2", week: 38, date: "3/30", year: 2027, text: "2 Kings 21; 2 Chronicles 33; Psalm 71; 2 Corinthians 3", passages: ["2 Kings 21", "2 Chronicles 33", "Psalm 71", "2 Corinthians 3"] },
  { id: "38-3", week: 38, date: "3/31", year: 2027, text: "Nahum 1-3; Psalm 149; 2 Corinthians 4", passages: ["Nahum 1-3", "Psalm 149", "2 Corinthians 4"] },
  { id: "38-4", week: 38, date: "4/1", year: 2027, text: "2 Kings 22-23; Psalm 73; 2 Corinthians 5", passages: ["2 Kings 22-23", "Psalm 73", "2 Corinthians 5"] },
  { id: "38-5", week: 38, date: "4/2", year: 2027, text: "2 Chronicles 34-35; 2 Corinthians 6", passages: ["2 Chronicles 34-35", "2 Corinthians 6"] },

  // Week 39
  { id: "39-1", week: 39, date: "4/5", year: 2027, text: "Habakkuk 1-3; 2 Corinthians 7", passages: ["Habakkuk 1-3", "2 Corinthians 7"] },
  { id: "39-2", week: 39, date: "4/6", year: 2027, text: "Zephaniah 1-3; Psalm 74; 2 Corinthians 8", passages: ["Zephaniah 1-3", "Psalm 74", "2 Corinthians 8"] },
  { id: "39-3", week: 39, date: "4/7", year: 2027, text: "Jeremiah 1-4; Psalm 130; 2 Corinthians 9", passages: ["Jeremiah 1-4", "Psalm 130", "2 Corinthians 9"] },
  { id: "39-4", week: 39, date: "4/8", year: 2027, text: "Jeremiah 5-7; Psalm 75; 2 Corinthians 10", passages: ["Jeremiah 5-7", "Psalm 75", "2 Corinthians 10"] },
  { id: "39-5", week: 39, date: "4/9", year: 2027, text: "Jeremiah 8-10; 2 Corinthians 11", passages: ["Jeremiah 8-10", "2 Corinthians 11"] },

  // Week 40
  { id: "40-1", week: 40, date: "4/12", year: 2027, text: "Jeremiah 11-13; 2 Corinthians 12", passages: ["Jeremiah 11-13", "2 Corinthians 12"] },
  { id: "40-2", week: 40, date: "4/13", year: 2027, text: "Jeremiah 14-16; Psalm 76; 2 Corinthians 13", passages: ["Jeremiah 14-16", "Psalm 76", "2 Corinthians 13"] },
  { id: "40-3", week: 40, date: "4/14", year: 2027, text: "Jeremiah 17-20; James 1", passages: ["Jeremiah 17-20", "James 1"] },
  { id: "40-4", week: 40, date: "4/15", year: 2027, text: "Jeremiah 22, 23, 26; Psalm 77; James 2", passages: ["Jeremiah 22", "Jeremiah 23", "Jeremiah 26", "Psalm 77", "James 2"] },
  { id: "40-5", week: 40, date: "4/16", year: 2027, text: "Jeremiah 25, 35, 36, 45; Psalm 133; James 3", passages: ["Jeremiah 25", "Jeremiah 35", "Jeremiah 36", "Jeremiah 45", "Psalm 133", "James 3"] },

  // Week 41
  { id: "41-1", week: 41, date: "4/19", year: 2027, text: "Jeremiah 27, 28, 29, 24; James 4", passages: ["Jeremiah 27", "Jeremiah 28", "Jeremiah 29", "Jeremiah 24", "James 4"] },
  { id: "41-2", week: 41, date: "4/20", year: 2027, text: "Jeremiah 37, 21, 34; Psalm 79; James 5", passages: ["Jeremiah 37", "Jeremiah 21", "Jeremiah 34", "Psalm 79", "James 5"] },
  { id: "41-3", week: 41, date: "4/21", year: 2027, text: "Jeremiah 30-33; 1 Peter 1", passages: ["Jeremiah 30-33", "1 Peter 1"] },
  { id: "41-4", week: 41, date: "4/22", year: 2027, text: "Jeremiah 38, 39, 52; 1 Peter 2", passages: ["Jeremiah 38", "Jeremiah 39", "Jeremiah 52", "1 Peter 2"] },
  { id: "41-5", week: 41, date: "4/23", year: 2027, text: "Ezra 1-2; John 21", passages: ["Ezra 1-2", "John 21"] },

  // Week 42
  { id: "42-1", week: 42, date: "4/26", year: 2027, text: "2 Kin 24-25; 2 Chronicles 36; Psalm 126; 1 Peter 3", passages: ["2 Kings 24-25", "2 Chronicles 36", "Psalm 126", "1 Peter 3"] },
  { id: "42-2", week: 42, date: "4/27", year: 2027, text: "Lamentations 1-5; Psalm 137; 1 Peter 4", passages: ["Lamentations 1-5", "Psalm 137", "1 Peter 4"] },
  { id: "42-3", week: 42, date: "4/28", year: 2027, text: "Obadiah; Jeremiah 40-42; Psalm 147; 1 Peter 5", passages: ["Obadiah", "Jeremiah 40-42", "Psalm 147", "1 Peter 5"] },
  { id: "42-4", week: 42, date: "4/29", year: 2027, text: "Jeremiah 43, 44, 46; 2 Peter 1", passages: ["Jeremiah 43", "Jeremiah 44", "Jeremiah 46", "2 Peter 1"] },
  { id: "42-5", week: 42, date: "4/30", year: 2027, text: "Jeremiah 47, 48, 49; Psalm 80; 2 Peter 2", passages: ["Jeremiah 47", "Jeremiah 48", "Jeremiah 49", "Psalm 80", "2 Peter 2"] },

  // Week 43
  { id: "43-1", week: 43, date: "5/3", year: 2027, text: "Ezekiel 1-3; John 1", passages: ["Ezekiel 1-3", "John 1"] },
  { id: "43-2", week: 43, date: "5/4", year: 2027, text: "Ezekiel 4-6; Psalm 82; John 2", passages: ["Ezekiel 4-6", "Psalm 82", "John 2"] },
  { id: "43-3", week: 43, date: "5/5", year: 2027, text: "Ezekiel 7-9; John 3", passages: ["Ezekiel 7-9", "John 3"] },
  { id: "43-4", week: 43, date: "5/6", year: 2027, text: "Ezekiel 10-12; Psalm 83; John 4", passages: ["Ezekiel 10-12", "Psalm 83", "John 4"] },
  { id: "43-5", week: 43, date: "5/7", year: 2027, text: "Ezekiel 13-15; Psalm 136; John 5", passages: ["Ezekiel 13-15", "Psalm 136", "John 5"] },

  // Week 44
  { id: "44-1", week: 44, date: "5/10", year: 2027, text: "Ezekiel 16-18; John 6", passages: ["Ezekiel 16-18", "John 6"] },
  { id: "44-2", week: 44, date: "5/11", year: 2027, text: "Ezekiel 19-21; Psalm 84; John 7", passages: ["Ezekiel 19-21", "Psalm 84", "John 7"] },
  { id: "44-3", week: 44, date: "5/12", year: 2027, text: "Ezekiel 22-24; Psalm 134; John 8", passages: ["Ezekiel 22-24", "Psalm 134", "John 8"] },
  { id: "44-4", week: 44, date: "5/13", year: 2027, text: "Ezekiel 25-27; Psalm 85; John 9", passages: ["Ezekiel 25-27", "Psalm 85", "John 9"] },
  { id: "44-5", week: 44, date: "5/14", year: 2027, text: "Ezekiel 28-30; John 10", passages: ["Ezekiel 28-30", "John 10"] },

  // Week 45
  { id: "45-1", week: 45, date: "5/17", year: 2027, text: "Ezekiel 31-33; John 11", passages: ["Ezekiel 31-33", "John 11"] },
  { id: "45-2", week: 45, date: "5/18", year: 2027, text: "Ezekiel 34-36; Psalm 86; John 12", passages: ["Ezekiel 34-36", "Psalm 86", "John 12"] },
  { id: "45-3", week: 45, date: "5/19", year: 2027, text: "Ezekiel 37-39; Psalm 87; John 13", passages: ["Ezekiel 37-39", "Psalm 87", "John 13"] },
  { id: "45-4", week: 45, date: "5/20", year: 2027, text: "Ezekiel 40-42; John 14", passages: ["Ezekiel 40-42", "John 14"] },
  { id: "45-5", week: 45, date: "5/21", year: 2027, text: "Ezekiel 43-45; Psalm 135; John 15", passages: ["Ezekiel 43-45", "Psalm 135", "John 15"] },

  // Week 46
  { id: "46-1", week: 46, date: "5/24", year: 2027, text: "Ezekiel 46-48; John 16", passages: ["Ezekiel 46-48", "John 16"] },
  { id: "46-2", week: 46, date: "5/25", year: 2027, text: "Daniel 1-3; Psalm 88; John 17", passages: ["Daniel 1-3", "Psalm 88", "John 17"] },
  { id: "46-3", week: 46, date: "5/26", year: 2027, text: "Daniel 4-6; John 18", passages: ["Daniel 4-6", "John 18"] },
  { id: "46-4", week: 46, date: "5/27", year: 2027, text: "Daniel 7-9; Psalm 91; John 19", passages: ["Daniel 7-9", "Psalm 91", "John 19"] },
  { id: "46-5", week: 46, date: "5/28", year: 2027, text: "Daniel 10-12; John 20", passages: ["Daniel 10-12", "John 20"] },

  // Week 47
  { id: "47-1", week: 47, date: "5/31", year: 2027, text: "Jeremiah 50-51; 2 Peter 3", passages: ["Jeremiah 50-51", "2 Peter 3"] },
  { id: "47-2", week: 47, date: "6/1", year: 2027, text: "Zechariah 6-8; 1 John 4", passages: ["Zechariah 6-8", "1 John 4"] },
  { id: "47-3", week: 47, date: "6/2", year: 2027, text: "Zechariah 9-11; 1 John 5", passages: ["Zechariah 9-11", "1 John 5"] },
  { id: "47-4", week: 47, date: "6/3", year: 2027, text: "Zechariah 12-14; Psalm 94; 2 John", passages: ["Zechariah 12-14", "Psalm 94", "2 John"] },
  { id: "47-5", week: 47, date: "6/4", year: 2027, text: "Ezra 5-6; Psalm 95; 3 John", passages: ["Ezra 5-6", "Psalm 95", "3 John"] },

  // Week 48
  { id: "48-1", week: 48, date: "6/7", year: 2027, text: "Esther 1-3; Psalm 139; Revelation 1", passages: ["Esther 1-3", "Psalm 139", "Revelation 1"] },
  { id: "48-2", week: 48, date: "6/8", year: 2027, text: "Esther 4-6; Revelation 2", passages: ["Esther 4-6", "Revelation 2"] },
  { id: "48-3", week: 48, date: "6/9", year: 2027, text: "Esther 7-10; Revelation 3", passages: ["Esther 7-10", "Revelation 3"] },
  { id: "48-4", week: 48, date: "6/10", year: 2027, text: "Ezra 7-10; Psalm 97; Revelation 4", passages: ["Ezra 7-10", "Psalm 97", "Revelation 4"] },
  { id: "48-5", week: 48, date: "6/11", year: 2027, text: "Nehemiah 1-3; Revelation 5", passages: ["Nehemiah 1-3", "Revelation 5"] },

  // Week 49
  { id: "49-1", week: 49, date: "6/14", year: 2027, text: "Nehemiah 4-6; Psalm 98; Revelation 6", passages: ["Nehemiah 4-6", "Psalm 98", "Revelation 6"] },
  { id: "49-2", week: 49, date: "6/15", year: 2027, text: "Nehemiah 7-9; Psalm 140; Revelation 7", passages: ["Nehemiah 7-9", "Psalm 140", "Revelation 7"] },
  { id: "49-3", week: 49, date: "6/16", year: 2027, text: "Nehemiah 10-13; Revelation 8", passages: ["Nehemiah 10-13", "Revelation 8"] },
  { id: "49-4", week: 49, date: "6/17", year: 2027, text: "Malachi; Psalm 2; Revelation 9", passages: ["Malachi", "Psalm 2", "Revelation 9"] },
  { id: "49-5", week: 49, date: "6/18", year: 2027, text: "Job 1-3; Psalm 29; Revelation 10", passages: ["Job 1-3", "Psalm 29", "Revelation 10"] },

  // Week 50
  { id: "50-1", week: 50, date: "6/21", year: 2027, text: "Job 4-7; Psalm 99; Revelation 11", passages: ["Job 4-7", "Psalm 99", "Revelation 11"] },
  { id: "50-2", week: 50, date: "6/22", year: 2027, text: "Job 8-11; Revelation 12", passages: ["Job 8-11", "Revelation 12"] },
  { id: "50-3", week: 50, date: "6/23", year: 2027, text: "Job 12-14; Psalm 100; Revelation 13", passages: ["Job 12-14", "Psalm 100", "Revelation 13"] },
  { id: "50-4", week: 50, date: "6/24", year: 2027, text: "Job 15-17; Revelation 14", passages: ["Job 15-17", "Revelation 14"] },
  { id: "50-5", week: 50, date: "6/25", year: 2027, text: "Job 18-20; Psalm 141; Revelation 15", passages: ["Job 18-20", "Psalm 141", "Revelation 15"] },

  // Week 51
  { id: "51-1", week: 51, date: "6/28", year: 2027, text: "Job 21-23; Psalm 101; Revelation 16", passages: ["Job 21-23", "Psalm 101", "Revelation 16"] },
  { id: "51-2", week: 51, date: "6/29", year: 2027, text: "Job 24-27; Revelation 17", passages: ["Job 24-27", "Revelation 17"] },
  { id: "51-3", week: 51, date: "6/30", year: 2027, text: "Job 28-30; Revelation 18", passages: ["Job 28-30", "Revelation 18"] },
  { id: "51-4", week: 51, date: "7/1", year: 2027, text: "Job 31-33; Psalm 102; Revelation 19", passages: ["Job 31-33", "Psalm 102", "Revelation 19"] },
  { id: "51-5", week: 51, date: "7/2", year: 2027, text: "Job 34-36; Revelation 20", passages: ["Job 34-36", "Revelation 20"] },

  // Week 52
  { id: "52-1", week: 52, date: "7/5", year: 2027, text: "Job 37-39; Psalm 103; Revelation 21", passages: ["Job 37-39", "Psalm 103", "Revelation 21"] },
  { id: "52-2", week: 52, date: "7/6", year: 2027, text: "Job 40-42; Psalm 150; Revelation 22", passages: ["Job 40-42", "Psalm 150", "Revelation 22"] },
  { id: "52-3", week: 52, date: "7/7", year: 2027, text: "Ezra 3-4; Psalm 92; 1 John 1", passages: ["Ezra 3-4", "Psalm 92", "1 John 1"] },
  { id: "52-4", week: 52, date: "7/8", year: 2027, text: "Haggai; Zechariah 1; Psalm 138; 1 John 2", passages: ["Haggai 1-2", "Zechariah 1", "Psalm 138", "1 John 2"] },
  { id: "52-5", week: 52, date: "7/9", year: 2027, text: "Zechariah 2-5; Psalm 93; 1 John 3", passages: ["Zechariah 2-5", "Psalm 93", "1 John 3"] }
];
