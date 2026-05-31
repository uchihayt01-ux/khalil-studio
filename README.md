# Khalil Studio — Portfolio & Order System

A modern, dark-purple single-page site for a Front-End Development & UI/UX Design studio.

- **Animated background** — cursor-reactive WebGL "liquid silk" (graceful CSS fallback).
- **Portfolio** — filterable masonry grid (All / Web Dev / UI/UX) with real project images.
- **Order wizard** — 3-step flow (service → brief + timeline → confirm) with a success animation.
- **Client accounts** — sign up / log in; each client tracks their own orders and statuses.
- Orders are emailed to the studio (EmailJS, with a `mailto:` fallback).

## Tech
Plain HTML, CSS and JavaScript — no build step. Just open `index.html`.

## Run locally
```bash
npx serve .
```

## Deploy (Vercel)
```bash
npx vercel        # preview deploy
npx vercel --prod # production deploy
```

## Notes
- The account system is **front-end only** (browser `localStorage`) for demo purposes.
  Real, cross-device accounts need a backend (e.g. Supabase or Firebase Auth).
- To send real order emails, fill in `CONFIG.emailjs` at the top of `script.js`
  (free account at https://emailjs.com). Until then, submitting opens the visitor's
  mail app pre-filled to the studio address.

© Khalil M'hamdi
