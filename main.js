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
   3. EVENT LISTENERS (CLICK & DRAG)
   ========================================================================== */

left.addEventListener("click", () => {
    scrollIndex--;
    if (scrollIndex < 0) scrollIndex = 0;
    scrollPercent = scrollPositions[scrollIndex];
    lastPercent = scrollPercent;
});

if (center) {
    center.addEventListener("click", () => {
        if (!isRefreshingConnection) {
            triggerConnectionRefresh();
        }
        scrollIndex = 1;
        scrollPercent = scrollPositions[scrollIndex];
        lastPercent = scrollPercent;
    });
}

right.addEventListener("click", () => {
    scrollIndex++;
    if (scrollIndex > 2) scrollIndex = 2;
    scrollPercent = scrollPositions[scrollIndex];
    lastPercent = scrollPercent;
});

document.addEventListener("mousedown", (event) => {
    mouse.firstX = event.clientX;
    mouse.firstY = event.clientY;
    isScrolling = true;
});

document.addEventListener("mouseup", () => {
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
    if (draggingEnabled) {
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
   4. INTERNET CONNECTION & CENTER BUTTON REFRESH SYSTEM
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
   5. ANIMATION LOOP & SEQUENTIAL NAVIGATION STATES
   ========================================================================== */

update();

function update() {
    if (Math.abs(currentPercent - scrollPercent) > 0.0005) {
        currentPercent = lerp(currentPercent, scrollPercent, 0.05);
    }

    if (scrollPercent <= 0.55 && scrollPercent >= 0.45) {
        timeDisplay.classList.add("down");
        timeDisplayBigger.classList.remove("down");
    } else {
        timeDisplay.classList.remove("down");
        timeDisplayBigger.classList.add("down");
    }

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
   6. MUSIC PLAYER AUTO-RESET SYSTEM
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