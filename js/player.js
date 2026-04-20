window.OCTAVE = {
    queue: [], currentIndex: -1, isPlaying: false,
    liked: {}, playlists: {}, recentPlayed: [], recentSearches: [],
    playStats: {}, // NEW: Tracks how many times every song is played
    activeTrackForOptions: null
};

// --- CACHE SYSTEM ---
function saveCache() {
    localStorage.setItem('octave_data', JSON.stringify({
        liked: window.OCTAVE.liked,
        playlists: window.OCTAVE.playlists,
        recentPlayed: window.OCTAVE.recentPlayed.slice(0, 30),
        recentSearches: window.OCTAVE.recentSearches.slice(0, 30),
        playStats: window.OCTAVE.playStats, // Save stats
        queue: window.OCTAVE.queue,
        currentIndex: window.OCTAVE.currentIndex
    }));
}

function loadCache() {
    const data = localStorage.getItem('octave_data');
    if (data) {
        const parsed = JSON.parse(data);
        window.OCTAVE.liked = parsed.liked || {};
        window.OCTAVE.playlists = parsed.playlists || {};
        window.OCTAVE.recentPlayed = parsed.recentPlayed || [];
        window.OCTAVE.recentSearches = parsed.recentSearches || [];
        window.OCTAVE.playStats = parsed.playStats || {};
        window.OCTAVE.queue = parsed.queue || [];
        window.OCTAVE.currentIndex = parsed.currentIndex || -1;
    }
}
loadCache();

const INVIDIOUS = [
    'https://inv.nadeko.net', 'https://invidious.privacyredirect.com',
    'https://invidious.nerdvpn.de', 'https://iv.melmac.space', 'https://invidious.io.lol'
];
let invIdx = 0;
let YTP = null, ytReady = false, progressTimer = null;

const script = document.createElement('script');
script.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(script);

window.onYouTubeIframeAPIReady = () => {
    const container = document.createElement('div');
    container.id = 'yt-hidden-frame';
    container.style.cssText = 'position:fixed;width:1px;height:1px;bottom:0;right:0;opacity:0;pointer-events:none;';
    document.body.appendChild(container);

    YTP = new YT.Player('yt-hidden-frame', {
        height: '1', width: '1',
        playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
        events: {
            onReady: e => { 
                ytReady = true; 
                e.target.setVolume(100);
                if (window.OCTAVE.currentIndex >= 0 && window.OCTAVE.queue.length > 0) {
                    updatePlayerUI(window.OCTAVE.queue[window.OCTAVE.currentIndex]);
                }
            },
            onStateChange: onYTS
        }
    });
};

function onYTS(e) {
    if (e.data === YT.PlayerState.PLAYING) {
        window.OCTAVE.isPlaying = true;
        updatePlayIcons('fa-solid fa-pause');
        startProgressTracking();
    } else if (e.data === YT.PlayerState.PAUSED) {
        window.OCTAVE.isPlaying = false;
        updatePlayIcons('fa-solid fa-play');
        clearInterval(progressTimer);
    } else if (e.data === YT.PlayerState.ENDED) {
        window.OCTAVE.isPlaying = false;
        playNextLogic();
    }
}

function updatePlayIcons(iconClass) {
    const mini = document.querySelector('.play-btn-mini i');
    const fp = document.querySelector('#fp-play i');
    if (mini) mini.className = iconClass;
    if (fp) fp.className = iconClass;
}

window.togglePlay = () => {
    if (!YTP || window.OCTAVE.currentIndex === -1) return;
    window.OCTAVE.isPlaying ? YTP.pauseVideo() : YTP.playVideo();
};

function startProgressTracking() {
    clearInterval(progressTimer);
    progressTimer = setInterval(() => {
        if (YTP && window.OCTAVE.isPlaying) {
            const current = YTP.getCurrentTime();
            const total = YTP.getDuration();
            if (total > 0) {
                const percent = (current / total) * 100;
                document.getElementById('mini-progress').style.width = `${percent}%`;
                document.getElementById('fp-progress-fill').style.width = `${percent}%`;
                document.getElementById('fp-time-current').textContent = formatTime(current);
                document.getElementById('fp-time-total').textContent = formatTime(total);
            }
        }
    }, 500);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

window.playTrackByIndex = (index) => {
    if (index < 0 || index >= window.OCTAVE.queue.length) return;
    window.OCTAVE.currentIndex = index;
    const track = window.OCTAVE.queue[index];
    
    // Track stats for the Heavy Duty Algorithm
    window.OCTAVE.playStats[track.videoId] = (window.OCTAVE.playStats[track.videoId] || 0) + 1;
    
    window.OCTAVE.recentPlayed = [track, ...window.OCTAVE.recentPlayed.filter(t => t.videoId !== track.videoId)];
    saveCache();
    
    updatePlayerUI(track);
    if (ytReady && YTP) YTP.loadVideoById({ videoId: track.videoId });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title, artist: track.author,
            artwork: [{ src: track.thumb, sizes: '512x512', type: 'image/jpeg' }]
        });
        navigator.mediaSession.setActionHandler('play', () => YTP.playVideo());
        navigator.mediaSession.setActionHandler('pause', () => YTP.pauseVideo());
        navigator.mediaSession.setActionHandler('nexttrack', playNextLogic);
        navigator.mediaSession.setActionHandler('previoustrack', window.playPrev);
    }
};

window.playTrack = (track) => {
    window.OCTAVE.recentSearches = [track, ...window.OCTAVE.recentSearches.filter(t => t.videoId !== track.videoId)];
    
    const existIdx = window.OCTAVE.queue.findIndex(t => t.videoId === track.videoId);
    if (existIdx >= 0) {
        window.playTrackByIndex(existIdx);
    } else {
        window.OCTAVE.queue.push(track);
        window.playTrackByIndex(window.OCTAVE.queue.length - 1);
    }
};

window.playPrev = () => {
    if (YTP && YTP.getCurrentTime() > 3) {
        YTP.seekTo(0);
    } else if (window.OCTAVE.currentIndex > 0) {
        window.playTrackByIndex(window.OCTAVE.currentIndex - 1);
    }
};

async function playNextLogic() {
    if (window.OCTAVE.currentIndex < window.OCTAVE.queue.length - 1) {
        window.playTrackByIndex(window.OCTAVE.currentIndex + 1);
    } else {
        const currentTrack = window.OCTAVE.queue[window.OCTAVE.currentIndex];
        if (!currentTrack) return;
        
        for (let i = 0; i < INVIDIOUS.length; i++) {
            const base = INVIDIOUS[(invIdx + i) % INVIDIOUS.length];
            try {
                const r = await fetch(`${base}/api/v1/videos/${currentTrack.videoId}?fields=recommendedVideos`, { signal: AbortSignal.timeout(5000) });
                if (r.ok) {
                    const d = await r.json();
                    if (d.recommendedVideos && d.recommendedVideos.length > 0) {
                        const rec = d.recommendedVideos[0];
                        const nextTrack = {
                            videoId: rec.videoId, title: rec.title, author: rec.author,
                            thumb: (rec.videoThumbnails && rec.videoThumbnails.length > 0) ? rec.videoThumbnails[0].url : ''
                        };
                        window.OCTAVE.queue.push(nextTrack);
                        window.playTrackByIndex(window.OCTAVE.queue.length - 1);
                        return;
                    }
                }
            } catch(e) { continue; }
        }
    }
}
window.playNext = playNextLogic;

// --- PLAYLIST LOGIC & SMART SHUFFLE ALGORITHM ---
window.playPlaylist = (plName) => {
    const pl = window.OCTAVE.playlists[plName];
    if (pl && pl.length > 0) {
        window.OCTAVE.queue = [...pl];
        window.playTrackByIndex(0);
    }
};

window.smartShufflePlaylist = (plName) => {
    const pl = window.OCTAVE.playlists[plName];
    if (pl && pl.length > 0) {
        // Sorts by historical play count (most played first)
        let sorted = [...pl].sort((a, b) => {
            const countA = window.OCTAVE.playStats[a.videoId] || 0;
            const countB = window.OCTAVE.playStats[b.videoId] || 0;
            if (countB !== countA) return countB - countA;
            return 0.5 - Math.random(); // Shuffles ties
        });
        window.OCTAVE.queue = sorted;
        window.playTrackByIndex(0);
    }
};

window.removeFromPlaylist = (plName, index) => {
    window.OCTAVE.playlists[plName].splice(index, 1);
    saveCache();
    if(window.renderPlaylistDetail) window.renderPlaylistDetail(plName);
};

window.removeFromLiked = (videoId) => {
    delete window.OCTAVE.liked[videoId];
    saveCache();
    if(window.renderLikedSongs) window.renderLikedSongs();
};

function updatePlayerUI(track) {
    document.getElementById('mini-title-el').textContent = track.title;
    document.getElementById('mini-artist-el').textContent = track.author;
    document.getElementById('mini-art-el').style.backgroundImage = `url(${track.thumb})`;
    document.getElementById('mini-art-el').style.backgroundSize = 'cover';
    
    document.getElementById('fp-title').textContent = track.title;
    document.getElementById('fp-artist').textContent = track.author;
    document.getElementById('fp-art').src = track.thumb;
    document.getElementById('fp-art').style.display = 'block';

    const isLiked = !!window.OCTAVE.liked[track.videoId];
    document.getElementById('mini-like-btn').innerHTML = isLiked ? '<i class="fa-solid fa-heart" style="color:var(--accent);"></i>' : '<i class="fa-regular fa-heart"></i>';
    document.getElementById('fp-like').innerHTML = isLiked ? '<i class="fa-solid fa-heart" style="color:var(--accent);"></i>' : '<i class="fa-regular fa-heart"></i>';
    
    // Automatically re-render currently viewed playlist screen to update stats instantly
    if(document.getElementById('playlist-detail-list')) {
        const activeNav = document.querySelector('.nav-item.active').getAttribute('data-tab');
        if (activeNav === 'home' || activeNav === 'library') window.renderHome(); 
    }
}

window.toggleLike = (track) => {
    if (window.OCTAVE.liked[track.videoId]) {
        delete window.OCTAVE.liked[track.videoId];
    } else {
        window.OCTAVE.liked[track.videoId] = track;
    }
    saveCache();
    updatePlayerUI(track);
    if(window.renderHome) window.renderHome();
};

document.querySelector('.play-btn-mini').addEventListener('click', (e) => { e.stopPropagation(); window.togglePlay(); });
document.getElementById('fp-play').addEventListener('click', window.togglePlay);
document.getElementById('fp-next').addEventListener('click', playNextLogic);
document.getElementById('fp-prev').addEventListener('click', window.playPrev);

document.getElementById('mini-like-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if(window.OCTAVE.currentIndex >= 0) window.toggleLike(window.OCTAVE.queue[window.OCTAVE.currentIndex]);
});
document.getElementById('fp-like').addEventListener('click', () => {
    if(window.OCTAVE.currentIndex >= 0) window.toggleLike(window.OCTAVE.queue[window.OCTAVE.currentIndex]);
});

// Track Seeking
function seekToPosition(e, containerElement) {
    if (!YTP || window.OCTAVE.currentIndex === -1) return;
    const rect = containerElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const totalTime = YTP.getDuration();
    if (totalTime > 0) {
        YTP.seekTo(totalTime * percentage, true);
        document.getElementById('fp-progress-fill').style.width = `${percentage * 100}%`;
        document.getElementById('mini-progress').style.width = `${percentage * 100}%`;
    }
}
document.getElementById('fp-progress-container').addEventListener('click', (e) => seekToPosition(e, document.getElementById('fp-progress-container')));
document.querySelector('.mini-player').addEventListener('click', (e) => {
    const rect = document.querySelector('.mini-player').getBoundingClientRect();
    if (e.clientY - rect.top <= 10) { e.stopPropagation(); seekToPosition(e, document.querySelector('.mini-player')); }
});

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
