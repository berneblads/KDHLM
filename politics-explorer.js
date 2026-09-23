import { historicalPolitics } from './politics-history.js';

const rural = {
  id:'landsbygd', label:'Landsbygd', title:'Mer kraft till landsbygden',
  intro:'Service, bostäder och företagande i byar och kransorter. Landsbygdsprogrammet från 2023 omfattar både 2022–2026 och nästa mandatperiod.',
  source:'Landsbygdsprogram 2023',
  bullets:[
    'Ge landsbygdsfrågorna en egen politisk organisation genom ett utskott eller ett utökat uppdrag till en befintlig nämnd.',
    'Avsätta en årlig miljon till projekt på landsbygden och följa upp kommunens investeringar i Leader.',
    'Planera för ett nytt industriområde i Hästveda, sanera oanvänd industrimark och underlätta företagsetableringar i kransorterna.',
    'Se över priset på kommunens villatomter på landsbygden så att fler kan bygga och bo där.',
    'Ansöka om att bli testkommun för förenklade strandskyddsregler i glest befolkade landsbygdsområden.',
    'Ta fram en livsmedelsstrategi som stärker livsmedelsförsörjningen och inhemskt lantbruk, med hänsyn till säkerhetsläget och kraven på säkra livsmedel.',
    'Införa kommunal skötsel av välskötta enskilda vägar till permanentboende. Förslaget gäller vägar längre än 150 meter, med tillräcklig standard och med eventuella statsbidrag överförda till kommunen. Större investeringar och ombyggnader omfattas inte.',
    'Bevaka och prioritera näringslivets och djurägarnas intressen i frågan om vargetablering, samtidigt som stora rovdjur ska ha en gynnsam bevarandestatus.'
  ]
};
const fold = text => text.toLocaleLowerCase('sv-SE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const synonyms = {buss:['buss','avgang','kollektivtrafik','nattrafik'],bussar:['buss','avgang','kollektivtrafik','nattrafik'],dagis:['forskola','barnomsorg'],aldre:['aldre','senior','hemtjanst'],tag:['tag','pagatag','jarnvag'],jobb:['jobb','foretag','naringsliv','arbetsliv']};
export function matchesPolicy(text, query) {
  const haystack=fold(text);
  return fold(query).trim().split(/\s+/).filter(Boolean).every(word=>(synonyms[word]||[word]).some(term=>haystack.includes(term)));
}
const node=(tag,text,className)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;};

export function initPoliticsExplorer(content) {
  const search=document.querySelector('#policy-search'),period=document.querySelector('#policy-period'),subject=document.querySelector('#policy-subject');
  const results=document.querySelector('#policy-results'),status=document.querySelector('#policy-result-count'),reset=document.querySelector('#policy-reset');
  const labels={omsorg:'Äldre och omsorg',skola:'Skola och förskola',varderingar:'Trygghet och gemenskap',motesplatser:'Mötesplatser för äldre',ekonomi:'Kommunens ekonomi',kommun:'Boende, resor och fritid',campus:'Utbildning och jobb'};
  const summaries={
    omsorg:'Fasta omsorgskontakter, stärkt anhörigstöd och mer medicinsk kompetens i äldreomsorgen.',
    skola:'Mindre barngrupper i förskolan, mer tid för baskunskaper och tidigt stöd till elever.',
    varderingar:'Trygga offentliga miljöer, starkare föreningsliv och större delaktighet för familjer.',
    motesplatser:'Aktiviteter, gemenskap och digitalt stöd för äldre i hela kommunen.',
    ekonomi:'Prioritera välfärden, minska onödig administration och redovisa hur pengarna används.',
    kommun:'Fler bostäder och avgångar från kransorterna. Verka för att öppna simhallarna i Tyringe och Bjärnum igen.',
    campus:'Utveckla Campus Hässleholm och knyta utbildning närmare arbetslivet.',
    landsbygd:'En årlig miljon till landsbygdsprojekt och bättre möjligheter att bo och driva företag i byarna.'
  };
  const current=content.politics.topics.map(t=>({...t,label:labels[t.id]||t.label,source:'Valprogram 2026'}));
  const params=new URLSearchParams(location.search);
  search.value=params.get('q')||'';period.value=params.get('period')==='2022'?'2022':'2026';
  function topics(){return [...(period.value==='2022'?historicalPolitics:current),rural];}
  function subjects(){subject.replaceChildren(new Option('Alla ämnen','all'),...topics().map(t=>new Option(t.label,t.id)));}
  subjects();if([...subject.options].some(o=>o.value===params.get('subject')))subject.value=params.get('subject');
  function render(){
    const query=search.value.trim(),chosen=topics().filter(t=>subject.value==='all'||t.id===subject.value);let total=0;
    results.replaceChildren();
    for(const topic of chosen){
      const whole=matchesPolicy(topic.title+' '+topic.label+' '+topic.intro,query);
      const bullets=topic.bullets.filter(text=>!query||whole||matchesPolicy(text,query));
      if(!bullets.length)continue;
      total+=bullets.length;
      const section=node('details',null,'policy-answer');
      section.open=Boolean(query)||subject.value!=='all';
      const summary=node('summary'),heading=node('h3',topic.label);
      const preview=node('p',summaries[topic.id]||topic.intro,'policy-card-preview');
      const action=node('span',null,'policy-card-action');
      const updateAction=()=>{action.textContent=section.open?'Stäng förslagen −':`Läs ${bullets.length} förslag +`;};
      updateAction();section.addEventListener('toggle',updateAction);
      summary.append(heading,preview,action);section.append(summary);
      const body=node('div',null,'policy-card-body');body.append(node('p','Vi vill:','policy-list-label'));
      const list=node('ul');for(const text of bullets)list.append(node('li',text));body.append(list);
      const source=node('a',`Läs originalet: ${topic.source} ↗`,'policy-answer-source');
      source.href=topic.id==='landsbygd'?'/program/landsbygdsprogram-2023.docx':period.value==='2022'?'/program/valmanifest-2022-2026.pdf':content.links.program;
      body.append(source);section.append(body);
      results.append(section);
    }
    document.querySelector('#policy-results-heading').textContent=query?'Sökresultat':period.value==='2022'?'Våra tidigare valförslag 2022–2026':'Våra frågor inför valet 2026';
    results.classList.toggle('is-filtered',Boolean(query)||subject.value!=='all');
    document.querySelector('#policy-period-note').textContent=period.value==='2022'?'Tidigare valförslag, inte en redovisning av genomförda beslut.':'Förslag ur valprogrammet 2026 och landsbygdsprogrammet 2023.';
    status.textContent=query?`${total} förslag matchar ”${query}”.`:subject.value==='all'?`${results.childElementCount} politikområden`:`${total} förslag`;
    reset.hidden=!query&&subject.value==='all';
    if(!total){const empty=node('div',null,'policy-no-results');empty.append(node('h3','Inga förslag matchar sökningen'),node('p','Prova ett annat ord, välj Alla ämnen eller byt period.'));results.append(empty);}
    const next=new URL(location.href);for(const [key,value] of [['q',query],['period',period.value==='2022'?'2022':''],['subject',subject.value==='all'?'':subject.value]]){if(value)next.searchParams.set(key,value);else next.searchParams.delete(key);}history.replaceState(null,'',next);
  }
  search.addEventListener('input',render);subject.addEventListener('change',render);period.addEventListener('change',()=>{subjects();render();});
  reset.addEventListener('click',()=>{search.value='';subject.value='all';render();search.focus();});render();
}
