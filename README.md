# AcademyPro — Student Portal

This build is assembled directly from your Stitch-exported HTML/Tailwind
code for every screen (login, dashboard, fees, attendance, class tests,
test sessions, notifications, profile), wired up to `data/students.json`
and multi-page navigation/session handling.

## Running it locally

Plain HTML/CSS/JS, no build step to *run* it. From this folder run a static server:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`. (Don't double-click `index.html` —
`fetch()` of the JSON needs `http://`, not `file://`.) Fonts and icons
(Google Fonts, Material Symbols) still load from Google's CDN, but the
Tailwind utility CSS is now a **compiled local file**
(`css/tailwind.built.css`) instead of the `cdn.tailwindcss.com` script —
that CDN script isn't meant for production use, so removing it makes
the site faster and not dependent on that one external script.

### If you add new Tailwind classes later

The compiled CSS only contains the utility classes actually used in
the project today. If you edit the HTML/JS and introduce a new
Tailwind class that isn't already used elsewhere, you'll need to
recompile:

```
npm install -D tailwindcss@3      # once
npx tailwindcss -i css/tailwind-src.css -o css/tailwind.built.css --minify --config tailwind.config.js
```

(A ready-made `tailwind.config.js` and `css/tailwind-src.css` are
included for this.) If that's more than you want to deal with, you can
always swap back to the CDN script tag temporarily while testing.


## ⚠️ Two things to check before you rely on this

1. **The background photos and logo are your Stitch-generated image
   URLs** (`lh3.googleusercontent.com/aida-public/...`), copied exactly
   from the code you sent. I couldn't verify from my side whether these
   stay reachable long-term — some AI-tool asset links are tied to the
   originating project/session and can expire. **Before you rely on
   this for real students, open the site and confirm the login page
   photos and logo actually load.** If any come back broken, download
   the image from Stitch and swap the URL for a local file in `assets/`.
2. I could not get a working visual preview from my side this session
   (my sandbox blocks the same CDNs your browser will use), so what
   I'm handing you is carefully code-reviewed but not screenshot-
   verified. Please look it over page by page and tell me anything
   that's off — spacing, colors, or behavior — and I'll fix it directly.

## Deploying to GitHub Pages

1. Push this folder's contents to the root of your repo (or `/docs`).
2. **Settings → Pages** → pick the branch/folder → Save.
3. Live at `https://<username>.github.io/<repo>/`.

## Updating student data

Everything lives in `data/students.json` — add/edit/remove student
objects there. The Student ID shown across the portal (e.g.
`BIO-10th-012`) is generated automatically from `group`, `class`, and
`rollNo` — you don't set it directly.

## Login & sessions

- Step 1: Class + Group + Roll Number → looks up the student.
- Step 2: shows their Student ID, checks the password.
- 5 wrong passwords locks that student out for 30 seconds
  (client-side only — see the security note below).
- Session lives in `sessionStorage`: cleared on tab close or Logout.

## ⚠️ Security note

This is a static site with no backend — `data/students.json` (including
plaintext passwords) is downloadable by anyone who inspects the page's
network requests. The login flow is built to feel solid, but there's no
way to make client-only auth genuinely secure. Real security would need
a backend/API — which your PHP admin portal could eventually provide.
