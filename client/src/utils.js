import { LEVELS } from "./constants";

export function getLevel(xp) {
  let level = LEVELS[0];
  for (const v of LEVELS) {
    if (xp >= v.min) level = v;
  }
  return level;
}

export function getNextLevel(xp) {
  for (const v of LEVELS) {
    if (xp < v.min) return v;
  }
  return null;
}

export function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export function getWeekDates() {
  const today = new Date();
  const todayIdx = getTodayIndex();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + (i - todayIdx));
    dates.push(d.getDate());
  }
  return dates;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function getTimezoneOffset() {
  const offset = -new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const sign = offset >= 0 ? "+" : "-";
  return `UTC${sign}${hours}`;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}
