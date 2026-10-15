/* ==========================================================================
   1. GLOBAL STATE & CACHE CONFIGURATION (V4 DYNAMIC FULL SYNC)
   ========================================================================== */

const INABA_CHANNEL_HANDLE = '@inabakumori';
const INABA_CHANNEL_ID = 'UCNElM45JypxqAR73RoUQ10g';
const INABA_AVATAR_CACHE_KEY = 'osage_inaba_live_avatar';
const INABA_METRICS_CACHE_KEY = 'osage_inaba_metrics_cache_v4';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

try {
    localStorage.removeItem('osage_inaba_metrics_cache');
    localStorage.removeItem('osage_inaba_metrics_cache_v2');
    localStorage.removeItem('osage_inaba_metrics_cache_v3');
} catch (e) {}

let resolvedInabaAvatar = '../assets/profile/Inabakumori.png';

try {
    const cachedAvatar = localStorage.getItem(INABA_AVATAR_CACHE_KEY);
    if (cachedAvatar) {
        resolvedInabaAvatar = cachedAvatar;
    }
} catch (e) {}


/* ==========================================================================
   2. FORMATTING HELPERS & DEEP UNESCAPE UTILITY
   ========================================================================== */

function unescapeDynamicString(str) {
    if (!str) return '';
    return str
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
        .replace(/\\u0026/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function formatViewsCount(views) {
    const num = typeof views === 'number' ? views : parseInt(String(views).replace(/[^0-9]/g, ''), 10) || 0;
    if (num <= 0) return '0 views';
    if (num >= 1000000) {
        const m = (num / 1000000).toFixed(1).replace(/\.0$/, '');
        return `${m}M views`;
    }
    if (num >= 1000) {
        const k = Math.round(num / 1000);
        return `${k}K views`;
    }
    return `${num} views`;
}

function formatReleaseDate(rawDate) {
    if (!rawDate) return '';
    const str = String(rawDate).trim();
    const cleanMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (cleanMatch) {
        const [, y, m, d] = cleanMatch;
        return `${y}.${m.padStart(2, '0')}.${d.padStart(2, '0')}`;
    }
    return str;
}

function getVideoStats(video) {
    if (!video) return '';
    const vCount = video.viewsCount || 0;
    const vDate = video.releaseDate || '';
    return `${formatViewsCount(vCount)} • ${formatReleaseDate(vDate)}`;
}


/* ==========================================================================
   3. INABAKUMORI AVATAR DYNAMIC RESOLVER
   ========================================================================== */

async function initDynamicAvatar() {
    if (!navigator.onLine) return;

    const sources = [
        `https://unavatar.io/youtube/${INABA_CHANNEL_HANDLE}`,
        `https://unavatar.io/youtube/${INABA_CHANNEL_ID}`,
        `https://yt3.googleusercontent.com/ytc/AIdro_k2P2V9C3...`
    ];

    for (let url of sources) {
        try {
            const img = new Image();
            img.src = url;
            const loaded = await new Promise((resolve) => {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                setTimeout(() => resolve(false), 2500);
            });

            if (loaded) {
                resolvedInabaAvatar = url;
                try {
                    localStorage.setItem(INABA_AVATAR_CACHE_KEY, url);
                } catch (e) {}

                document.querySelectorAll('.card-avatar.inaba-avatar, #modal-avatar').forEach(el => {
                    if (el) el.style.backgroundImage = `url('${url}')`;
                });
                break;
            }
        } catch (e) {}
    }
}


/* ==========================================================================
   4. MULTI-FALLBACK METADATA FETCHER (TITLE, VIEWS, DESC)
   ========================================================================== */

function getStoredInabaCache() {
    try {
        const stored = localStorage.getItem(INABA_METRICS_CACHE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') return parsed;
        }
    } catch (e) {}
    return { timestamp: 0, items: {} };
}

function saveStoredInabaCache(cacheObj) {
    try {
        localStorage.setItem(INABA_METRICS_CACHE_KEY, JSON.stringify(cacheObj));
    } catch (e) {}
}

function applyMetricsToInabaData(cacheItems) {
    if (typeof inabaVideoData === 'undefined' || !Array.isArray(inabaVideoData)) return;

    inabaVideoData.forEach(video => {
        const cached = cacheItems[video.id];
        if (cached) {
            if (cached.title && cached.title.trim().length > 0) {
                video.title = cached.title.trim();
            }
            if (cached.viewsCount && cached.viewsCount > 0) {
                video.viewsCount = cached.viewsCount;
            }
            if (cached.description && cached.description.trim().length > 10) {
                video.description = cached.description;
            }
            video.stats = getVideoStats(video);
        }
    });
}

async function fetchSingleVideoDynamicMeta(videoId) {
    const meta = { title: '', viewsCount: 0, description: '' };

    try {
        const subController = new AbortController();
        const tid = setTimeout(() => subController.abort(), 3500);

        const innertubeRes = await fetch("https://www.youtube.com/youtubei/v1/player?key=AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                videoId: videoId,
                context: {
                    client: {
                        clientName: "ANDROID",
                        clientVersion: "18.15.40",
                        androidSdkVersion: 30,
                        hl: "ja"
                    }
                }
            }),
            signal: subController.signal
        });
        clearTimeout(tid);

        if (innertubeRes.ok) {
            const data = await innertubeRes.json();
            if (data && data.videoDetails) {
                if (data.videoDetails.title) {
                    meta.title = unescapeDynamicString(data.videoDetails.title.trim());
                }
                if (data.videoDetails.viewCount) {
                    meta.viewsCount = parseInt(data.videoDetails.viewCount, 10) || 0;
                }
                if (data.videoDetails.shortDescription) {
                    meta.description = unescapeDynamicString(data.videoDetails.shortDescription.trim());
                }
                if (meta.title && meta.viewsCount > 0 && meta.description) return meta;
            }
        }
    } catch (e) {}

    try {
        const subController = new AbortController();
        const tid = setTimeout(() => subController.abort(), 3500);

        const innertubeWebRes = await fetch("https://www.youtube.com/youtubei/v1/player?key=AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                videoId: videoId,
                context: {
                    client: {
                        clientName: "WEB",
                        clientVersion: "2.20240101.00.00",
                        hl: "ja"
                    }
                }
            }),
            signal: subController.signal
        });
        clearTimeout(tid);

        if (innertubeWebRes.ok) {
            const data = await innertubeWebRes.json();
            if (data && data.videoDetails) {
                if (!meta.title && data.videoDetails.title) {
                    meta.title = unescapeDynamicString(data.videoDetails.title.trim());
                }
                if (!meta.viewsCount && data.videoDetails.viewCount) {
                    meta.viewsCount = parseInt(data.videoDetails.viewCount, 10) || 0;
                }
                if (!meta.description && data.videoDetails.shortDescription) {
                    meta.description = unescapeDynamicString(data.videoDetails.shortDescription.trim());
                }
                if (meta.title && meta.viewsCount > 0 && meta.description) return meta;
            }
        }
    } catch (e) {}

    const invidiousInstances = [
        `https://inv.nadeko.net/api/v1/videos/${videoId}`,
        `https://invidious.jing.rocks/api/v1/videos/${videoId}`,
        `https://yt.artemislena.eu/api/v1/videos/${videoId}`
    ];

    for (let ep of invidiousInstances) {
        if (meta.title && meta.viewsCount > 0 && meta.description) break;
        try {
            const subController = new AbortController();
            const tid = setTimeout(() => subController.abort(), 3000);
            const res = await fetch(ep, { signal: subController.signal });
            clearTimeout(tid);

            if (res.ok) {
                const data = await res.json();
                if (data) {
                    if (!meta.title && data.title) {
                        meta.title = unescapeDynamicString(data.title.trim());
                    }
                    if (!meta.viewsCount && data.viewCount) {
                        meta.viewsCount = parseInt(data.viewCount, 10) || 0;
                    }
                    if (!meta.description && data.description) {
                        meta.description = unescapeDynamicString(data.description.trim());
                    }
                }
            }
        } catch (e) {}
    }

    if (!meta.viewsCount) {
        try {
            const subController = new AbortController();
            const tid = setTimeout(() => subController.abort(), 2500);
            const rydRes = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`, { signal: subController.signal });
            clearTimeout(tid);

            if (rydRes.ok) {
                const rydData = await rydRes.json();
                if (rydData && rydData.viewCount) {
                    meta.viewsCount = parseInt(rydData.viewCount, 10) || 0;
                }
            }
        } catch (e) {}
    }

    return meta;
}


/* ==========================================================================
   5. STAGGERED QUEUE SYNC ENGINE
   ========================================================================== */

async function syncYouTubeMetrics() {
    if (typeof inabaVideoData === 'undefined' || !Array.isArray(inabaVideoData)) return;

    const cache = getStoredInabaCache();
    applyMetricsToInabaData(cache.items || {});

    if (!navigator.onLine) return;

    const now = Date.now();
    const isCacheExpired = (now - (cache.timestamp || 0)) > CACHE_TTL_MS;

    const updatedCacheItems = { ...(cache.items || {}) };
    const videosToSync = inabaVideoData.filter(v => {
        if (isCacheExpired) return true;
        const c = updatedCacheItems[v.id];
        return !c || !c.title || !c.description || c.description.length < 15;
    });

    if (videosToSync.length === 0) {
        return;
    }

    const CONCURRENCY = 3;
    let poolIndex = 0;

    async function worker() {
        while (poolIndex < videosToSync.length) {
            const video = videosToSync[poolIndex++];
            if (!video) break;

            try {
                const res = await fetchSingleVideoDynamicMeta(video.id);
                if (res.title || res.viewsCount > 0 || (res.description && res.description.length > 5)) {
                    updatedCacheItems[video.id] = {
                        title: res.title || video.title,
                        viewsCount: res.viewsCount > 0 ? res.viewsCount : (video.viewsCount || 0),
                        description: res.description || video.description
                    };

                    applyMetricsToInabaData(updatedCacheItems);
                    saveStoredInabaCache({
                        timestamp: Date.now(),
                        items: updatedCacheItems
                    });

                    if (typeof currentMode !== 'undefined' && currentMode === 'inaba' && !document.body.classList.contains('page-exit') && typeof renderCurrentPage === 'function') {
                        renderCurrentPage(false);
                    }
                }
            } catch (e) {}

            await new Promise(r => setTimeout(r, 120));
        }
    }

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker());
    }

    await Promise.allSettled(workers);
}