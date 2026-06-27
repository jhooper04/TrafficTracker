# TrafficTracker

A lightweight field tool for recording and reviewing visitor traffic at a boat launch or recreation site. Rangers and site staff log each visit in real time — one tap creates an entry, and details (license plate, vehicle description, contacts made) can be filled in at any point during the shift. At the end of the day, the full entry list is available for review and reporting.

The app is built as a Progressive Web App (PWA-friendly) so it works well on phones and tablets in the field.

---

## Features

- **Quick entry logging** — one-tap buttons for each visit type (Boat, Paddleboard, Hiker, Other) with live per-type counts
- **Detail editing** — slide-in panel to record license plate, state, vehicle description, number of people contacted, and freeform notes
- **Today's view** — automatically loads entries since midnight; real-time local updates without page refreshes
- **Authentication** — secure email/password login backed by Appwrite; no session persists after logout
- **Reports view** — placeholder for future reporting features

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 6 |
| Backend / Auth / DB | [Appwrite](https://appwrite.io) (self-hosted) |
| Styling | Plain CSS (no framework) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm 9 or later
- Access to the Appwrite instance (`appwrite.jakehooper.pro`) — or your own Appwrite deployment (see [Configuration](#configuration))

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd TrafficTracker

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Log in with a valid Appwrite account for the `traffic-tracker` project.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot-module replacement |
| `npm run build` | Type-check with `tsc` then bundle for production into `dist/` |
| `npm run preview` | Serve the production build locally to verify before deploying |

---

## Configuration

The Appwrite connection is configured directly in [src/lib/appwrite.ts](src/lib/appwrite.ts):

```ts
const client = new Client()
  .setEndpoint('https://appwrite.jakehooper.pro/v1')
  .setProject('traffic-tracker')
```

To point the app at a different Appwrite instance, update those two values. You will also need a database named `traffic-log` with a collection named `entries` containing the following attributes:

| Attribute | Type | Notes |
|---|---|---|
| `site` | String | Location name (e.g. `"Bead Lake Launch"`) |
| `visit_type` | String | `Boat`, `Paddleboard`, `Hiker`, or `Other` |
| `license_plate` | String | Optional |
| `state` | String | Two-letter state code, optional |
| `vehicle_desc` | String | Optional |
| `contacted` | Integer | Number of people contacted |
| `notes` | String | Freeform, optional |

The Appwrite built-in `$createdAt` timestamp is used to filter today's entries — no additional date field is required.

---

## Deployment

The production build is served from a subdirectory path. The Vite config sets:

```ts
base: '/BeadLake/dist/'
```

To deploy, build the project and copy `dist/` to the appropriate directory on your web server:

```bash
npm run build
# then copy dist/ → /var/www/html/BeadLake/dist/ (or your server equivalent)
```

If you serve the app from a different path, update `base` in [vite.config.ts](vite.config.ts) before building.

---

## Project Structure

```
src/
├── lib/
│   └── appwrite.ts       # Appwrite client, DB constants, fetchTodayEntries()
├── types/
│   └── entry.ts          # Entry interface and VisitType union
├── components/
│   ├── LoginForm.tsx      # Email/password login screen
│   ├── NavBar.tsx         # View switcher and logout
│   ├── EntriesView.tsx    # Main view — quick-add buttons, table, edit panel
│   ├── VisitButtons.tsx   # Per-type count badges and add buttons
│   ├── EntriesTable.tsx   # Scrollable table of today's entries
│   ├── EntryPanel.tsx     # Slide-in drawer for editing entry details
│   └── ReportsView.tsx    # Placeholder for future reports
├── App.tsx                # Root — auth state, entry list, view routing
├── main.tsx               # React entry point
└── index.css              # Global styles
```

---

## How It Works

1. On load, the app checks for an active Appwrite session. If none exists, the login screen is shown.
2. After login, today's entries are fetched (all documents created since local midnight, newest first).
3. Tapping a visit-type button immediately creates a new entry in Appwrite with the site name and type set. No form required — entries can be captured in under a second.
4. Tapping a row in the entry table opens the detail panel, where additional fields can be saved at any time.
5. All state is held in `App.tsx` and passed down as props. Appwrite is the source of truth; the local list is updated optimistically after each successful write.
