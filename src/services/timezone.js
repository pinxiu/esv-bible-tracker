import { BIBLE_PLAN } from '../data/biblePlanData.js';
import { isDateToday } from '../utils/dateUtils.js';

// Beijing Timezone ID
export const BEIJING_TZ = 'Asia/Shanghai';

/**
 * Gets the current date formatted as M/D in Beijing Timezone.
 */
export function getBeijingTodayDate() {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: BEIJING_TZ,
      month: 'numeric',
      day: 'numeric'
    });
    return formatter.format(now); // e.g. "7/21"
  } catch (e) {
    return "7/21";
  }
}

export function getBeijingFormattedDateTime() {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
      timeZone: BEIJING_TZ,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);
  } catch (e) {
    return "Tue, Jul 21, 08:00 AM";
  }
}

/**
 * Finds the scheduled reading plan item for today's date in Beijing timezone.
 */
export function getTodayPlanItem() {
  const match = BIBLE_PLAN.find(item => isDateToday(item.date, item.year));
  if (match) return match;
  
  return BIBLE_PLAN.find(item => item.date === "7/21") || BIBLE_PLAN[0];
}

/**
 * Gets all readings prior to today that are uncompleted
 */
export function getMissedReadings(completedMap) {
  const todayItem = getTodayPlanItem();
  const todayIndex = BIBLE_PLAN.findIndex(item => item.id === todayItem.id);
  
  if (todayIndex <= 0) return [];
  
  const pastItems = BIBLE_PLAN.slice(0, todayIndex);
  return pastItems.filter(item => !completedMap[item.id] || !completedMap[item.id].allCompleted);
}
