export const politicsSearch = `<section class="container sub-content politics-content politics-explorer">
  <h2 id="policy-search-heading">Vad vill du veta om vår politik?</h2>
  <p class="politics-lead">Sök bland våra lokala förslag eller läs det viktigaste här nedanför.</p>
  <div class="policy-search-controls" role="search" aria-labelledby="policy-search-heading">
    <label class="sr-only" for="policy-search">Sök i vår lokala politik</label>
    <input id="policy-search" type="search" placeholder="Sök till exempel äldre, buss eller skola" autocomplete="off" aria-controls="policy-results">
    <div class="policy-filter-row">
      <label for="policy-period">Period <select id="policy-period"><option value="2026">Från 2026</option><option value="2022">2022–2026</option></select></label>
      <label for="policy-subject">Ämne <select id="policy-subject"><option value="all">Alla ämnen</option></select></label>
      <button id="policy-reset" type="button" hidden>Rensa sökningen</button>
    </div>
  </div>
  <div class="policy-results-top"><h2 id="policy-results-heading">Vår politik från 2026</h2><p id="policy-result-count" role="status" aria-live="polite" aria-atomic="true"></p></div>
  <p id="policy-period-note" class="policy-period"></p>
  <div id="policy-results"></div>
  <p class="policy-national">Söker du rikspolitik? <a href="https://kristdemokraterna.se/var-politik/politik-a-till-o">Se KD:s politik A–Ö ↗</a></p>
  <details class="policy-originals"><summary>Originalprogram och källor</summary>
    <p>Här kan du läsa originalen som förslagen ovan bygger på.</p>
    <ul class="program-list">
      <li><a href="/Valprogram%20KD%20H%C3%A4ssleholm%202026.pdf">Valprogram 2026 <span>PDF · Antaget 26 maj 2026</span></a></li>
      <li><a href="/program/landsbygdsprogram-2023.docx" download>Landsbygdsprogram <span>Word · Antaget 3 oktober 2023</span></a></li>
      <li><a href="/program/valmanifest-2022-2026.pdf">Valmanifest 2022–2026 <span>PDF · Antaget 26 april 2022</span></a></li>
    </ul>
  </details>
  <noscript><p>Sökningen kräver JavaScript. Du kan också läsa förslagen på <a href="/valprogram.html">programsidan</a> eller öppna originalprogrammen nedan.</p></noscript>
</section>`;
