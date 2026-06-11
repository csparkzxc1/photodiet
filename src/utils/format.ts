export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  const formatted = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted}${units[index]}`;
}

export function formatMB(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function formatGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

const KO_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function formatDateKo(ts: number): string {
  const d = new Date(ts);
  const weekday = KO_WEEKDAYS[d.getDay()] ?? '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${weekday})`;
}

export function formatTimeKo(ts: number): string {
  const d = new Date(ts);
  const hour = d.getHours();
  const minute = d.getMinutes();
  const ampm = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${ampm} ${hour12}:${String(minute).padStart(2, '0')}`;
}
