const content = window.siteContent;
const topics = content.topics;
const topicImages = content.topicImages;

const topicGrid = document.querySelector("#topicGrid");
const tabs = document.querySelector("#tabs");
const detailPanel = document.querySelector("#detailPanel");
const promiseCard = document.querySelector("#promiseCard");
const candidateGrid = document.querySelector("#candidateGrid");
let activeTopic = topics[0].id;
let promiseIndex = 0;
let activeProposalIndex = 0;

const promises = content.nationalProposals;

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = value || "";
  element.hidden = value === "";
}

function renderStaticContent() {
  document.title = content.pageTitle;
  document.querySelector('meta[name="description"]').setAttribute("content", content.metaDescription);

  setText('[data-content="nav.start"]', content.nav.start);
  setText('[data-content="nav.statement"]', content.nav.statement);
  setText('[data-content="nav.politics"]', content.nav.politics);
  setText('[data-content="nav.focus"]', content.nav.focus);
  setText('[data-content="nav.candidates"]', content.nav.candidates);
  setText('[data-content="nav.proposals"]', content.nav.proposals);
  setText('[data-content="nav.local"]', content.nav.local);
  setText('[data-content="nav.pdf"]', content.nav.pdf);
  setText('[data-content="nav.channels"]', content.nav.channels);
  setText('[data-content="nav.action"]', content.nav.action);

  setText('[data-content="hero.eyebrow"]', content.hero.eyebrow);
  setText('[data-content="hero.title"]', content.hero.title);
  setText('[data-content="hero.lead"]', content.hero.lead);
  setText('[data-content="hero.primaryButton"]', content.hero.primaryButton);
  setText('[data-content="hero.secondaryButton"]', content.hero.secondaryButton);
  setText('[data-content="hero.badgeLabel"]', content.hero.badgeLabel);
  setText('[data-content="hero.badgeYear"]', content.hero.badgeYear);
  setText('[data-content="hero.badgeText"]', content.hero.badgeText);

  setText('[data-content="statement.eyebrow"]', content.statement.eyebrow);
  setText('[data-content="statement.title"]', content.statement.title);
  setText('[data-content="statement.text"]', content.statement.text);
  setText('[data-content="statement.caption"]', content.statement.caption);
  document.querySelector(".candidate-photo img").alt = content.statement.imageAlt;

  setText('[data-content="politics.eyebrow"]', content.politics.eyebrow);
  setText('[data-content="politics.title"]', content.politics.title);
  setText('[data-content="focus.eyebrow"]', content.focus.eyebrow);
  setText('[data-content="focus.title"]', content.focus.title);

  setText('[data-content="promise.eyebrow"]', content.promise.eyebrow);
  setText('[data-content="promise.title"]', content.promise.title);
  setText('[data-content="promise.text"]', content.promise.text);
  setText('[data-content="promise.randomButton"]', content.promise.randomButton);
  document.querySelector("#prevPromise").setAttribute("aria-label", content.promise.prevLabel);
  document.querySelector("#nextPromise").setAttribute("aria-label", content.promise.nextLabel);
  document
    .querySelector(".promise-section")
    .style.setProperty("--promise-bg", `url("${content.promise.backgroundImage}")`);

  setText('[data-content="local.eyebrow"]', content.local.eyebrow);
  setText('[data-content="local.title"]', content.local.title);
  setText('[data-content="local.text"]', content.local.text);
  setText('[data-content="local.cta"]', content.local.cta);
  document.querySelector(".team-link").href = content.local.ctaUrl || "#";
  document.querySelector(".team-image-wrap img").src = content.local.image;
  document.querySelector(".team-image-wrap img").alt = content.local.imageAlt;

  setText('[data-content="candidates.eyebrow"]', content.candidatesSection.eyebrow);
  setText('[data-content="candidates.title"]', content.candidatesSection.title);
  setText('[data-content="candidates.text"]', content.candidatesSection.text);

  setText('[data-content="pdf.eyebrow"]', content.pdf.eyebrow);
  setText('[data-content="pdf.title"]', content.pdf.title);
  setText('[data-content="pdf.button"]', content.pdf.button);
  setText('[data-content="footer.text"]', content.footer.text);
  setText('[data-content="footer.topLink"]', content.footer.topLink);
}

function explainProposal(text, topic) {
  const lower = text.toLowerCase();
  const explanations = content.explanations;
  if (lower.includes("anhörig")) {
    return explanations.relatives;
  }
  if (lower.includes("hemtjänst") || lower.includes("äldre") || lower.includes("75")) {
    return explanations.elderly;
  }
  if (lower.includes("skola") || lower.includes("läx") || lower.includes("elev") || lower.includes("lärare")) {
    return explanations.school;
  }
  if (lower.includes("bidrag") || lower.includes("öppen") || lower.includes("transparens")) {
    return explanations.transparency;
  }
  if (lower.includes("underhåll") || lower.includes("fastighets")) {
    return explanations.maintenance;
  }
  if (lower.includes("trafik") || lower.includes("avgång") || lower.includes("pågatåg")) {
    return explanations.transport;
  }
  if (lower.includes("campus") || lower.includes("högskol") || lower.includes("yrkeshög")) {
    return explanations.campus;
  }
  if (lower.includes("civilsamhälle") || lower.includes("förening") || lower.includes("kyrk")) {
    return explanations.civilSociety;
  }
  if (lower.includes("bostad") || lower.includes("småhus") || lower.includes("radhus")) {
    return explanations.housing;
  }
  return explanations.fallback.replace("{topic}", topic.label.toLowerCase());
}

function renderCards() {
  topicGrid.innerHTML = topics
    .map(
      (topic) => `
        <button
          class="policy-card"
          type="button"
          data-topic="${topic.id}"
          data-mark="${topic.mark}"
          style="--accent:${topic.accent}"
        >
          <img
            class="policy-card-image"
            src="${topicImages[topic.mark] || `assets/${topic.mark}.png`}"
            alt=""
            aria-hidden="true"
            onerror="this.remove()"
          />
          <span class="policy-card-content">
            <h3>${topic.label}</h3>
          </span>
        </button>
      `
    )
    .join("");
}

function renderCandidates() {
  candidateGrid.innerHTML = content.candidatesSection.candidates
    .map(
      (candidate) => `
        <article class="candidate-card" tabindex="0">
          <img
            src="${candidate.image}"
            alt="${candidate.name}"
            style="--candidate-position:${candidate.imagePosition || "center"}; --candidate-scale:${candidate.imageScale || 1.15}; --candidate-x:${candidate.imageX || "0"}; --candidate-y:${candidate.imageY || "0"};"
          />
          <div class="candidate-info">
            <small>${candidate.role}</small>
            <h3>${candidate.name}</h3>
            <p>${candidate.description}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTabs() {
  tabs.innerHTML = topics
    .map(
      (topic) => `
        <button
          class="tab-button"
          type="button"
          role="tab"
          aria-selected="${topic.id === activeTopic}"
          data-topic="${topic.id}"
        >
          ${topic.label}
        </button>
      `
    )
    .join("");
}

function renderDetail(focus = false) {
  const topic = topics.find((item) => item.id === activeTopic);
  detailPanel.style.setProperty("--panel-accent", topic.accent);
  detailPanel.innerHTML = `
    <div class="focus-layout">
      <div class="focus-copy">
        <div class="detail-intro">
          <div>
            <p class="eyebrow">${content.focus.selectedEyebrow}</p>
            <h2>${topic.title}</h2>
            <p>${topic.intro}</p>
          </div>
        </div>
        <div class="reader-summary" aria-label="Kort sammanfattning">
          <strong>${content.focus.summaryTitle}</strong>
          <ul>
            ${topic.bullets
              .slice(0, 3)
              .map((bullet) => `<li>${bullet}</li>`)
              .join("")}
          </ul>
        </div>
      </div>

      <div class="proposal-section">
        <div class="carousel-heading">
          <h3>${content.focus.proposalsTitle}</h3>
          <div class="carousel-controls" aria-label="Bläddra bland förslag">
            <button type="button" class="carousel-button" data-carousel-prev aria-label="Föregående punkt">‹</button>
            <span>${activeProposalIndex + 1} / ${topic.bullets.length}</span>
            <button type="button" class="carousel-button" data-carousel-next aria-label="Nästa punkt">›</button>
          </div>
        </div>
        <div class="proposal-carousel">
          ${topic.bullets
            .map((bullet, index) => {
              const offset = index - activeProposalIndex;
              return `
                <article
                  class="proposal-card ${index === activeProposalIndex ? "is-active" : ""}"
                  data-proposal-index="${index}"
                  style="--offset:${offset}"
                  aria-hidden="${index === activeProposalIndex ? "false" : "true"}"
                >
                  <div class="proposal-card-top">
                    <p>${topic.label}</p>
                    <span>${String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h4>${bullet}</h4>
                  <p class="proposal-subtitle">${explainProposal(bullet, topic)}</p>
                </article>
              `;
            })
            .join("")}
        </div>
        <div class="carousel-dots" aria-label="Välj punkt">
          ${topic.bullets
            .map(
              (_, index) => `
                <button
                  type="button"
                  data-proposal-dot="${index}"
                  aria-label="Visa punkt ${index + 1}"
                  aria-current="${index === activeProposalIndex ? "true" : "false"}"
                ></button>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
  if (focus) {
    detailPanel.focus({ preventScroll: true });
  }
}

function scrollToFocusSection() {
  const focusSection = document.querySelector("#fokus");
  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const target = focusSection.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
  window.scrollTo({ top: Math.max(target, 0), behavior: "smooth" });
}

function setActiveTopic(id, scroll = false) {
  activeTopic = id;
  activeProposalIndex = 0;
  document.querySelector("#fokus").hidden = false;
  renderTabs();
  renderDetail(scroll);
  if (scroll) {
    scrollToFocusSection();
  }
}

function moveProposal(delta) {
  const topic = topics.find((item) => item.id === activeTopic);
  activeProposalIndex = (activeProposalIndex + delta + topic.bullets.length) % topic.bullets.length;
  renderDetail();
}

function setProposal(index) {
  activeProposalIndex = index;
  renderDetail();
}

function renderPromise() {
  const promise = promises[promiseIndex];
  promiseCard.style.opacity = "0";
  setTimeout(() => {
    promiseCard.innerHTML = `
      <small>${promise.area}</small>
      <h3>${promise.title}</h3>
      <p>${promise.text}</p>
    `;
    document.querySelector("#readMorePromise").href = promise.source;
    promiseCard.style.opacity = "1";
  }, 300);
}

function movePromise(delta) {
  promiseIndex = (promiseIndex + delta + promises.length) % promises.length;
  renderPromise();
}

function randomPromise() {
  const next = Math.floor(Math.random() * promises.length);
  promiseIndex = next === promiseIndex ? (next + 1) % promises.length : next;
  renderPromise();
}

renderStaticContent();
renderCards();
renderCandidates();
renderTabs();
renderDetail();
renderPromise();

topicGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-topic]");
  if (card) {
    setActiveTopic(card.dataset.topic, true);
  }
});

tabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-topic]");
  if (tab) {
    setActiveTopic(tab.dataset.topic);
  }
});

detailPanel.addEventListener("click", (event) => {
  if (event.target.closest("[data-carousel-prev]")) {
    moveProposal(-1);
  }
  if (event.target.closest("[data-carousel-next]")) {
    moveProposal(1);
  }
  const dot = event.target.closest("[data-proposal-dot]");
  if (dot) {
    setProposal(Number(dot.dataset.proposalDot));
  }
});

document.querySelector("#prevPromise").addEventListener("click", () => movePromise(-1));
document.querySelector("#nextPromise").addEventListener("click", () => movePromise(1));

// Auto-rotate proposals every 25 seconds
setInterval(randomPromise, 25000);
