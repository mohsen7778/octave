const INVIDIOUS = [
    'https://inv.nadeko.net',
    'https://invidious.privacyredirect.com',
    'https://invidious.nerdvpn.de',
    'https://iv.melmac.space',
    'https://invidious.io.lol',
    'https://yt.cdaut.de'
];
let invIdx = 0;

const S = {
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    volume: 85
};

let YTP = null;
let ytReady = false;

// 1. Inject YouTube iFrame API
const script = document.createElement('script');
script.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(script);

window.onYouTubeIframeAPIReady = () => {
    const container = document.createElement('div');
    container.id = 'yt-hidden-frame';
    container.style.position = 'fixed';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.bottom = '0';
    container.style.right = '0';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    YTP = new YT.Player('yt-hidden-frame', {
        height: '1', width: '1',
        playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
        events: {
            onReady: e => { ytReady = true; e.target.setVolume(S.volume); },
            onStateChange: onYTS
        }
    });
};

function onYTS(e) {
    const playBtnIcon = document.querySelector('.play-btn-mini i');
    if (!playBtnIcon) return;
    
    if (e.data === YT.PlayerState.PLAYING) {
        S.isPlaying = true;
        playBtnIcon.className = 'fa-solid fa-pause';
    } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
        S.isPlaying = false;
        playBtnIcon.className = 'fa-solid fa-play';
    }
}

// 2. Playback Controls
document.querySelector('.play-btn-mini').addEventListener('click', () => {
    if (!YTP || S.currentIndex === -1) return;
    S.isPlaying ? YTP.pauseVideo() : YTP.playVideo();
});

window.playTrack = (track) => {
    S.queue.push(track);
    S.currentIndex = S.queue.length - 1;
    
    // Update Mini Player UI
    document.querySelector('.mini-title').textContent = track.title;
    document.querySelector('.mini-artist').textContent = track.author;
    document.querySelector('.mini-art').style.backgroundImage = `url(${track.thumb})`;
    document.querySelector('.mini-art').style.backgroundSize = 'cover';
    
    // Load into YouTube Engine
    if (ytReady && YTP) {
        YTP.loadVideoById({ videoId: track.videoId });
    }
};

// 3. Search API Logic
window.performSearch = async (query) => {
    for (let i = 0; i < INVIDIOUS.length; i++) {
        const base = INVIDIOUS[(invIdx + i) % INVIDIOUS.length];
        try {
            const r = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId,title,author,videoThumbnails`, { signal: AbortSignal.timeout(7000) });
            if (!r.ok) continue;
            
            const d = await r.json(); 
            invIdx = (invIdx + i) % INVIDIOUS.length;
            
            return d.map(item => ({
                videoId: item.videoId,
                title: item.title,
                author: item.author,
                thumb: getBestThumb(item.videoThumbnails)
            }));
        } catch(e) { 
            continue; 
        }
    }
    return [];
};

function getBestThumb(thumbs) {
    if (!thumbs || !thumbs.length) return '';
    const pref = thumbs.find(t => t.quality === 'medium' || t.quality === 'high');
    return pref ? pref.url : thumbs[0].url;
}
