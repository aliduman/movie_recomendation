# AGENTS.md

## Repository Snapshot (verified 2026-04-14)
- **Stack:** React 18 + Vite + Tailwind CSS + Framer Motion + Firebase Auth + TMDB API
- **Module type:** ES Modules (`"type": "module"` in `package.json`)
- **Language:** JavaScript (JSX), no TypeScript

## Architecture

```
src/
├── config/          # Firebase & TMDB API clients
│   ├── firebase.js  # initializeApp, auth, googleProvider
│   └── tmdb.js      # axios instance, image URL helpers
├── contexts/
│   └── AuthContext.jsx   # Firebase onAuthStateChanged, Google sign-in/out
├── hooks/
│   ├── useMovies.js      # TMDB data fetching (trending, genre, search, detail)
│   └── useFavorites.js   # localStorage-based per-user favorites
├── components/
│   ├── Navbar.jsx         # Fixed glass nav with animated active indicator
│   ├── HeroSection.jsx    # Auto-rotating backdrop carousel
│   ├── MovieCard.jsx      # Poster card with hover animation + fav toggle
│   ├── MovieGrid.jsx      # Responsive grid with stagger animation + skeleton
│   ├── GenreSelector.jsx  # Pill-style genre switcher with layoutId animation
│   └── SearchBar.jsx      # Controlled search input
├── pages/
│   ├── HomePage.jsx       # Hero + trending grid
│   ├── ExplorePage.jsx    # Genre filter + search + grid
│   ├── MovieDetailPage.jsx # Full detail: cast, trailer, similar films
│   ├── FavoritesPage.jsx  # User's saved movies
│   └── LoginPage.jsx      # Google OAuth entry
├── App.jsx           # Route definitions, ProtectedRoute wrapper
├── main.jsx          # React root, BrowserRouter, AuthProvider
└── index.css         # Tailwind directives, glass utility, custom scrollbar
```

## Developer Commands
```bash
npm install          # Install dependencies
npm run dev          # Vite dev server on http://localhost:3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

## Key Patterns & Conventions
- **Animation:** Framer Motion `layoutId` for shared-element transitions (genre pills, nav indicator). `AnimatePresence mode="wait"` for page transitions.
- **Glass UI:** `.glass` CSS class (see `src/index.css`) — semi-transparent blur used across Navbar, cards, buttons.
- **Data fetching:** Custom hooks (`useMovies`, `useMovieDetail`) encapsulate all TMDB calls. No global state library; React context only for auth.
- **Favorites:** Per-user localStorage keyed by Firebase `uid`. No backend database — purely client-side persistence.
- **Protected routes:** `<ProtectedRoute>` in `App.jsx` redirects unauthenticated users to `/login`.
- **Image helpers:** `poster()` and `backdrop()` in `src/config/tmdb.js` build full TMDB image URLs.
- **Locale:** TMDB requests use `language: 'tr-TR'` for Turkish results.

## Environment Variables (required in `.env`)
- `VITE_TMDB_API_KEY` — TMDB v3 API key
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

## External Dependencies
| Dependency | Purpose |
|-----------|---------|
| TMDB API | Movie data, images, trailers |
| Firebase Auth | Google sign-in, user identity |
| Framer Motion | Page transitions, card animations, layout animations |
| react-hot-toast | Notification toasts |
| react-icons | Icon set (Feather Icons, Google icon) |
| axios | HTTP client for TMDB |

## Update Rule
When adding features, update this file with new modules, hooks, or integration points.
