(function() {
    //remove no-js for enhanced behavior
    document.documentElement.classList.remove('no-js');

    //mapping header text -> language code (strict)
    function mapLang(text) {
        const t = (text || '').trim().toLowerCase();
        if (t === '__english_section') return 'en';
        if (t === '__vietnamese_section') return 'vi';
        return null;
    }

    // find the main content root
    const root = document.querySelector('.gh-content, .post-content, article');
    if (!root) return;

    //1. find marker headings, we mark as h2
    const markers = [];
    root.querySelectorAll('h2').forEach(h => {
        const lang = mapLang(h.textContent);
        if (lang) markers.push({el: h, lang});
    });

    // if no marker than we keep post as is
    if (markers.length === 0) return;

// 2) Group blocks under each marker without moving DOM
  for (let i = 0; i < markers.length; i++) {
    const { el, lang } = markers[i];
    el.classList.add('lang-marker'); // hide on web
    let node = el.nextElementSibling;
    const nextMarker = markers[i + 1]?.el || null;
    while (node && node !== nextMarker) {
      // Only tag element nodes; skip script/style, etc.
      node.classList?.add('lang-chunk');
      node.setAttribute?.('data-lang', lang);
      node = node.nextElementSibling;
    }
  }

  // 3) Determine languages present
  const chunks = Array.from(root.querySelectorAll('.lang-chunk[data-lang]'));
  const langsPresent = [...new Set(chunks.map(c => c.getAttribute('data-lang')))];
  const hasBilingualBody = langsPresent.length >= 2;

  // 4) Title spans (optional title toggle)
  const titleSpans = Array.from(document.querySelectorAll('.lang-title'));
  const hasBilingualTitle = titleSpans.length >= 2;

  // If neither body nor title is bilingual, do nothing
  if (!hasBilingualBody && !hasBilingualTitle) return;

  // 5) Show/hide switcher based on body bilingual
  const switcher = document.querySelector('.lang-toggle');
  if (switcher) switcher.hidden = !hasBilingualBody;

  // 6) Resolve initial language: URL ?lang=.. > localStorage > default
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  const stored = localStorage.getItem('preferredLang');
  const defaultLang = langsPresent.includes('en') ? 'en' : (langsPresent[0] || 'en');

  let current =
    (urlLang && (langsPresent.includes(urlLang) || ['en','vi'].includes(urlLang))) ? urlLang :
    (stored && (langsPresent.includes(stored) || ['en','vi'].includes(stored))) ? stored :
    defaultLang;

  // 7) Apply selection
  function apply(lang) {
    chunks.forEach(c => c.classList.toggle('is-active', c.getAttribute('data-lang') === lang));
    titleSpans.forEach(t => t.classList.toggle('is-active', t.dataset.lang === lang));
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.setLang === lang ? 'true' : 'false');
    });
  }

  apply(current);

  // 8) Wire the two buttons (if present)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    const lang = btn.dataset.setLang;
    if (!lang) return;
    apply(lang);
    localStorage.setItem('preferredLang', lang);
  });
})();