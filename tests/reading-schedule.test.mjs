import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDelimitedSchedule, parseScheduleRows } from '../src/utils/readingSchedule.js';
import { readFile } from 'node:fs/promises';

const readingPlanView = await readFile(new URL('../src/components/ReadingPlanView.jsx', import.meta.url), 'utf8');
const electronMain = await readFile(new URL('../electron/main.cjs', import.meta.url), 'utf8');
const electronPreload = await readFile(new URL('../electron/preload.js', import.meta.url), 'utf8');

test('parses pasted tab-separated reading schedules', () => {
  const plan = parseDelimitedSchedule(
    'Week\tDate\tYear\tPassages\n1\t7/13\t2026\tGenesis 1-2; Psalm 19; Mark 1\n1\t7/14\t2026\tGenesis 3-5; Mark 2'
  );
  assert.equal(plan.length, 2);
  assert.deepEqual(plan[0].passages, ['Genesis 1-2', 'Psalm 19', 'Mark 1']);
  assert.equal(plan[0].date, '7/13');
  assert.equal(plan[0].year, 2026);
  assert.equal(plan[1].week, 1);
});

test('parses the visible CSV placeholder exactly as displayed', () => {
  const plan = parseDelimitedSchedule(
    'Date,Year,Passages\n7/13,2026,"Genesis 1-2; Psalm 19; Mark 1"\n7/14,2026,"Genesis 3-5; Mark 2"'
  );
  assert.equal(plan.length, 2);
  assert.deepEqual(plan[0].passages, ['Genesis 1-2', 'Psalm 19', 'Mark 1']);
  assert.equal(plan[1].date, '7/14');
});

test('also accepts literal escaped tabs and newlines copied from plain text', () => {
  const plan = parseDelimitedSchedule(
    'Week\\tDate\\tYear\\tPassages\\n1\\t7/13\\t2026\\tGenesis 1-2; Psalm 19'
  );
  assert.equal(plan.length, 1);
  assert.deepEqual(plan[0].passages, ['Genesis 1-2', 'Psalm 19']);
});

test('parses spreadsheet dates and derives omitted weeks', () => {
  const plan = parseScheduleRows([
    ['Custom Reading Schedule'],
    ['Keep the header names'],
    ['Date', 'Passages'],
    [new Date(2027, 0, 4), 'Matthew 1; Psalm 1'],
    ['1/5/2027', 'Matthew 2']
  ]);
  assert.equal(plan[0].date, '1/4');
  assert.equal(plan[0].year, 2027);
  assert.equal(plan[0].week, 1);
  assert.equal(plan[1].year, 2027);
});

test('rejects schedules without required columns', () => {
  assert.throws(
    () => parseScheduleRows([['Date', 'Notes'], ['7/13', 'Genesis 1']]),
    /Missing required.*Passages/
  );
});

test('template download uses a native save dialog with a visible result', () => {
  assert.match(electronPreload, /saveReadingScheduleTemplate.*save-reading-schedule-template/);
  assert.match(electronMain, /dialog\.showSaveDialog/);
  assert.match(electronMain, /fs\.promises\.copyFile/);
  assert.match(readingPlanView, /Template saved to/);
  assert.match(readingPlanView, /\.\/reading-schedule-template\.xlsx/);
  assert.doesNotMatch(readingPlanView, /href="\/reading-schedule-template\.xlsx"/);
  assert.match(readingPlanView, /Date,Year,Passages\\n7\/13,2026/);
});
