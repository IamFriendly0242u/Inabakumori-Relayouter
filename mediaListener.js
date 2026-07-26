/* ==========================================================================
   1. DOM ELEMENTS SELECTION
   ========================================================================== */

let switchMenu = document.getElementById('switch-menu');
let settingsMenu = document.getElementById('settings-menu');
let mediaProperties = document.getElementById('media-properties');
let mediaPlaylist = document.getElementById('media-playlist');
let mediaPlaylistList = document.getElementById('media-playlist-list');
let imageDisplay = document.getElementById('media-image');
let albumDisplay = document.getElementById('media-album');
let titleDisplay = document.getElementById('media-title');
let artistDisplay = document.getElementById('media-artist');
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
let gifStateBackup = false;

let sliderUiFrame = null;
let isSeekingAnimation = false;

let isMouseDownOnSlider = false;
let sliderMouseDownX = 0;
let sliderMouseDownValue = 0;
let isDraggingSlider = false;

const songGifs = {
    '03. 『Pascal Beats』Vo. 歌愛ユキ.mp3': 'assets/gifs/03.gif',
    '04. 『Cooler Girl』Vo. 歌愛ユキ.mp3': 'assets/gifs/04.gif',
    '05. 『Loop Spinner』Vo. 歌愛ユキ.mp3': 'assets/gifs/05.gif',
    '06. 『Namida Denpa』Vo. 歌愛ユキ.mp3': 'assets/gifs/06.gif',
    '07. 『Tsukurikake no Shinshou』Vo. 歌愛ユキ.mp3': 'assets/gifs/07.gif',
    '11. 『Utsushi Asobi』Vo. 歌愛ユキ.mp3': 'assets/gifs/11.gif',
    '13. 『Non-Use』Vo. 歌愛ユキ & 初音ミク.mp3': 'assets/gifs/13.gif',
    '14. 『Himitsu Ongaku』Vo. 歌愛ユキ.mp3': 'assets/gifs/14.gif',
    '17. 『Rainy Boots』Vo. 歌愛ユキ.mp3': 'assets/gifs/17.gif',
    '18. 『Lagtrain』Vo. 歌愛ユキ.mp3': 'assets/gifs/18.gif',
    '25. 『Kimi ni Kaikisen』Vo. 歌愛ユキ.mp3': 'assets/gifs/25.gif',
    '29. 『Float Play』Vo. 歌愛ユキ.mp3': 'assets/gifs/29.gif',
    '34. 『Watashi wa Ame』Vo. 歌愛ユキ.mp3': 'assets/gifs/34.gif',
    '39. 『Spot Late』Vo. 歌愛ユキ.mp3': 'assets/gifs/39.gif'
};


/* ==========================================================================
   3. THUMBNAIL UPSCALER & SLIDER FILL HELPERS
   ========================================================================== */

function getHDThumbnail(url) {
    if (!url) return "assets/icons/inaba_512.png";

    if (url.includes('ytimg.com')) {
        return url.replace(/\/(hqdefault|mqdefault|sddefault|default)\.jpg/i, '/maxresdefault.jpg');
    }

    if (url.includes('ggpht.com') || url.includes('googleusercontent.com')) {
        return url
            .replace(/=w\d+-h\d+/g, '=w1000-h1000')
            .replace(/=s\d+/g, '=s1000');
    }

    return url;
}

function updateSliderFill(percent) {
    if (!slider) return;
    const safePercent = Math.max(0, Math.min(100, percent || 0));
    slider.style.background = `linear-gradient(to right, #ffffff ${safePercent}%, #000000 ${safePercent}%)`;
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

function getCleanAppName(appId, coverUrl, albumName, titleName) {
    let cleanApp = (appId || "").replace(/\.exe$/i, '').trim().toLowerCase();
    let cleanCover = (coverUrl || "").toLowerCase();
    let cleanAlbum = (albumName || "").toLowerCase();
    let cleanTitle = (titleName || "").toLowerCase();

    if (cleanApp.includes("youtube") ||
        cleanCover.includes("ytimg") ||
        cleanCover.includes("ggpht") ||
        cleanCover.includes("googleusercontent") ||
        cleanAlbum.includes("youtube") ||
        cleanTitle.includes("youtube")) {
        return "YouTube";
    }

    if (cleanApp.includes("chrome")) return "Chrome";
    if (cleanApp.includes("edge") || cleanApp.includes("msedge")) return "Edge";
    if (cleanApp.includes("firefox")) return "Firefox";
    if (cleanApp.includes("brave")) return "Brave";
    if (cleanApp.includes("opera")) return "Opera";
    if (cleanApp.includes("vlc")) return "VLC";

    if (cleanApp.includes("spotify") ||
        cleanCover.includes("spotify") ||
        cleanCover.includes("scdn.co") ||
        cleanAlbum.includes("spotify")) {
        return "Spotify";
    }

    if (!cleanApp) {
        return "APPs Connect";
    }

    return cleanApp.charAt(0).toUpperCase() + cleanApp.slice(1);
}

if (window.wallpaperRegisterMediaPropertiesListener) {
    window.wallpaperRegisterMediaPropertiesListener((event) => {
        systemMediaData.title = event.title || "Unknown Title";
        systemMediaData.artist = event.artist || "Unknown Artist";
        systemMediaData.album = event.subTitle || event.albumTitle || "Single Track";
        systemMediaData.appId = (event.appId || "").toLowerCase();

        if (isAppsConnectPlaying()) {
            updateSystemMediaPlayer();
        } else if (isAppsConnectEnabled) {
            updateAppsUIState();
        }
    });
}

if (window.wallpaperRegisterMediaThumbnailListener) {
    window.wallpaperRegisterMediaThumbnailListener((event) => {
        let rawCover = event.thumbnail || "assets/icons/inaba_512.png";
        systemMediaData.cover = getHDThumbnail(rawCover);

        if (isAppsConnectPlaying()) {
            imageDisplay.style.backgroundImage = `url("${systemMediaData.cover}")`;
            const infoCover = document.getElementById("info-cover");
            if (infoCover) {
                infoCover.style.backgroundImage = `url("${systemMediaData.cover}")`;
            }
            yearDisplay.textContent = getCleanAppName(
                systemMediaData.appId,
                systemMediaData.cover,
                systemMediaData.album,
                systemMediaData.title
            );
        }
    });
}

if (window.wallpaperRegisterMediaTimelineListener) {
    window.wallpaperRegisterMediaTimelineListener((event) => {
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

if (window.wallpaperRegisterMediaPlaybackListener) {
    window.wallpaperRegisterMediaPlaybackListener(wallpaperMediaPlaybackListener);
}

function updateAppsUIState() {
    if (!mediaWrapper) mediaWrapper = document.getElementById('media-wrapper');
    let isActive = isAppsConnectPlaying();

    if (mediaWrapper) {
        if (isActive) {
            mediaWrapper.classList.add('apps-active', 'spotify-active');
            if (slider) slider.style.pointerEvents = 'none';
        } else {
            mediaWrapper.classList.remove('apps-active', 'spotify-active');
            if (slider) slider.style.pointerEvents = 'auto';
            updateLyricUI("", "");
            lastTrackKey = "";
        }
    }
}

function parseLRC(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const result = [];
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    for (let line of lines) {
        const match = line.match(regex);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);
            const time = minutes * 60 + seconds + (milliseconds > 99 ? milliseconds / 1000 : milliseconds / 100);
            const text = match[4].trim();
            result.push({ time, text });
        }
    }
    return result.sort((a, b) => a.time - b.time);
}

function fetchSyncedLyrics(title, artist) {
    const trackKey = `${title}-${artist}`;
    if (lastTrackKey === trackKey) return;
    lastTrackKey = trackKey;

    syncedLyricsMemory = [];
    updateLyricUI("Searching lyrics...", "");

    const cleanTitle = encodeURIComponent(title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim());
    const cleanArtist = encodeURIComponent((artist || "").split(',')[0].split('/')[0].split('-')[0].trim());

    fetch(`https://lrclib.net/api/get?track_name=${cleanTitle}&artist_name=${cleanArtist}`)
        .then(res => {
            if (!res.ok) throw new Error("Lyrics not found");
            return res.json();
        })
        .then(data => {
            if (data && data.syncedLyrics) {
                syncedLyricsMemory = parseLRC(data.syncedLyrics);
                updateLyricUI("♪ " + title, "Enjoy the music!");
            } else {
                updateLyricUI("♪ No synced lyrics available", "");
            }
        })
        .catch(err => {
            console.log("Lyrics error:", err);
            updateLyricUI("♪ Lyrics unavailable", "");
        });
}

function updateLyricUI(currentText, nextText) {
    const wrapper = document.getElementById("media-lyrics-wrapper");
    const currentEl = document.getElementById("media-lyric-current");
    const nextEl = document.getElementById("media-lyric-next");

    if (!wrapper || !currentEl || !nextEl) return;

    if (!currentEl.textContent || currentText === "Searching lyrics..." || currentText.startsWith("♪ ")) {
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
            currentEl.textContent = currentText;
            nextEl.textContent = nextText;
            wrapper.classList.remove("slide-up");

            void wrapper.offsetWidth;
            wrapper.style.transition = "";
            isLyricAnimating = false;
        }, 350);
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
                    let currentIndex = -1;
                    for (let i = 0; i < syncedLyricsMemory.length; i++) {
                        if (currentPos >= syncedLyricsMemory[i].time) {
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
        }
    }, 150);
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

    yearDisplay.textContent = getCleanAppName(
        systemMediaData.appId,
        systemMediaData.cover,
        systemMediaData.album,
        systemMediaData.title
    );
    imageDisplay.style.backgroundImage = `url("${systemMediaData.cover}")`;

    updatePlayPauseUI(systemMediaData.isPlaying);

    if (isAppsConnectPlaying() && systemMediaData.title) {
        fetchSyncedLyrics(systemMediaData.title, systemMediaData.artist);
    }

    const infoTitle = document.getElementById("info-title");
    const infoArtist = document.getElementById("info-artist");
    const infoCover = document.getElementById("info-cover");

    if (infoTitle) infoTitle.textContent = systemMediaData.title;
    if (infoArtist) infoArtist.textContent = systemMediaData.artist;
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
let songCurrentDuration = 0;
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
            const targetTime = (targetPercent / 100) * currentSong.audio.duration;
            currentSong.audio.currentTime = targetTime;
        }

        animateSliderToAudio(sliderMouseDownValue, 1500);
    }

    isDraggingSlider = false;
    isDragging = false;
});

switchMenu.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;

    let needsDelay = false;

    if (mediaContainer.classList.contains("info-open")) {
        mediaContainer.classList.remove("info-open");
        infoButton.classList.remove("active");
        stopAutoScrollInfo();
        needsDelay = true;
    }

    if (mediaContainer.classList.contains("settings-open")) {
        mediaContainer.classList.remove("settings-open");
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
        }, 1100);
    } else {
        mediaContainer.classList.add("settings-open");
        renderSettings();
    }
});

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

playButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;
    startSong(currentSong);
});

pauseButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;
    stopSong();
});

nextButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;
    loadNextSong();
});

previousButton.addEventListener("click", () => {
    if (isAppsConnectPlaying()) return;
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
    let randomSong = songPaths[Math.floor(Math.random() * songPaths.length)];
    loadAudio("assets/musics/" + randomSong)
        .then(songProperties => {
            currentSong = { ...songProperties };
            currentSong.audio.addEventListener("loadedmetadata", () => {
                if (playAtStart) {
                    startSong(currentSong);
                } else {
                    stopSong();
                }
            });
            currentSong.audio.addEventListener("ended", songOnEndListener);
            currentSong.audio.load();

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
        })
        .catch(error => {
            console.error(error);
        });
    currentSongIndex = songPaths.indexOf(randomSong);
    pageLoad.isLoaded = true;
    updateArrowVisibility();
    updateSliderFill(0);
    isFirstLoad = false;
}


/* ==========================================================================
   8. AUDIO PLAYBACK CORE FUNCTIONS
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

    const songElement = event.currentTarget;
    let songPath = songElement.getAttribute("data-song-path");

    loadSong("assets/musics/" + songPath);
    toggleMenu();
    currentSongIndex = songPaths.indexOf(songPath);
}

function songOnEndListener() {
    if (playMode === 2) {
        currentSong.audio.currentTime = 0;
        currentSong.audio.play();
        return;
    }

    if (playMode === 1) {
        loadNextSong();
        return;
    }

    loadRandomSong();
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

    currentSong.audio.addEventListener("loadedmetadata", () => {
        startSong(currentSong);
    });

    currentSong.audio.addEventListener("ended", songOnEndListener);
    currentSong.audio.load();
}

function startSong(song) {
    clearInterval(songInterval);
    songInterval = setInterval(moveSongSlider, 500);

    let startPercent = parseFloat(slider.value) || 0;

    song.audio.volume = volume;

    song.audio.play().then(() => {
        updatePlayPauseUI(true);
    }).catch(err => {
        console.log("Play error:", err);
        updatePlayPauseUI(false);
    });

    const tags = song.tags || {};
    const songPath = songPaths[currentSongIndex];

    let image = getSongCoverImage(songPath, tags);

    setTimeout(() => {
        updatePlayer(
            tags.title || songPath.slice(0, -4),
            tags.album || "Inabakumori Songs",
            tags.artist || "Inabakumori",
            tags.year || "",
            image,
            convertSecondsToMinute(currentSong.audio.duration)
        );
    }, 600);

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
    if (sliderUiFrame) cancelAnimationFrame(sliderUiFrame);
    isSeekingAnimation = false;
    clearInterval(songInterval);
    updatePlayPauseUI(false);
}

function clearSlider() {
    clearInterval(songInterval);
    elapsedTime.innerHTML = "0:00";
    slider.value = 0;
    updateSliderFill(0);
}

function moveSongSlider() {
    if (isAppsConnectPlaying()) return;

    if (!currentSong || !currentSong.audio) return;
    if (isNaN(currentSong.audio.duration)) return;
    if (isDragging || isSeekingAnimation) return;

    const currentTime = currentSong.audio.currentTime;

    elapsedTime.innerHTML = convertSecondsToMinute(currentTime);

    const progress = (currentTime / currentSong.audio.duration) * 100;
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
}

function wallpaperMediaPlaybackListener(event) {
    isPlayingOtherMedia = (event.state == window.wallpaperMediaIntegration.PLAYBACK_PLAYING);
    systemMediaData.isPlaying = isPlayingOtherMedia;

    if (isPlayingOtherMedia) {
        if (isAppsConnectPlaying()) {
            stopSong();
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
        const maxScroll = track.scrollWidth - wrapper.clientWidth;
        if (maxScroll <= 2) return;

        const SPEED_PX_PER_SEC = 35;
        const scrollDuration = Math.max(1500, (maxScroll / SPEED_PX_PER_SEC) * 1000);
        const PAUSE_DURATION = 3000;

        let state = "WAIT_START";
        let startTime = null;

        handleObj.timeout = setTimeout(() => {
            state = "SCROLL_RIGHT";
            startTime = performance.now();

            function step(now) {
                if (!track) return;

                if (state === "SCROLL_RIGHT") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    track.style.transform = `translateX(${-progress * maxScroll}px)`;

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
                    track.style.transform = `translateX(${-(1 - progress) * maxScroll}px)`;

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
    }, 50);
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

    if (tags && tags.picture && tags.picture.data) {
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
    const title = tags.title || songPaths[currentSongIndex].slice(0, -4);
    const artist = tags.artist || "Inabakumori";

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
    const songTitle = tags.title || songPaths[currentSongIndex].slice(0, -4);

    if (cat === "Description") {
        html += row("Title", songTitle);
        html += row("Subtitle", tags.album || "Inabakumori Songs");
        html += row("Rating", "★★★★★");
        html += row("Comments", (tags.comment && tags.comment.text) || "None");
    }

    if (cat === "Audio") {
        html += row("Bitrate", "320kbps");
        html += row("Channels", "2 (stereo)");
        html += row("Sample rate", "48000 Hz");
    }

    if (cat === "Media") {
        html += row("Album", tags.album || "Inabakumori Songs");
        html += row("Year", tags.year || "Unknown");
        html += row("Genre", tags.genre || "Vocaloid");
        html += row("Track", tags.track || (currentSongIndex + 1));
    }

    if (cat === "Origin") {
        html += row("Publisher", getTagValue(tags.TPUB));
        html += row("Encoded by", getTagValue(tags.TENC));
    }

    if (cat === "Content") {
        html += row("Composer", getTagValue(tags.TCOM));
        html += row("BPM", getTagValue(tags.TBPM));
        html += row("Genre", tags.genre || "Vocaloid");
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

    let html = "";

    html += `
        <div class="info-row settings-row ${isAppsConnectEnabled ? 'disabled' : ''}" id="setting-gif-row" style="cursor: ${isAppsConnectEnabled ? 'not-allowed' : 'pointer'}; margin-bottom: 8px;">
            <span>GIF Icon</span>
            <span class="settings-toggle ${isGifIconEnabled ? 'active' : ''}">
                ${isGifIconEnabled ? 'ON' : 'OFF'}
            </span>
        </div>
    `;

    html += `
        <div class="info-row settings-row" id="setting-apps-row" style="cursor: pointer;">
            <span>APPs Connect (Beta)</span>
            <span class="settings-toggle ${isAppsConnectEnabled ? 'active' : ''}">
                ${isAppsConnectEnabled ? 'ON' : 'OFF'}
            </span>
        </div>
    `;

    container.innerHTML = html;

    const gifRow = document.getElementById("setting-gif-row");
    if (gifRow) {
        gifRow.onclick = () => {
            if (isAppsConnectEnabled) return;

            isGifIconEnabled = !isGifIconEnabled;
            refreshCurrentSongCover();
            renderSettings();
        };
    }

    const appsRow = document.getElementById("setting-apps-row");
    if (appsRow) {
        appsRow.onclick = () => {
            isAppsConnectEnabled = !isAppsConnectEnabled;

            if (isAppsConnectEnabled) {
                if (!gifStateBackup && isGifIconEnabled) {
                    gifStateBackup = true;
                }
                isGifIconEnabled = false;
            } else {
                isGifIconEnabled = gifStateBackup;
                gifStateBackup = false;
            }

            renderSettings();
            handleConnectStateChange();
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
                jsmediatags.read(blob, {
                    onSuccess: (tags) => {
                        resolve({ tags: tags.tags || {}, audio: songAudio });
                    },
                    onError: (error) => {
                        console.log("jsmediatags error:", error);
                        resolve({ tags: {}, audio: songAudio });
                    }
                });
            })
            .catch(error => {
                console.error("Audio load error:", error);
                reject(error);
            });
    });
}

function getPictureFromTags(tags) {
    if (!tags || !tags.picture) return "assets/icons/inaba_512.png";

    const imageData = tags.picture.data;
    const imageFormat = tags.picture.format;

    let base64string = '';
    for (let i = 0; i < imageData.length; i++) {
        base64string += String.fromCharCode(imageData[i]);
    }

    return `data:${imageFormat};base64,${window.btoa(base64string)}`;
}

function convertSecondsToMinute(totalSeconds) {
    let secondsRound = Math.round(totalSeconds);
    let minutes = Math.floor(secondsRound / 60);
    let seconds = secondsRound % 60;

    let minuteString = (minutes < 10 ? '0' : '') + minutes;
    let secondString = (seconds < 10 ? '0' : '') + seconds;

    let resultString = minuteString + ':' + secondString;
    return resultString;
}

function formatYear(year) {
    if (!year) return "Unknown Release";

    const match = String(year).match(/\d{4}/);
    if (!match) return "Unknown Release";

    const y = parseInt(match[0]);

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

    if (tag.data) return tag.data;

    if (tag.text) return tag.text;

    return "Unknown";
}

function row(label, value) {
    return `<div class="info-row">
        <span>${label}</span>
        <span>${value || "Unknown"}</span>
    </div>`;
}