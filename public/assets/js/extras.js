/* Extras: size charts for the product dialog.
   The numbers are placeholders: edit GUIDE to match your real sizing. */
(function () {
  'use strict';
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
  window.EXTRAS = { sizeGuideHTML };
})();
