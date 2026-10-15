/* ==========================================================================
   1. CONSTANTS & CONFIGURATION
   ========================================================================== */

const STATIC_INABA_AVATAR = '../assets/profile/Inabakumori.png';
let resolvedInabaAvatar = STATIC_INABA_AVATAR;

const YOUTUBE_API_KEY = "";
const YT_METRICS_CACHE_KEY = 'osage_yt_metrics_cache';
const YT_CACHE_TTL = 6 * 60 * 60 * 1000;

const monthFullNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];


/* ==========================================================================
   2. FORMATTING HELPERS
   ========================================================================== */

function formatViewsCount(num) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    const n = Number(num);
    if (n < 0) return "0";

    if (n >= 1000000000) {
        return `${(n / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (n >= 100000000) {
        return `${Math.floor(n / 1000000)}M`;
    }
    if (n >= 1000000) {
        return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (n >= 10000) {
        return `${Math.floor(n / 1000)}K`;
    }
    return n.toLocaleString('en-US');
}

function formatReleaseDate(isoDate) {
    if (!isoDate) return "";

    const parts = String(isoDate).split('T')[0].split('-');
    if (parts.length === 3) {
        const yyyy = parts[0];
        const mm = parseInt(parts[1], 10);
        const dd = parts[2].padStart(2, '0');
        const monthName = monthFullNames[mm - 1] || "";
        if (monthName) {
            return `${parseInt(dd, 10)} ${monthName} ${yyyy}`;
        }
    }

    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    const dd = d.getDate();
    const monthName = monthFullNames[d.getMonth()] || "";
    const yyyy = d.getFullYear();
    return `${dd} ${monthName} ${yyyy}`;
}

function getVideoStats(video) {
    if (!video) return "";
    if (video.viewsCount !== undefined && video.releaseDate) {
        const formattedViews = formatViewsCount(video.viewsCount);
        const formattedDate = formatReleaseDate(video.releaseDate);
        return `${formattedViews} views • ${formattedDate}`;
    }
    return video.stats || 'Custom Stream';
}

function parseISO8601Duration(isoStr) {
    if (!isoStr) return "";
    const match = isoStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";

    const hours = parseInt(match[1] || 0, 10);
    const minutes = parseInt(match[2] || 0, 10);
    const seconds = parseInt(match[3] || 0, 10);

    const padSec = seconds.toString().padStart(2, '0');

    if (hours > 0) {
        const padMin = minutes.toString().padStart(2, '0');
        return `${hours}:${padMin}:${padSec}`;
    }
    return `${minutes}:${padSec}`;
}

function formatSecondsToMMSS(sec) {
    const s = parseInt(sec, 10) || 0;
    if (s <= 0) return "";
    const hrs = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const remainder = s % 60;
    const padSec = remainder.toString().padStart(2, '0');
    if (hrs > 0) {
        return `${hrs}:${m.toString().padStart(2, '0')}:${padSec}`;
    }
    return `${m}:${padSec}`;
}


/* ==========================================================================
   3. YOUTUBE METRICS SYNC & LOCAL CACHE ENGINE
   ========================================================================== */

function getMetricsCache() {
    try {
        const cached = localStorage.getItem(YT_METRICS_CACHE_KEY);
        if (!cached) return {};
        const parsed = JSON.parse(cached);
        if (Date.now() - (parsed._timestamp || 0) > YT_CACHE_TTL) {
            return {};
        }
        return parsed.data || {};
    } catch (e) {}
    return {};
}

function saveMetricsCache(dataMap) {
    try {
        const payload = {
            _timestamp: Date.now(),
            data: dataMap
        };
        localStorage.setItem(YT_METRICS_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {}
}

function applyMetricsToData(metricsMap) {
    if (typeof inabaVideoData === 'undefined') return false;
    let updatedAny = false;
    inabaVideoData.forEach(video => {
        const m = metricsMap[video.id];
        if (m) {
            if (m.viewsCount) video.viewsCount = Number(m.viewsCount);
            if (m.duration) video.duration = m.duration;
            if (m.releaseDate) video.releaseDate = m.releaseDate;
            video.stats = getVideoStats(video);
            updatedAny = true;
        }
    });
    return updatedAny;
}

async function syncYouTubeMetrics() {
    const cachedData = getMetricsCache();
    if (Object.keys(cachedData).length > 0) {
        applyMetricsToData(cachedData);
        if (typeof fetchAndFilterVideos === 'function') {
            fetchAndFilterVideos(false);
        }
    }

    if (!YOUTUBE_API_KEY || !navigator.onLine || typeof inabaVideoData === 'undefined') return;

    try {
        const validIds = inabaVideoData.map(v => v.id).filter(id => id && id.length === 11);
        if (validIds.length === 0) return;

        const chunks = [];
        for (let i = 0; i < validIds.length; i += 50) {
            chunks.push(validIds.slice(i, i + 50));
        }

        const newMetricsMap = { ...cachedData };

        for (const chunk of chunks) {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error();

            const data = await res.json();
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    const vid = item.id;
                    const views = item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : null;
                    const duration = parseISO8601Duration(item.contentDetails?.duration);
                    const releaseDate = item.snippet?.publishedAt ? item.snippet.publishedAt.split('T')[0] : null;

                    newMetricsMap[vid] = {
                        viewsCount: views,
                        duration: duration,
                        releaseDate: releaseDate
                    };
                });
            }
        }

        saveMetricsCache(newMetricsMap);
        const didUpdate = applyMetricsToData(newMetricsMap);
        if (didUpdate && typeof fetchAndFilterVideos === 'function') {
            fetchAndFilterVideos(false);
        }
    } catch (err) {}
}


/* ==========================================================================
   4. DYNAMIC YOUTUBE AVATAR RESOLVER & FALLBACK
   ========================================================================== */

function initDynamicAvatar() {
    const dynamicUrl = 'https://unavatar.io/youtube/inabakumori';
    const testImg = new Image();

    testImg.onload = () => {
        resolvedInabaAvatar = dynamicUrl;
        applyResolvedAvatar();
    };

    testImg.onerror = () => {
        resolvedInabaAvatar = STATIC_INABA_AVATAR;
        applyResolvedAvatar();
    };

    testImg.src = dynamicUrl;
}

function applyResolvedAvatar() {
    const modalAvatar = document.getElementById('modal-avatar');
    if (modalAvatar && typeof currentMode !== 'undefined' && currentMode === 'inaba') {
        modalAvatar.style.backgroundImage = `url('${resolvedInabaAvatar}')`;
    }

    document.querySelectorAll('.card-avatar.inaba-avatar').forEach(el => {
        el.style.backgroundImage = `url('${resolvedInabaAvatar}')`;
    });
}