// Browser-safe calendar helpers. All display is explicitly Stockholm time.
export const ZONE = 'Europe/Stockholm';
export const formatDate = (date, options) => new Intl.DateTimeFormat('sv-SE', { timeZone: ZONE, ...options }).format(new Date(date));
export const localDate = (date) => formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
export const timeLabel = (event) => event.allDay ? 'Hela dagen' : event.endUnknown ? `Från ${formatDate(event.start, { hour: '2-digit', minute: '2-digit' })} · sluttid ej angiven` : `${formatDate(event.start, { hour: '2-digit', minute: '2-digit' })}–${formatDate(event.end, { hour: '2-digit', minute: '2-digit' })}`;
export function upcomingEvents(events, now = Date.now()) {
  return [...events].filter(e => Number.isFinite(Date.parse(e.start)) && Number.isFinite(Date.parse(e.end)) && Date.parse(e.end) > now).sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || a.id.localeCompare(b.id));
}
const escapeICS = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r/g, '');
function foldLine(line) {
  const encoder = new TextEncoder();
  let result = '', part = '', bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) { result += part + '\r\n'; part = ' '; bytes = 1; }
    part += char; bytes += size;
  }
  return result + part;
}
export function makeICS(event, now = new Date()) {
  const stamp = (date) => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KD Hassleholm//Kalender//SV', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${escapeICS(event.id)}@kdhlm.se`, `DTSTAMP:${stamp(now)}`,
    ...(event.allDay ? [`DTSTART;VALUE=DATE:${localDate(event.start).replaceAll('-','')}`, `DTEND;VALUE=DATE:${localDate(event.end).replaceAll('-','')}`] : [`DTSTART:${stamp(event.start)}`, ...(event.endUnknown ? [] : [`DTEND:${stamp(event.end)}`])]),
    `SUMMARY:${escapeICS((event.example ? 'EXEMPEL – ' : '') + event.title)}`, `LOCATION:${escapeICS([event.place, event.address].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${escapeICS(event.description)}`, `STATUS:${event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT', 'END:VCALENDAR'].map(foldLine).join('\r\n') + '\r\n';
}
// Only used for sample dates. Tries both CET/CEST offsets and verifies the wall clock.
export function sampleInstant(local) {
  for (const offset of ['+02:00', '+01:00']) {
    const instant = new Date(local + offset);
    const wall = `${localDate(instant)}T${formatDate(instant, { hour: '2-digit', minute: '2-digit' })}`;
    if (wall === local) return instant.toISOString();
  }
  throw new Error('Invalid Stockholm sample time');
}
