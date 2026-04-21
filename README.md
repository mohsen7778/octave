<div align="center">

# Octave — Private Music Player

**A fully private, client-side Spotify alternative running entirely in your browser with zero backend.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Privacy: 100%](https://img.shields.io/badge/Privacy-100%25-success.svg)](#)
[![Backend: None](https://img.shields.io/badge/Backend-Zero-blue.svg)](#)

<p align="center">
  <img src="./screenshot/screenshot1.jpg" width="45%" style="border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
  <img src="./screenshot/screenshot2.jpg" width="45%" style="border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
</p>

**Live Demo:** [https://mohsen7778.github.io/octavemusicapp/](https://mohsen7778.github.io/octavemusicapp/)  
*(This link is provided as a demo. Do not rely on it for personal usage. Deploy your own instance for best performance.)*

</div>

---

## Why Octave

Most music apps are heavy, slow, and track everything. Octave is different.

* No account required
* No tracking
* No backend
* No data collection

Everything runs directly in your browser and stays on your device.

---

## What is Octave

Octave is a high-performance, client-side music player that connects to public audio APIs in real-time. It does not store or host any media. 

All user data, including playlists, liked songs, listening history, and algorithm preferences, is stored locally using browser `localStorage`. 

This guarantees:
* Full control over your data
* No external servers processing your behavior
* No privacy concerns

---

## Core Features

### Background Playback
Octave supports reliable background playback across Chrome, Safari, and Brave. It uses a raw HTML5 `<audio>` proxy engine that bypasses traditional iframe restrictions, keeping the audio alive when the app is minimized. It fully integrates with the Media Session API for native lock-screen controls and album art.

### Predictive Music Engine
The app runs a 10-point behavioral tracking system locally to build your taste profile:
* **Action Tracking:** Scores adjust based on quick skips, full completions, and manual selections.
* **Time Context:** Tags listening habits by time of day (morning, afternoon, night).
* **Session Blacklist:** Ensures you never hear the same song twice in a single sitting.
* **Auto-DJ:** Generates continuous, personalized queues using your highest-scoring local tracks.

### Modern Interface
* **Liquid Shadows:** Album art colors are extracted using a center-grid sampling algorithm to cast dynamic, highly saturated, animated shadows across the player.
* **Glassmorphism:** Built with modern, frosted-glass aesthetics and smooth CSS transitions.

### Local Data System
* **Data Vault:** Export and import your entire listening history, stats, and playlists as a portable JSON file.
* **Custom Playlists:** Create, edit, and manage libraries directly on your device.

### Artist & Lyrics Integration
* **Synced Lyrics:** Real-time lyric fetching with a custom typography picker.
* **Artist Bios:** Uses a dual-fallback system (TheAudioDB + aggressive Wikipedia API redirects) to pull accurate artist history, caching it locally for instant load times.

---

## Architecture Flow

Octave acts as a bridge between your browser and public APIs.

* **Search & Stream:** Proxied HTML5 Audio via Invidious API
* **Playback Control:** Native Audio Element + Media Session API
* **Lyrics:** LRCLIB API
* **Artist Info:** TheAudioDB / Wikipedia API
* **Storage:** Browser localStorage

No data is stored on any server owned by this project.

---

## Performance

* Lightweight and fast
* No server latency
* Runs entirely in the browser
* Optimized for mobile devices

*Performance depends directly on the availability of the public Invidious instances it connects to.*

---

## Deploy Your Own

For the best experience, deploy your own instance. Since it is pure frontend, it takes less than a minute.

**GitHub Pages**
1. Fork this repository
2. Go to Settings -> Pages
3. Select the main branch and save

**Cloudflare Pages**
1. Go to pages.cloudflare.com
2. Connect your repository
3. Deploy with default settings

**Netlify / Vercel**
Connect the repository and deploy without any build configuration.

---

## Use Cases

* Personal, private music player
* Lightweight alternative to mainstream streaming apps
* Self-hosted music interface
* Learning project for frontend development and proxy API routing

---

## Limitations

* Depends entirely on public APIs
* No offline playback capability
* Performance may vary based on API response times and rate limits

---

## Legal Notice

This project is provided for educational and personal use.

You are allowed to use, modify, and deploy this project for non-commercial purposes only.

You are not allowed to sell, resell, sublicense, or use this project or any modified version of it for commercial gain without explicit permission from the author.

This project does not host, store, or distribute any media. All content is fetched from third-party public APIs.

The developer has no control over external content and is not responsible for any copyright issues or service interruptions.

By using or deploying this project you accept full responsibility for compliance with applicable laws and third-party terms.

This software is provided as is without any warranty.

---

## Support

Telegram: [https://t.me/ucvezw](https://t.me/ucvezw)

---

If you like this project, consider giving it a star.
