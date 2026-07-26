export function getPassagesForDay(day) {
  if (Array.isArray(day?.passages) && day.passages.length > 0) {
    return day.passages;
  }
  return day?.text ? day.text.split(/;\s*/).filter(Boolean) : [];
}

export function findOldestMissedUnreadPassage(planList, isPast) {
  if (!Array.isArray(planList)) return null;

  for (const day of planList) {
    if (!isPast(day.date, day.year) || day.completed) continue;

    const passages = getPassagesForDay(day);
    const completedPassages = day.completedPassages || {};
    const unreadPassage = passages.find(passage => !completedPassages[passage]);

    if (unreadPassage) return unreadPassage;
  }

  return null;
}
