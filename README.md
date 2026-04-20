# Gold Rush Slots

A Gold Rush-themed HTML5 slot game. No dependencies, no build step — pure HTML/CSS/JS.

## Features

- 5-reel × 3-row slot engine
- 20 paylines with win-line highlighting
- 8 symbols: Wild ⭐, Scatter 💥, Gold Bar 🥇, Nugget 💛, Pickaxe ⛏️, Dynamite 🧨, Horseshoe 🧲, Cowboy Hat 🤠
- Smooth reel-stop animation (staggered)
- Balance tracker, configurable bet (1–50), session RTP stats
- Spacebar shortcut to spin
- Responsive layout (desktop + mobile)

## Running locally

```
open index.html
```
or serve from any static host — no backend required.

## Tests

```
node tests/gameLogic.test.js
```

## Deployment

Push to `main` → GitHub Actions runs tests → deploys to GitHub Pages automatically.
