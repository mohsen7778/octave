const INVIDIOUS = [
    'https://inv.nadeko.net',
    'https://invidious.privacyredirect.com',
    'https://invidious.nerdvpn.de',
    'https://iv.melmac.space',
    'https://invidious.io.lol',
    'https://yt.cdaut.de'
];
let invIdx = 0;

const S = { queue: [], currentIndex: -1, isPlaying: false };

// 1. Native HTML5 Audio Engine (Survives Chrome Background)
const audio = new Audio();
// Removed crossOrigin - this was causing the browser to block YouTube's raw streams

audio.addEventListener('playing', () => {
    // Only shows 'pause' when audio is actively outputting sound
    S.isPlaying = true;
    updatePlayIcons('fa-solid fa-pause');
});

audio.addEventListener('pause', () => {
    S.isPlaying = false;
    updatePlayIcons('fa-solid fa-play');
});

audio.addEventListener('waiting', () => {
    // Shows loading spinner while buffering/fetching
    updatePlayIcons('fa-solid fa-spinner fa-spin');
});

audio.addEventListener('ended', () => {
    S.isPlaying = false;
    updatePlayIcons('fa-solid fa-play');
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        const miniProg = document.getElementById('mini-progress');
        const fpProg = document.getElementById('fp-progress-fill');
        if (miniProg) miniProg.style.width = `${percent}%`;
        if (fpProg) fpProg.style.width = `${percent}%`;
        
        const currTime = document.getElementById('fp-time-current');
        const totTime = document.getElementById('fp-time-total');
        if (currTime) currTime.textContent = formatTime(audio.currentTime);
        if (totTime) totTime.textContent = formatTime(audio.duration);
    }
});

function updatePlayIcons(iconClass) {
    const miniIcon = document.querySelector('.play-btn-mini i');
    const fullIcon = document.querySelector('#fp-play i');
    if (miniIcon) miniIcon.className = iconClass;
    if (fullIcon) fullIcon.className = iconClass;
}

function togglePlay() {
    if (!audio.src || S.currentIndex === -1) return;
    S.isPlaying ? audio.pause() : audio.play();
}

document.querySelector('.play-btn-mini').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
});

const fpPlayBtn = document.getElementById('fp-play');
if(fpPlayBtn) fpPlayBtn.addEventListener('click', togglePlay);

// Open/Close Full Player
document.querySelector('.mini-inner').addEventListener('click', () => {
    const fp = document.getElementById('full-player');
    if(fp) fp.classList.add('active');
});

const closeFpBtn = document.getElementById('close-fp');
if(closeFpBtn) {
    closeFpBtn.addEventListener('click', () => {
        document.getElementById('full-player').classList.remove('active');
    });
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// 2. Load Track & Fetch Raw Audio Stream
window.playTrack = async (track) => {
    S.queue.push(track);
    S.currentIndex = S.queue.length - 1;
    
    // Update UI immediately
    const miniTitle = document.querySelector('.mini-title');
    const miniArtist = document.querySelector('.mini-artist');
    const miniArt = document.querySelector('.mini-art');
    if(miniTitle) miniTitle.textContent = track.title;
    if(miniArtist) miniArtist.textContent = track.author;
    if(miniArt) {
        miniArt.style.backgroundImage = `url(${track.thumb})`;
        miniArt.style.backgroundSize = 'cover';
    }
    
    const fpTitle = document.getElementById('fp-title');
    const fpArtist = document.getElementById('fp-artist');
    const fpArt = document.getElementById('fp-art');
    if(fpTitle) fpTitle.textContent = track.title;
    if(fpArtist) fpArtist.textContent = track.author;
    if(fpArt) {
        fpArt.src = track.thumb;
        fpArt.style.display = 'block';
    }

    // Force UI into loading state
    updatePlayIcons('fa-solid fa-spinner fa-spin');
    
    // Start smart fetch loop
    await fetchAndPlay(track, 0);
};

// Recursive fetch function to bypass broken/blocked Invidious nodes
async function fetchAndPlay(track, attempt) {
    if (attempt >= INVIDIOUS.length) {
        alert("All servers failed to load audio. Please try another track.");
        updatePlayIcons('fa-solid fa-play');
        return;
    }

    const base = INVIDIOUS[(invIdx + attempt) % INVIDIOUS.length];
    let streamUrl = null;

    try {
        const r = await fetch(`${base}/api/v1/videos/${track.videoId}?fields=adaptiveFormats`, { signal: AbortSignal.timeout(5000) });
        if (r.ok) {
            const d = await r.json();
            const audioFormats = d.adaptiveFormats.filter(f => f.type.includes('audio'));
            if (audioFormats.length > 0) {
                streamUrl = audioFormats[0].url;
            }
        }
    } catch(e) {
        console.warn(`Server ${base} fetch failed, trying next...`);
    }

    // Fallback if the direct adaptive format fails to pull
    if (!streamUrl) {
        streamUrl = `${base}/latest_version?id=${track.videoId}&itag=140`;
    }

    audio.src = streamUrl;
    
    try {
        await audio.play();
        // Success! Save this working index
        invIdx = (invIdx + attempt) % INVIDIOUS.length;

        // Set Lock Screen details
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.author,
                album: 'Octave',
                artwork: [{ src: track.thumb, sizes: '512x512', type: 'image/jpeg' }]
            });
            navigator.mediaSession.setActionHandler('play', () => audio.play());
            navigator.mediaSession.setActionHandler('pause', () => audio.pause());
        }
    } catch (e) {
        console.warn("Audio play blocked by CORS or 403 Forbidden. Retrying on next server...", e);
        // Automatically try the next server if playback rejects
        await fetchAndPlay(track, attempt + 1);
    }
}

// 3. Search API
window.performSearch = async (query) => {
    for (let i = 0; i < INVIDIOUS.length; i++) {
        const base = INVIDIOUS[(invIdx + i) % INVIDIOUS.length];
        try {
            const r = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId,title,author,videoThumbnails`, { signal: AbortSignal.timeout(7000) });
            if (!r.ok) continue;
            const d = await r.json(); 
            invIdx = (invIdx + i) % INVIDIOUS.length;
            return d.map(item => ({
                videoId: item.videoId, title: item.title, author: item.author,
                thumb: (item.videoThumbnails && item.videoThumbnails.length > 0) ? item.videoThumbnails[0].url : ''
            }));
        } catch(e) { continue; }
    }
    return [];
};
