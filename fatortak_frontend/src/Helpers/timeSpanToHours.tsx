export const timeSpanToHours = (timeSpan: string): number => {
  if (!timeSpan) return 0;

  const parts = timeSpan.split(":");
  if (parts.length < 2) return 0;

  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const seconds = parseInt(parts[2]) || 0;

  return hours + minutes / 60 + seconds / 3600;
};
