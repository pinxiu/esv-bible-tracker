import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyMemoryReview } from '../src/utils/memoryProgress.js';

const memoryView = await readFile(new URL('../src/components/VerseMemoryView.jsx', import.meta.url), 'utf8');

const verse = {
  id: 'john-3-16',
  reference: 'John 3:16',
  masteryLevel: 50,
  stageProgress: 2,
  reviewCount: 4,
  lastReviewed: '2026-07-20'
};

test('a finished no-backtracking review can increment Reviewed without granting mastery', () => {
  const updated = applyMemoryReview(verse, 3, 0, {
    awardMastery: false,
    countReview: true,
    reviewedOn: '2026-07-27'
  });
  assert.equal(updated.reviewCount, 5);
  assert.equal(updated.masteryLevel, 50);
  assert.equal(updated.stageProgress, 2);
  assert.equal(updated.lastReviewed, '2026-07-27');
});

test('a correct finished review increments Reviewed and advances mastery', () => {
  const updated = applyMemoryReview(verse, 3, 1, {
    awardMastery: true,
    countReview: true,
    reviewedOn: '2026-07-27'
  });
  assert.equal(updated.reviewCount, 5);
  assert.equal(updated.masteryLevel, 75);
  assert.equal(updated.stageProgress, 3);
});

test('partial verse progress does not count a review until the passage finishes', () => {
  const updated = applyMemoryReview(verse, 3, 0.5, {
    awardMastery: true,
    countReview: false
  });
  assert.equal(updated.reviewCount, 4);
  assert.equal(updated.lastReviewed, '2026-07-20');
});

test('memory UI exposes both next-verse review paths and no-backtracking completion', () => {
  assert.match(memoryView, /Review Next Verse/);
  assert.match(memoryView, /Jump to Next Un-Mastered Verse/);
  assert.match(memoryView, /autoCompleteAtEnd \|\| noBacktrackMode/);
  assert.match(memoryView, /awardMastery:\s*false,\s*countReview:\s*true/);
  assert.match(memoryView, /Complete Stage \{stage\}/);
  assert.doesNotMatch(memoryView, /if \(!passedRecall\) return/);
  assert.doesNotMatch(memoryView, /Review Finished/);
});
