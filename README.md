# KD Hässleholm

HTML5, CSS och vanilla JavaScript med Vite. Ingen SPA-router eller frontendramverk. Inte publicerad till Vercel.

## Aktuell sidstruktur

Startsidan använder Aktuellt-designen: banner, kategorifilter och nyhetskort överst, sedan ”Välj område. Få beskeden direkt.” och kalendern. Herons text och Simonporträtt hålls närmare mitten även på breda skärmar, medan bakgrunden fyller hela bredden. Huvudmenyns Aktuellt går till `/`. `aktuellt.html` fungerar fortsatt som nyhetsarkiv. Träffa oss är en kalendersektion på startsidan och information under Kontakt, utan separat menyalternativ.

Förslagskorten ingår i Fokusfråga. Den åttonde fliken, ”Nationella frågor”, visar de 15 nationella förslagen från `siteContent.politics.national`, med föregående/nästa, punktval, slumpval som alltid byter kort och en källänk som följer det visade förslaget. Gamla `/#loften` och `/#nationellt` öppnar den nationella fliken. Kör `node scripts/verify-proposal-cards.js` för att kontrollera kort, länkar, slumpval, tangentbord och mobilvyer.

Fokusfrågan på `/#fokus` har sju lokala områdesflikar och Nationella frågor, en sammanfattning och förslagskort med pilar, punktval och slumpval. Det lokala innehållet hämtas från `siteContent.politics.topics` i `content.js`. Länken under sammanfattningen öppnar rätt ämne på politiköversikten. Flikarna stöder piltangenter, Home och End. Den gemensamma implementationen finns i `policy-focus.js` och `policy-focus.css`. Kör `node scripts/verify-policy-focus.js` för att verifiera alla lokala förslag, bläddring, tangentbord, ämneslänkar, direktankare och fyra skärmbredder.

Alla medlemsknappar är vanliga länkar direkt till KD:s medlemsregistrering. Om oss visar en kort introduktion följd av två likvärdiga kolumner: styrelsen i officiell ordning till vänster och lokala politiker i alfabetisk namnordning till höger. Porträttkort visar namn, respektive grupps uppdrag, e-postadress och telefonnummer direkt; saknade kontaktuppgifter markeras som ej publicerade. Varje kolumn har separat bläddring och Visa alla, med fyra personer på dator och två på mobil. På mobil staplas kolumnerna. Devisen i sidfoten är **Människan före systemet**. Nyhetskategorin Gruppledaren visas inte längre; Facebook-rubriken är **FRÅN FACEBOOK**. Mediebevakningen är ett enda kronologiskt flöde utan ämnesfilter.

## Undersidor och automatisk styrelsehämtning

### Artiklar och porträtt

**Debattarkiv 2026:** 25 unika artiklar från Word- och PDF-filerna i `artiklar/` finns i `debate-articles.js` och kopplas in via `content.js`. Debatt nås på `/#debatt` och `/aktuellt.html#debatt`, med senaste datum först, datum/författare på korten, tre artiklar åt gången och Visa fler. När riktiga artiklar finns visas inga exempelartiklar i flödet, även lokalt. Originaltexter och underskrifter bevaras; bilderna är märkta som illustrationsbilder. Datum kommer från filnamnens ÅÅMMDD, inte verifierade tidningspubliceringar. Saknad författare ersätts inte med ett antaget namn.

Två versionspar (fotbolls-VM 12 maj och vårdskandaler 19 augusti) visas bara en gång. Versionerna med `(1)` används tills vidare; de skiljer sig i text/undertecknare från versionerna utan suffix. Inga originalfiler raderas. Fyra dokument är inte införda: filen daterad `251231`, det odaterade pressmeddelandet om Folkbildningsrådet, den odaterade hemtjänstartikeln och tillväxtartikeln från 28 maj med `XX` som undertecknare. Fullständigt urval finns i `artifacts/debate-import-report.json`.

Import: `node scripts/extract-debate-sources.js`, sedan `node scripts/import-debate-articles.js` och `npm run build`. Importskriptet innehåller de granskade versionsvalen och PDF-styckegränserna och skriver över den importerade modulen. Redigera importerade artiklar i `debate-articles.js` för manuella ändringar, eller ändra importreglerna om importen ska köras om. Lägg andra nya artiklar i `siteContent.subpages.articles` som tidigare. `node scripts/verify-debate-articles.js` jämför samtliga importerade texter och underskrifter med källorna och verifierar filtrering, datumordning, unika sidor, mobil, bilder, sitemap och läsning utan JavaScript.

Nyhetskortens bilder, rubriker och Läs mer går till `/artiklar/<slug>.html`. Vite genererar separata HTML-filer från `siteContent.subpages.articles` inför dev/build och vid innehållsändringar under utveckling. Rubrik, ingress, brödtext och metadata finns i HTML även utan JavaScript. Publicerade artiklar får canonical, Open Graph, Article-JSON-LD och en post i sitemap. `siteContent.siteURL` anger webbplatsens publika domän. Ange ett stabilt `slug` (alternativt `id`); ändra inte detta när rubriken ändras. Utöver befintliga artikelfält stöds `author`, `modified` och `caption`. Nya publiceringar och ändringar kräver ett nytt produktionsbygge.

Exempelartiklar har egna länkbart renderade sidor för designgranskning, tydlig exempelmärkning och `noindex`. De ingår inte i sitemap. Opublicerade och framtidsdaterade artiklar genereras inte, och tidigare genererade filer tas bort när en artikel dras tillbaka. Källfiler finns i `artiklar/`, tillhörande bilder i `public/article-media/`; dessa hanteras av `scripts/generate-articles.js`. Redigera innehållet i `content.js`, inte de genererade HTML-filerna.

Porträtt hämtas från personernas individuella KD-profiler där större bilder finns, med verifierat person-ID och offentlig bildflagga. Fyra profilförfrågningar körs samtidigt; bildadresser cachas i 24 timmar och listbilder sparas som reserv. Webbläsaren faller tillbaka till listbilden om profilbilden inte kan laddas. Upplösningen begränsas fortfarande av originalet hos KD. `npm run sync:directory` uppdaterar också den sparade reservkopian med större porträtt.

`npm run test:articles` verifierar artikelnavigering, direktlänkar, HTML utan JavaScript, metadata, saknade sidor, mobilvyer, porträttdimensioner och bildreserv. Kör även mot byggd preview med `TEST_BASE_URL` satt till preview-adressen.

Designen har justerats ytterligare mot sexsidorsmockupen: bredare innehållsyta, kondenserad brödtext och rubriker, proportionerade bildbanners, varm bakgrund med diskret stadsmotiv och blå sidfot med sociala ikoner. En visuell översikt finns på `/artifacts/mockup-review.html` i den lokala utvecklingsservern. Skärmbilderna där uppdateras av `npm run test:subpages`.

Fyra illustrativa AI-genererade bildmotiv används som ersättning för saknade mockup-original: sjö, kaffebord, sporthall och Hässleholmsskylt. De är inte dokumentära lokalbilder. WebP-filer finns i `assets/mockup-*.webp`, original i `artifacts/design-sources` och promptar i `artifacts/image-prompts.md`. Den verkliga Avenyn-bilden och befintliga personporträtt används fortsatt.

Undersidorna är nu implementerade efter den tillhandahållna mockupen: `aktuellt.html`, `politik.html`, sex separata `politik-*.html`, `fortroendevalda.html`, `om-oss.html` och `kontakt.html`. Politiköversikten har sex luftiga kort med linjeikoner, diskreta skuggor och två kolumner på dator. Det kompletta tidigare programinnehållet finns kvar på `valprogram.html` och i den ursprungliga PDF-filen. Alla HTML-filer i projektroten registreras som byggingångar; detta är ingen klientrouter.

**Aktiv offentlig datakoppling:** `/api/representatives` hämtar styrelse och lokala politiker från KD:s officiella Hässleholmssida utan inloggning. Den publika sidan innehåller strukturerade JSON-data; adaptern läser dessa som data och kör aldrig webbplatsens JavaScript. Bara namn, styrelsens först visade roll, alla distinkta lokala politiska uppdrag, porträtt, publicerad e-post/telefon och profillänk lämnas ut. Politiska uppdrag i källdatan avdupliceras; inga ytterligare roller hittas på. Personer som finns i båda listorna slås samman i datan och visas i båda kolumnerna med rätt grupps uppdrag.

Om oss och Förtroendevalda delar samma källa i `window.siteContent.directory`. Alla i styrelsen nås via bläddring eller Visa hela styrelsen på Om oss. Förtroendevalda har sökning, filtrering, fyra kort åt gången och expanderbara kontaktuppgifter. Vid inspektionen fanns 13 styrelsepersoner och 20 unika företrädare; antal och innehåll kommer från källan, inte hårdkodade listor.

På öppna, synliga sidor sker hämtning var femte minut och när fliken aktiveras. Servern hämtar om källan vid nästa besök efter fem minuter. Detta är automatisk synkning, inte en webhook eller garanterad omedelbar uppdatering. Ingen process behöver köras när ingen besöker sidan. Serverns senaste fungerande uppsättning behålls vid fel; `public/data/representatives.json` är en kontrollerad reservkopia som även fungerar vid kalla starter. Den befintliga REST Redis-cachen används dessutom om `CACHE_REST_URL` och `CACHE_REST_TOKEN` finns, men krävs inte för denna offentliga koppling.

Vite har uttryckliga lokala adaptrar för `/api/representatives`, `/api/media` och `/api/contact`, både i dev och preview. Styrelsesynkningen fungerar alltså redan lokalt. Det ändrar inte att Excel- och Facebookfunktionerna nedan behöver `vercel dev` och sina respektive behörigheter. Vid publicering kör Vercel samma `api/representatives.js` som en serverfunktion, utan nya hemligheter. Källsidans struktur kan ändras; vid en sådan ändring behålls reservdata och adaptern kan behöva justeras.

Uppdatera den sparade reservkopian med `npm run sync:directory` före ett framtida bygge. Lägg bara verifierade nyheter i `siteContent.subpages.articles` med stabilt `id`/`slug`, `published: true`, datum, kategori, titel, ingress, bild, alternativtext och `paragraphs`. Nyhetsflödet visar exempelartiklar enbart i lokal exempelvy; deras separata granskningssidor är alltid märkta och har `noindex`.

Kontaktformuläret skickar meddelanden via POST /api/contact och Resend. Besökaren får en bekräftelse först när e-posttjänsten accepterat meddelandet; vid fel behålls alla fält. Mottagaren är låst på servern till hassleholm@kristdemokraterna.se, och Reply-To är besökarens adress. Inget automatiskt svar skickas till besökaren. Meddelandet sparas inte av webbservern men behandlas av Resend och mottagarens e-postsystem.

För att aktivera leverans: konfigurera RESEND_API_KEY och CONTACT_FROM_EMAIL på servern. Avsändaren måste tillhöra en verifierad domän i Resend. Lokalt kan värdena ligga i .env.local (starta om Vite); vid publicering anges de som servervariabler. Hemligheterna får aldrig ha VITE_-prefix. Se [Resends API-dokumentation](https://resend.com/docs/api-reference/emails/send-email). Utan konfiguration svarar API:t med 503, aldrig med en falsk skickat-bekräftelse. Verklig leverans är ännu inte verifierad.

Vite dev och preview har en lokal adapter för kontakt-API:t. Produktion kräver en serverfunktion, inte enbart statisk hosting. API:t validerar längder, typ och origin, begränsar requeststorleken och har ett honeypotfält. Dubbelklick spärras, och återförsök av samma meddelande har samma idempotensnyckel. En begränsad minnesbaserad spärr tillåter fem försök per IP och tio minuter per serverinstans; den är inte ett distribuerat spamskydd och nollställs vid omstart. Inför publik drift bör plattformens gemensamma rate limiting konfigureras. Inga meddelanden eller adresser skrivs i loggarna.

Kör node --test tests/contact.test.js för API-validering och simulerad e-postleverans. Kör node scripts/verify-contact.js för webbläsarflödet med simulerade svar samt kontroll av lokalt API. Dessa tester skickar inga riktiga mejl.

`npm run test:subpages` kontrollerar alla sex sidtyper vid 1024, 1440, 390 och 320 px, kortlänkar, förslag, artikelkategorier, sökning, styrelsen, kontaktformulärets skickaflöde samt automatisk uppdatering och felhantering. Skärmbilder ligger i `artifacts/sub-*-BREDD.png`. Den här delen jämförs med den nya sexdelade undersidesmockupen; noteringen längre ned om saknad exakt startsidesmockup avser endast startsidans tidigare arbete.

## Starta och bygg

SEO inför publicering är förberett i `scripts/seo-pages.js`, `seo-utils.js` och artikelgeneratorn. Vite genererar navigering, rubriker, lokala programtexter och artikelarkiv i HTML; arkivet innehåller alla publicerade artikellänkar utan JavaScript. Varje sida får canonical och delningsmetadata. Artiklar har separata författarobjekt och brödsmuledata. Importerade datum är skrivdatum, inte antagna publiceringsdatum. Sitemap återskapas från aktuella sidor och artiklar vid varje bygge. Se [PUBLICERING-SEO.md](PUBLICERING-SEO.md) för tester och stegen i Search Console som återstår efter publicering. `npm run test:seo` körs med byggd preview på port 4173.

Node 22.12 eller senare (Node 24 LTS rekommenderas för Vercel).

```sh
npm ci
npm run dev
```

Öppna `http://127.0.0.1:5173`. Lokal Vite visar **märkta exempeldata** för gruppledare, kalender och Facebook. Exempeldatum flyttas fram relativt dagens datum så att kalenderns funktioner alltid kan granskas; de är aldrig bokade möten.

```sh
npm run build
npm run preview
```

Förhandsvisa bygget på `http://127.0.0.1:4173`. Även här är exempeldata tillgängliga lokalt. `?data=live` väljer API-data. På externa värdnamn används alltid API-data; exempeldata aktiveras aldrig som reservinnehåll i produktion.

`vercel.json`: byggkommando `npm run build`, utdatakatalog `dist`. Vercel hanterar `api/` separat från det statiska byggresultatet. `index.html` och `politik.html` är separata HTML-ingångar i `vite.config.js`. Inga catch-all-rewrites. Produktionspublicering ska ske först efter separat instruktion.

## Filer och redigering

- `index.html`: semantisk grundstruktur i önskad sektionsordning.
- `styles.css`: profilvariabler, lokala typsnitt, layout och responsivitet.
- `content.js`: `window.siteContent`, med navigering, texter, bilder, kontakter, medlemslänk, politikinnehåll och gruppledarens publicerade inlägg.
- `app.js`: DOM-rendering, bildspel, meny, inlägg, kalender, Facebook och dialoger. Extern text sätts med `textContent`; externa URL:er valideras.
- `calendar-utils.js`: Stockholmformatering, filtrering och ICS-export.
- `examples.js`: separata utvecklingsposter, laddade enbart i lokal exempelvy och tillgängliga i `window.siteContent.examples`.
- `assets/`: originalbilder/logotyper från befintlig webbplats samt lokala typsnitt och licenser.
- `public/`: ursprunglig valprogram-PDF på oförändrad URL, robots.txt, sitemap och typsnittslicenser.
- `api/calendar.js`, `api/facebook.js`: Vercel-funktioner. `server/`: enbart serverbaserad validering, Microsoftkoppling och beständig cache.
- `tests/`, `scripts/verify-browser.js`: datatester och webbläsarverifiering. Skärmbilder sparas i `artifacts/`.

Alla sju kommunala politikområden, samtliga förslag, tio kandidatpresentationer och de nationella förslagen från kdhlm.se finns i `content.js` och i arkivet `valprogram.html`. Den nya översikten finns på `politik.html`. Gamla bokmärken `/#politik`, `/#kandidater` och `/#pdf` leder vidare till motsvarande innehåll. `/#fokus` öppnar områdesväljaren och `/#loften` förslagskorten på startsidan. Det tidigare projektet fanns inte lokalt; arbetsmappen var tom vid arbetets start.

### Publicera gruppledarens text

Lägg ett objekt i `window.siteContent.leaderPosts`. Senaste publicerade inlägget vars datum har inträffat visas. Använd verifierade uppgifter; exemplet nedan är ett schema, inte ett verkligt inlägg.

```js
{
  id: 'stabilt-id',
  published: true,
  date: '2026-09-05T09:00:00+02:00',
  name: 'Verifierat namn',
  role: 'Verifierad roll',
  portrait: new URL('./assets/verifierat-portratt.jpg', import.meta.url).href,
  title: 'Inläggets rubrik',
  intro: 'Kort ingress',
  quote: 'Verifierat citat ur texten',
  paragraphs: ['Första stycket.', 'Nästa stycke.']
}
```

Ingen person har antagits vara gruppledare. I exempelvyn används en tydlig porträttplatshållare och ett markerat exempelcitat. I livevyn visas ett neutralt tomläge tills ett riktigt inlägg finns.

## Excel: färdig adapter, inte ansluten

Vald lösning: servern hämtar `.xlsx` med Microsoft Graph **driveItem `/content`** och läser filen med ExcelJS. Den använder OAuth client credentials för OneDrive for Business/SharePoint. Den använder **inte** Excel `/workbook/tables/.../rows`, eftersom Microsoft uttryckligen anger att application permissions inte stöds där.

Detta återstår att ansluta:

1. En faktisk arbetsbok i organisationens OneDrive for Business eller SharePoint.
2. En Entra-app och administratörsgodkänd åtkomst. Dokumentationen för vald download-endpoint anger application `Files.Read.All` som lägsta listade rättighet. Organisationens administratör ska granska omfattningen. Ingen sådan behörighet har begärts eller lagts till av implementationen.
3. `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_DRIVE_ID`, `MS_ITEM_ID`, eventuellt `MS_SHEET_NAME` (standard `Kalender`).
4. En beständig REST Redis-cache med `CACHE_REST_URL` och `CACHE_REST_TOKEN`, till exempel en befintlig Upstash-databas. Cache krävs för att aktivera kalender-API:t. Inga nya tjänster har skapats.

Kopiera `.env.example` till `.env.local` lokalt. Lägg värdena i Vercels **servermiljövariabler** för rätt miljö. Lägg aldrig hemligheter i `VITE_`-variabler, `content.js`, `public/` eller klientkod. `.env.local` och `.vercel/` ignoreras av Git.

### Arbetsbokens format

Bladet `Kalender` ska ha rubrikerna på rad 1, med dessa namn (ordningen får ändras):

```text
id | rubrik | startdatum | starttid | slutdatum | sluttid | plats | adress | beskrivning | status | publicera
```

`scripts/create-calendar-template.js` skapar en riktig arbetsbok med en opublicerad exempelrad i `artifacts/kalender-mall.xlsx`.

- `id`: unikt och stabilt, 1–100 tecken, bokstäver a–z, siffror, `_` eller `-`. Ändra aldrig ID när ett möte flyttas. Dubbla publicerade ID:n tas bort ur det nya resultatet för att undvika att fel möte visas.
- `rubrik`, start/slutdatum, start/sluttid och `plats` är obligatoriska. Slut ska ligga efter start.
- Datum: Excel-datum eller text `YYYY-MM-DD`. Tid: Excel-tid eller text `HH:mm`. Ange både slutdatum och sluttid, även när det är samma dag.
- `status`: tomt/`planerad`/`scheduled`, eller `inställd`/`inställt`/`cancelled`.
- `publicera`: endast `ja`, `true`, `1`, booleskt true eller talet 1 publiceras. Allt annat döljs.
- Adress och beskrivning är publik text. Inga kontaktlistor eller interna anteckningar returneras. Formler utförs inte; använd faktiska cellvärden i publiceringsfält.
- Max 10 MB komprimerad arbetsbok och 5 000 datarader. Felaktiga enskilda rader hoppas över; antal fel skrivs endast i serverloggen. Om alla publicerade rader är felaktiga behålls förra fungerande uppsättningen. En giltigt tom kalender ersätter däremot tidigare innehåll.

Alla lokala tider tolkas som `Europe/Stockholm` och omvandlas till UTC. Sommar- och vintertid hanteras automatiskt. Klockslag som inte finns vid vårens omställning och den dubbla timmen på hösten avvisas; välj ett otvetydigt klockslag. Det hindrar att ett möte tyst flyttas en timme. Kalenderns vyer visar alltid Stockholmstid, oavsett besökarens tidszon.

### Automatisk synkning och reservdata

En öppen, synlig startsida hämtar kalenderdata ungefär var femte minut, och när fliken blir synlig igen. Servern använder en beständig cache i fem minuter och hämtar därefter om arbetsboken vid nästa förfrågan. Detta är automatisk, besöksdriven synkning; ingen bakgrundsprocess körs utan besök och ingen garanterad realtid utlovas. Cache och polling kan tillsammans fördröja en ändring mer än fem minuter.

Endast filtrerade publika fält sparas i cachen, aldrig arbetsboken. Senast fungerande data sparas utan TTL så att de överlever kalla serverstarter och tillfälliga Microsoftfel. Vid cachefel behåller redan öppna sidor sitt senaste resultat. Passerade aktiviteter filtreras bort med sluttiden. Inställda framtida aktiviteter finns kvar med tydlig märkning om `publicera` fortfarande är ja. ICS använder stabil UID, UTC-tider, korrekt textescaping, CRLF och vikning vid 75 UTF-8-byte.

`Visa plats` visar adress på samma sida. Inga kartkoordinater gissas. Om verifierade `latitude`/`longitude` senare läggs till i det publika dataformatet finns en karta bakom ett uttryckligt val att ladda OpenStreetMap. Inga kartanrop görs före det valet.

## I media: automatisk Google Alerts-bevakning

`/i-media.html` är mediesidan. Startsidan och `/aktuellt.html` har också fliken **I media**, direktlänk `/#i-media`. De sju Google Alerts-adresserna som användaren har lämnat finns enbart i `server/media-config.js`: Simon Berneblad Mandegård, Simon Berneblad, Erika Heil Utbult, Kristdemokraterna Hässleholm samt tre ytterligare Simon-bevakningar med sökorden Norra Skåne respektive Frilagt. Alla fem Simon-flöden samlas under Simon och dubletter slås ihop. Tidningsnamnen är del av Google-bevakningarnas sökfrågor, inte en domänbegränsning i vår kod. En separat bevakning för exakt **KD Hässleholm** återstår att få RSS-länk till; kategorin i gränssnittet omfattar tills vidare den anslutna Kristdemokraterna-bevakningen.

`api/media.js` hämtar Atom-flöden parallellt på servern. XML valideras med `saxes`, HTML återges som vanlig text, Google-länkar packas upp till artikellänkar och spårningsparametrar tas bort. Samma artikel-URL från flera bevakningar slås ihop och behåller sina ämnesetiketter. Datum sorteras med senaste först. Urvalet kommer från Google Alerts-sökningarna; ingen ytterligare faktagranskning eller AI-bedömning görs. Justera källor/sökregler i Google Alerts vid behov. För att dölja en felträff läggs originalartikelns URL i `hiddenMediaURLs` i serverkonfigurationen och ändringen publiceras.

API:t cachelagrar lyckade hämtningar i 15 minuter per serverinstans, med CDN-cache på Vercel. Sidan kontrollerar efter uppdateringar var 15:e minut medan den är synlig. Det är läsdriven uppdatering, inte ett schemalagt arkivjobb. En tidigare lyckad hämtning kan användas i upp till 24 timmar vid fel, så länge serverinstansen lever. Det finns inget beständigt artikelarkiv: flödenas aktuella innehåll avgör vilka artiklar som visas, och gammal reservdata överlever inte en omstart. Vyn skiljer på tomt flöde, partiella fel och total otillgänglighet, med möjlighet att försöka igen.

Lokal Vite dev **och preview** har en uttrycklig adapter för `/api/media`, så den riktiga kopplingen kan testas utan kontohemligheter eller `vercel dev`. Produktionsdrift kräver att Vercel kör API-funktionen; enbart statisk filhosting räcker inte.

Designpreview: `http://127.0.0.1:5173/i-media.html?preview=media` eller `http://127.0.0.1:5173/?preview=media#i-media`. Preview kräver localhost och ett uttryckligt URL-val. Samtliga exempel är märkta och saknar externa artikellänkar; på publik domän visas alltid den riktiga bevakningen. `/i-media.html` utan parametern visar live även lokalt. Vid första verifieringen svarade alla fyra flöden med HTTP 200 men utan artiklar.

`npm test` testar XML, länkar, dubletter, blockering, cache och fel. `npm run test:media` testar riktiga RSS-svar genom API:t, tomvy, preview, gemensamt flöde utan ämnesfilter, nyhetsflikar, mobilbredder, externa länkar och återhämtning efter fel. Simulerade artiklar används för fyllda flöden; detta bevisar inte att Google har levererat en verklig artikel ännu. Skärmbilder och resultat sparas i `artifacts/media-*`.

## Facebook: förberett gränssnitt, inte anslutet

Användaren har bekräftat den lokala sidan `https://www.facebook.com/kdhassleholm/` och egen administratörsåtkomst. Webbplatsens Facebooklänkar använder nu denna adress. Sid-ID och Page access token återstår innan flödet kan anslutas. Instagramlänken är fortsatt rikspartiets.

Funktionen är en förberedd Pages API-adapter för `/{page-id}/published_posts`. Den returnerar endast ID, avsändare, text, tillgängligt datum, tillåten bild-URL och permalänk. Graphs tokenbärande `paging.next` lämnas aldrig till klienten; endast den opaka `after`-markören returneras. Äldre poster laddas via servern. Ingen skrapning, likes eller påhittad historik används.

**Meta-dokumentationens sidor gick inte att läsa vid kontrollen 2026-09-05** (429 i webbläsarverktyget, därefter ”This page isn't available right now” i vanlig webbläsare). Därför är denna adapter ännu inte verifierad mot aktuell Meta-version eller faktiska sidbehörigheter och ska inte beskrivas som färdigansluten.

Före anslutning behövs en administratörsverifierad lokal Facebooksida, sid-ID, sidnamn, officiell sid-URL, Page access token, en aktuell stödd Graph-version och kontroll av aktuella åtkomstkrav i Meta-dokumentationen. Kontrollera särskilt `pages_read_engagement`, sidåtkomst, appens åtkomstnivå och eventuell App Review. Konfigurera därefter servervariablerna `META_PAGE_ID`, `META_PAGE_NAME`, `META_PAGE_URL`, `META_PAGE_ACCESS_TOKEN`, `META_API_VERSION` och testa faktiskt läsbehörighet och paginering. Uppdatera reservlänken i `content.js` när den lokala sidans URL är verifierad.

Ingen garanti ges för alla inläggstyper eller fullständig historik. Om egna kort inte tillåts av behörigheterna behöver man välja en officiell Page Plugin. Dess layout, innehållsurval och historik kan inte tvingas att matcha mockupens tre egna kort. En sådan inbäddning är inte installerad och ska ligga bakom uttryckligt samtycke; webbplatsen laddar i nuläget inga Facebookskript, inbäddningar eller spårningskakor. Vid fel visas alltid reservlänken.

## Testa integrationerna lokalt

Vites devserver och preview har lokala adaptrar för kontakt, mediebevakning och företrädare. Övriga API-funktioner kräver vercel dev.

```sh
# Efter att Vercel-projektet och dess development-miljö har anslutits:
npx vercel dev
```

Använd adressen Vercel skriver ut (normalt `http://localhost:3000`) med `?data=live`. Vercel kör Vite och API-funktionerna tillsammans. CLI-installation, projektkoppling och externa inloggningar har inte gjorts här. Detta kommando är lokal utveckling, inte produktionspublicering.

Testa verklig synkning när åtkomsten finns:

1. Publicera en framtida rad med ett unikt ID. Kontrollera listan, månadsvyn och ICS-filens lokala mötestid.
2. Ändra tiden och platsen men behåll ID. Låt sidan vara öppen minst en cache/pollperiod och verifiera att samma aktivitet uppdateras utan dubblett.
3. Markera inställd. Kontrollera status och `STATUS:CANCELLED` i ICS.
4. Sätt `publicera=nej`. Kontrollera att aktiviteten försvinner efter synkning och att andra interna fält aldrig finns i `/api/calendar`.
5. Lägg till en felaktig rad bredvid en giltig. Den giltiga ska fortfarande visas.
6. Simulera ett Microsoftfel efter en lyckad hämtning och kontrollera att den beständiga kopian visas även från en ny webbläsare/serverinstans.

## Verifiering

```sh
npm test
npm run test:browser
```

Webbläsartestet använder installerad Edge i headless-läge. För Chromium: `npx playwright install chromium` och ange `TEST_BROWSER_CHANNEL=chromium`. Ange `TEST_BASE_URL=http://127.0.0.1:4173` för produktionsbygget.

Tester täcker sommartid, felaktiga Excelrader, en riktig skapad XLSX-fil, filtrering, stabila ID:n, mockad Graphhämtning, ICS och stängda API:er utan konfiguration. Webbläsartester täcker karusellens paus, hover, fokus, tangentbord, rörelsereducering, mobilmeny, inlägg, kalender, platsinformation, ICS-nedladdning, Facebook, dialoger och femminutersuppdatering med mockat API. Skärmbilder tas vid 1024, 1440, 390 och 320 pixlar. De här testerna bevisar inte en anslutning till riktiga Microsoft- eller Metakonton.

Visuell grund: den senaste textbeskrivningens sektioner och mått, samt de tidigare bifogade bildernas grafiska uttryck. De tillgängliga bifogade bilderna visar en annan sektionsordning än den senaste beskrivningen. En exakt pixeljämförelse med en separat mockup för gruppledare/kalender/Facebook är därför inte gjord.

## Källor och tillgångar

Kommunens sammanträdesplan finns i `municipal-calendar.js`: 39 sammanträden (13 KSAU, 14 KS och 12 KF) från den tillhandahållna PDF:en för 2027, inklusive angränsande datum 2026 och 2028. Inlämningsdagar och berednings-AU visas inte. Specialtider bevaras och okända sluttider uppfinns inte. Kalendern visas även utan Excel-anslutning; en Excel-post med samma `id` kan uppdatera eller ställa in ett kommunalt möte.

Debattartiklarnas bildval finns i `article-images.js`, med original i `assets/Stock/`, alternativtext och bildtext. `npm run build` och `npm run dev` skapar automatiskt WebP-versioner i `public/article-media/` (högst 1600 pixlar på längsta sidan). Originalen ändras inte. Ändra bildvalet i `article-images.js` och bygg om/starta om utvecklingsservern; samma bild används i artikelkort, artikelsida och delningsmetadata. En ny artikel utan bildval använder sin redaktionella reservbild.

Inspekterade 2026-09-05:

- [Befintlig webbplats](https://kdhlm.se/): logotyper, Avenyn, kulturhuset, kandidatbild, politikinnehåll och PDF. Alla använda bilder hämtades som bildfiler; mockupen används inte som bakgrund. Fotografens namn framgick inte. Verifiera befintliga bildrättigheter innan publicering om dessa inte redan är dokumenterade.
- [Grafisk profil](https://kd.nu/profil) omdirigerade till [grafisk manual 2.0](https://kd.nu/KD_Grafisk_Manual.pdf), daterad 2021-09-17. Manualen lästes lokalt, inklusive färger, logotyp, bildval och typografi.
- [Officiella kontakter och förtroendevalda](https://kristdemokraterna.se/vart-parti/foretradare/kd-lokalt/skane/hassleholm): Åkaregatan 14, 281 38 Hässleholm; 076-329 92 31; hassleholm@kristdemokraterna.se.
- [Officiellt medlemsflöde](https://kristdemokraterna.se/engagera-dig/ansok-om-medlemskap-i-kristdemokraterna).
- [Microsoft driveItem download och application permissions](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0).
- [Microsoft Excel list rows: application permissions stöds inte](https://learn.microsoft.com/en-us/graph/api/table-list-rows?view=graph-rest-1.0).
- [Microsoft client credentials](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow).
- [Meta Pages API posts – försök till verifiering](https://developers.facebook.com/docs/pages-api/posts/).
- [Vite](https://vite.dev/guide/) och [Vercel Functions](https://vercel.com/docs/functions/quickstart).

Typsnitten är lokala Barlow (400/500/600/700), Barlow Condensed (700/800) och Lora Italic (400), med OFL-licenser i `assets/fonts/` och `public/licenses/`. Serverberoendet ExcelJS använder en uppdaterad `uuid` via override; både XLSX-läsning och skapande av arbetsbok testas.
