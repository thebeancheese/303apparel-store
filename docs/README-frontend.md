# 303 Apparel — storefront (HTML, CSS, JavaScript)

This is the front-end-only build: everything runs from static files and browser
storage (localStorage), so it works by just opening the site — no server, PHP
or MongoDB needed yet.

## Open it
Open `index.html` in a browser, or serve the folder so paths resolve cleanly:

```bash
python3 -m http.server 8080   # from inside this folder
# then open http://localhost:8080
```

## Pages
- `index.html` — Landing page: hero, about, featured products, promo banner with
  countdown, promotional video, and the two-sided brochure (`assets/img/brochure/`)
- `features.html` — Feature page
- `products.html` — Product catalog: search, category filter, sort, and
  **pagination** (8 per page) — the whole gallery lives in this one file
- `contact.html` — Contact form + company info
- `social.html` — "Cop the Drop" social media campaign, with a scrollable carousel of the five promotional posters (`assets/img/campaign/`)
- `infographic.html` — "The Fit Formula" infographic page
- `credits.html` — Credits (creators and special thanks)
- `admin.html` — Staff area (passcode: `a303admin`, set in `assets/js/admin.js`)

## Product photos and galleries
Each product's photos live in `assets/img/products/<slug>/1.jpg`, `2.jpg`, etc.
A product with more than one photo shows a photo-count badge on its card, and
its detail view opens a gallery with arrows, swipe-style dots and left/right
arrow-key support. Products with only one photo just show that photo, no
gallery controls. The catalog itself — names, prices, categories, stock,
featured flag, description, and the photo list — lives in `assets/js/data.js`.

## Admin
The admin page can add a product (with 1–8 photos), edit one, delete one,
toggle which ones are "Featured" (shown on the home page), and edit the promo
code. These are saved in the browser's localStorage, so they're local to
whichever browser/device the admin uses — this is the front-end stage; see
below for what changes once the database is wired up.

## Sample data
Five made-up customers are seeded into the admin's Customers tab the first
time a browser loads the site (`window.SEED_CUSTOMERS` in `assets/js/data.js`),
so that dataset isn't empty before anyone has actually checked out. Real
orders are added on top of this and never overwrite it.

## 404 page
`404.html` is a branded "page not found" screen. Netlify serves it
automatically for any unmatched URL once the site is deployed, no extra
configuration needed.

## The product catalog, and a note on browser caching
The storefront saves its catalog into each visitor's browser (localStorage) the
first time they load it, so admin changes stick around on return visits without
a database. That means if you edit `assets/js/data.js` later, a browser that
already has a saved catalog won't see the edit on its own — so `data.js` also
sets `window.SEED_VERSION`. **Bump that number any time you change
`SEED_PRODUCTS`** and every visitor's browser will refresh to the new list
automatically on their next load (this does discard anything they'd added
through the admin page, by design — the seed is meant to be the ground truth
whenever it changes). The admin page's own "Reset to the original catalog"
button does the same thing on demand.

## Promo
Code **15FF** gives 15% off and runs through **October 15, 2026**. Edit it
from the admin page, or change the default in `assets/js/store.js`
(`DEFAULT_PROMO`).

## Swapping in MongoDB later
All data access goes through `assets/js/store.js` (`window.Store`), with one
function per thing the site needs: `listProducts`, `getProduct`, `addProduct`,
`updateProduct`, `deleteProduct`, `getPromo`, `setPromo`, `placeOrder`,
`listCustomers`, `addMessage`, `listMessages`. Right now each one reads or
writes `localStorage`. When the MongoDB-backed API is ready, replace the body
of each function with a `fetch()` call to that API — the rest of the site
(`common.js`, `home.js`, `products.js`, `admin.js`, etc.) calls `Store.*` and
never touches storage directly, so nothing else needs to change.

## Brand assets
`assets/img/logo-mark-cream.png` (header, on navy) and `assets/img/logo-badge-navy.png`
(hero badge, on cream) come straight from the official logo files. The favicons
(`favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`, `favicon.ico`) are
cropped from the same navy mark. Brand colors (`--navy` #2a3f62, `--cream` #fef9ea)
in `assets/css/style.css` are sampled from those files, so any new art in the same
navy/cream should match automatically.

## Promotional video
`assets/video/promovid303.mp4` is H.264, so it plays in all major browsers. The
poster frame is `assets/img/promo/video-poster.jpg`. To use another file, put it
at the same path or change `VIDEO_FILE` in `assets/js/config.js`.

`initVideoSystem()` in `assets/js/common.js` creates two separate video
elements, one for the floating player and one for the section on the landing
page. They are never moved between parents, because reparenting a playing
`<video>` freezes the picture on some phones. When you scroll between the two
spots, the one leaving is paused and the other resumes at the same time.

- **Floating mini player.** Shows from page load, can be dragged by its title
  bar and resized with the corner handle or arrow keys. Always 4:3, between
  160px and 420px wide (`MIN_W` / `MAX_W` in `initVideoSystem()`). The close
  button pauses it and hands off to the section below until the page reloads.
- **Video section** on the landing page. Also 4:3, resizable from 260px to
  820px (`MIN_W` / `MAX_W` in `assets/js/home.js`).

## Image viewer
The brochure images (home page) and the infographic open in an in-page dialog
instead of a new tab. To use it on another image, add `data-lightbox` to the
`<a>` that wraps it. The code is in `assets/js/common.js`.

## Things to fill in
- **Promotional video:** set `VIDEO_EMBED_URL` or `VIDEO_FILE` in
  `assets/js/config.js`.
- **Company details:** phone, email and hours in the same file are
  placeholders.
- **Social links:** replace the `#` placeholders in `config.js`.
- **Admin passcode:** change `ADMIN_KEY` in `assets/js/admin.js` before
  sharing this publicly. It is a plain string in the code, which is fine for a
  class demo but not for a real deployment.
