import { sampleInstant } from './calendar-utils.js';

// Transcribed and visually checked against the supplied municipal schedule.
// Columns: other committee deadline, KLF deadline, KSAU, KS, KF.
const rows = [
  ['2026-10-27','2026-11-03','2026-11-25','2026-12-09','2027-01-25'],
  ['2026-12-15','2026-12-22','2027-01-13','2027-01-27','2027-02-15'],
  ['2027-01-12','2027-01-19','2027-02-10','2027-03-03','2027-03-22'],
  ['2027-02-23','2027-03-02','2027-03-24','2027-04-07','2027-04-26'],
  ['2027-03-09','2027-03-16','2027-04-14','2027-04-28','2027-05-31'],
  ['2027-04-06','2027-04-13','2027-05-05','2027-05-19','2027-06-14'],
  ['2027-05-04','2027-05-11','2027-06-02','2027-06-16','2027-08-30'],
  ['2027-07-13','2027-07-20','2027-08-11','2027-08-25','2027-09-27'],
  ['2027-08-10','2027-08-17','2027-09-08','2027-09-22','2027-10-25'],
  ['2027-09-14','2027-09-21','2027-10-13','2027-10-27','2027-11-29'],
  ['2027-10-05','2027-10-12','2027-10-27','2027-11-17','2027-12-13'],
  ['2027-11-02','2027-11-09','2027-12-01','2027-12-15','2028-01-31'],
  ['2027-12-14','2027-12-21','2028-01-12','2028-01-26',null],
];
const notes = {
  'kf-2027-03-22': 'Över- och underskottshantering.',
  'ks-2027-04-07': 'Årsredovisning och månadsuppföljning.',
  'kf-2027-04-26': 'Årsredovisning.',
  'kf-2027-05-31': 'Bolagens redovisningar.',
  'kf-2027-06-14': 'Heldag – budget.',
  'ks-2027-06-16': 'Månadsuppföljning per 30/4.',
  'ks-2027-09-22': 'Delårsrapport.',
  'kf-2027-10-25': 'Delårsrapport.',
  'ks-2027-11-17': 'Månadsuppföljning per 31/10.',
  'ks-2027-03-10': 'Heldag – bolag.',
};
const nextDay = date => new Date(Date.parse(date + 'T12:00:00Z') + 86400000).toISOString().slice(0,10);
function meeting(kind, date, title, time, endTime) {
  const allDay = !time, endDate = nextDay(date);
  return {
    id: `kommun-${kind}-${date}`, title, status: 'scheduled',
    start: sampleInstant(date + 'T' + (time || '00:00')),
    end: sampleInstant((endTime ? date : endDate) + 'T' + (endTime || '00:00')),
    allDay, endUnknown: !allDay && !endTime, date, endDate,
    place: 'Plats ej angiven', address: '',
    description: [notes[kind+'-'+date], allDay ? 'Sista inlämningsdag. Klockslag anges inte i underlaget.' : !endTime ? 'Sluttid och mötesplats anges inte i underlaget.' : 'Mötesplats anges inte i underlaget.', 'Kommunalt planeringsdatum, inte ett internt KD-möte. Källa: Hässleholms kommuns ”Sammanträdesdagar 2027 och tider för inlämning av handlingar”.'].filter(Boolean).join(' '),
  };
}
export const municipalEvents = rows.flatMap(([, , au, ks, kf]) => [
  meeting('ksau', au, 'Kommunstyrelsens arbetsutskott (KSAU)', '09:00'),
  meeting('ks', ks, 'Kommunstyrelsen (KS)', '13:30'),
  ...(kf ? [meeting('kf', kf, 'Kommunfullmäktige (KF)', {'2027-01-25':'19:00','2027-05-31':'15:30','2027-06-14':'09:00'}[kf] || '18:00')] : []),
]).concat(meeting('ks', '2027-03-10', 'Kommunstyrelsen (KS) – heldag, bolag', '08:30'))
  .sort((a,b) => Date.parse(a.start)-Date.parse(b.start) || a.id.localeCompare(b.id));

// An explicit event with the same ID in the editable calendar overrides the baseline.
export const mergeMunicipalEvents = events => [...new Map([...municipalEvents, ...events].map(event => [event.id, event])).values()];
