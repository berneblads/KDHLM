import './policy-focus.css';

const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};

export function initPolicyFocus(content) {
  const root = document.querySelector('#fokus');
  if (!root) return;
  const topics = [...content.politics.topics, {
    id: 'nationellt', label: 'Nationella frågor', title: 'Ett konkret KD-förslag i taget',
    intro: 'Upptäck vår nationella politik. Bläddra eller slumpa fram ett förslag och läs mer om frågan.',
    bullets: content.politics.national.map(proposal => proposal.title),
    proposals: content.politics.national,
  }];
  const tabs = root.querySelector('[role=tablist]');
  const panels = root.querySelector('.focus-panels');
  const buttons = [];
  const views = [];

  function select(index) {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      views[i].hidden = i !== index;
    });
  }

  topics.forEach((topic, index) => {
    const tab = element('button', topic.label, 'focus-tab');
    tab.type = 'button';
    tab.id = `focus-tab-${topic.id}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `focus-panel-${topic.id}`);
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: (index + 1) % topics.length, ArrowLeft: (index - 1 + topics.length) % topics.length, Home: 0, End: topics.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      select(keys[event.key]);
      buttons[keys[event.key]].focus();
    });
    buttons.push(tab);
    tabs.append(tab);

    const panel = element('div', undefined, 'focus-panel');
    panel.id = `focus-panel-${topic.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    const copy = element('div', undefined, 'focus-copy');
    copy.append(element('p', topic.proposals ? 'Valt område · Nationell politik' : 'Valt område · Valprogram 2026', 'eyebrow'), element('h3', topic.title), element('p', topic.intro, 'focus-intro'));
    const summary = element('div', undefined, 'focus-summary');
    const list = element('ul');
    list.append(...topic.bullets.slice(0, 3).map(text => element('li', text)));
    summary.append(element('h4', 'Tre saker att ta med sig'), list);
    const more = element('a', 'Läs alla förslag inom området →', 'focus-more');
    more.href = topic.proposals ? '/valprogram.html#nationellt' : `/politik.html?subject=${encodeURIComponent(topic.id)}`;
    copy.append(summary, more);

    const carousel = element('div', undefined, 'focus-proposals');
    const heading = element('h4', 'Förslagen, kort förklarade');
    const card = element('div', undefined, 'focus-proposal-card');
    card.setAttribute('aria-live', 'polite');
    card.setAttribute('aria-atomic', 'true');
    const label = element('p', topic.label, 'eyebrow');
    const number = element('span', '', 'focus-proposal-number');
    const text = element('p', '', 'focus-proposal-text');
    card.append(label, number, text);
    const description = element('p', '', 'focus-proposal-description');
    const source = element('a', 'Läs mer hos Kristdemokraterna ↗', 'focus-proposal-source');
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    if (topic.proposals) card.append(description, source);
    const controls = element('div', undefined, 'focus-controls');
    const previous = element('button', '←', 'arrow-button');
    const next = element('button', '→', 'arrow-button');
    previous.type = next.type = 'button';
    previous.setAttribute('aria-label', 'Föregående förslag');
    next.setAttribute('aria-label', 'Nästa förslag');
    const count = element('span');
    const dots = element('div', undefined, 'focus-dots');
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', 'Välj förslag');
    let active = 0;
    const dotButtons = topic.bullets.map((_, i) => {
      const button = element('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Visa förslag ${i + 1}`);
      button.addEventListener('click', () => show(i));
      dots.append(button);
      return button;
    });
    function show(i) {
      active = (i + topic.bullets.length) % topic.bullets.length;
      number.textContent = String(active + 1).padStart(2, '0');
      text.textContent = topic.bullets[active];
      if (topic.proposals) {
        const proposal = topic.proposals[active];
        label.textContent = proposal.area;
        description.textContent = proposal.text;
        source.href = proposal.source;
      }
      count.textContent = `${active + 1} / ${topic.bullets.length}`;
      dotButtons.forEach((button, j) => button.setAttribute('aria-current', String(j === active)));
    }
    previous.addEventListener('click', () => show(active - 1));
    next.addEventListener('click', () => show(active + 1));
    controls.append(previous, count, next);
    carousel.append(heading, card, controls, dots);
    const random = element('button', 'Slumpa ett förslag', 'button button-outline focus-random');
    random.type = 'button';
    random.disabled = topic.bullets.length < 2;
    random.addEventListener('click', () => show(active + 1 + Math.floor(Math.random() * (topic.bullets.length - 1))));
    carousel.append(random);
    panel.append(copy, carousel);
    panels.append(panel);
    views.push(panel);
    show(0);
  });
  function followHash() {
    if (location.hash === '#loften' || location.hash === '#nationellt') {
      select(topics.length - 1);
      root.scrollIntoView();
    }
  }
  select(0);
  followHash();
  window.addEventListener('hashchange', followHash);
}
