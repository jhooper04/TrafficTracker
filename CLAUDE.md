# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # tsc type-check + Vite production build → dist/
npm run preview   # serve the production build locally
```

No test runner or linter is configured.

## Architecture

**TrafficTracker** ("Bead Lake") is a React 19 + TypeScript + Vite SPA for recording visitor entries at a boat launch. It uses a self-hosted Appwrite backend for auth and data.

### Backend (Appwrite)

All Appwrite wiring lives in [src/lib/appwrite.ts](src/lib/appwrite.ts):
- Endpoint: `https://appwrite.jakehooper.pro/v1`, project `traffic-tracker`
- Database: `traffic-log`, collection: `entries` (constants `DB_ID`, `COLLECTION_ID`)
- Exports `account`, `databases`, `Query`, `ID`, and `fetchTodayEntries()` (queries today's entries ordered newest-first)

The `Entry` type ([src/types/entry.ts](src/types/entry.ts)) maps directly to Appwrite document fields: `site`, `visit_type` (`Boat | Paddleboard | Hiker | Other`), `license_plate`, `state`, `vehicle_desc`, `contacted` (number), `notes`.

### State management

All state lives in `App.tsx` — no external state library. `App` owns: `user` (Appwrite account), `entries` (today's list), `selectedEntry` (the entry open in the edit panel), and `view` (`entries | reports`). Callbacks flow down as props; entries are updated optimistically in local state after Appwrite writes succeed.

### Component tree

```
App
├── LoginForm          — email/password login via Appwrite account
├── NavBar             — view switcher + logout
└── EntriesView        — main view
    ├── VisitButtons   — one button per visit type, shows today's count, creates a new entry on click
    ├── EntriesTable   — list of today's entries, row click sets selectedEntry
    └── EntryPanel     — slide-in drawer to edit an entry's details (license plate, state, vehicle desc, contacts, notes)
    ReportsView        — stub ("coming soon")
```

Entry creation happens in `EntriesView.handleAdd`: a minimal document is created in Appwrite immediately on button tap with `site` hard-coded to `'Bead Lake Launch'`, then detail fields are filled in via `EntryPanel`.

### Build / deploy

Vite `base` is set to `/BeadLake/dist/`, meaning the app is served from a subdirectory on the host. `npm run build` outputs to `dist/`.
