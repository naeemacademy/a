# AcademyPro — Student Portal

A static student portal (login, dashboard, fees, attendance, class tests,
test sessions, profile) built to match the AcademyPro design and driven
entirely by `data/students.json`.

## Running it locally

No build step — it's plain HTML/CSS/JS. From this folder, run any static
server, e.g.:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`. (Opening `index.html` directly by
double-clicking may fail in some browsers because `fetch()` of the JSON
file needs `http://`, not `file://`.)

## Deploying to GitHub Pages

1. Push this entire folder's contents to the root of your GitHub repo
   (or to a `/docs` folder — either works with GitHub Pages).
2. In the repo, go to **Settings → Pages**, set the source branch and
   folder, and save.
3. Your portal will be live at `https://<username>.github.io/<repo>/`.

## Updating student data

Everything lives in `data/students.json`. Add, edit, or remove student
objects there — every page reads from this file (via the browser at
login, then from the session for the rest of the visit).

## Login

- **Step 1** — student picks Class + Group and enters their Roll Number.
- **Step 2** — shown their Student ID (`GROUP-CLASS-ROLL`, e.g.
  `BIO-10th-012`) and asked for their password.
- After 5 wrong password attempts, that student is locked out for 30
  seconds (client-side only — see the security note below).
- The session lives in `sessionStorage`, so it clears automatically when
  the tab is closed, and also on Logout.

## Logo

`assets/logo.svg` is a placeholder circular emblem. Swap it out for the
real Naeem Academy logo image (keep the filename `logo.svg`, or update
the `<img src="assets/logo.svg">` references across the HTML files if
you use a different filename/format).

## ⚠️ Security note

This is a static site with no backend — `data/students.json` (including
plaintext passwords) is downloadable by anyone who opens it directly or
inspects the page's network requests. The login flow is built to *feel*
solid (validation, lockout, no plaintext left visible in the UI), but
there is no way to make client-only authentication genuinely secure.
For real security, student data and password checks would need to move
behind a backend/API — which your PHP admin portal could eventually
provide.
