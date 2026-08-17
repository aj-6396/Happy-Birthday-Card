export const isBDay = function () {
  const dateStr = process.env.OPEN_DATE || process.env.BIRTH_DATE;
  if (!dateStr) return "ON_TIME";
  const startTime = new Date(dateStr + "T00:00").getTime();
  const endTime = startTime + 24 * 60 * 60 * 1000;
  const localTime = Date.now();
  if (localTime < startTime) return "IS_EARLY";
  if (localTime > endTime) return "IS_LATE";
  return "ON_TIME";
};

