// Server-only: Google Alerts feed addresses supplied by the site owner.
const base = 'https://www.google.com/alerts/feeds/01478806186017938414/';
export const mediaFeeds = [
  { id: '2005217282086673731', topic: 'Simon', label: 'Simon Berneblad Mandegård' },
  { id: '10347222589258790241', topic: 'Simon', label: 'Simon Berneblad' },
  { id: '2707622303709274064', topic: 'Simon', label: 'Simon Berneblad Mandegård, Norra Skåne' },
  { id: '5403094432309073941', topic: 'Simon', label: 'Simon Berneblad Mandegård, frilagt' },
  { id: '2148187242542639534', topic: 'Simon', label: 'Simon Berneblad, frilagt' },
  { id: '5399105933201380096', topic: 'Erika', label: 'Erika Heil Utbult' },
  { id: '6293602843036109393', topic: 'KD Hässleholm', label: 'Kristdemokraterna Hässleholm' },
].map(feed => ({ ...feed, url: base + feed.id }));

// Add an article's canonical URL here to hide a false match, then rebuild/deploy.
export const hiddenMediaURLs = [];
