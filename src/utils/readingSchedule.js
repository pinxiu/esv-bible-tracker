const REQUIRED_HEADERS = ['date', 'passages'];

const normalizeHeader = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '');

const formatDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      date: `${value.getMonth() + 1}/${value.getDate()}`,
      year: value.getFullYear()
    };
  }

  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (!match) throw new Error(`Invalid date "${raw}". Use M/D or M/D/YYYY.`);
  let year = match[3] ? Number(match[3]) : null;
  if (year && year < 100) year += 2000;
  return { date: `${Number(match[1])}/${Number(match[2])}`, year };
};

const splitPassages = (value) => String(value || '')
  .split(/\s*(?:;|\||\n)\s*/)
  .map(passage => passage.trim())
  .filter(Boolean);

export function parseScheduleRows(rows, defaultYear = new Date().getFullYear()) {
  const normalizedRows = (rows || []).filter(row => (
    Array.isArray(row) && row.some(value => String(value ?? '').trim())
  ));
  if (normalizedRows.length < 2) {
    throw new Error('Add a header row and at least one reading day.');
  }

  const headerRowIndex = normalizedRows.findIndex(row => {
    const candidateHeaders = row.map(normalizeHeader);
    return REQUIRED_HEADERS.every(required => candidateHeaders.includes(required));
  });
  if (headerRowIndex === -1) {
    throw new Error('Missing required "Date" or "Passages" column.');
  }

  const scheduleRows = normalizedRows.slice(headerRowIndex);
  const headers = scheduleRows[0].map(normalizeHeader);
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required "${required === 'date' ? 'Date' : 'Passages'}" column.`);
    }
  }

  const indexes = {
    week: headers.indexOf('week'),
    date: headers.indexOf('date'),
    year: headers.indexOf('year'),
    passages: headers.indexOf('passages')
  };

  return scheduleRows.slice(1).map((row, rowIndex) => {
    const parsedDate = formatDate(row[indexes.date]);
    const explicitYear = indexes.year >= 0 ? Number(row[indexes.year]) : null;
    const year = parsedDate.year || (Number.isFinite(explicitYear) && explicitYear > 0 ? explicitYear : defaultYear);
    const passages = splitPassages(row[indexes.passages]);
    if (passages.length === 0) {
      throw new Error(`Row ${rowIndex + 2} has no passages. Separate multiple passages with semicolons.`);
    }
    const explicitWeek = indexes.week >= 0 ? Number(row[indexes.week]) : null;
    const week = Number.isFinite(explicitWeek) && explicitWeek > 0
      ? explicitWeek
      : Math.floor(rowIndex / 5) + 1;

    return {
      id: `custom-${year}-${parsedDate.date.replace('/', '-')}-${rowIndex + 1}`,
      week,
      date: parsedDate.date,
      year,
      text: passages.join('; '),
      passages,
      completed: false,
      completedPassages: {}
    };
  });
}

export function parseDelimitedSchedule(text, defaultYear = new Date().getFullYear()) {
  const input = String(text || '')
    .replace(/\\t/g, '\t')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .trim();
  if (!input) throw new Error('Paste your schedule first.');
  const delimiter = input.includes('\t') ? '\t' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') {
        cell += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[index + 1] === '\n') index++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return parseScheduleRows(rows, defaultYear);
}
