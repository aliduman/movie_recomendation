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
│   ├── useMovies.js      # TMDB data fetching (trending, genre, search, detail, person)
│   ├── useFavorites.js   # Firestore-backed per-user favorites (guest fallback localStorage)
│   ├── useWatchlist.js   # Firestore-backed multi-watchlist management + legacy single-list migration
│   ├── useRecommendation.js # Wizard recommendation history + seen tracking
│   └── useInfiniteScroll.js # IntersectionObserver sentinel for pagination
├── components/
│   ├── Navbar.jsx         # Fixed glass nav with animated active indicator
│   ├── Footer.jsx         # Support logo footer area
│   ├── HeroSection.jsx    # Auto-rotating backdrop carousel
│   ├── MovieCard.jsx      # Poster card with hover animation + fav toggle
│   ├── MovieGrid.jsx      # Responsive grid with stagger animation + skeleton
│   ├── GenreSelector.jsx  # Pill-style genre switcher with layoutId animation
│   ├── WatchlistSelector.jsx # Movie-detail watchlist picker (mobile sheet / desktop dialog)
│   └── SearchBar.jsx      # Controlled search input
├── pages/
│   ├── HomePage.jsx       # Hero + trending grid
│   ├── ExplorePage.jsx    # Genre filter + search + grid
│   ├── MovieDetailPage.jsx # Full detail: cast, trailer, watch providers, similar films
│   ├── ActorDetailPage.jsx # Person profile + known movies
│   ├── FavoritesPage.jsx  # User's saved movies
│   ├── WatchlistPage.jsx  # User's watchlist cards + create-list flow
│   ├── WatchlistDetailPage.jsx # Single watchlist detail grid
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
- **Pagination:** Home and Explore lists use a "Daha fazla film gör" CTA first, then infinite scroll via `useInfiniteScroll` + `useMovies.loadMore()`.
- **Detail flows:** Movie detail pulls `/movie/{id}/watch/providers` and supports `TR/US` region selector; cast cards link to `/person/:id`.
- **Actor filtering:** Actor detail page filters known movies client-side by year range and minimum rating; filters are shareable via query params (`/person/:id?from=2010&to=2020&min=7`).
- **Favorites:** Logged-in users persist to Firestore at `users/{uid}/favorites/{movieId}`; guests fallback to localStorage.
- **Watchlists:** User-created watchlists persist at `users/{uid}/watchlists/{watchlistId}` with movies in `movies/{movieId}` subcollections; old `users/{uid}/watchlist` entries migrate into a default list.
- **Recommendation history:** Wizard stores recommendation records at `users/{uid}/recommendations/{movieId}` and marks repeated suggestions.
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
| Firestore | Per-user favorites + recommendation history persistence |
| Framer Motion | Page transitions, card animations, layout animations |
| react-hot-toast | Notification toasts |
| react-icons | Icon set (Feather Icons, Google icon) |
| axios | HTTP client for TMDB |

## Update Rule
When adding features, update this file with new modules, hooks, or integration points.
