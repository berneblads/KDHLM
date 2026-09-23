// All editorial content lives here. Asset URLs are resolved by Vite at build time.
import { debateArticles } from './debate-articles.js';
import { withArticleImage } from './article-images.js';
const asset = (name) => new URL(`./assets/${name}`, import.meta.url).href;
export const siteContent = {
  siteURL: 'https://kdhlm.se',
  integrations: { calendar: '/api/calendar', facebook: '/api/facebook', refreshMs: 300000 },
  links: {
    membership: 'https://kristdemokraterna.se/engagera-dig/ansok-om-medlemskap-i-kristdemokraterna',
    representatives: 'https://kristdemokraterna.se/vart-parti/foretradare/kd-lokalt/skane/hassleholm',
    program: '/Valprogram%20KD%20H%C3%A4ssleholm%202026.pdf',
    facebook: 'https://www.facebook.com/kdhassleholm/',
    instagram: 'https://www.instagram.com/kristdemokraterna/',
  },
  navigation: [
    { label: 'Aktuellt', href: '/' }, { label: 'Vår politik', href: '/politik.html' },
    { label: 'Om oss', href: '/om-oss.html' }, { label: 'Kontakt', href: '/kontakt.html' },
    { label: 'Bli medlem', link: 'membership', primary: true },
  ],
  footerNavigation: [
    { label: 'Kontakt', href: '/kontakt.html' }, { label: 'Förtroendevalda', href: '/fortroendevalda.html' },
    { label: 'Vårt politiska program', link: 'program' }, { label: 'Facebook', link: 'facebook' },
    { label: 'Instagram', link: 'instagram' },
    { label: 'Om oss', href: '/om-oss.html' },
  ],
  text: {
    heroEyebrow: 'KRISTDEMOKRATERNA I HÄSSLEHOLM',
    leaderEyebrow: 'SENASTE FRÅN GRUPPLEDAREN', leaderHeading: 'En inblick i vårt arbete.',
    readPost: 'Läs hela inlägget', closePost: 'Stäng inlägget',
    calendarEyebrow: 'TRÄFFA OSS', calendarHeading: 'Kommande möten och aktiviteter.',
    listView: 'Lista', monthView: 'Månad', moreEvents: 'Visa fler tillfällen ↓',
    facebookEyebrow: 'FRÅN FACEBOOK', facebookHeading: 'KD Hässleholm.',
    morePosts: 'Ladda fler inlägg ↓', facebookLink: 'Besök KD på Facebook ↗',
    membershipHeading: 'BLI EN DEL AV\nKD HÄSSLEHOLM',
    membershipText: 'Tillsammans kan vi göra skillnad.\nBli medlem och var med och forma ett bättre Hässleholm.',
    membershipButton: 'Bli medlem →',
    politicsEyebrow: 'VALPROGRAM 2026–2030', politicsHeading: 'Tro på Hässleholm!',
    politicsIntro: 'Här finns politikområdena och förslagen från det befintliga valprogrammet, samlade på ett ställe.',
    programButton: 'Läs hela valprogrammet (PDF) ↗', candidatesHeading: 'Möt laget bakom programmet',
    nationalHeading: 'Nationella förslag',
    calendarExample: 'EXEMPELVY · Aktiviteterna är demonstrationer, inte bokade möten.',
    facebookExample: 'EXEMPELVY · Korten visar exempel, inte publicerade Facebookinlägg.',
    calendarEmpty: 'Inga kommande aktiviteter är publicerade just nu. Hör gärna av dig till oss.',
    calendarUnavailable: 'Kalendern kan inte visas just nu. Kontakta oss för information om kommande träffar.',
    facebookUnavailable: 'Inläggen kan inte visas här just nu. Du hittar KD på Facebook via länken nedan.',
    facebookEmpty: 'Inga inlägg finns att visa just nu.',
    leaderEmpty: 'Här kommer gruppledarens senaste publicerade inlägg. Kontakta oss om du vill veta mer om vårt arbete.',
    cancelled: 'Inställt', showPlace: 'Visa plats', addCalendar: 'Lägg till i min kalender',
    showMore: 'Visa mer', showLess: 'Visa mindre', example: 'EXEMPELINNEHÅLL',
    mapConsent: 'Kartan laddas från OpenStreetMap först när du väljer att visa den. Då delas din IP-adress med karttjänsten.',
    mapLoad: 'Visa karta från OpenStreetMap', mapUnavailable: 'Platsen visas med adress. En karta kan läggas till när koordinater har verifierats.',
    weekdays: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
  },
  leaderPosts: [], // Add verified, published posts; schema is documented in README.md.
  contact: { title: 'Kontakta KD Hässleholm', name: 'Kristdemokraterna i Hässleholm', email: 'hassleholm@kristdemokraterna.se', phone: '076-329 92 31', address: 'Åkaregatan 14, 281 38 Hässleholm', sourceLabel: 'Officiella kontaktuppgifter ↗' },
  brandName: 'HÄSSLEHOLM',
  images: { logo: asset('logo.png'), whiteLogo: asset('logo-vit.png'), avenue: asset('avenyn.jpg'), meeting: asset('motesplatser.jpg'), candidates: asset('toppkandidater.jpg') },
};

siteContent.subpages = {
  heroes: {
    home: { title:'TRO PÅ HÄSSLEHOLM', intro:'Tack för ditt stöd och din röst i valet', image:asset('avenyn.jpg'), alt:'Avenyn i Hässleholm', position:'center 52%' },
    news: { title:'AKTUELLT\nI HÄSSLEHOLM', intro:'Nyheter och kommentarer\nfrån vårt arbete.', image:asset('avenyn.jpg'), alt:'Avenyn i Hässleholm' },
    politics: { title:'VÅR POLITIK', intro:'Våra prioriteringar för kommunen.', image:asset('Humlesjön.jpg'), alt:'Humlesjön med badbrygga och skog längs stranden', position:'center 58%' },
    'politics-archive': { title:'HÄSSLEHOLM 2022–2026', intro:'Vår tidigare lokala politik.', image:asset('Humlesjön.jpg'), alt:'Humlesjön med badbrygga och skog längs stranden', position:'center 58%' },
    people: { title:'DINA FÖRTROENDEVALDA', intro:'Hitta rätt person och ta kontakt.', image:asset('Stadshuset.jpg'), alt:'Hässleholms stadshus med kommunflaggan', position:'center 38%' },
    about: { title:'KD HÄSSLEHOLM', intro:'Människorna bakom föreningen.', image:asset('mockup-coffee.webp'), alt:'Illustrativ bild av kaffekoppar vid ett mötesbord, AI-genererad', position:'center 65%' },
    contact: { title:'KONTAKTA OSS', intro:'Vi vill gärna höra från dig.', image:asset('Centrala Hässleholm.jpg'), alt:'Centrala Hässleholm med centralstationen i bakgrunden', position:'center 48%' },
  },
  text: {
    overview:'Vi vill ha ett Hässleholm som håller ihop, där människor kan växa och där framtidens generationer får goda förutsättningar. Här hittar du våra prioriterade politikområden.',
    programHeading:'Läs vårt politiska program', programIntro:'Vår vision och våra förslag för ett starkare Hässleholm.', programDownload:'Ladda ner programmet →', programArchive:'Alla förslag och kandidater i valprogrammet →',
    proposals:'Våra förslag', related:'Relaterade nyheter', relatedFallback:'Relaterat innehåll', areaIntro:'Här samlar vi vår politik och vårt arbete inom området.', areaQuestion:'Har du en fråga?', areaContact:'Kontakta oss så berättar vi mer om vår politik.', contactForm:'Till kontaktformuläret →',
    newsFilters:['Alla','Nyheter','Debatt'], moreNews:'Visa fler artiklar', newsExample:'EXEMPELVY · Exempeltexter, inga publicerade nyheter.', newsEmpty:'Här publicerar vi nyheter och kommentarer från vårt arbete. Inga artiklar är publicerade ännu.', readArticle:'Läs mer →',
    peopleFilters:[{id:'all',label:'Alla'},{id:'council',label:'Fullmäktige'},{id:'committees',label:'Nämnder'},{id:'board',label:'Styrelsen'}], search:'Sök namn eller uppdrag', peopleMore:'Visa fler förtroendevalda', peopleEmpty:'Ingen person matchar din sökning.', portraitMissing:'Porträtt saknas', email:'Skicka e-post', call:'Ring upp', profile:'Se officiell presentation ↗', directorySource:'Uppgifter från Kristdemokraternas officiella sida ↗', directoryLoading:'Hämtar aktuella uppgifter…', directoryFallback:'Visar senast hämtade uppgifter.',
    boardHeading:'Vår styrelse',
    aboutCtaHeading:'Bli en del av KD Hässleholm', aboutCtaText:'Tillsammans kan vi göra skillnad. Bli medlem och var med och forma ett bättre Hässleholm.', memberButton:'Bli medlem →',
    formHeading:'Skicka ett meddelande', nameLabel:'Namn', emailLabel:'E-post', messageLabel:'Meddelande', messagePlaceholder:'Skriv ditt meddelande här …', formExplanation:'Ditt meddelande skickas till KD Hässleholm. Vi svarar till e-postadressen du anger.', formButton:'Skicka meddelande →', formSending:'Skickar …', formSent:'Tack! Ditt meddelande har skickats. Vi svarar så snart vi kan.', formError:'Vi kunde inte bekräfta att meddelandet skickades. Din text finns kvar. Försök igen om en stund eller kontakta oss via e-post eller telefon.', formInvalid:'Fyll i namn, en giltig e-postadress och ett meddelande.', formRateLimit:'Du har gjort flera försök på kort tid. Vänta tio minuter och försök igen. Din text finns kvar.', detailsHeading:'Kontaktuppgifter', emailHeading:'E-postadress', emailDescription:'Vi svarar så snart vi kan.', phoneHeading:'Telefonnummer', phoneDescription:'Ring vår partiavdelning.', representativesHeading:'Hitta en förtroendevald', representativesDescription:'Sök bland våra förtroendevalda.', meetHeading:'Träffa oss', meetText:'Välkommen att träffa oss på möten och aktiviteter i Hässleholm. Hör av dig om du vill veta mer eller prata med oss om en lokal fråga. Kommande tillfällen hittar du i kalendern på startsidan.', meetLink:'Se kalendern på startsidan →', followHeading:'Följ oss', followText:'Följ KD i sociala kanaler.',
  },
  about: {
    paragraphs:['Kristdemokraterna i Hässleholm är en lokal förening med människor som vill göra skillnad i vår kommun. Vi tror på människans värdighet, gemenskap och ett samhälle som håller ihop.','Genom dialog, engagemang och konkreta förslag arbetar vi för ett Hässleholm där fler får möjlighet att växa.'],
  },
  areas:[
    {id:'omsorg',title:'Omsorg',subtitle:'Trygghet genom hela livet',icon:'heart',image:asset('skola.jpg'),alt:'Bild från den befintliga webbplatsen',groups:[{title:'Trygghet och värdighet',topic:'omsorg'},{title:'Mötesplatser och gemenskap',topic:'motesplatser'}]},
    {id:'skola',title:'Skola',subtitle:'Kunskap för framtiden',icon:'school',image:asset('skola.jpg'),alt:'Förälder och barn, bild från den befintliga webbplatsen',groups:[{title:'En skola för varje barn',topic:'skola'}]},
    {id:'kultur-och-fritid',title:'Kultur och fritid',subtitle:'Ett rikare liv i hela kommunen',icon:'people',image:asset('mockup-sports.webp'),alt:'Illustrativ bild av en ljus sporthall med blått golv, AI-genererad',groups:[{title:'Föreningsliv',topic:'varderingar',include:['kulturarv','mötesplatser']},{title:'Mötesplatser',topic:'motesplatser'},{title:'Idrott och rörelse',topic:'kommun',include:['simhallar']}]},
    {id:'landsbygd',title:'Landsbygd',subtitle:'Levande orter och byar',icon:'leaf',image:asset('kommun.jpg'),alt:'Bild från den befintliga webbplatsens kommunavsnitt',groups:[{title:'Hela kommunen ska fungera',topic:'kommun'}]},
    {id:'ekonomi',title:'Ekonomi',subtitle:'Ett ansvarsfullt samhällsbygge',icon:'chart',image:asset('avenyn.jpg'),alt:'Avenyn i Hässleholm',groups:[{title:'Ansvar för varje skattekrona',topic:'ekonomi'}]},
    {id:'samhallsbyggnad',title:'Samhällsbyggnad',subtitle:'Hållbar tillväxt och livsmiljö',icon:'city',image:asset('avenyn.jpg'),alt:'Avenyn i Hässleholm',groups:[{title:'Campus och framtidstro',topic:'campus'},{title:'En kommun som håller ihop',topic:'varderingar'},{title:'Boende och kommunikationer',topic:'kommun',include:['vill','bost','trafik','avgång','station','väg']}]},
  ],
  articles: debateArticles.map(article => withArticleImage({ ...article, image: asset(article.image) })),
  exampleArticles:[
    {id:'example-news-1',slug:'vi-fortsatter-driva-viktiga-fragor-for-hassleholm',category:'Nyheter',title:'Vi fortsätter driva viktiga frågor för Hässleholm',intro:'Ett starkare lokalsamhälle genom dialog och långsiktighet.',image:asset('mockup-coffee.webp'),alt:'Illustrativ bild av kaffekoppar och anteckningsblock, AI-genererad',paragraphs:['Detta är en exempelartikel som visar sidans utformning. Texten beskriver inte en verklig rapport eller en genomförd aktivitet.','Verifierade nyheter kan läggas in centralt i content.js.']},
    {id:'example-news-2',slug:'ett-hassleholm-dar-fler-far-vaxa',category:'Debatt',title:'Ett Hässleholm där fler får växa',intro:'Våra tankar om kommunens framtid och möjligheter.',image:asset('avenyn.jpg'),alt:'Avenyn i Hässleholm',paragraphs:['Exempeltext för kategorin Debatt. Ingen person har tillskrivits artikeln.']},
    {id:'example-news-4',slug:'nara-vardagen-i-hela-kommunen',category:'Nyheter',title:'Nära vardagen i hela kommunen',intro:'Ett exempel på en äldre artikel.',image:asset('kommun.jpg'),alt:'Bild från befintlig webbplats',paragraphs:['Detta är ett exempel som används för att kontrollera knappen Visa fler artiklar.']},
  ],
};

// Preserved editorial content from kdhlm.se, retrieved 2026-09-05.
siteContent.politics = {
  "topics": [
    {
      "id": "omsorg",
      "label": "Omsorg",
      "mark": "O",
      "accent": "#ffd62f",
      "title": "En tydlig prioritering: omsorg",
      "intro": "Vardagen ska fungera först. Programmet lägger tyngd på kvalitet, trygghet, värdighet och bättre arbetsvillkor i omsorgen.",
      "bullets": [
        "Prioritera omsorgens kvalitet, trygghet och värdighet.",
        "Större möjlighet att välja kön på personal i intima situationer.",
        "Underhåll, säkerhet och tillgänglighet på äldreboenden.",
        "Omtag kring måltidsorganisationen med näringsrik mat, trygghet och bemötande i samråd med våra äldre.",
        "Förebyggande hembesök från 75 år.",
        "Stärkt anhörigstöd och avlösning.",
        "Anställa geriatriker inom kommunal äldreomsorg.",
        "Fria arbetsskor och utbildningssjuksköterskor.",
        "Prioritera snöröjning på stråk där äldre och människor med funktionsvariationer rör sig.",
        "Bostad först och minskad hemlöshet.",
        "Erbjuda seniorer flytthjälp vid flytt från eget boende till mellanboende.",
        "Omsorgsbonus till ungdomar som tar examen från Vård- och omsorgsprogrammet och börjar arbeta i kommunens omsorg.",
        "Samarbete mellan kulturskolan och omsorgen för mer kultur på äldreboenden.",
        "Kommunalt trygghetslöfte för äldre med kontinuitet i hemtjänsten, fasta omsorgskontakter och motverkad ensamhet."
      ]
    },
    {
      "id": "skola",
      "label": "Skola",
      "mark": "S",
      "accent": "#f1be8a",
      "title": "Skolan som nav",
      "intro": "Skolan ska ge kunskap, trygghet och framtidstro. Ingen elev ska lämnas efter och ingen elev ska hållas tillbaka.",
      "bullets": [
        "Släppa fram idéburna, privata och föreningsdrivna alternativ.",
        "Värna föräldrars möjlighet att välja skola och barnomsorg.",
        "Minska barngrupperna i förskolan: högst 12 barn i småbarnsgrupper och max 15 barn för de större barnen.",
        "Mer tid för läsning, skrivande och matematik.",
        "Tidiga insatser innan problem växer.",
        "Tydligare ordningsregler och bättre stöd till lärare och rektorer.",
        "Utveckla elevhälsan vid psykisk ohälsa, skolfrånvaro och särskilt stöd.",
        "Fler elever ska få läxhjälp och stödinsatser.",
        "Se över skolmiljöernas betydelse för trygghet, rörelse och trivsel."
      ]
    },
    {
      "id": "varderingar",
      "label": "Värderingar",
      "mark": "V",
      "accent": "#8aabac",
      "title": "Värderingar som håller ihop Hässleholm",
      "intro": "Politiken ska handla om människor i vardagen, inte bara budgetrader och organisationsscheman.",
      "bullets": [
        "Trygghet och respekt i skola, fritid, omsorg och offentliga miljöer.",
        "Uppvärdera värderingarna i skolan: dygder framför normlöshet.",
        "Värna skolavslutningar i kyrkan och traditioner som julsånger.",
        "Värna familjens betydelse och föräldrars delaktighet.",
        "Stärka kulturarv, mötesplatser, bibliotek och hembygdsföreningar.",
        "Redovisa hur större förändringar inom skola, äldreomsorg, LSS och samhällsplanering påverkar människors vardag.",
        "Lokala utvecklingsplaner för större byar och kommundelar."
      ]
    },
    {
      "id": "motesplatser",
      "label": "Mötesplatser",
      "mark": "M",
      "accent": "#8fa45a",
      "title": "Äldre mötesplatser 2.0",
      "intro": "Träffpunkter ska bli aktiva nav för gemenskap, hälsa och förebyggande arbete i hela kommunen.",
      "bullets": [
        "Samlat uppdrag, utvecklingsplan och underhållsplan för träffpunkter.",
        "Likvärdig service oavsett bostadsort.",
        "Förebyggande uppdrag inom gemenskap, hälsa och trygghet.",
        "Samarbete med civilsamhället, civilförsvaret, föreningar, kyrkor, pensionärsorganisationer och Region Skåne.",
        "Närmare koppling till hemtjänst och anhörigstöd.",
        "Hälsofrämjande aktiviteter och digitalt stöd på alla orter.",
        "Följa upp effekter på ensamhet, hälsa och trygghet."
      ]
    },
    {
      "id": "ekonomi",
      "label": "Skattekronor",
      "mark": "K",
      "accent": "#ffd62f",
      "title": "Ansvar för varje skattekrona",
      "intro": "Ordning i ekonomin beskrivs som en förutsättning för trygg välfärd. Fokus ligger på kärnuppdrag, transparens och minskad administration.",
      "bullets": [
        "Översyn av kommunens fastighetsbestånd.",
        "Säga nej till projekt utan tydlig vardagsnytta.",
        "Samlad underhållsplan för skolor, omsorgsboenden och offentliga miljöer.",
        "Öppet bidragsregister för kommunens verksamhetsbidrag.",
        "Öppen plattform för overheadfunktioner och yrkestitlar.",
        "Redovisa effekter när service förändras eller centraliseras.",
        "Släppa fram idéburna, privata och föreningsdrivna alternativ där de fungerar bättre än kommunen.",
        "Se över kommunens utbud för unga, bland annat Ungfritid, så hela kommunen får ett jämförbart utbud.",
        "Öka kommunens attraktionskraft för turism och rekreation.",
        "Se över vilka delar av offentlig verksamhet som kan samordnas med civilsamhället.",
        "Minska onödig administration i kommunledningsförvaltningen.",
        "Samordna kommunikatörer och näringslivsavdelning i en samlad kommunikationsavdelning som stärker kommunens varumärke."
      ]
    },
    {
      "id": "kommun",
      "label": "Vår kommun",
      "mark": "H",
      "accent": "#f1be8a",
      "title": "Hela kommunen ska fungera på riktigt",
      "intro": "Likabehandling betyder att alla tas på allvar. Programmet vill anpassa politiken efter orters olika villkor.",
      "bullets": [
        "Verka för att återstarta Tyringe och Bjärnums simhallar.",
        "Erkänna skillnader mellan orter och anpassa politiken därefter.",
        "Grundpaket av service, trygghet och mötesplatser i kransorterna.",
        "Tätortsmiljon för lokalt engagemang och investeringar.",
        "Arkitekturpolicy med traditionella estetiska värden.",
        "Fler villor, småhus och radhus för familjer och seniorer.",
        "Stärkt närservice på biblioteken.",
        "Säsongsblommor och dekoration i alla tätorter.",
        "Bevara landsbygdsskolor där det är försvarbart.",
        "Fler avgångar från kransorter och Pågatågsstation i Finja.",
        "Verka för standardhöjning av väg 117 mellan Hässleholm och Markaryd.",
        "Kvälls- och nattrafik i samverkan med Region Skåne.",
        "Stadspulsbiljett för evenemang och aktiviteter.",
        "Stärka kulturarv, lokala mötesplatser, bibliotek, hembygdsföreningar och evenemang i kransorterna.",
        "Återinföra bidrag till trosamfund och försvarsorganisationer."
      ]
    },
    {
      "id": "campus",
      "label": "Campus",
      "mark": "C",
      "accent": "#8aabac",
      "title": "Campus Hässleholm: framtidens väg",
      "intro": "Hässleholm ska växa genom utbildning, kompetens och samverkan mellan högre utbildning, yrkeshögskola, innovation och näringsliv.",
      "bullets": [
        "Arbeta för högskolefilial eller egen högskola i samarbete med lärosäten.",
        "Stegvis uppbyggt spår mot examensrätt och särskild profil.",
        "Möjliggöra student- och forskarbostäder nära campus.",
        "Forskningsprojekt med kommunala förvaltningar, exempelvis energi, äldreomsorg och social innovation.",
        "Knyta campus till Norra Station och gamla Norra Skåne-huset.",
        "Co-working, inkubatorer och testbäddar i Västra centrum.",
        "Driva finansiering och etablering regionalt och nationellt.",
        "Integrera yrkeshögskoleutbildningar som övergång mot arbetsliv och högre utbildning."
      ]
    }
  ],
  "candidates": [
    {
      "name": "Simon Berneblad Mandegård",
      "role": "#1 på kommunlistan",
      "description": "Driver frågor om äldreomsorg, trygghet och ett rikt kultur- och fritidsliv."
    },
    {
      "name": "Erika Heil Utbult",
      "role": "#2 på kommunlistan",
      "description": "Fokuserar på omsorg, närhet och ett starkare lokalsamhälle.",
      "imagePosition": "55% center",
      "imageScale": 1.12
    },
    {
      "name": "Christer Caesar",
      "role": "#3 på kommunlistan",
      "description": "Vill se ordning, ansvar och långsiktighet i kommunens ekonomi och styrning.",
      "imagePosition": "50% center",
      "imageScale": 1.12
    },
    {
      "name": "Elias Höghäll",
      "role": "#4 på kommunlistan",
      "description": "Lyfter ungas villkor, framtidstro och möjligheten att växa upp och stanna i kommunen.",
      "imagePosition": "58% 18%",
      "imageScale": 1,
      "imageX": "0",
      "imageY": "0"
    },
    {
      "name": "Mats Björklund",
      "role": "#5 på kommunlistan",
      "description": "Driver frågor om socialtansvar, service och utveckling.",
      "imagePosition": "67% center",
      "imageScale": 1.12,
      "imageX": "0"
    },
    {
      "name": "Pär Palmgren",
      "role": "#6 på kommunlistan",
      "description": "Fokuserar på infrastruktursfrågor, en kommun som förvaltar ekonomin väl och en kommun som håller ihop."
    },
    {
      "name": "Roland Blomqvist",
      "role": "#7 på kommunlistan",
      "description": "Vill stärka samhällsplanering, infrastruktur och minska krånglet för medborgaren."
    },
    {
      "name": "Tobias Eriksson",
      "role": "#8 på kommunlistan",
      "description": "Driver frågor om trygghet, digital säkerhet och en modernare kommunal service.",
      "imagePosition": "50% 18%",
      "imageScale": 1,
      "imageX": "0",
      "imageY": "0"
    },
    {
      "name": "Marie Juhlin",
      "role": "#9 på kommunlistan",
      "description": "Fokuserar på vård, omsorg och trygghet för äldre och anhöriga.",
      "imagePosition": "center center",
      "imageX": "0",
      "imageY": "-6%"
    },
    {
      "name": "Gilbert Nathell",
      "role": "#10 på kommunlistan",
      "description": "Lyfter vikten av en fungerande skolgång, tryggheten och vikten av levande orter i hela kommunen.",
      "imagePosition": "center 32%",
      "imageScale": 1
    }
  ],
  "national": [
    {
      "area": "Familj",
      "title": "Gör föräldraförsäkringen mer flexibel",
      "text": "KD vill säga nej till kvotering, skydda föräldraledigas inkomst längre och låta fler dagar användas som dubbeldagar.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/familj"
    },
    {
      "area": "Familj",
      "title": "Inför tak för småbarnsgrupper i förskolan",
      "text": "KD vill lagstifta om max 12 barn i småbarnsgrupper för mer trygghet, anknytning och tid för varje barn.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/familj"
    },
    {
      "area": "Familj",
      "title": "Stärk föräldrastöd och familjerådgivning",
      "text": "KD vill att kommuner ska erbjuda föräldrastödsprogram och sänka trösklarna till familjerådgivning.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/familj"
    },
    {
      "area": "Bostad",
      "title": "Gör bostadsmarknaden mer rörlig",
      "text": "KD vill ta bort taket för uppskov på reavinstskatten vid ny bostad och kraftigt reducera amorteringskraven.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/bostad"
    },
    {
      "area": "Bostad",
      "title": "Gör det möjligt för fler att äga sitt hem",
      "text": "KD vill använda startlån, bosparande och förändrade tomträttsregler för att fler med vanliga inkomster ska kunna äga bostad.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/bostad"
    },
    {
      "area": "Bostad",
      "title": "Minska krånglet för den som vill bygga",
      "text": "KD vill förenkla regler så fler kan bygga ut, dela upp bostäder och skapa hem på redan använd tomtmark.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/bostad"
    },
    {
      "area": "Jord & skogsbruk",
      "title": "Öka svensk självförsörjning",
      "text": "KD vill stärka lönsamheten i svenskt jordbruk så Sverige kan producera mer livsmedel även i fredstid.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/jord--skogsbruk"
    },
    {
      "area": "Jord & skogsbruk",
      "title": "Minska regelkrånglet för bönder",
      "text": "KD vill ha färre men tydligare regler för jordbruksnäringen så lantbrukare får bättre förutsättningar att producera.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/jord--skogsbruk"
    },
    {
      "area": "Jord & skogsbruk",
      "title": "Värna äganderätten i skogen",
      "text": "KD vill stå upp för enskilt ägande och brukande av skog under frihet och ansvar.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/jord--skogsbruk"
    },
    {
      "area": "Äldre",
      "title": "Mer medicinsk kompetens i äldreomsorgen",
      "text": "KD vill stärka kommunal vård med bättre medicinsk kompetens och möjlighet för kommuner att säkra läkartillgång.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/aldre"
    },
    {
      "area": "Äldre",
      "title": "Inför äldreboendegaranti",
      "text": "KD vill ge personer över 85 år en lagstadgad rätt till anpassat boende när de själva vill och behöver det.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/aldre"
    },
    {
      "area": "Äldre",
      "title": "Förbättra villkoren för omsorgspersonal",
      "text": "KD vill minska delade turer, stärka medarbetarnöjdheten och avlasta chefer i äldreomsorgen.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/aldre"
    },
    {
      "area": "Vård & omsorg",
      "title": "Inrätta nationell vårdförmedling",
      "text": "KD vill använda ledig vårdkapacitet i hela landet så patienter snabbare kan få vård när vårdgarantin passerats.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/vard--omsorg"
    },
    {
      "area": "Vård & omsorg",
      "title": "Fler vårdplatser och starkare kapacitet",
      "text": "KD vill öka antalet vårdplatser och koppla statlig ersättning till minskade överbeläggningar och bättre kapacitet.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/vard--omsorg"
    },
    {
      "area": "Vård & omsorg",
      "title": "Ge staten huvudansvar för sjukvården",
      "text": "KD vill samla huvudansvaret nationellt för en mer jämlik, effektiv och högkvalitativ vård i hela landet.",
      "source": "https://kristdemokraterna.se/var-politik/politikomraden/vard--omsorg"
    }
  ]
};

if (typeof window !== 'undefined') window.siteContent = siteContent;
