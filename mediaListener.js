/* ==========================================================================
   1. DOM ELEMENTS SELECTION
   ========================================================================== */

let switchMenu = document.getElementById('switch-menu');
let settingsMenu = document.getElementById('settings-menu');
let resyncMenu = document.getElementById('resync-menu');
let mediaProperties = document.getElementById('media-properties');
let mediaPlaylist = document.getElementById('media-playlist');
let mediaPlaylistList = document.getElementById('media-playlist-list');
let imageDisplay = document.getElementById('media-image');
let yearDisplay = document.getElementById('media-release');
let duration = document.getElementById('song-duration');
let elapsedTime = document.getElementById('time-elapsed');
let slider = document.getElementById('media-slider');
let playButton = document.getElementById('media-play');
let pauseButton = document.getElementById('media-pause');
let nextButton = document.getElementById('media-next');
let previousButton = document.getElementById('media-previous');
let backPage = document.getElementById('media-left');
let forwardPage = document.getElementById('media-right');
let repeatButton = document.getElementById('media-repeat');
let infoButton = document.getElementById('media-info');
let mediaContainer = document.getElementById('media-container');
let mediaWrapper = document.getElementById('media-wrapper');
let mediaButtons = document.getElementById('media-buttons');
let timerMenu = document.getElementById('timer-menu');
let timerText = document.getElementById('timer-text');
let timerTooltip = document.getElementById('timer-tooltip');

const categoryTitle = document.getElementById("info-category");
const contentDisplay = document.getElementById("info-content-display");


/* ==========================================================================
   2. GLOBAL STATE & CONFIGURATION
   ========================================================================== */

const jsmediatags = window.jsmediatags;

let playMode = 0;
let isFirstLoad = true;
let isDragging = false;
let isPlayingOtherMedia = false;
let randomizeSongs = true;

let isGifIconEnabled = false;
let userGifPreference = false;
let gifStateBackup = false;

let isVisualizerEnabled = true;
window.isVisualizerEnabled = true;

let isCrossfadeEnabled = false;
let crossfadeStateBackup = false;
let crossfadeDuration = 5;
let isCrossfading = false;
let crossfadeInterval = null;
let fadingAudioInstance = null;
let isExpandAnimating = false;

let sliderUiFrame = null;
let isSeekingAnimation = false;

let isMouseDownOnSlider = false;
let sliderMouseDownX = 0;
let sliderMouseDownValue = 0;
let isDraggingSlider = false;

let isFirstLoadPending = true;
let countdownValue = 60;
let countdownInterval = null;
let isKeepPaused = false;
let is3sLockPhase = false;

let autoScrollSettingsRaf = null;
let autoScrollSettingsTimeout = null;

function startFirstLoadCountdown() {
    if (!window.hasMediaRevealed) return;
    if (!isFirstLoadPending || isKeepPaused) return;

    if (timerText) timerText.textContent = countdownValue;
    if (timerMenu && !isAppsConnectPlaying()) timerMenu.classList.remove('hide-timer');

    if (countdownInterval !== null) return;

    countdownInterval = setInterval(() => {
        countdownValue--;

        if (timerText) timerText.textContent = countdownValue;

        if (countdownValue <= 0) {
            finishFirstLoadCountdown();
        }
    }, 1000);
}

function finishFirstLoadCountdown() {
    if (!isFirstLoadPending) return;
    isFirstLoadPending = false;
    is3sLockPhase = false;

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    if (timerTooltip) {
        timerTooltip.classList.add('hide-tooltip');
    }

    if (timerMenu) {
        timerMenu.classList.add('hide-timer');
    }

    if (mediaButtons) {
        mediaButtons.classList.remove('controls-locked');
    }
    if (switchMenu) {
        switchMenu.classList.remove('controls-locked');
    }

    if (!isKeepPaused) {
        if (currentSong && !isPlayingOtherMedia && !isAppsConnectPlaying()) {
            startSong(currentSong);
        }
    }
}

if (timerMenu) {
    timerMenu.addEventListener('mouseenter', () => {
        if (isFirstLoadPending && !is3sLockPhase && timerTooltip && !isAppsConnectPlaying()) {
            timerTooltip.classList.remove('hide-tooltip');
        }
    });

    timerMenu.addEventListener('mouseleave', () => {
        if (timerTooltip) {
            timerTooltip.classList.add('hide-tooltip');
        }
    });

    timerMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isFirstLoadPending && !is3sLockPhase) {
            isKeepPaused = true;
            is3sLockPhase = true;

            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }

            if (timerTooltip) {
                timerTooltip.classList.add('hide-tooltip');
            }

            if (mediaButtons) {
                mediaButtons.classList.add('controls-locked');
            }
            if (switchMenu) {
                switchMenu.classList.add('controls-locked');
            }

            let delayBefore3s = 0;
            if (isPlaylistOpen()) {
                toggleMenu();
                delayBefore3s = 1000;
            }

            setTimeout(() => {
                countdownValue = 3;
                if (timerText) {
                    timerText.textContent = countdownValue;
                }

                if (countdownInterval) clearInterval(countdownInterval);

                countdownInterval = setInterval(() => {
                    countdownValue--;
                    if (timerText) timerText.textContent = countdownValue;

                    if (countdownValue <= 0) {
                        finishFirstLoadCountdown();
                    }
                }, 1000);
            }, delayBefore3s);
        }
    });
}

const songGifs = Object.fromEntries([
    ['03. 『Pascal Beats』Vo. 歌愛ユキ.mp3', 'assets/gifs/03.gif'],
    ['04. 『Cooler Girl』Vo. 歌愛ユキ.mp3', 'assets/gifs/04.gif'],
    ['05. 『Loop Spinner』Vo. 歌愛ユキ.mp3', 'assets/gifs/05.gif'],
    ['06. 『Namida Denpa』Vo. 歌愛ユキ.mp3', 'assets/gifs/06.gif'],
    ['07. 『Tsukurikake no Shinshou』Vo. 歌愛ユキ.mp3', 'assets/gifs/07.gif'],
    ['11. 『Utsushi Asobi』Vo. 歌愛ユキ.mp3', 'assets/gifs/11.gif'],
    ['13. 『Non-Use』Vo. 歌愛ユキ & 初音ミク.mp3', 'assets/gifs/13.gif'],
    ['14. 『Himitsu Ongaku』Vo. 歌愛ユキ.mp3', 'assets/gifs/14.gif'],
    ['17. 『Rainy Boots』Vo. 歌愛ユキ.mp3', 'assets/gifs/17.gif'],
    ['18. 『Lagtrain』Vo. 歌愛ユキ.mp3', 'assets/gifs/18.gif'],
    ['25. 『Kimi ni Kaikisen』Vo. 歌愛ユキ.mp3', 'assets/gifs/25.gif'],
    ['29. 『Float Play』Vo. 歌愛ユキ.mp3', 'assets/gifs/29.gif'],
    ['34. 『Watashi wa Ame』Vo. 歌愛ユキ.mp3', 'assets/gifs/34.gif'],
    ['39. 『Spot Late』Vo. 歌愛ユキ.mp3', 'assets/gifs/39.gif']
]);


/* ==========================================================================
   3. THUMBNAIL UPSCALER & SLIDER FILL HELPERS
   ========================================================================== */

function getHDThumbnail(url) {
    if (!url) return "assets/icons/inaba_512.png";

    let cleanUrl = url.split('?')[0];

    if (cleanUrl.includes('ytimg.com')) {
        return cleanUrl.replace(/\/(hqdefault|mqdefault|sddefault|default|hq720)\.(jpg|webp)/i, '/maxresdefault.jpg');
    }

    if (cleanUrl.includes('ggpht.com') || cleanUrl.includes('googleusercontent.com')) {
        return cleanUrl.replace(/=[^=]+$/, '=s1200');
    }

    return url;
}

function resolveAlbumDisplay(album, title) {
    if (!album || !album.trim()) {
        return "Single Track";
    }

    let a = album.trim();
    let t = (title || "").trim();

    let cleanA = a.toLowerCase().replace(/[[({【『].*?[\])}】』]/g, '').trim();
    let cleanT = t.toLowerCase().replace(/[[({【『].*?[\])}】』]/g, '').trim();

    if (!cleanA || cleanA === cleanT || a.toLowerCase() === t.toLowerCase() || /^(single|single track|single-track)$/i.test(a)) {
        return "Single Track";
    }

    return a;
}

function updateSliderFill(percent) {
    if (!slider) return;
    const safePercent = Math.max(0, Math.min(100, percent || 0));
    slider.style.background = `linear-gradient(to right, #ffffff ${safePercent}%, #000000 ${safePercent}%)`;
}

function updateCrossfadeSliderFill(value) {
    const sliderEl = document.getElementById("crossfade-slider");
    if (!sliderEl) return;
    const percent = ((value - 1) / 9) * 100;
    const safePercent = Math.max(0, Math.min(100, percent));
    sliderEl.style.background = `linear-gradient(to right, #ffffff ${safePercent}%, #000000 ${safePercent}%)`;
}


/* ==========================================================================
   4. APPS CONNECT & SYNCED LYRICS INTEGRATION
   ========================================================================== */

let isAppsConnectEnabled = false;
let appsTimer = null;

let syncedLyricsMemory = [];
let lastTrackKey = "";
let lastCurrentLyricText = "";
let isLyricAnimating = false;
let lyricMarqueeRaf = null;
let lyricMarqueeTimeout = null;

const LYRICS_TIME_OFFSET_SEC = 0.35;

let autoScrollRaf = null;
let autoScrollTimeout = null;

let systemMediaData = {
    title: "No Track Playing",
    artist: "External App",
    album: "Single Track",
    cover: "assets/icons/inaba_512.png",
    duration: 0,
    position: 0,
    lastUpdateTimestamp: 0,
    isPlaying: false,
    appId: ""
};

function isAppsConnectPlaying() {
    return isAppsConnectEnabled &&
        systemMediaData.isPlaying &&
        systemMediaData.title &&
        systemMediaData.title !== "No Track Playing" &&
        systemMediaData.title !== "Unknown Title";
}

function isYouTubeMedia(coverUrl, appId, title, album) {
    let c = (coverUrl || "").toLowerCase();
    let app = (appId || "").toLowerCase();
    let t = (title || "").toLowerCase();
    let a = (album || "").toLowerCase();

    return c.includes("ytimg.com") ||
        c.includes("ggpht.com") ||
        c.includes("googleusercontent.com") ||
        c.includes("youtube.com") ||
        app.includes("youtube") ||
        app.includes("chrome") ||
        app.includes("edge") ||
        app.includes("brave") ||
        app.includes("firefox") ||
        app.includes("opera") ||
        t.includes("youtube") ||
        a.includes("youtube");
}

function isSpotifyMedia(coverUrl, appId) {
    let c = (coverUrl || "").toLowerCase();
    let app = (appId || "").toLowerCase();

    return app.includes("spotify") ||
        c.includes("scdn.co") ||
        c.includes("spotify") ||
        (!isYouTubeMedia(coverUrl, appId, "", "") && (c.startsWith("data:image") || c.includes("blob:")));
}

function getCleanAppName() {
    return "APPs Connect";
}

if (window['wallpaperRegisterMediaPropertiesListener']) {
    window['wallpaperRegisterMediaPropertiesListener']((event) => {
        let newTitle = event.title || "Unknown Title";
        let newArtist = event.artist || "Unknown Artist";
        let rawAlbum = event.subTitle || event.albumTitle || "";

        systemMediaData.title = newTitle;
        systemMediaData.artist = newArtist;
        systemMediaData.appId = (event.appId || "").toLowerCase();
        systemMediaData.album = resolveAlbumDisplay(rawAlbum, newTitle);

        if (isAppsConnectPlaying()) {
            updateSystemMediaPlayer();
        } else {
            updateAppsUIState();
        }
    });
}

if (window['wallpaperRegisterMediaThumbnailListener']) {
    window['wallpaperRegisterMediaThumbnailListener']((event) => {
        let rawCover = event.thumbnail || "assets/icons/inaba_512.png";
        systemMediaData.cover = getHDThumbnail(rawCover);

        if (isAppsConnectPlaying()) {
            imageDisplay.style.backgroundImage = `url("${systemMediaData.cover}")`;
            const infoCover = document.getElementById("info-cover");
            if (infoCover) {
                infoCover.style.backgroundImage = `url("${systemMediaData.cover}")`;
            }
            yearDisplay.textContent = getCleanAppName();

            if (isSpotifyMedia(systemMediaData.cover, systemMediaData.appId)) {
                fetchSyncedLyrics(systemMediaData.title, systemMediaData.artist);
            } else {
                stopLyricMarquee();
                updateLyricUI("", "");
                lastTrackKey = "";
            }
        }
    });
}

if (window['wallpaperRegisterMediaTimelineListener']) {
    window['wallpaperRegisterMediaTimelineListener']((event) => {
        let oldPos = systemMediaData.position;
        let newPos = event.position || 0;
        let timePassed = systemMediaData.lastUpdateTimestamp ? (Date.now() - systemMediaData.lastUpdateTimestamp) / 1000 : 0;
        let expectedPos = oldPos + timePassed;

        systemMediaData.position = newPos;
        systemMediaData.duration = event.duration || 0;
        systemMediaData.lastUpdateTimestamp = Date.now();

        if (isAppsConnectPlaying()) {
            let posDelta = Math.abs(newPos - expectedPos);
            if (posDelta > 1.5 && !isSeekingAnimation) {
                let startPercent = parseFloat(slider.value) || 0;
                animateSliderToAudio(startPercent, 1500);
            }
            startAppsTimer();
        }
    });
}

if (window['wallpaperRegisterMediaPlaybackListener']) {
    window['wallpaperRegisterMediaPlaybackListener'](wallpaperMediaPlaybackListener);
}

function updateAppsUIState() {
    if (!mediaWrapper) mediaWrapper = document.getElementById('media-wrapper');
    let isActive = isAppsConnectPlaying();

    if (mediaWrapper) {
        if (isActive) {
            mediaWrapper.classList.add('apps-active');

            if (isSpotifyMedia(systemMediaData.cover, systemMediaData.appId)) {
                mediaWrapper.classList.add('spotify-active');
            } else {
                mediaWrapper.classList.remove('spotify-active');
            }

            if (timerTooltip) timerTooltip.classList.add('hide-tooltip');
            if (slider) slider.style.pointerEvents = 'none';

            if (isFirstLoadPending) {
                if (timerMenu) timerMenu.classList.add('hide-timer');
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                }
            }
        } else {
            mediaWrapper.classList.remove('apps-active', 'spotify-active');
            if (slider) slider.style.pointerEvents = 'auto';
            stopLyricMarquee();
            updateLyricUI("", "");
            lastTrackKey = "";

            if (isFirstLoadPending && window.hasMediaRevealed) {
                if (timerMenu) timerMenu.classList.remove('hide-timer');
                startFirstLoadCountdown();
            }
        }
    }
}

function parseLRC(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const result = [];
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})](.*)/;

    for (let line of lines) {
        const match = line.match(regex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3], 10);
            const time = minutes * 60 + seconds + (milliseconds > 99 ? milliseconds / 1000 : milliseconds / 100);
            const text = match[4].trim();
            if (text) {
                result.push({ time, text });
            }
        }
    }
    return result.sort((a, b) => a.time - b.time);
}

function fetchSyncedLyrics(title, artist) {
    if (!isSpotifyMedia(systemMediaData.cover, systemMediaData.appId) || !systemMediaData.isPlaying) {
        stopLyricMarquee();
        updateLyricUI("", "");
        lastTrackKey = "";
        return;
    }

    const trackKey = `${title}-${artist}`;
    if (lastTrackKey === trackKey) return;
    lastTrackKey = trackKey;

    syncedLyricsMemory = [];
    stopLyricMarquee();
    updateLyricUI("Searching lyrics...", "");

    const cleanTitle = encodeURIComponent(title.replace(/\(.*?\)/g, '').replace(/\[.*?]/g, '').trim());
    const cleanArtist = encodeURIComponent((artist || "").split(',')[0].split('/')[0].split('-')[0].trim());

    fetch(`https://lrclib.net/api/get?track_name=${cleanTitle}&artist_name=${cleanArtist}`)
        .then(res => {
            if (!res.ok) throw new Error("Lyrics not found");
            return res.json();
        })
        .then(data => {
            if (!isSpotifyMedia(systemMediaData.cover, systemMediaData.appId) || !systemMediaData.isPlaying) {
                stopLyricMarquee();
                updateLyricUI("", "");
                return;
            }
            if (data && data.syncedLyrics) {
                syncedLyricsMemory = parseLRC(data.syncedLyrics);
                updateLyricUI("♪ " + title, "Enjoy the music!");
            } else {
                updateLyricUI("♪ No synced lyrics available", "");
            }
        })
        .catch(() => {
            if (!isSpotifyMedia(systemMediaData.cover, systemMediaData.appId) || !systemMediaData.isPlaying) {
                stopLyricMarquee();
                updateLyricUI("", "");
                return;
            }
            updateLyricUI("♪ Lyrics unavailable", "");
        });
}

function stopLyricMarquee() {
    if (lyricMarqueeRaf) {
        cancelAnimationFrame(lyricMarqueeRaf);
        lyricMarqueeRaf = null;
    }
    if (lyricMarqueeTimeout) {
        clearTimeout(lyricMarqueeTimeout);
        lyricMarqueeTimeout = null;
    }
    const currentEl = document.getElementById("media-lyric-current");
    if (currentEl) {
        currentEl.style.transform = "translateX(0px)";
    }
}

function checkAndStartLyricMarquee(currentEl, text) {
    stopLyricMarquee();
    if (!currentEl) return;

    currentEl.style.transform = "translateX(0px)";
    currentEl.textContent = text;

    setTimeout(() => {
        if (!currentEl) return;
        const containerWidth = currentEl.parentElement ? currentEl.parentElement.clientWidth : 0;
        const textWidth = currentEl.scrollWidth;
        const overflow = textWidth - containerWidth;

        if (overflow > 4) {
            const SPEED_PX_SEC = 25;
            const scrollDuration = Math.max(1200, (overflow / SPEED_PX_SEC) * 1000);
            const PAUSE_DURATION = 1200;

            let state = "WAIT_START";
            let startTime = null;

            lyricMarqueeTimeout = setTimeout(() => {
                state = "SCROLL_LEFT";
                startTime = performance.now();

                function step(now) {
                    if (!currentEl) return;

                    if (state === "SCROLL_LEFT") {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / scrollDuration, 1);
                        currentEl.style.transform = `translateX(${-progress * overflow}px)`;

                        if (progress >= 1) {
                            state = "WAIT_END";
                            lyricMarqueeTimeout = setTimeout(() => {
                                state = "SCROLL_RIGHT";
                                startTime = performance.now();
                                lyricMarqueeRaf = requestAnimationFrame(step);
                            }, PAUSE_DURATION);
                            return;
                        }
                    } else if (state === "SCROLL_RIGHT") {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / scrollDuration, 1);
                        currentEl.style.transform = `translateX(${-(1 - progress) * overflow}px)`;

                        if (progress >= 1) {
                            state = "WAIT_START";
                            lyricMarqueeTimeout = setTimeout(() => {
                                state = "SCROLL_LEFT";
                                startTime = performance.now();
                                lyricMarqueeRaf = requestAnimationFrame(step);
                            }, PAUSE_DURATION);
                            return;
                        }
                    }
                    lyricMarqueeRaf = requestAnimationFrame(step);
                }
                lyricMarqueeRaf = requestAnimationFrame(step);
            }, PAUSE_DURATION);
        }
    }, 50);
}

function updateLyricUI(currentText, nextText) {
    const wrapper = document.getElementById("media-lyrics-wrapper");
    const currentEl = document.getElementById("media-lyric-current");
    const nextEl = document.getElementById("media-lyric-next");

    if (!wrapper || !currentEl || !nextEl) return;

    if (!currentText) {
        stopLyricMarquee();
        currentEl.textContent = "";
        nextEl.textContent = "";
        lastCurrentLyricText = "";
        return;
    }

    if (currentText === "Searching lyrics..." || currentText.startsWith("♪ ")) {
        stopLyricMarquee();
        currentEl.textContent = currentText;
        nextEl.textContent = nextText;
        lastCurrentLyricText = currentText;
        return;
    }

    if (lastCurrentLyricText !== currentText && !isLyricAnimating) {
        lastCurrentLyricText = currentText;
        isLyricAnimating = true;

        wrapper.classList.add("slide-up");

        setTimeout(() => {
            wrapper.style.transition = "none";
            checkAndStartLyricMarquee(currentEl, currentText);
            nextEl.textContent = nextText;
            wrapper.classList.remove("slide-up");

            void wrapper.offsetWidth;
            wrapper.style.transition = "";
            isLyricAnimating = false;
        }, 180);
    }
}

function startAppsTimer() {
    stopAppsTimer();
    appsTimer = setInterval(() => {
        if (isAppsConnectPlaying()) {
            let elapsedSinceUpdate = (Date.now() - systemMediaData.lastUpdateTimestamp) / 1000;
            let currentPos = systemMediaData.position + elapsedSinceUpdate;

            if (systemMediaData.duration > 0 && currentPos <= systemMediaData.duration) {
                elapsedTime.innerHTML = convertSecondsToMinute(currentPos);
                duration.textContent = convertSecondsToMinute(systemMediaData.duration);

                let targetPercent = (currentPos / systemMediaData.duration) * 100;
                let currentPercent = parseFloat(slider.value) || 0;

                if (!isDragging && !isSeekingAnimation) {
                    let diff = targetPercent - currentPercent;
                    let nextVal = currentPercent + diff * 0.2;
                    slider.value = nextVal;
                    updateSliderFill(nextVal);
                }

                if (syncedLyricsMemory.length > 0) {
                    let compensatedPos = currentPos + LYRICS_TIME_OFFSET_SEC;
                    let currentIndex = -1;

                    for (let i = 0; i < syncedLyricsMemory.length; i++) {
                        if (compensatedPos >= syncedLyricsMemory[i].time) {
                            currentIndex = i;
                        } else {
                            break;
                        }
                    }

                    if (currentIndex !== -1) {
                        const currentLine = syncedLyricsMemory[currentIndex].text || "♪";
                        const nextLine = (currentIndex + 1 < syncedLyricsMemory.length) ? syncedLyricsMemory[currentIndex + 1].text : "";
                        updateLyricUI(currentLine, nextLine);
                    }
                }
            }
        } else {
            stopAppsTimer();
        }
    }, 40);
}

function stopAppsTimer() {
    if (appsTimer) {
        clearInterval(appsTimer);
        appsTimer = null;
    }
}

function updateSystemMediaPlayer() {
    updateAppsUIState();
    setScrollingTitle(systemMediaData.title);
    setScrollingAlbum(systemMediaData.album);

    let artist = systemMediaData.artist;
    if (artist && artist.includes("/")) {
        artist = artist.split("/").join(", ");
    }
    setScrollingArtist(artist);

    yearDisplay.textContent = getCleanAppName();
    imageDisplay.style.backgroundImage = `url("${systemMediaData.cover}")`;

    updatePlayPauseUI(systemMediaData.isPlaying);

    let isSpotify = isSpotifyMedia(systemMediaData.cover, systemMediaData.appId);

    if (isAppsConnectPlaying() && systemMediaData.title) {
        if (isSpotify) {
            fetchSyncedLyrics(systemMediaData.title, systemMediaData.artist);
        } else {
            stopLyricMarquee();
            updateLyricUI("", "");
            lastTrackKey = "";
        }
    } else {
        stopLyricMarquee();
        updateLyricUI("", "");
        lastTrackKey = "";
    }

    const infoTitle = document.getElementById("info-title");
    const infoArtist = document.getElementById("info-artist");
    const infoCover = document.getElementById("info-cover");

    if (infoTitle) infoTitle.textContent = systemMediaData.title;
    if (infoArtist) infoArtist.textContent = artist;
    if (infoCover) infoCover.style.backgroundImage = `url("${systemMediaData.cover}")`;
}


/* ==========================================================================
   5. PLAYLIST ARRAY & LOCAL AUDIO STATE
   ========================================================================== */

let songPaths = [
    '01. 『Anticyclone』Vo. 歌愛ユキ.mp3',
    '02. 『Lost Umbrella』Vo. 歌愛ユキ.mp3',
    '03. 『Pascal Beats』Vo. 歌愛ユキ.mp3',
    '04. 『Cooler Girl』Vo. 歌愛ユキ.mp3',
    '05. 『Loop Spinner』Vo. 歌愛ユキ.mp3',
    '06. 『Namida Denpa』Vo. 歌愛ユキ.mp3',
    '07. 『Tsukurikake no Shinshou』Vo. 歌愛ユキ.mp3',
    '08. 『Fuyuu Gekkougai』Vo. 歌愛ユキ.mp3',
    '09. 『Zettai Ansei』Vo. 歌愛ユキ.mp3',
    '10. 『Uzumaki Hanabi』Vo. 歌愛ユキ.mp3',
    '11. 『Utsushi Asobi』Vo. 歌愛ユキ.mp3',
    '12. 『Sakasama Shoujo-kan』Vo. 歌愛ユキ.mp3',
    '13. 『Non-Use』Vo. 歌愛ユキ & 初音ミク.mp3',
    '14. 『Himitsu Ongaku』Vo. 歌愛ユキ.mp3',
    '15. 『Himitsu no Shougakusei』Vo. 歌愛ユキ.mp3',
    '16. 『Hello Marina』Vo. 歌愛ユキ & 初音ミク.mp3',
    '17. 『Rainy Boots』Vo. 歌愛ユキ.mp3',
    '18. 『Lagtrain』Vo. 歌愛ユキ.mp3',
    '19. 『Haruno Sekibaku』Vo. 弦巻マキ.mp3',
    '20. 『Kazemachigusa』Vo. 鳴花ヒメ.mp3',
    '21. 『Radar』Vo. 歌愛ユキ.mp3',
    '22. 『Katamusubi』Vo. 歌愛ユキ.mp3',
    '23. 『Tenkyuu』Vo. 歌愛ユキ.mp3',
    '24. 『Post Shelter』Vo. 弦巻マキ.mp3',
    '25. 『Kimi ni Kaikisen』Vo. 歌愛ユキ.mp3',
    '26. 『Loneliness of Spring』Vo. 弦巻マキ (『Haru no Sekibaku』English Cover).mp3',
    '27. 『Tokoshizume』Vo. 星界.mp3',
    '28. 『Sinktank』Vo. 裏命.mp3',
    '29. 『Float Play』Vo. 歌愛ユキ.mp3',
    '30. 『Kitaidoori』Vo. AI音街ウナ.mp3',
    '31. 『Relay Outer』Vo. 歌愛ユキ.mp3',
    '32. 『Denki Yohou』feat. 初音ミク.mp3',
    '33. 『Yoyuuyoku』Vo. nagiβ & カゼヒキβ.mp3',
    '34. 『Watashi wa Ame』Vo. 歌愛ユキ.mp3',
    '35. 『Tabi no Mae, Tabi no Ato (tabitabi Remix)』feat. 初音ミク.mp3',
    '36. 『Ipace』Vo. 歌愛ユキ.mp3',
    '37. 『Chou Shin\'entai』Vo. 歌愛ユキ.mp3',
    '38. 『Harunanshiki』Vo. 彩澄しゅお & 彩澄りりせ.mp3',
    '39. 『Spot Late』Vo. 歌愛ユキ.mp3',
    '40. 『Yurail』Vo. 弦巻マキ.mp3'
];

let songsDivs = [];
let songInterval;
let currentSong;
let currentSongIndex = 0;
let playlistPage = 0;
let volume = 0.2;
let playAtStart = false;

const categories = ["Description", "Audio", "Media", "Origin", "Content"];
let currentCategoryIndex = 0;


/* ==========================================================================
   6. EVENT LISTENERS & SMOOTH SLIDER LOGIC
   ========================================================================== */

function isPlaylistOpen() {
    return !mediaPlaylist.classList.contains("hide-properties");
}

function syncStaticPlayPauseUI() {
    let isPlaying = currentSong && currentSong.audio && !currentSong.audio.paused;
    updatePlayPauseUI(isPlaying);
}

function stopAutoScrollInfo() {
    if (autoScrollRaf) {
        cancelAnimationFrame(autoScrollRaf);
        autoScrollRaf = null;
    }
    if (autoScrollTimeout) {
        clearTimeout(autoScrollTimeout);
        autoScrollTimeout = null;
    }
}

function startAutoScrollInfo() {
    stopAutoScrollInfo();
    const container = document.getElementById("info-content-display");
    if (!container) return;

    container.scrollTop = 0;

    autoScrollTimeout = setTimeout(() => {
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (maxScroll <= 2) return;

        const SCROLL_DURATION = 5000;
        const PAUSE_DURATION = 3000;

        let state = "WAIT_TOP";
        let startTime = null;

        autoScrollTimeout = setTimeout(() => {
            state = "SCROLL_DOWN";
            startTime = performance.now();

            function step(now) {
                if (!container) return;

                if (state === "SCROLL_DOWN") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / SCROLL_DURATION, 1);
                    container.scrollTop = progress * maxScroll;

                    if (progress >= 1) {
                        state = "WAIT_BOTTOM";
                        autoScrollTimeout = setTimeout(() => {
                            state = "SCROLL_UP";
                            startTime = performance.now();
                            autoScrollRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                } else if (state === "SCROLL_UP") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / SCROLL_DURATION, 1);
                    container.scrollTop = (1 - progress) * maxScroll;

                    if (progress >= 1) {
                        state = "WAIT_TOP";
                        autoScrollTimeout = setTimeout(() => {
                            state = "SCROLL_DOWN";
                            startTime = performance.now();
                            autoScrollRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                }

                autoScrollRaf = requestAnimationFrame(step);
            }

            autoScrollRaf = requestAnimationFrame(step);
        }, PAUSE_DURATION);
    }, 300);
}

function stopAutoScrollSettings() {
    if (autoScrollSettingsRaf) {
        cancelAnimationFrame(autoScrollSettingsRaf);
        autoScrollSettingsRaf = null;
    }
    if (autoScrollSettingsTimeout) {
        clearTimeout(autoScrollSettingsTimeout);
        autoScrollSettingsTimeout = null;
    }
    const container = document.querySelector("#settings-panel .info-section");
    if (container) {
        container.scrollTop = 0;
    }
}

function startAutoScrollSettings(immediate = false) {
    if (autoScrollSettingsRaf) {
        cancelAnimationFrame(autoScrollSettingsRaf);
        autoScrollSettingsRaf = null;
    }
    if (autoScrollSettingsTimeout) {
        clearTimeout(autoScrollSettingsTimeout);
        autoScrollSettingsTimeout = null;
    }

    const container = document.querySelector("#settings-panel .info-section");
    if (!container) return;

    const delay = immediate ? 100 : 800;

    autoScrollSettingsTimeout = setTimeout(() => {
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (maxScroll <= 2) {
            container.scrollTop = 0;
            return;
        }

        const SPEED_PX_PER_SEC = 20;
        const scrollDuration = Math.max(3000, (maxScroll / SPEED_PX_PER_SEC) * 1000);
        const PAUSE_DURATION = 3000;

        let state = "WAIT_TOP";
        let startTime = null;

        autoScrollTimeout = setTimeout(() => {
            state = "SCROLL_DOWN";
            startTime = performance.now();

            function step(now) {
                if (!container) return;

                const currentMaxScroll = container.scrollHeight - container.clientHeight;
                if (currentMaxScroll <= 2) {
                    container.scrollTop = 0;
                    return;
                }

                if (state === "SCROLL_DOWN") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    container.scrollTop = progress * currentMaxScroll;

                    if (progress >= 1) {
                        state = "WAIT_BOTTOM";
                        autoScrollSettingsTimeout = setTimeout(() => {
                            state = "SCROLL_UP";
                            startTime = performance.now();
                            autoScrollSettingsRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                } else if (state === "SCROLL_UP") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    container.scrollTop = (1 - progress) * currentMaxScroll;

                    if (progress >= 1) {
                        state = "WAIT_TOP";
                        autoScrollSettingsTimeout = setTimeout(() => {
                            state = "SCROLL_DOWN";
                            startTime = performance.now();
                            autoScrollSettingsRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                }

                autoScrollSettingsRaf = requestAnimationFrame(step);
            }

            autoScrollSettingsRaf = requestAnimationFrame(step);
        }, PAUSE_DURATION);
    }, delay);
}

repeatButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;

    playMode = (playMode + 1) % 3;
    repeatButton.classList.remove("repeat-mode", "sequential-mode");

    if (playMode === 1) {
        repeatButton.classList.add("sequential-mode");
    } else if (playMode === 2) {
        repeatButton.classList.add("repeat-mode");
    }
});

infoButton.addEventListener("click", () => {
    if (mediaContainer.classList.contains("info-open")) {
        mediaContainer.classList.remove("info-open");
        infoButton.classList.remove("active");
        stopAutoScrollInfo();
        return;
    }

    let needsDelay = false;

    if (mediaContainer.classList.contains("settings-open")) {
        mediaContainer.classList.remove("settings-open");
        stopAutoScrollSettings();
        needsDelay = true;
    }

    if (isPlaylistOpen()) {
        toggleMenu();
        needsDelay = true;
    }

    if (needsDelay) {
        setTimeout(() => {
            infoButton.classList.add("active");
            mediaContainer.classList.add("info-open");
            startAutoScrollInfo();
        }, 1100);
    } else {
        infoButton.classList.add("active");
        mediaContainer.classList.add("info-open");
        startAutoScrollInfo();
    }
});

function animateSliderToAudio(startPercent, durationMs = 1500) {
    if (sliderUiFrame) cancelAnimationFrame(sliderUiFrame);
    isSeekingAnimation = true;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        const easeProgress = 1 - Math.pow(1 - progress, 3);

        let currentAudioPercent = 0;
        let isAppPlaying = isAppsConnectPlaying();

        if (isAppPlaying) {
            let elapsedSinceUpdate = (Date.now() - systemMediaData.lastUpdateTimestamp) / 1000;
            let currentPos = systemMediaData.position + elapsedSinceUpdate;
            if (systemMediaData.duration > 0) {
                currentAudioPercent = (currentPos / systemMediaData.duration) * 100;
            }
        } else if (currentSong && currentSong.audio && !isNaN(currentSong.audio.duration)) {
            currentAudioPercent = (currentSong.audio.currentTime / currentSong.audio.duration) * 100;
        } else {
            isSeekingAnimation = false;
            return;
        }

        const interpolatedValue = startPercent + (currentAudioPercent - startPercent) * easeProgress;

        slider.value = interpolatedValue;
        updateSliderFill(interpolatedValue);

        if (isAppPlaying) {
            let elapsedSinceUpdate = (Date.now() - systemMediaData.lastUpdateTimestamp) / 1000;
            let currentPos = systemMediaData.position + elapsedSinceUpdate;
            elapsedTime.innerHTML = convertSecondsToMinute(currentPos);
        } else if (currentSong && currentSong.audio) {
            elapsedTime.innerHTML = convertSecondsToMinute(currentSong.audio.currentTime);
        }

        if (progress < 1) {
            sliderUiFrame = requestAnimationFrame(step);
        } else {
            isSeekingAnimation = false;
        }
    }

    sliderUiFrame = requestAnimationFrame(step);
}

slider.addEventListener("mousedown", (e) => {
    if (isAppsConnectPlaying()) return;

    e.preventDefault();

    isMouseDownOnSlider = true;
    isDraggingSlider = false;
    sliderMouseDownX = e.clientX;
    sliderMouseDownValue = parseFloat(slider.value) || 0;
});

document.addEventListener("mousemove", (e) => {
    if (!isMouseDownOnSlider || isAppsConnectPlaying()) return;

    const deltaX = Math.abs(e.clientX - sliderMouseDownX);
    if (deltaX > 3) {
        isDraggingSlider = true;
        isDragging = true;
    }

    if (isDraggingSlider) {
        const rect = slider.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const targetPercent = Math.max(0, Math.min(100, (currentX / rect.width) * 100));

        slider.value = targetPercent;
        updateSliderFill(targetPercent);

        if (currentSong && currentSong.audio && !isNaN(currentSong.audio.duration)) {
            const seekTime = (targetPercent / 100) * currentSong.audio.duration;
            currentSong.audio.currentTime = seekTime;
            elapsedTime.innerHTML = convertSecondsToMinute(seekTime);
        }
    }
});

document.addEventListener("mouseup", (e) => {
    if (!isMouseDownOnSlider) return;
    isMouseDownOnSlider = false;

    if (isAppsConnectPlaying()) return;

    if (!isDraggingSlider) {
        const rect = slider.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const targetPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

        if (currentSong && currentSong.audio && !isNaN(currentSong.audio.duration)) {
            currentSong.audio.currentTime = (targetPercent / 100) * currentSong.audio.duration;
        }

        animateSliderToAudio(sliderMouseDownValue, 1500);
    }

    isDraggingSlider = false;
    isDragging = false;
});

switchMenu.addEventListener("click", () => {
    if (isAppsConnectPlaying() || is3sLockPhase) return;

    let needsDelay = false;

    if (mediaContainer.classList.contains("info-open")) {
        mediaContainer.classList.remove("info-open");
        infoButton.classList.remove("active");
        stopAutoScrollInfo();
        needsDelay = true;
    }

    if (mediaContainer.classList.contains("settings-open")) {
        mediaContainer.classList.remove("settings-open");
        stopAutoScrollSettings();
        needsDelay = true;
    }

    if (needsDelay) {
        setTimeout(() => {
            toggleMenu();
        }, 1100);
    } else {
        toggleMenu();
    }
});

settingsMenu.addEventListener("click", () => {
    if (mediaContainer.classList.contains("settings-open")) {
        mediaContainer.classList.remove("settings-open");
        stopAutoScrollSettings();
        return;
    }

    let needsDelay = false;

    if (mediaContainer.classList.contains("info-open")) {
        mediaContainer.classList.remove("info-open");
        infoButton.classList.remove("active");
        stopAutoScrollInfo();
        needsDelay = true;
    }

    if (isPlaylistOpen()) {
        toggleMenu();
        needsDelay = true;
    }

    if (needsDelay) {
        setTimeout(() => {
            mediaContainer.classList.add("settings-open");
            renderSettings();
            startAutoScrollSettings();
        }, 1100);
    } else {
        mediaContainer.classList.add("settings-open");
        renderSettings();
        startAutoScrollSettings();
    }
});

if (resyncMenu) {
    resyncMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!isAppsConnectPlaying()) return;

        resyncMenu.classList.remove("spinning");
        void resyncMenu.offsetWidth;
        resyncMenu.classList.add("spinning");

        lastTrackKey = "";
        stopLyricMarquee();
        updateSystemMediaPlayer();

        let startPercent = parseFloat(slider.value) || 0;
        animateSliderToAudio(startPercent, 1000);
    });
}

backPage.addEventListener("click", () => {
    playlistPage--;
    if (playlistPage < 0) playlistPage = 0;
    switchPage();
});

forwardPage.addEventListener("click", () => {
    playlistPage++;
    if (playlistPage >= songsDivs.length / 5) playlistPage = Math.floor(songsDivs.length / 5) - 1;
    switchPage();
});

function resetTimerLockAndResume() {
    isKeepPaused = false;
    is3sLockPhase = false;
    isFirstLoadPending = false;

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    if (timerTooltip) {
        timerTooltip.classList.add('hide-tooltip');
    }

    if (timerMenu) {
        timerMenu.classList.add('hide-timer');
    }

    if (mediaButtons) {
        mediaButtons.classList.remove('controls-locked');
    }

    if (switchMenu) {
        switchMenu.classList.remove('controls-locked');
    }
}

playButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;

    resetTimerLockAndResume();
    if (currentSong) {
        startSong(currentSong);
    }
});

pauseButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;

    resetTimerLockAndResume();
    stopSong();
});

nextButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;

    resetTimerLockAndResume();
    loadNextSong();
});

previousButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;

    resetTimerLockAndResume();
    loadPreviousSong();
});

document.getElementById("info-prev").onclick = () => {
    if (currentCategoryIndex > 0) {
        currentCategoryIndex--;
        renderInfo();
    }
};

document.getElementById("info-next").onclick = () => {
    if (currentCategoryIndex < categories.length - 1) {
        currentCategoryIndex++;
        renderInfo();
    }
};


/* ==========================================================================
   7. INITIALIZATION & PAGE LOAD
   ========================================================================== */

function pageLoad() {
    mediaPlaylistList.innerHTML = '';
    songPaths.forEach(createSongDiv);
    clearSlider();

    let randomSong = songPaths[Math.floor(Math.random() * songPaths.length)];
    loadAudio("assets/musics/" + randomSong)
        .then(songProperties => {
            currentSong = { ...songProperties };

            const handleInitialMetadata = () => {
                stopSong();

                if (isFirstLoadPending && !isKeepPaused && window.hasMediaRevealed) {
                    startFirstLoadCountdown();
                }

                const songPath = songPaths[currentSongIndex];
                const image = getSongCoverImage(songPath, currentSong.tags);
                updatePlayer(
                    (currentSong.tags && currentSong.tags.title) || songPath.slice(0, -4),
                    (currentSong.tags && currentSong.tags.album) || "Inabakumori Songs",
                    (currentSong.tags && currentSong.tags.artist) || "Inabakumori",
                    (currentSong.tags && currentSong.tags.year) || "",
                    image,
                    convertSecondsToMinute(currentSong.audio.duration)
                );
            };

            if (currentSong.audio.readyState >= 1) {
                handleInitialMetadata();
            } else {
                currentSong.audio.addEventListener("loadedmetadata", handleInitialMetadata, { once: true });
            }

            currentSong.audio.addEventListener("ended", songOnEndListener);
            currentSong.audio.load();
        })
        .catch(error => {
            console.error(error);
        });
    currentSongIndex = songPaths.indexOf(randomSong);
    pageLoad.isLoaded = true;
    updateArrowVisibility();
    clearSlider();
    isFirstLoad = false;
}


/* ==========================================================================
   8. AUDIO PLAYBACK CORE & SPOTIFY EQUAL-POWER CROSSFADE SYSTEM
   ========================================================================== */

function updatePlayPauseUI(isPlaying) {
    if (isPlaying) {
        playButton.classList.add('hide-pause-play');
        pauseButton.classList.remove('hide-pause-play');
    } else {
        playButton.classList.remove('hide-pause-play');
        pauseButton.classList.add('hide-pause-play');
    }
}

function songOnClickListener(event) {
    if (isAppsConnectPlaying()) return;

    resetTimerLockAndResume();
    const songElement = event.currentTarget;
    let songPath = songElement.getAttribute("data-song-path");

    loadSong("assets/musics/" + songPath);
    toggleMenu();
    currentSongIndex = songPaths.indexOf(songPath);
}

function songOnEndListener() {
    if (isCrossfading || isKeepPaused) return;

    if (playMode === 2) {
        let startPercent = parseFloat(slider.value) || 100;
        currentSong.audio.currentTime = 0;
        currentSong.audio.play().catch(() => {});
        animateSliderToAudio(startPercent, 1500);
        return;
    }

    if (playMode === 1) {
        loadNextSong();
        return;
    }

    loadRandomSong();
}

function triggerCrossfade() {
    if (isCrossfading || isKeepPaused || !currentSong || !currentSong.audio) return;
    isCrossfading = true;

    let oldAudio = currentSong.audio;
    fadingAudioInstance = oldAudio;

    let nextIndex = currentSongIndex;
    if (playMode === 1) {
        nextIndex = (currentSongIndex + 1) % songPaths.length;
    } else if (playMode === 0) {
        nextIndex = Math.floor(Math.random() * songPaths.length);
    }
    currentSongIndex = nextIndex;

    let nextSongPath = "assets/musics/" + songPaths[currentSongIndex];

    const newAudio = new Audio(nextSongPath);
    newAudio.volume = 0;

    currentSong = {
        audio: newAudio,
        tags: {}
    };

    const songPathStr = songPaths[currentSongIndex];

    const updateMetadataUI = () => {
        const tags = (currentSong && currentSong.tags) ? currentSong.tags : {};
        let songDur = convertSecondsToMinute(newAudio.duration);
        let image = getSongCoverImage(songPathStr, tags);
        updatePlayer(
            tags.title || songPathStr.slice(0, -4),
            tags.album || "Inabakumori Songs",
            tags.artist || "Inabakumori",
            tags.year || "",
            image,
            songDur
        );
    };

    loadAudio(nextSongPath).then(props => {
        if (currentSong && currentSong.audio === newAudio) {
            currentSong.tags = props.tags || {};
            refreshCurrentSongCover();
            updateMetadataUI();
        }
    }).catch(() => {});

    newAudio.addEventListener("ended", songOnEndListener);
    newAudio.play().then(() => {
        updatePlayPauseUI(true);
    }).catch(() => {});

    if (!isNaN(newAudio.duration) && newAudio.duration > 0) {
        updateMetadataUI();
    } else {
        newAudio.addEventListener("loadedmetadata", updateMetadataUI, { once: true });
    }

    let startTime = performance.now();
    let durationMs = crossfadeDuration * 1000;

    if (crossfadeInterval) clearInterval(crossfadeInterval);

    crossfadeInterval = setInterval(() => {
        let elapsed = performance.now() - startTime;
        let progress = Math.min(elapsed / durationMs, 1);

        let outFactor = Math.cos(progress * 0.5 * Math.PI);
        let inFactor = Math.sin(progress * 0.5 * Math.PI);

        if (oldAudio) oldAudio.volume = Math.max(0, Math.min(1, volume * outFactor));
        if (newAudio) newAudio.volume = Math.max(0, Math.min(1, volume * inFactor));

        if (progress >= 1) {
            clearInterval(crossfadeInterval);
            crossfadeInterval = null;
            if (oldAudio) {
                oldAudio.pause();
                oldAudio.volume = 0;
            }
            if (newAudio) {
                newAudio.volume = volume;
            }
            fadingAudioInstance = null;
            isCrossfading = false;
        }
    }, 20);
}

function loadRandomSong() {
    let randomSong = songPaths[Math.floor(Math.random() * songPaths.length)];
    loadSong("assets/musics/" + randomSong);
    currentSongIndex = songPaths.indexOf(randomSong);
}

function loadNextSong() {
    currentSongIndex++;
    if (currentSongIndex > songPaths.length - 1) currentSongIndex = 0;
    loadSong("assets/musics/" + songPaths[currentSongIndex]);
}

function loadPreviousSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) currentSongIndex = songPaths.length - 1;
    loadSong("assets/musics/" + songPaths[currentSongIndex]);
}

function loadSong(songPath) {
    if (crossfadeInterval) {
        clearInterval(crossfadeInterval);
        crossfadeInterval = null;
    }
    if (fadingAudioInstance) {
        fadingAudioInstance.pause();
        fadingAudioInstance = null;
    }
    isCrossfading = false;

    loadAudio(songPath)
        .then(songProperties => {
            initSong(songProperties);
        })
        .catch(error => {
            console.error(error);
        });
}

function initSong(songProperties) {
    stopSong();
    clearInterval(songInterval);

    currentSong = { ...songProperties };
    currentSong.audio.addEventListener("ended", songOnEndListener);
    currentSong.audio.load();

    if (!isPlayingOtherMedia && !isAppsConnectPlaying() && !isKeepPaused) {
        startSong(currentSong);
    }
}

function startSong(song) {
    if (isKeepPaused) return;

    if (isFirstLoadPending) {
        isFirstLoadPending = false;
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        if (timerTooltip) {
            timerTooltip.classList.add('hide-tooltip');
        }
        if (timerMenu) {
            timerMenu.classList.add('hide-timer');
        }
        if (mediaButtons) {
            mediaButtons.classList.remove('controls-locked');
        }
        if (switchMenu) {
            switchMenu.classList.remove('controls-locked');
        }
    }

    clearInterval(songInterval);
    songInterval = setInterval(moveSongSlider, 500);

    let startPercent = parseFloat(slider.value) || 0;

    song.audio.volume = volume;

    song.audio.play().then(() => {
        updatePlayPauseUI(true);
    }).catch(() => {
        updatePlayPauseUI(false);
    });

    const tags = song.tags || {};
    const songPath = songPaths[currentSongIndex];
    let image = getSongCoverImage(songPath, tags);

    const updateMetadataUI = () => {
        updatePlayer(
            tags.title || songPath.slice(0, -4),
            tags.album || "Inabakumori Songs",
            tags.artist || "Inabakumori",
            tags.year || "",
            image,
            convertSecondsToMinute(song.audio.duration)
        );
    };

    if (!isNaN(song.audio.duration) && song.audio.duration > 0) {
        updateMetadataUI();
    } else {
        song.audio.addEventListener("loadedmetadata", updateMetadataUI, { once: true });
    }

    if (song && song.audio && !isNaN(song.audio.duration)) {
        let targetPercent = (song.audio.currentTime / song.audio.duration) * 100;
        if (Math.abs(startPercent - targetPercent) > 1) {
            animateSliderToAudio(startPercent, 1500);
        }
    }
}

function stopSong() {
    if (currentSong && currentSong.audio) {
        currentSong.audio.pause();
    }
    if (fadingAudioInstance) {
        fadingAudioInstance.pause();
        fadingAudioInstance = null;
    }
    if (crossfadeInterval) {
        clearInterval(crossfadeInterval);
        crossfadeInterval = null;
    }
    isCrossfading = false;

    if (sliderUiFrame) cancelAnimationFrame(sliderUiFrame);
    isSeekingAnimation = false;
    clearInterval(songInterval);
    updatePlayPauseUI(false);

    if (!isAppsConnectPlaying()) {
        let curTime = (currentSong && currentSong.audio) ? currentSong.audio.currentTime : 0;
        let durTime = (currentSong && currentSong.audio && !isNaN(currentSong.audio.duration)) ? currentSong.audio.duration : 0;

        elapsedTime.innerHTML = convertSecondsToMinute(curTime);
        let progress = durTime > 0 ? (curTime / durTime) * 100 : 0;
        slider.value = progress;
        updateSliderFill(progress);
    }
}

function clearSlider() {
    clearInterval(songInterval);
    if (sliderUiFrame) cancelAnimationFrame(sliderUiFrame);
    isSeekingAnimation = false;
    elapsedTime.innerHTML = "0:00";
    slider.value = 0;
    updateSliderFill(0);
}

function moveSongSlider() {
    if (isAppsConnectPlaying()) return;

    if (!currentSong || !currentSong.audio) return;
    if (isNaN(currentSong.audio.duration)) return;

    const currentTime = currentSong.audio.currentTime;
    const totalDuration = currentSong.audio.duration;
    const remainingTime = totalDuration - currentTime;

    if (isCrossfadeEnabled && remainingTime <= crossfadeDuration && remainingTime > 0.5 && !isCrossfading && !isKeepPaused) {
        triggerCrossfade();
        return;
    }

    if (isDragging || isSeekingAnimation) return;

    elapsedTime.innerHTML = convertSecondsToMinute(currentTime);

    const progress = (currentTime / totalDuration) * 100;
    slider.value = progress;
    updateSliderFill(progress);
}


/* ==========================================================================
   9. UI & PLAYLIST MANAGEMENT
   ========================================================================== */

function updateArrowVisibility() {
    const totalPages = Math.ceil(songsDivs.length / 5);

    if (playlistPage <= 0) {
        backPage.style.opacity = "0";
        backPage.style.pointerEvents = "none";
    } else {
        backPage.style.opacity = "1";
        backPage.style.pointerEvents = "auto";
    }

    if (playlistPage >= totalPages - 1) {
        forwardPage.style.opacity = "0";
        forwardPage.style.pointerEvents = "none";
    } else {
        forwardPage.style.opacity = "1";
        forwardPage.style.pointerEvents = "auto";
    }
}

function createSongDiv(songName, index) {
    let song = document.createElement('div');
    song.setAttribute("data-song-path", songName);

    const fullTitle = songName.slice(0, songName.length - 4);

    const match = fullTitle.match(/^(\d+\.\s*)(.*)$/);
    const number = match ? match[1] : "";
    const title = match ? match[2] : fullTitle;

    song.innerHTML = `
        <div class="playlist-item">
            <span class="playlist-number">${number}</span>
            <div class="playlist-title-wrapper">
                <div class="playlist-title-track">
                    <span class="playlist-title">${title}</span>
                </div>
            </div>
        </div>
    `;

    song.addEventListener("click", songOnClickListener);

    if (index < 5) {
        mediaPlaylistList.appendChild(song);
    }

    songsDivs.push(song);
}

function switchPage() {
    mediaPlaylistList.innerHTML = '';
    let startIndex = playlistPage * 5;

    for (let i = startIndex; i < startIndex + 5; i++) {
        if (i < songPaths.length) {
            mediaPlaylistList.appendChild(songsDivs[i]);
        }
    }

    updateArrowVisibility();
    applyPlaylistScrolling();
}

function toggleMenu() {
    mediaPlaylist.classList.toggle('hide-properties');
    mediaProperties.classList.toggle('hide-properties');

    if (!mediaProperties.classList.contains('hide-properties')) {
        setTimeout(() => {
            if (currentSong && currentSong.tags) {
                const songPath = songPaths[currentSongIndex];
                setScrollingTitle((currentSong.tags && currentSong.tags.title) || songPath.slice(0, -4));
                setScrollingAlbum((currentSong.tags && currentSong.tags.album) || "Inabakumori Songs");
                setScrollingArtist((currentSong.tags && currentSong.tags.artist) || "Inabakumori");
            }
        }, 1000);
    } else {
        stopPingPongMarquee('title');
        stopPingPongMarquee('album');
        stopPingPongMarquee('artist');
    }
}

function wallpaperMediaPlaybackListener(event) {
    isPlayingOtherMedia = Boolean(window['wallpaperMediaIntegration'] && event.state === window['wallpaperMediaIntegration']['PLAYBACK_PLAYING']);
    systemMediaData.isPlaying = isPlayingOtherMedia;

    if (isPlayingOtherMedia) {
        stopSong();

        if (isAppsConnectPlaying()) {
            let startPercent = parseFloat(slider.value) || 0;
            lastTrackKey = "";
            updatePlayPauseUI(true);
            updateSystemMediaPlayer();
            startAppsTimer();
            animateSliderToAudio(startPercent, 1500);
        } else {
            stopAppsTimer();
            updateAppsUIState();
            syncStaticPlayPauseUI();
            clearSlider();
        }
    } else {
        stopAppsTimer();
        updateAppsUIState();

        if (isAppsConnectEnabled) {
            updatePlayPauseUI(false);
            if (currentSong && currentSong.tags) {
                refreshCurrentSongCover();
                let startPercent = parseFloat(slider.value) || 0;
                updatePlayer(
                    (currentSong.tags && currentSong.tags.title) || songPaths[currentSongIndex].slice(0, -4),
                    (currentSong.tags && currentSong.tags.album) || "Inabakumori Songs",
                    (currentSong.tags && currentSong.tags.artist) || "Inabakumori",
                    (currentSong.tags && currentSong.tags.year) || "",
                    getSongCoverImage(songPaths[currentSongIndex], currentSong.tags),
                    convertSecondsToMinute(currentSong.audio.duration)
                );
                if (currentSong && currentSong.audio && !isNaN(currentSong.audio.duration)) {
                    animateSliderToAudio(startPercent, 1500);
                }
            }
        } else {
            syncStaticPlayPauseUI();
            if (isKeepPaused) {
                stopSong();
            }
        }
    }
}


/* ==========================================================================
   10. PING-PONG MARQUEE & TEXT SCROLLING HELPERS
   ========================================================================== */

const marqueeHandles = {
    title: { raf: null, timeout: null },
    album: { raf: null, timeout: null },
    artist: { raf: null, timeout: null },
    playlist: []
};

function stopPingPongMarquee(handleKey, index = -1) {
    let h = (handleKey === 'playlist' && index >= 0) ? marqueeHandles.playlist[index] : marqueeHandles[handleKey];
    if (h) {
        if (h.raf) cancelAnimationFrame(h.raf);
        if (h.timeout) clearTimeout(h.timeout);
        h.raf = null;
        h.timeout = null;
    }

    if (handleKey === 'title') {
        const el = document.getElementById("media-title-track");
        if (el) el.style.transform = "translateX(0px)";
    } else if (handleKey === 'album') {
        const el = document.getElementById("media-album-track");
        if (el) el.style.transform = "translateX(0px)";
    } else if (handleKey === 'artist') {
        const el = document.getElementById("media-artist-track");
        if (el) el.style.transform = "translateX(0px)";
    }
}

function createPingPongMarquee(wrapper, track, text, handleKey, index = -1) {
    stopPingPongMarquee(handleKey, index);

    if (!wrapper || !track) return;

    track.classList.remove("scroll");
    track.style.transform = "translateX(0px)";
    track.innerHTML = `<span>${text}</span>`;

    const handleObj = { raf: null, timeout: null };
    if (handleKey === 'playlist' && index >= 0) {
        marqueeHandles.playlist[index] = handleObj;
    } else if (handleKey !== 'playlist') {
        marqueeHandles[handleKey] = handleObj;
    }

    setTimeout(() => {
        if (!wrapper || !track) return;

        if (wrapper.clientWidth <= 0) {
            track.style.transform = "translateX(0px)";
            return;
        }

        const maxScroll = track.scrollWidth - wrapper.clientWidth;
        if (maxScroll <= 2) {
            track.style.transform = "translateX(0px)";
            return;
        }

        const SPEED_PX_PER_SEC = 35;
        const scrollDuration = Math.max(1500, (maxScroll / SPEED_PX_PER_SEC) * 1000);
        const PAUSE_DURATION = 3000;

        let state = "WAIT_START";
        let startTime = null;

        handleObj.timeout = setTimeout(() => {
            state = "SCROLL_RIGHT";
            startTime = performance.now();

            function step(now) {
                if (!track || !wrapper) return;

                const currentMaxScroll = track.scrollWidth - wrapper.clientWidth;
                if (currentMaxScroll <= 2 || wrapper.clientWidth <= 0) {
                    track.style.transform = "translateX(0px)";
                    return;
                }

                if (state === "SCROLL_RIGHT") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    track.style.transform = `translateX(${-progress * currentMaxScroll}px)`;

                    if (progress >= 1) {
                        state = "WAIT_END";
                        handleObj.timeout = setTimeout(() => {
                            state = "SCROLL_LEFT";
                            startTime = performance.now();
                            handleObj.raf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                } else if (state === "SCROLL_LEFT") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    track.style.transform = `translateX(${-(1 - progress) * currentMaxScroll}px)`;

                    if (progress >= 1) {
                        state = "WAIT_START";
                        handleObj.timeout = setTimeout(() => {
                            state = "SCROLL_RIGHT";
                            startTime = performance.now();
                            handleObj.raf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                }

                handleObj.raf = requestAnimationFrame(step);
            }

            handleObj.raf = requestAnimationFrame(step);
        }, PAUSE_DURATION);
    }, 300);
}

function applyPlaylistScrolling() {
    marqueeHandles.playlist.forEach((h, i) => stopPingPongMarquee('playlist', i));
    marqueeHandles.playlist = [];

    const wrappers = document.querySelectorAll(".playlist-title-wrapper");
    wrappers.forEach((wrapper, index) => {
        const track = wrapper.querySelector(".playlist-title-track");
        if (track) {
            const text = track.textContent.trim();
            createPingPongMarquee(wrapper, track, text, 'playlist', index);
        }
    });
}

function setScrollingTitle(title) {
    const wrapper = document.getElementById("media-title-wrapper");
    const track = document.getElementById("media-title-track");
    createPingPongMarquee(wrapper, track, title, 'title');
}

function setScrollingAlbum(album) {
    const wrapper = document.getElementById("media-album-wrapper");
    const track = document.getElementById("media-album-track");
    createPingPongMarquee(wrapper, track, album, 'album');
}

function setScrollingArtist(artist) {
    const wrapper = document.getElementById("media-artist-wrapper");
    const track = document.getElementById("media-artist-track");
    createPingPongMarquee(wrapper, track, artist, 'artist');
}


/* ==========================================================================
   11. PANEL RENDERERS (INFO & SETTINGS)
   ========================================================================== */

function getSongCoverImage(songPath, tags) {
    if (isGifIconEnabled && songPath && songGifs[songPath]) {
        return songGifs[songPath];
    }

    if (tags && tags['picture'] && tags['picture']['data']) {
        try {
            return getPictureFromTags(tags);
        } catch (e) {
            console.log("Image tag error:", e);
        }
    }

    return "assets/icons/inaba_512.png";
}

function refreshCurrentSongCover() {
    if (!currentSong) return;

    const songPath = songPaths[currentSongIndex];
    const coverImage = getSongCoverImage(songPath, currentSong.tags);

    imageDisplay.style.backgroundImage = `url("${coverImage}")`;

    const infoCover = document.getElementById("info-cover");
    if (infoCover) {
        infoCover.style.backgroundImage = `url("${coverImage}")`;
    }
}

function updatePlayer(title, album, artist, year, image, songDuration) {
    setScrollingTitle(title || "Unknown Title");
    setScrollingAlbum(album || "Unknown Album");

    if (artist && artist.includes("/")) {
        artist = artist.split("/").join(", ");
    }

    setScrollingArtist(artist || "Unknown Artist");

    yearDisplay.textContent = formatYear(year);
    imageDisplay.style.backgroundImage = `url(${image})`;
    duration.textContent = songDuration;

    syncStaticPlayPauseUI();
    updateInfoPanel(currentSong ? currentSong.tags : {}, currentSong ? currentSong.audio : null, image);
}

function updateInfoPanel(tags, audio, image) {
    tags = tags || {};
    const title = tags['title'] || songPaths[currentSongIndex].slice(0, -4);
    const artist = tags['artist'] || "Inabakumori";

    document.getElementById("info-title").textContent = title;
    document.getElementById("info-artist").textContent = artist;

    const cover = image || "assets/icons/inaba_512.png";
    document.getElementById("info-cover").style.backgroundImage = `url("${cover}")`;

    currentCategoryIndex = 0;
    renderInfo();
}

function renderInfo() {
    const cat = categories[currentCategoryIndex];
    categoryTitle.textContent = cat;

    let html = "";

    const tags = (currentSong && currentSong.tags) ? currentSong.tags : {};
    const songTitle = tags['title'] || songPaths[currentSongIndex].slice(0, -4);

    if (cat === "Description") {
        html += row("Title", songTitle);
        html += row("Subtitle", tags['album'] || "Inabakumori Songs");
        html += row("Rating", "★★★★★");
        const commentObj = tags['comment'];
        const commentVal = (commentObj && typeof commentObj === 'object' && commentObj['text']) ? commentObj['text'] : (typeof commentObj === 'string' ? commentObj : "None");
        html += row("Comments", commentVal);
    }

    if (cat === "Audio") {
        html += row("Bitrate", "320kbps");
        html += row("Channels", "2 (stereo)");
        html += row("Sample rate", "48000 Hz");
    }

    if (cat === "Media") {
        html += row("Album", tags['album'] || "Inabakumori Songs");
        html += row("Year", tags['year'] || "Unknown");
        html += row("Genre", tags['genre'] || "Vocaloid");
        html += row("Track", tags['track'] || (currentSongIndex + 1));
    }

    if (cat === "Origin") {
        html += row("Publisher", getTagValue(tags['TPUB']));
        html += row("Encoded by", getTagValue(tags['TENC']));
    }

    if (cat === "Content") {
        html += row("Composer", getTagValue(tags['TCOM']));
        html += row("BPM", getTagValue(tags['TBPM']));
        html += row("Genre", tags['genre'] || "Vocaloid");
    }

    contentDisplay.innerHTML = html;
    updateArrowUI();
    startAutoScrollInfo();
}

function updateArrowUI() {
    const prev = document.getElementById("info-prev");
    const next = document.getElementById("info-next");

    if (currentCategoryIndex === 0) {
        prev.style.opacity = "0";
        prev.style.pointerEvents = "none";
    } else {
        prev.style.opacity = "1";
        prev.style.pointerEvents = "auto";
    }

    if (currentCategoryIndex === categories.length - 1) {
        next.style.opacity = "0";
        next.style.pointerEvents = "none";
    } else {
        next.style.opacity = "1";
        next.style.pointerEvents = "auto";
    }
}

function renderSettings() {
    const container = document.getElementById("settings-content");
    if (!container) return;

    if (container.querySelector('#setting-crossfade-row')) {
        updateSettingsUIValues();
        return;
    }

    let html = "";

    html += `
        <div class="settings-row-item ${isAppsConnectEnabled ? 'disabled' : ''}" id="setting-gif-row">
            <div class="settings-row-main">
                <span>GIF Icon</span>
                <span class="settings-toggle ${userGifPreference ? 'active' : ''}">
                    ${userGifPreference ? 'ON' : 'OFF'}
                </span>
            </div>
        </div>
    `;

    html += `
        <div class="settings-row-item ${isAppsConnectEnabled ? 'disabled' : ''}" id="setting-crossfade-row">
            <div class="settings-row-main" id="setting-crossfade-header">
                <span>Crossfade Song</span>
                <span class="settings-toggle ${isCrossfadeEnabled ? 'active' : ''}">
                    ${isCrossfadeEnabled ? 'ON' : 'OFF'}
                </span>
            </div>
            <div class="crossfade-control-wrapper ${isCrossfadeEnabled ? 'expanded' : ''}" id="crossfade-control-wrapper">
                <div class="crossfade-slider-header">
                    <span>Duration</span>
                    <span id="crossfade-val-text">${crossfadeDuration}s</span>
                </div>
                <input type="range" id="crossfade-slider" min="1" max="10" value="${crossfadeDuration}">
            </div>
        </div>
    `;

    html += `
        <div class="settings-row-item" id="setting-visualizer-row">
            <div class="settings-row-main">
                <span>Audio Visualizer</span>
                <span class="settings-toggle ${isVisualizerEnabled ? 'active' : ''}">
                    ${isVisualizerEnabled ? 'ON' : 'OFF'}
                </span>
            </div>
        </div>
    `;

    html += `
        <div class="settings-row-item" id="setting-apps-row">
            <div class="settings-row-main">
                <span>APPs Connect (Beta)</span>
                <span class="settings-toggle ${isAppsConnectEnabled ? 'active' : ''}">
                    ${isAppsConnectEnabled ? 'ON' : 'OFF'}
                </span>
            </div>
        </div>
    `;

    container.innerHTML = html;

    bindSettingsEvents();
    updateCrossfadeSliderFill(crossfadeDuration);
}

function updateSettingsUIValues() {
    const gifToggle = document.querySelector("#setting-gif-row .settings-toggle");
    const gifRow = document.getElementById("setting-gif-row");
    if (gifRow && gifToggle) {
        if (isAppsConnectEnabled) {
            gifRow.classList.add("disabled");
        } else {
            gifRow.classList.remove("disabled");
        }
        gifToggle.textContent = userGifPreference ? 'ON' : 'OFF';
        gifToggle.className = `settings-toggle ${userGifPreference ? 'active' : ''}`;
    }

    const crossfadeRow = document.getElementById("setting-crossfade-row");
    const crossfadeHeader = document.getElementById("setting-crossfade-header");
    const crossfadeToggle = document.querySelector("#setting-crossfade-header .settings-toggle");
    const crossfadeWrapper = document.getElementById("crossfade-control-wrapper");

    if (crossfadeRow && crossfadeHeader && crossfadeToggle && crossfadeWrapper) {
        if (isAppsConnectEnabled) {
            crossfadeRow.classList.add("disabled");
        } else {
            crossfadeRow.classList.remove("disabled");
        }
        crossfadeToggle.textContent = isCrossfadeEnabled ? 'ON' : 'OFF';
        crossfadeToggle.className = `settings-toggle ${isCrossfadeEnabled ? 'active' : ''}`;

        if (isCrossfadeEnabled) {
            crossfadeWrapper.classList.add("expanded");
        } else {
            crossfadeWrapper.classList.remove("expanded");
        }
    }

    const visualizerToggle = document.querySelector("#setting-visualizer-row .settings-toggle");
    if (visualizerToggle) {
        visualizerToggle.textContent = isVisualizerEnabled ? 'ON' : 'OFF';
        visualizerToggle.className = `settings-toggle ${isVisualizerEnabled ? 'active' : ''}`;
    }

    const appsToggle = document.querySelector("#setting-apps-row .settings-toggle");
    if (appsToggle) {
        appsToggle.textContent = isAppsConnectEnabled ? 'ON' : 'OFF';
        appsToggle.className = `settings-toggle ${isAppsConnectEnabled ? 'active' : ''}`;
    }

    updateCrossfadeSliderFill(crossfadeDuration);
}

function bindSettingsEvents() {
    const gifRow = document.getElementById("setting-gif-row");
    if (gifRow) {
        gifRow.onclick = () => {
            if (isAppsConnectEnabled) return;

            userGifPreference = !userGifPreference;
            isGifIconEnabled = userGifPreference;
            refreshCurrentSongCover();
            updateSettingsUIValues();
        };
    }

    const crossfadeHeader = document.getElementById("setting-crossfade-header");
    if (crossfadeHeader) {
        crossfadeHeader.onclick = () => {
            if (isAppsConnectEnabled || isExpandAnimating) return;

            isExpandAnimating = true;
            isCrossfadeEnabled = !isCrossfadeEnabled;

            updateSettingsUIValues();

            setTimeout(() => {
                isExpandAnimating = false;
                if (isCrossfadeEnabled) {
                    startAutoScrollSettings();
                } else {
                    stopAutoScrollSettings();
                }
            }, 1500);
        };
    }

    const crossfadeSlider = document.getElementById("crossfade-slider");
    if (crossfadeSlider) {
        crossfadeSlider.oninput = (e) => {
            crossfadeDuration = parseInt(e.target.value, 10);
            const valText = document.getElementById("crossfade-val-text");
            if (valText) valText.textContent = `${crossfadeDuration}s`;
            updateCrossfadeSliderFill(crossfadeDuration);
        };
    }

    const visualizerRow = document.getElementById("setting-visualizer-row");
    if (visualizerRow) {
        visualizerRow.onclick = () => {
            isVisualizerEnabled = !isVisualizerEnabled;
            window.isVisualizerEnabled = isVisualizerEnabled;

            const visualizerCanvas = document.getElementById('audiovisualizer');
            if (visualizerCanvas && !isVisualizerEnabled) {
                const ctx = visualizerCanvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            }

            updateSettingsUIValues();
        };
    }

    const appsRow = document.getElementById("setting-apps-row");
    if (appsRow) {
        appsRow.onclick = () => {
            if (isExpandAnimating) return;

            let wasCrossfadeOpen = isCrossfadeEnabled;
            isAppsConnectEnabled = !isAppsConnectEnabled;

            if (isAppsConnectEnabled) {
                if (!gifStateBackup && userGifPreference) {
                    gifStateBackup = true;
                }
                if (!crossfadeStateBackup && isCrossfadeEnabled) {
                    crossfadeStateBackup = true;
                }
                isGifIconEnabled = false;
                isCrossfadeEnabled = false;

                if (wasCrossfadeOpen) {
                    isExpandAnimating = true;
                    updateSettingsUIValues();

                    setTimeout(() => {
                        isExpandAnimating = false;
                        handleConnectStateChange();
                        stopAutoScrollSettings();
                    }, 1500);
                    return;
                }
            } else {
                userGifPreference = gifStateBackup;
                isGifIconEnabled = gifStateBackup;
                gifStateBackup = false;

                isCrossfadeEnabled = crossfadeStateBackup;
                crossfadeStateBackup = false;
            }

            updateSettingsUIValues();
            handleConnectStateChange();

            if (isCrossfadeEnabled) {
                setTimeout(() => {
                    startAutoScrollSettings();
                }, 1500);
            } else {
                stopAutoScrollSettings();
            }
        };
    }
}

function handleConnectStateChange() {
    lastTrackKey = "";

    if (isAppsConnectPlaying()) {
        stopSong();
        let startPercent = parseFloat(slider.value) || 0;
        updateSystemMediaPlayer();
        startAppsTimer();
        animateSliderToAudio(startPercent, 1500);
    } else {
        stopAppsTimer();
        updateAppsUIState();
        refreshCurrentSongCover();

        let startPercent = parseFloat(slider.value) || 0;

        if (currentSong && currentSong.tags) {
            updatePlayer(
                (currentSong.tags && currentSong.tags.title) || songPaths[currentSongIndex].slice(0, -4),
                (currentSong.tags && currentSong.tags.album) || "Inabakumori Songs",
                (currentSong.tags && currentSong.tags.artist) || "Inabakumori",
                (currentSong.tags && currentSong.tags.year) || "",
                getSongCoverImage(songPaths[currentSongIndex], currentSong.tags),
                convertSecondsToMinute(currentSong.audio.duration)
            );
        }
        syncStaticPlayPauseUI();

        if (currentSong && currentSong.audio && !isNaN(currentSong.audio.duration)) {
            animateSliderToAudio(startPercent, 1500);
        } else {
            clearSlider();
        }
    }
}


/* ==========================================================================
   12. UTILITY & HELPER FUNCTIONS
   ========================================================================== */

function loadAudio(audioFileName) {
    return new Promise((resolve, reject) => {
        fetch(audioFileName)
            .then(response => {
                if (!response.ok) throw new Error("File not found: " + audioFileName);
                return response.arrayBuffer();
            })
            .then(data => {
                const blob = new Blob([data]);
                const songAudio = new Audio(audioFileName);
                const tagHandlers = {};
                tagHandlers['on' + 'Success'] = (tags) => {
                    resolve({ tags: (tags && tags['tags']) || {}, audio: songAudio });
                };
                tagHandlers['on' + 'Error'] = () => {
                    resolve({ tags: {}, audio: songAudio });
                };
                jsmediatags.read(blob, tagHandlers);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function getPictureFromTags(tags) {
    if (!tags || !tags['picture']) return "assets/icons/inaba_512.png";

    const imageData = tags['picture']['data'];
    const imageFormat = tags['picture']['format'];

    let base64string = '';
    for (let i = 0; i < imageData.length; i++) {
        base64string += String.fromCharCode(imageData[i]);
    }

    return `data:${imageFormat};base64,${window.btoa(base64string)}`;
}

function convertSecondsToMinute(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds === null || totalSeconds === undefined) {
        return "00:00";
    }

    let secondsRound = Math.round(totalSeconds);
    let minutes = Math.floor(secondsRound / 60);
    let seconds = secondsRound % 60;

    let minuteString = (minutes < 10 ? '0' : '') + minutes;
    let secondString = (seconds < 10 ? '0' : '') + seconds;

    return minuteString + ':' + secondString;
}

function formatYear(year) {
    if (!year) return "Unknown Release";

    const match = String(year).match(/\d{4}/);
    if (!match) return "Unknown Release";

    const y = parseInt(match[0], 10);

    const now = new Date();
    const releaseDate = new Date(y, 0, 1);

    const diff = now - releaseDate;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return years === 1 ? "1 year ago" : `${years} years ago`;
    if (months > 0) return months === 1 ? "1 month ago" : `${months} months ago`;
    if (days > 0) return days === 1 ? "1 day ago" : `${days} day ago`;
    if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    if (minutes > 0) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    if (seconds > 5) return `${seconds} seconds ago`;

    return "New Release";
}

function getTagValue(tag) {
    if (!tag) return "Unknown";

    if (typeof tag === "string") return tag;

    if (typeof tag === "object") {
        if (tag['data']) return tag['data'];
        if (tag['text']) return tag['text'];
    }

    return "Unknown";
}

function row(label, value) {
    return `<div class="info-row">
        <span>${label}</span>
        <span>${value || "Unknown"}</span>
    </div>`;
}


/* ==========================================================================
   13. PAGE NAVIGATION OBSERVER
   ========================================================================== */

const selectorNav = document.getElementById('pageSelector');

function handlePageSelectorState() {
    if (!selectorNav) return;
    const isAtStart = selectorNav.classList.contains('at-start');

    if (!isAtStart) {
        if (typeof resetMusicPanels === 'function') {
            resetMusicPanels();
        }

        if (userGifPreference && isGifIconEnabled) {
            isGifIconEnabled = false;
            refreshCurrentSongCover();
            updateSettingsUIValues();
        }
    } else {
        if (userGifPreference && !isGifIconEnabled && !isAppsConnectEnabled) {
            isGifIconEnabled = true;
            refreshCurrentSongCover();
            updateSettingsUIValues();
        }
    }
}

if (selectorNav) {
    const musicObserver = new MutationObserver(() => {
        handlePageSelectorState();
    });

    musicObserver.observe(selectorNav, { attributes: true, attributeFilter: ['class'] });

    selectorNav.querySelectorAll('i').forEach(navBtn => {
        navBtn.addEventListener('click', () => {
            setTimeout(handlePageSelectorState, 50);
        });
    });
}


/* ==========================================================================
   14. PAGE LIFECYCLE & INITIALIZATION TRIGGER
   ========================================================================== */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof pageLoad === 'function' && !pageLoad.isLoaded) {
            pageLoad();
        }
    });
} else {
    if (typeof pageLoad === 'function' && !pageLoad.isLoaded) {
        pageLoad();
    }
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});