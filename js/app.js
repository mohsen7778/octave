document.addEventListener('DOMContentLoaded', () => {
    const dynamicView = document.getElementById('dynamic-view');
    
    // Cache the initial home HTML so we can return to it
    const views = {
        home: dynamicView.innerHTML,
        search: `
            <header class="search-header">
                <h1 class="search-title">Search</h1>
                <div class="search-input-wrap">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" class="search-box" id="searchInput" placeholder="Songs, artists, or podcasts..." autocomplete="off">
                </div>
            </header>
            <div class="search-results" id="searchResults">
                <div style="color: var(--text-secondary); font-size: 13px; text-align: center; margin-top: 20px;">
                    Type to start searching...
                </div>
            </div>
            <div class="bottom-spacer"></div>
        `,
        library: `
            <header class="search-header"><h1 class="search-title">Your Library</h1></header>
            <div style="padding: 20px; color: var(--text-secondary); text-align: center; margin-top: 40px;">
                <i class="fa-solid fa-layer-group" style="font-size: 40px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>Your saved playlists and liked songs will appear here.</p>
            </div>
        `,
        premium: `
            <div style="padding: 80px 20px; text-align: center;">
                <i class="fa-solid fa-crown" style="font-size: 64px; color: var(--accent); margin-bottom: 24px; text-shadow: 0 0 20px rgba(30,215,96,0.4);"></i>
                <h2 style="font-size: 24px; margin-bottom: 12px;">Octave Premium</h2>
                <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">Ad-free background listening and custom audio engine are currently active.</p>
            </div>
        `
    };

    // Bottom Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            document.querySelector('.nav-item.active').classList.remove('active');
            item.classList.add('active');
            
            const tab = item.getAttribute('data-tab');
            dynamicView.innerHTML = views[tab];
            
            // Re-bind search input event if the search tab is opened
            if (tab === 'search') {
                bindSearch();
            }
        });
    });

    // Initial Greeting setup
    setGreeting();
});

function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    
    const greetingEl = document.getElementById('time-greeting');
    if (greetingEl) greetingEl.textContent = greeting;
}

// Debounce function to prevent API spam while typing
function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function bindSearch() {
    const input = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!input) return;

    input.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (!query) {
            resultsContainer.innerHTML = '<div style="color: var(--text-secondary); text-align: center; margin-top: 20px;">Type to start searching...</div>';
            return;
        }

        resultsContainer.innerHTML = '<div class="spinner"></div>';
        
        // Trigger the search function built into player.js
        if (window.performSearch) {
            const results = await window.performSearch(query);
            renderResults(results, resultsContainer);
        }
    }));
}

function renderResults(results, container) {
    if (!results || results.length === 0) {
        container.innerHTML = '<div style="color: var(--text-secondary); text-align: center; margin-top: 20px;">No results found.</div>';
        return;
    }

    container.innerHTML = '';
    results.slice(0, 15).forEach(track => {
        const el = document.createElement('div');
        el.className = 'result-item';
        el.innerHTML = `
            <img class="result-thumb" src="${track.thumb}" loading="lazy" alt="Art">
            <div class="result-info">
                <div class="result-title">${track.title}</div>
                <div class="result-artist">${track.author}</div>
            </div>
            <i class="fa-solid fa-play" style="color: var(--accent); font-size: 14px;"></i>
        `;
        
        // Play track on click
        el.addEventListener('click', () => {
            if (window.playTrack) window.playTrack(track);
        });
        
        container.appendChild(el);
    });
}
