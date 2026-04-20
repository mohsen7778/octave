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
audio.crossOrigin = "anonymous";

audio.addEventListener('play', () => {
    S.isPlaying = true;
    updatePlayIcons('fa-solid fa-pause');
});

audio.addEventListener('pause', () => {
    S.isPlaying = false;
    updatePlayIcons('fa-solid fa-play');
});

audio.addEventListener('ended', () => {
    // Add logic later for auto-playing next track
    S.isPlaying = false;
    updatePlayIcons('fa-solid fa-play');
});

// Replaces the old setInterval for smoother progress tracking
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        document.getElementById('mini-progress').style.width = `${percent}%`;
        document.getElementById('fp-progress-fill').style.width = `${percent}%`;
        document.getElementById('fp-time-current').textContent = formatTime(audio.currentTime);
        document.getElementById('fp-time-total').textContent = formatTime(audio.duration);
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
document.getElementById('fp-play').addEventListener('click', togglePlay);

// Open/Close Full Player
document.querySelector('.mini-inner').addEventListener('click', () => {
    document.getElementById('full-player').classList.add('active');
});
document.getElementById('close-fp').addEventListener('click', () => {
    document.getElementById('full-player').classList.remove('active');
});

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
    document.querySelector('.mini-title').textContent = track.title;
    document.querySelector('.mini-artist').textContent = track.author;
    document.querySelector('.mini-art').style.backgroundImage = `url(${track.thumb})`;
    document.querySelector('.mini-art').style.backgroundSize = 'cover';
    
    document.getElementById('fp-title').textContent = track.title;
    document.getElementById('fp-artist').textContent = track.author;
    const fpArt = document.getElementById('fp-art');
    fpArt.src = track.thumb;
    fpArt.style.display = 'block';

    // Show loading state (optional, you can add a spinner class later)
    
    // Fetch raw audio stream
    const streamUrl = await getAudioStream(track.videoId);
    
    if (streamUrl) {
        audio.src = streamUrl;
        audio.play().catch(e => console.log("Autoplay blocked:", e));

        // Setup Lock Screen / Background Play Controls
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.author,
                album: 'Octave',
                artwork: [{ src: track.thumb, sizes: '512x512', type: 'image/jpeg' }]
            });
            navigator.mediaSession.setActionHandler('play', () => audio.play());
            navigator.mediaSession.setActionHandler('pause', () => audio.pause());
            // We will hook up next/prev handlers here when we build the queue system
        }
    } else {
        alert("Failed to load audio stream. Try another track.");
    }
};

// Raw Audio Fetcher
async function getAudioStream(videoId) {
    for (let i = 0; i < INVIDIOUS.length; i++) {
        const base = INVIDIOUS[(invIdx + i) % INVIDIOUS.length];
        try {
            const r = await fetch(`${base}/api/v1/videos/${videoId}?fields=adaptiveFormats`, { signal: AbortSignal.timeout(7000) });
            if (!r.ok) continue;
            const d = await r.json();
            invIdx = (invIdx + i) % INVIDIOUS.length;
            
            // Find the best audio-only format (usually m4a or webm)
            const audioFormats = d.adaptiveFormats.filter(f => f.type.includes('audio'));
            if (audioFormats.length > 0) {
                return audioFormats[0].url;
            }
        } catch(e) {
            continue;
        }
    }
    return null;
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
