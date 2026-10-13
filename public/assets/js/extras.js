/* Extras: sample reviews and ratings, size charts, trust badges, page transition.
   Everything here is sample content for the course project. Edit the text freely. */
(function () {
  'use strict';

  /* ---------- sample reviews ----------
     Ratings and reviews are generated from the product's slug, so a product always shows the
     same numbers. Replace with real data when there is a backend. */
  const NAMES = ['Maria S.', 'Juan D.', 'Angela R.', 'Paolo M.', 'Bea V.', 'Carlo T.', 'Nica L.', 'Migo A.', 'Trisha P.', 'Enzo G.', 'Kaye B.', 'Rafa C.'];
  const WHEN = ['September 2026', 'September 2026', 'August 2026', 'August 2026', 'July 2026'];
  const TEXT = {
    general: [
      ['Great quality for the price', 'Fabric feels solid and the stitching is clean. Exactly like the photos.'],
      ['Fits true to size', 'Ordered my usual size and it fit right out of the box. Would buy again.'],
      ['Easy to style', 'Goes with everything I already own. Got compliments the first day I wore it.'],
      ['Fast delivery', 'Arrived quicker than I expected and packed neatly. Happy with it.'],
      ['Looks even better in person', 'The color is spot on and it feels nicer than I thought it would.']
    ],
    tops: [
      ['Soft and comfortable', 'Breathable and nice against the skin, even after a full day out.'],
      ['Washes well', 'Washed it a few times already and no shrinking or fading so far.']
    ],
    outerwear: [
      ['Warm without being bulky', 'Perfect layer for AC rooms and cooler nights. The fit is relaxed.'],
      ['Feels premium', 'Zip and seams feel sturdy. Looks sharp over a plain tee.']
    ],
    sets: [
      ['Matching is so easy', 'Pieces already go together, so getting dressed takes no thinking at all.'],
      ['Worth the price', 'You get a full outfit for less than buying separate pieces.']
    ],
    kids: [
      ['My kid loves it', 'Soft fabric and my little one did not want to take it off.'],
      ['Sized well', 'Followed the size guide and it fit perfectly with a little room to grow.']
    ]
  };
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pick(arr, h, n) { const out = []; for (let i = 0; i < n; i++) out.push(arr[(h + i * 7) % arr.length]); return out; }

  const cache = new Map();
  function reviewData(p) {
    const key = p.id + '|' + p.category;
    if (cache.has(key)) return cache.get(key);
    const h = hash(String(p.id));
    const rating = Math.round((4.2 + (h % 8) / 10) * 10) / 10;           // 4.2 to 4.9
    const count = 8 + (h >>> 3) % 57;                                      // 8 to 64
    const pool = [...(TEXT[p.category] || []), ...TEXT.general];
    const reviews = pick(pool, h >>> 5, 3).map((t, i) => ({
      name: NAMES[(h + i * 5) % NAMES.length], when: WHEN[(h + i * 3) % WHEN.length],
      stars: i === 2 ? 4 : 5, title: t[0], body: t[1]
    }));
    const d = { rating, count, reviews };
    cache.set(key, d); return d;
  }
  const starsHTML = r => `<span class="stars" style="--r:${r}" role="img" aria-label="Rated ${r} out of 5">★★★★★</span>`;

  /* ---------- size guide ---------- */
  const NOTE = 'Measurements are body measurements, not garment measurements. Between two sizes? Size up for a relaxed fit.';
  const GUIDE = {
    tops: { label: 'Tops', head: ['Size', 'Chest (in)', 'Chest (cm)', 'Length (in)'],
      rows: [['S', '36–38', '91–97', '26'], ['M', '38–40', '97–102', '27'], ['L', '40–42', '102–107', '28'], ['XL', '42–44', '107–112', '29']],
      how: 'Chest: wrap the tape around the fullest part of your chest, under your arms.' },
    outerwear: { label: 'Outerwear', head: ['Size', 'Chest (in)', 'Chest (cm)', 'Length (in)'],
      rows: [['S', '38–40', '97–102', '26.5'], ['M', '40–42', '102–107', '27.5'], ['L', '42–44', '107–112', '28.5'], ['XL', '44–46', '112–117', '29.5']],
      how: 'Outerwear is cut with extra room so it layers over a tee or polo.' },
    sets: { label: 'Sets', head: ['Size', 'Chest (in)', 'Waist (in)', 'Waist (cm)'],
      rows: [['S', '36–38', '28–30', '71–76'], ['M', '38–40', '30–32', '76–81'], ['L', '40–42', '32–34', '81–86'], ['XL', '42–44', '34–36', '86–91']],
      how: 'Waist: measure around the narrowest part of your waist, just above the belly button.' },
    kids: { label: 'Kids', head: ['Size', 'Age', 'Height (cm)', 'Height (in)'],
      rows: [['S', '4–5 yrs', '104–110', '41–43'], ['M', '6–7 yrs', '116–122', '46–48'], ['L', '8–9 yrs', '128–134', '50–53'], ['XL', '10–11 yrs', '140–146', '55–57']],
      how: 'Height: measure your child standing straight, without shoes.' }
  };
  function sizeGuideHTML(category) {
    const g = GUIDE[category] || GUIDE.tops;
    return `<div class="tablewrap sg-table"><table><caption class="sr">${g.label} size chart</caption>
      <thead><tr>${g.head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
      <tbody>${g.rows.map(r => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="sg-how"><b>How to measure.</b> ${g.how}</p><p class="sg-how">${NOTE}</p>`;
  }

  /* ---------- trust badges ---------- */
  const I = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const TRUST = [
    [I('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), 'Secure checkout', 'Cash on delivery or GCash'],
    [I('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>'), 'Delivery in 2–7 days', 'Luzon-wide shipping'],
    [I('<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>'), '7-day returns', 'Unworn items with tags']
  ];
  const trustHTML = () => `<ul class="trust" aria-label="Shopping guarantees">${TRUST.map(t => `<li>${t[0]}<span><b>${t[1]}</b><small>${t[2]}</small></span></li>`).join('')}</ul>`;

  /* ---------- page transition ----------
     The new page fades in (CSS). When an internal link is clicked, the current page fades out
     for a moment first, so navigation never feels like a hard cut. */
  function pageTransition() {
    const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce()) return;
      const a = e.target.closest('a[href]'); if (!a) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.hasAttribute('data-lightbox')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html?$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;   // same page / #hash only
      e.preventDefault();
      document.documentElement.classList.add('leaving');
      setTimeout(() => { location.href = url.href; }, 170);
    });
    // coming back with the Back button can restore the faded-out page from cache
    addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('leaving'); });
  }
  pageTransition();

  window.EXTRAS = { reviewData, starsHTML, sizeGuideHTML, trustHTML };
})();
