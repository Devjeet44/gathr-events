# Gathr — Responsive Event Management Website

**K Explore – Web Designing** · Task: *Design and Develop a Responsive Event Management Website*

Gathr is a modern, fully responsive event platform where users can explore upcoming events, search and filter them, read detailed information and register through a validated form. It is built with plain **HTML5, CSS3 and JavaScript** (no frameworks, no build step).

- 🔗 **Live site:** `<add your deployed link here>`
- 📦 **Repository:** `<add your GitHub repo link here>`

---

## Features

### Core requirements
| Requirement | How it is done |
|---|---|
| Hero section | Gradient hero with headline, CTAs, live platform stats and a "Happening next" card |
| Upcoming & featured events | Dedicated *Featured* section (swipeable on mobile) plus a full *Upcoming events* grid |
| Event cards | Image, category tag, date badge, title, date/time, venue, short description, price, seats left, countdown |
| Browse, search, filter | Live search (title, venue, keywords), category chips with counts, and sorting (date / price / seats) |
| Event details | Click any card to open an accessible modal with full description, venue, time, price, availability and highlights |
| Registration form | Name, email, phone, selected event (+ number of tickets and terms checkbox) |
| JavaScript validation | Inline, real-time validation with clear messages, focus on the first error, and a shake animation |
| Confirmation message | Animated success view with a booking reference, summary and "Add to calendar" (.ics) |
| Responsive | Mobile-first layout tested at 390 px (phone), tablet and desktop widths; no horizontal overflow |

### Bonus challenges (all implemented)
- 🌗 **Dark / light mode** — respects system preference, remembers choice, no flash on load
- ⏱️ **Countdown timers** — live timer in the hero plus a "Starts in …" countdown on every card and ticket
- ✨ **Animations** — scroll-reveal, staggered card entrance, hover lifts, animated check mark, floating hero blobs (all disabled automatically for `prefers-reduced-motion`)
- 💾 **Local Storage registrations** — bookings persist in the browser; a **My tickets** section lists them and allows cancelling; seat counts update live and duplicate registrations are blocked

### Extra touches
Skip link, ARIA labels, keyboard-friendly native `<dialog>` (Esc to close, focus restored), loading state on submit, empty state for no search results, multi-tab sync via the `storage` event.

---

## Tech stack
- HTML5 (semantic landmarks, `<dialog>`)
- CSS3 (custom properties, Grid, Flexbox, `color-mix`, animations)
- Vanilla JavaScript (ES2020, no dependencies)

## Project structure
```
gathr-events/
├── index.html              # Page structure, dialog and form markup
├── css/style.css           # Design tokens, themes, layout, components, animations
├── js/
│   ├── events.js           # Event data (title, category, venue, price, seats…)
│   └── app.js              # Rendering, search/filter, countdowns, modal, validation, storage
├── images/                 # Original SVG artwork, one per event
├── tools/generate-images.js# Script that regenerates the SVG artwork
└── README.md
```

## Run locally
No installation needed.
```bash
git clone <your-repo-url>
cd gathr-events
# option 1: just open index.html in a browser
# option 2: serve it
npx serve .        # or: python3 -m http.server 8000
```

## Implementation notes

**Event dates.** Dates in `events.js` are stored as `daysFromNow` + `time`, and converted into real dates when the page loads. This keeps the demo always showing *upcoming* events with working countdowns. In a real product this would come from a database or API.

**Search & filter.** `getVisible()` combines the category filter and a multi-word search (every typed word must appear in the event's title, venue, category or description), then applies the chosen sort. Results re-render with a short debounce.

**Validation rules** (`rules` object in `app.js`):
| Field | Rule |
|---|---|
| Name | 2–60 characters; letters (any language), spaces, `. ' -` |
| Email | Must match `name@domain.tld` |
| Phone | 10 digits with an optional country code; digits, spaces, `+ ( ) -` only; 10-digit mobiles must start with 6–9 |
| Event | Required, must exist, must not be sold out |
| Tickets | 1–5 and not more than the seats left |
| Terms | Must be ticked |
| Duplicate | Same email cannot register twice for the same event |

Fields validate on blur, then re-validate on every keystroke once they have an error. On submit, all fields are checked and the first invalid one receives focus.

**Local Storage.** Keys: `gathr.registrations.v1` (array of bookings) and `gathr.theme`. A booking looks like:
```json
{ "ref": "GTR-3XS2PD", "eventId": "startup-pitch-night", "name": "Aarav Sharma",
  "email": "aarav@example.com", "phone": "+91 98765 43210", "tickets": 2,
  "total": 0, "createdAt": "2026-11-08T18:30:00.000Z" }
```
Seats left = total seats − seats already taken − tickets booked in this browser.

**Security.** All dynamic text is escaped before being inserted into the DOM.

**Artwork.** Event images are original SVGs generated by `tools/generate-images.js`, so the site has no external image dependencies and loads fast. Replace any file in `images/` (or change the `image` path in `events.js`) to use real photos.

## Deploy

**GitHub Pages**
1. Push the repo to GitHub.
2. *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.*
3. Your site appears at `https://<username>.github.io/<repo-name>/`.

**Netlify** — *Add new site → Import from Git* (build command: none, publish directory: `.`), or drag-and-drop the folder.

**Vercel** — *Add New → Project → import the repo* (Framework preset: *Other*, no build command).

## Git workflow
```bash
git init
git add .
git commit -m "feat: initial Gathr event website"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

## Possible improvements
Backend + database for real registrations, email confirmations, payments, user accounts, an organiser dashboard, map view and multi-language support.

## License
Educational project — free to use and modify.
