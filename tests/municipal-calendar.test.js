import test from 'node:test';
import assert from 'node:assert/strict';
import { municipalEvents, mergeMunicipalEvents } from '../municipal-calendar.js';
import { localDate, timeLabel, makeICS } from '../calendar-utils.js';
const find = (kind, date) => municipalEvents.find(e => e.id === `kommun-${kind}-${date}`);
test('municipal schedule includes only KSAU, KS and KF, including boundary years', () => {
  assert.equal(municipalEvents.length, 39);
  assert.equal(new Set(municipalEvents.map(e => e.id)).size, 39);
  const counts = [0,13,0,14,12];
  const groups = [/^kommun-inlamning-/,/^kommun-ksau-/,/^kommun-berednings-au-/,/^kommun-ks-/,/^kommun-kf-/];
  groups.forEach((re,i) => assert.equal(municipalEvents.filter(e => re.test(e.id)).length, counts[i]));
  assert.ok(find('ksau','2026-11-25')); assert.ok(find('kf','2028-01-31'));
  assert.ok(find('ks','2028-01-26'));
  for (const event of municipalEvents) {
    assert.equal(localDate(event.start), event.date);
    assert.ok(Date.parse(event.end)>Date.parse(event.start));
    if (/^kommun-(ksau|ks|berednings-au)-/.test(event.id)) assert.equal(new Date(event.date).getUTCDay(),3);
    if (event.id.startsWith('kommun-kf-')) assert.equal(new Date(event.date).getUTCDay(),1);
  }
});
test('special start times match the PDF', () => {
  for (const [kind,date,time] of [['kf','2027-01-25','19:00'],['kf','2027-05-31','15:30'],['kf','2027-06-14','09:00'],['ks','2027-03-10','08:30']]) {
    assert.ok(timeLabel(find(kind,date)).includes(time));
  }
});
test('ICS never invents meeting end times', () => {
  const meeting = makeICS(find('kf','2027-05-31'));
  assert.match(meeting,/DTSTART:20270531T133000Z/);
  assert.doesNotMatch(meeting,/DTEND/);
});
test('editable calendar can override or cancel a baseline meeting without duplicates', () => {
  const event = {...find('ks','2027-03-10'),status:'cancelled'};
  const merged = mergeMunicipalEvents([event]);
  assert.equal(merged.length,39);
  assert.equal(merged.find(e=>e.id===event.id).status,'cancelled');
});
