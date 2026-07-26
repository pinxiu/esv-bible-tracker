import test from 'node:test';
import assert from 'node:assert/strict';

import { findOldestMissedUnreadPassage } from '../src/utils/readingPlan.mjs';

const isPast = date => date < '7/28';

test('oldest missed opens the first unread passage within that day', () => {
  const plan = [{
    date: '7/27',
    year: 2026,
    completed: false,
    passages: ['Genesis 1-2', 'Mark 1'],
    completedPassages: {
      'Genesis 1-2': true,
      'Mark 1': false
    }
  }];

  assert.equal(findOldestMissedUnreadPassage(plan, isPast), 'Mark 1');
});

test('oldest missed skips completed days and days without unread passages', () => {
  const plan = [
    {
      date: '7/25',
      completed: false,
      passages: ['Genesis 1'],
      completedPassages: { 'Genesis 1': true }
    },
    {
      date: '7/26',
      completed: true,
      passages: ['Matthew 1'],
      completedPassages: { 'Matthew 1': true }
    },
    {
      date: '7/27',
      completed: false,
      text: 'Mark 2; Psalms 1',
      completedPassages: { 'Mark 2': true }
    }
  ];

  assert.equal(findOldestMissedUnreadPassage(plan, isPast), 'Psalms 1');
});
