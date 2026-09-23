// Imported ONLY on localhost in an explicit example view. Never used as live fallback.
export function exampleContent(images) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const date = (offset) => { const d = new Date(`${today}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + offset); return d.toISOString().slice(0, 10); };
  return {
    leaderPosts: [{ id: 'example-leader', published: true, example: true, date: today, name: 'Namn publiceras här', role: 'Gruppledarens uppgifter inväntas', portrait: null, title: 'En inblick i vårt arbete.', intro: 'Här får du följa tankarna och arbetet bakom den lokala politiken. Ett personligt perspektiv från vår gruppledare.', quote: 'Här finns plats för ett kort citat ur gruppledarens inlägg.', paragraphs: ['Detta är en utvecklingsplatshållare. Ingen person har tillskrivits texten eller citatet.', 'När ett verifierat inlägg publiceras visas hela texten här på sidan. Namn, roll, porträtt, datum, ingress och citat hämtas från samma innehållsobjekt.'] }],
    events: [
      ['example-1', 'Öppet möte om Hässleholms framtid', 3, '18:00', '19:30', 'Plats meddelas'],
      ['example-2', 'Träffa KD på stan', 8, '11:00', '13:00', 'Hässleholm'],
      ['example-3', 'Medlemsträff och politiska samtal', 14, '18:30', '20:00', 'Plats meddelas'],
      ['example-4', 'Samtal om vår kommun', 20, '18:00', '19:00', 'Plats meddelas'],
      ['example-5', 'Exempel på inställd aktivitet', 25, '17:00', '18:00', 'Plats meddelas'],
    ].map(([id, title, offset, start, end, place]) => ({ id, title, startLocal: `${date(offset)}T${start}`, endLocal: `${date(offset)}T${end}`, place, address: 'Ingen mötesadress är fastställd – exempelaktivitet.', description: 'Det här är en exempelaktivitet för att visa hur kalendern fungerar. Det är inte ett bokat möte. Datumet är endast för demonstration.', status: id === 'example-5' ? 'cancelled' : 'scheduled', example: true })),
    posts: [
      { id: 'example-fb-1', image: images.avenue, alt: 'Avenyn i Hässleholm', text: 'Nära vardagen. Nära Hässleholm. Här kommer våra senaste uppdateringar att visas.', more: 'Detta är en exempelpost. Bilden kommer från den befintliga webbplatsen; texten är inte ett publicerat Facebookinlägg.' },
      { id: 'example-fb-2', image: images.meeting, alt: 'Hässleholm kulturhus', text: 'Möten, samtal och lokalt engagemang. Följ det som händer i vår kommun.', more: 'Detta är en exempelpost som visar hur ett längre inlägg kan läsas direkt på startsidan.' },
      { id: 'example-fb-3', image: images.candidates, alt: 'Toppkandidaterna på den befintliga webbplatsen', text: 'Människorna bakom politiken. Här finns plats för bilder och nyheter från KD.', more: 'Exempelpost. Bilden visar Simon Berneblad Mandegård och Erika Heil Utbult; ingen av dem har tillskrivits denna text.' },
      { id: 'example-fb-4', image: images.avenue, alt: 'Avenyn i Hässleholm', text: 'Ett exempel på ett äldre inlägg.', more: 'Ladda fler visar äldre innehåll utan att lämna startsidan.' },
    ].map(p => ({ ...p, example: true, author: 'KD Hässleholm · exempel' })),
  };
}
