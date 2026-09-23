# SEO och AI-sök vid publicering

## Förberett i projektet

- Publik domän: `https://kdhlm.se`, angiven i `content.js`.
- Startsida och artikelarkiv genereras som HTML. Arkivet länkar till alla publicerade artiklar utan JavaScript; filtrering och Visa fler aktiveras när JavaScript körs.
- Navigering, sidrubriker och lokala programtexter finns i HTML. På mobil fungerar arkivets navigering även utan JavaScript.
- Alla sidor har canonical, beskrivning och Open Graph. Startsidan heter Kristdemokraterna i Hässleholm.
- Strukturerade data för organisation, webbplats och arkiv. Artiklar har Article och BreadcrumbList, med separat Person för varje känd undertecknare. Okända författare tillskrivs inte någon person.
- Importerade filnamnsdatum anges som skrivdatum/dateCreated. Ange `publishedAt` när ett faktiskt publiceringsdatum finns och `modified` vid en verklig innehållsändring. Byggdatum används aldrig som påhittad uppdateringstid.
- Sitemap och robots.txt genereras vid bygge. Inga exempelartiklar, utkast eller framtidsdaterade artiklar finns i sitemap. Exempelartiklar har noindex.
- De 25 debattartiklarna har utvalda bilder från `assets/Stock/`, beskrivande alternativtext och bildtext som markerar illustrationsbilder. Optimerade WebP-bilder används på kort, artikelsidor och i delningsmetadata.

## Kontrollera bygget före publicering

```powershell
npm run build
npm run preview
```

Med preview igång, i en annan terminal:

```powershell
npm run test:seo
node --test tests/articles.test.js tests/seo.test.js
```

SEO-testet kontrollerar alla sitemap-adresser i det byggda resultatet, metadata, artikelarkivet utan JavaScript, författare och datum, mobilbredder och interaktiv bläddring. Det är en lokal teknisk kontroll, inte ett besked om att Google har indexerat sajten.

## När sajten finns på den publika domänen

1. Kontrollera att HTTPS och den avsedda domänen fungerar. Ställ in permanent omdirigering från www till kdhlm.se hos webbhotellet om båda används. Förhandsvisningsdomäner bör hållas utanför indexering via värdens skydd eller X-Robots-Tag.
2. Verifiera domänen i Google Search Console med det Google tilldelar ert konto, normalt en DNS-post. Detta kan inte slutföras utan tillgång till Search Console och DNS.
3. Skicka `https://kdhlm.se/sitemap.xml` till Search Console. Gör motsvarande i Bing Webmaster Tools om ni använder det.
4. Använd URL-inspektion för startsidan, `/aktuellt.html` och en artikel. Kontrollera att Google kan läsa sidan, att canonical stämmer och att inget produktionsskydd eller noindex ligger kvar.
5. Kontrollera artikeldata med Googles Rich Results Test på de publika adresserna. Ett saknat publiceringsdatum är avsiktligt tills ett riktigt datum är känt; fyll inte i ett gissat datum enbart för testets skull.
6. Följ indexeringsstatus, sökfrågor och trafik i Search Console efter lanseringen. Insänd sitemap är en upptäcktssignal, inte en garanti för indexering, placering eller citering i AI-svar.

Ingen separat llms.txt eller särskild AI-märkning krävs för Googles AI-sök. Projektet fokuserar på åtkomlig HTML, tydlig avsändare, korrekta uppgifter och riktiga källänkar. Robots.txt tillåter publika innehållssidor generellt; beslut om enskilda AI-crawlers kan göras separat vid behov.

## Officiella referenser

- [Google: artikeldata](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: skapa och skicka sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: AI-sök](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
