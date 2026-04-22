<div align="center">
# Octave — Private Audio Engine
**A fully private, high-performance client-side music architecture running entirely in your browser with zero backend infrastructure.**
<p align="center">
<img src="./screenshot/screenshot1.jpg" width="45%" style="border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.5);" alt="Octave Player Interface">
<img src="./screenshot/screenshot2.jpg" width="45%" style="border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.5);" alt="Octave Playlist View">
</p>
**Live Demo:** https://mohsen7778.github.io/octavemusicapp/
*(This link is provided as a technological demonstration. Deploy your own static instance for optimal API performance.)*
</div>
<hr>
## Overview & Architecture
Octave is a serverless, vanilla web technology platform designed for zero-latency streaming and uncompromising user privacy. Unlike traditional streaming applications that track behavior and require heavy database rendering, Octave operates strictly at the edge.
 * No account or authentication required
 * No behavioral tracking or telemetry
 * No backend servers or databases
 * Zero data collection
All processing, analytics, and user preferences are executed locally within the browser utilizing localStorage.
## Browser Compatibility & Background Playback
Mobile operating systems natively restrict background media playback for browser-based applications to preserve battery life. To bypass these restrictions without utilizing external proxy servers, Octave utilizes a **Dual-Engine Architecture**.
**Recommended Browser: Brave**
For the optimal mobile experience featuring instant load times and uninterrupted background playback, the **Brave Browser** is highly recommended.
 * Octave automatically detects Brave and routes audio through an instant-loading IFrame engine.
 * Brave natively respects media session threads, preventing the OS from freezing the JavaScript execution when the application is pushed to the background or the screen is locked.
**Fallback Architecture (Chrome & Safari)**
When accessed via standard browsers like Google Chrome or Apple Safari, Octave automatically falls back to a Native HTML5 <audio> proxy engine. This routes the audio through Invidious CDN edge nodes to force background audio survival across stricter operating systems, though it may introduce a brief initial buffering period.
## Core Features
### Predictive Local Algorithm
The application runs a 10-point behavioral tracking system entirely client-side to build your taste profile without external databases:
 * **Action Tracking:** Algorithm scores adjust dynamically based on immediate skips, full completions, and manual selections.
 * **Temporal Context:** Automatically tags listening habits by time of day (morning, afternoon, night).
 * **Session Memory:** Ensures zero track repetition during an active listening session.
### Modern UI/UX Rendering
 * **Dynamic Liquid Shadows:** Real-time canvas sampling extracts exact color values from album art to generate continuously flowing, color-matched ambient shadow DOM elements.
 * **Glassmorphism Design:** Built with premium, frosted-glass aesthetics, hardware-accelerated CSS transitions, and minimalist typography.
### Data Vault Protocol
 * **Full Data Sovereignty:** Complete capability to export and import your entire listening history, local algorithmic stats, liked tracks, and custom playlists via a lightweight JSON encrypted blob.
### Aggregated OSINT Integration
 * **Synced Lyrics:** Real-time lyric fetching utilizing the LRCLIB API with a customizable typography engine.
 * **Artist Biographies:** Utilizes a dual-fallback system (TheAudioDB + targeted Wikipedia API redirects) to pull accurate artist history, caching it locally for instant subsequent load times.
## Deployment Guide
Octave is a purely static application. It requires zero build steps, node modules, or server configurations. It can be deployed in under 60 seconds.
**GitHub Pages**
 1. Fork this repository.
 2. Navigate to Settings > Pages.
 3. Select the main branch and save.
**Cloudflare Pages / Netlify / Vercel**
 1. Connect your repository to the hosting provider.
 2. Ensure Framework Preset is set to None or Static.
 3. Clear any default build commands.
 4. Set the publish directory to the root folder (/).
 5. Deploy.
## Legal Disclaimer & DMCA Compliance
This software is provided strictly for educational and personal technological demonstration.
 * **No Content Hosting:** Octave does not host, store, upload, or distribute any copyrighted media files.
 * **No DRM Circumvention:** This application does not decrypt, rip, download, or permanently save proprietary audio streams.
 * **API Utilization:** The software acts solely as a client-side interface, executing standard HTTP requests to public, third-party APIs (such as Invidious instances, Wikipedia, and LRCLIB) directly from the end-user's local IP address.
 * **Commercial Restriction:** You are allowed to use, modify, and deploy this project for non-commercial purposes only. You are not permitted to sell, resell, sublicense, or monetize this project or any modified version of it without explicit permission from the original author.
 * **User Responsibility:** The creators and contributors of Octave hold no liability for how end-users utilize this client-side tool or what public APIs they connect to through their local network. By deploying or utilizing this software, you assume all responsibility for compliance with applicable laws and third-party terms of service.
## Support & Contact
For technical inquiries or project support, reach out via Telegram: https://t.me/ucvezw
