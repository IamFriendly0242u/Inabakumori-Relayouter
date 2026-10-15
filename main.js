/* ==========================================================================
   1. DOM ELEMENTS SELECTION
   ========================================================================== */

let background = document.getElementById('backgroundScroller');
let timeDisplay = document.getElementById('timeDisplay');
let time = document.getElementById('time');
let dateDisplay = document.getElementById('date');
let time1 = document.getElementById('time1');
let dateDisplay1 = document.getElementById('date1');
let timeDisplayBigger = document.getElementById('timeDisplayBigger');
let calendar = document.getElementById('calendar-wrapper');
let media = document.getElementById('media-wrapper');
let visualizerCanvas = document.getElementById('audiovisualizer');
let left = document.getElementById('left');
let center = document.getElementById('center');
let centerIcon = document.getElementById('centerIcon');
let right = document.getElementById('right');
let pageSelector = document.getElementById('pageSelector');


/* ==========================================================================
   2. GLOBAL STATE & NAVIGATION CONFIG
   ========================================================================== */

let scrollPercent = 0.5;
let lastPercent = 0.5;
let currentPercent = 0.5;
let isScrolling = false;
let draggingEnabled = true;
let isNavigatingToVideo = false;
let isIntroActive = true;

let hasMediaRevealed = false;
let hasCalendarRevealed = false;
window.hasMediaRevealed = false;

let mouse = {
    x: undefined,
    y: undefined,
    firstX: undefined,
    firstY: undefined
};

let scrollPositions = [0, 0.5, 1];
let scrollIndex = 1;

let isRefreshingConnection = false;
const ONLINE_ICON = 'assets/icons/icons8-video-32.png';
const OFFLINE_ICON = 'assets/icons/icons8-no-wifi-32.png';


/* ==========================================================================
   3. UNIVERSAL GRADUAL AUDIO FADEOUT ENGINE
   ========================================================================== */

function fadeAudioToZero(durationMs = 2800) {
    let audioEl = (typeof currentSong !== 'undefined' && currentSong && currentSong.audio) ? currentSong.audio : null;
    let fadingEl = (typeof fadingAudioInstance !== 'undefined' && fadingAudioInstance) ? fadingAudioInstance : null;

    let startVol = audioEl ? audioEl.volume : 0;
    let startFadingVol = fadingEl ? fadingEl.volume : 0;
    let startTime = performance.now();

    let fadeTimer = setInterval(() => {
        let elapsed = performance.now() - startTime;
        let progress = Math.min(elapsed / durationMs, 1);
        let factor = 1 - progress;

        if (audioEl) audioEl.volume = Math.max(0, startVol * factor);
        if (fadingEl) fadingEl.volume = Math.max(0, startFadingVol * factor);

        if (progress >= 1) {
            clearInterval(fadeTimer);
            if (typeof stopSong === 'function') {
                stopSong();
            }
        }
    }, 25);
}


/* ==========================================================================
   4. EVENT LISTENERS (CLICK & DRAG)
   ========================================================================== */

left.addEventListener("click", () => {
    if (isNavigatingToVideo || isIntroActive) return;
    scrollIndex--;
    if (scrollIndex < 0) scrollIndex = 0;
    scrollPercent = scrollPositions[scrollIndex];
    lastPercent = scrollPercent;
});

if (center) {
    center.addEventListener("click", () => {
        if (isNavigatingToVideo || isIntroActive) return;

        if (checkInternetStatus()) {
            isNavigatingToVideo = true;
            draggingEnabled = false;

            scrollIndex = 1;
            scrollPercent = 0.5;
            lastPercent = 0.5;

            fadeAudioToZero(2000);

            setTimeout(() => {
                if (pageSelector) {
                    pageSelector.classList.add("closing-center");
                }
            }, 500);

            setTimeout(() => {
                if (pageSelector) {
                    pageSelector.classList.add("closing-sides");
                }
            }, 1000);

            setTimeout(() => {
                if (timeDisplayBigger) {
                    timeDisplayBigger.classList.add("exit-clock-down");
                }
                if (timeDisplay) {
                    timeDisplay.classList.add("exit-clock-down");
                }
            }, 1500);

            setTimeout(() => {
                if (visualizerCanvas) {
                    visualizerCanvas.classList.add("exit-fade");
                }
                if (background) {
                    background.classList.add("dim-out");
                }
            }, 2000);

            setTimeout(() => {
                window.location.href = 'video/video-player.html';
            }, 2600);

        } else {
            if (!isRefreshingConnection) {
                triggerConnectionRefresh();
            }
            scrollIndex = 1;
            scrollPercent = scrollPositions[scrollIndex];
            lastPercent = scrollPercent;
        }
    });
}

right.addEventListener("click", () => {
    if (isNavigatingToVideo || isIntroActive) return;
    scrollIndex++;
    if (scrollIndex > 2) scrollIndex = 2;
    scrollPercent = scrollPositions[scrollIndex];
    lastPercent = scrollPercent;
});

document.addEventListener("mousedown", (event) => {
    if (isNavigatingToVideo || isIntroActive) return;
    mouse.firstX = event.clientX;
    mouse.firstY = event.clientY;
    isScrolling = true;
});

document.addEventListener("mouseup", () => {
    if (isNavigatingToVideo || isIntroActive) return;
    isScrolling = false;
    mouse = {
        x: undefined,
        y: undefined,
        firstX: undefined,
        firstY: undefined
    };
    lastPercent = scrollPercent;
});

document.addEventListener("mousemove", (event) => {
    if (draggingEnabled && !isNavigatingToVideo && !isIntroActive) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        if (mouse.firstX && mouse.firstY) {
            let mouseMove = mouse.firstX - mouse.x;
            let newPercent = mouseMove / (window.innerWidth / 1);

            scrollPercent = newPercent + lastPercent;

            if (scrollPercent > 1) scrollPercent = 1;
            if (scrollPercent < 0) scrollPercent = 0;
        }
    }
});


/* ==========================================================================
   5. INTERNET CONNECTION & CENTER BUTTON REFRESH SYSTEM
   ========================================================================== */

function checkInternetStatus() {
    return navigator.onLine;
}

function updateCenterIcon() {
    if (centerIcon) {
        if (checkInternetStatus()) {
            centerIcon.src = ONLINE_ICON;
        } else {
            centerIcon.src = OFFLINE_ICON;
        }
    }
}

function triggerConnectionRefresh() {
    if (isRefreshingConnection || !center) return;
    isRefreshingConnection = true;

    center.classList.add("refresh-hide");

    setTimeout(() => {
        updateCenterIcon();
        center.classList.remove("refresh-hide");
        isRefreshingConnection = false;
    }, 3000);
}

window.addEventListener("online", () => {
    triggerConnectionRefresh();
});

window.addEventListener("offline", () => {
    triggerConnectionRefresh();
});

updateCenterIcon();


/* ==========================================================================
   6. ANIMATION LOOP & SEQUENTIAL NAVIGATION STATES
   ========================================================================== */

update();

function update() {
    if (Math.abs(currentPercent - scrollPercent) > 0.0005) {
        currentPercent = lerp(currentPercent, scrollPercent, 0.05);
    } else {
        currentPercent = scrollPercent;
    }

    if (scrollPercent <= 0.55 && scrollPercent >= 0.45) {
        timeDisplay.classList.add("down");
        timeDisplayBigger.classList.remove("down");
    } else {
        timeDisplay.classList.remove("down");
        timeDisplayBigger.classList.add("down");
    }

    if (!hasMediaRevealed && currentPercent <= 0.15) {
        hasMediaRevealed = true;
        window.hasMediaRevealed = true;
        if (media) media.classList.remove("widget-down");
        setTimeout(() => {
            if (typeof startFirstLoadCountdown === 'function') {
                startFirstLoadCountdown();
            }
        }, 500);
    }

    if (!hasCalendarRevealed && currentPercent >= 0.85) {
        hasCalendarRevealed = true;
        if (calendar) calendar.classList.remove("widget-down");
    }

    if (!isIntroActive) {
        if (currentPercent <= 0.08) {
            scrollIndex = 0;
            if (pageSelector) {
                pageSelector.classList.add("at-start");
                pageSelector.classList.remove("at-center", "at-end");
            }
        } else if (currentPercent >= 0.92) {
            scrollIndex = 2;
            if (pageSelector) {
                pageSelector.classList.add("at-end");
                pageSelector.classList.remove("at-start", "at-center");
            }
        } else if (currentPercent >= 0.42 && currentPercent <= 0.58) {
            scrollIndex = 1;
            if (pageSelector) {
                pageSelector.classList.add("at-center");
                pageSelector.classList.remove("at-start", "at-end");
            }
        } else {
            if (pageSelector) {
                pageSelector.classList.remove("at-start", "at-center", "at-end");
            }
        }
    }

    background.style.backgroundPositionX = (currentPercent * 100) + "%";

    timeDisplayBigger.style.transform = "translateX(calc(" + (((background.getBoundingClientRect().width) * -currentPercent) + background.getBoundingClientRect().width / 2) + "px - 50%))";
    calendar.style.transform = "translate(calc(" + (((background.getBoundingClientRect().width + 1500) * -currentPercent) + (background.getBoundingClientRect().width + 1500)) + "px - 50%), -50%)";
    media.style.transform = "translate(calc(" + (((background.getBoundingClientRect().width + 1500) * -currentPercent)) + "px - 50%), -50%)";

    requestAnimationFrame(update);
}

function lerp(current, target, smoothness) {
    return current + (target - current) * smoothness;
}


/* ==========================================================================
   7. MUSIC PLAYER AUTO-RESET SYSTEM
   ========================================================================== */

function resetMusicPanels() {
    let mediaContainer = document.getElementById('media-container');
    let mediaProperties = document.getElementById('media-properties');
    let mediaPlaylist = document.getElementById('media-playlist');
    let mediaInfoBtn = document.getElementById('media-info');

    if (mediaContainer) {
        mediaContainer.classList.remove('settings-open');
        mediaContainer.classList.remove('info-open');
    }

    if (mediaInfoBtn) {
        mediaInfoBtn.classList.remove('active');
    }

    if (mediaProperties && mediaPlaylist) {
        mediaProperties.classList.remove('hide-properties');
        mediaPlaylist.classList.add('hide-properties');
    }
}

if (pageSelector) {
    const musicObserver = new MutationObserver(() => {
        if (!pageSelector.classList.contains('at-start')) {
            resetMusicPanels();
        }
    });

    musicObserver.observe(pageSelector, { attributes: true, attributeFilter: ['class'] });

    pageSelector.querySelectorAll('i').forEach(navBtn => {
        navBtn.addEventListener('click', () => {
            setTimeout(() => {
                if (!pageSelector.classList.contains('at-start')) {
                    resetMusicPanels();
                }
            }, 50);
        });
    });
}


/* ==========================================================================
   8. INTRO CHOREOGRAPHY SEQUENCE & INITIALIZATION
   ========================================================================== */

document.body.classList.add("is-intro");
if (timeDisplayBigger) {
    timeDisplayBigger.classList.add("intro-clock-hide");
}
if (calendar) {
    calendar.classList.add("widget-down");
}
if (media) {
    media.classList.add("widget-down");
}

setTimeout(() => {
    if (timeDisplayBigger) {
        timeDisplayBigger.classList.remove("intro-clock-hide");
    }
}, 3000);

setTimeout(() => {
    if (pageSelector) {
        pageSelector.classList.add("sides-in");
    }
}, 3500);

setTimeout(() => {
    if (pageSelector) {
        pageSelector.classList.add("open-center");
    }
}, 4000);

setTimeout(() => {
    isIntroActive = false;
    document.body.classList.remove("is-intro");
    if (pageSelector) {
        pageSelector.classList.remove("sides-in", "open-center");
        pageSelector.classList.add("at-center");
    }
}, 4500);

if (sessionStorage.getItem('from_video_player') === 'true') {
    sessionStorage.removeItem('from_video_player');
}