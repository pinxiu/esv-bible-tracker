export function applyMemoryReview(
  verse,
  stageCompleted,
  partialFraction = 1,
  {
    awardMastery = true,
    countReview = partialFraction >= 1,
    reviewedOn = new Date().toISOString().split('T')[0]
  } = {}
) {
  const previousLevel = verse.masteryLevel || 0;
  const isFullStage = partialFraction >= 1;
  let masteryLevel = previousLevel;

  if (awardMastery && stageCompleted === 4 && isFullStage) {
    masteryLevel = 100;
  } else if (awardMastery) {
    const baseMastery = (stageCompleted - 1) * 25;
    const currentStageBonus = Math.round(25 * Math.min(1, Math.max(0, partialFraction)));
    masteryLevel = Math.min(100, Math.max(previousLevel, baseMastery + currentStageBonus));
  }

  return {
    ...verse,
    masteryLevel,
    stageProgress: awardMastery && isFullStage
      ? Math.max(verse.stageProgress || 1, stageCompleted)
      : (verse.stageProgress || 1),
    reviewCount: (verse.reviewCount || 0) + (countReview ? 1 : 0),
    lastReviewed: countReview ? reviewedOn : verse.lastReviewed
  };
}
