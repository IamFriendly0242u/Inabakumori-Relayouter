/* ==========================================================================
   1. DOM ELEMENTS SELECTION & GLOBAL STATE
   ========================================================================== */

const tabInaba = document.getElementById('tab-inaba-mode');
const tabCustom = document.getElementById('tab-custom-mode');
const modeTabIndicator = document.getElementById('mode-tab-indicator');
const searchBoxContainer = document.getElementById('search-box-container');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const btnSettings = document.getElementById('btn-settings');
const btnBackHome = document.getElementById('btn-back-home');

const virtualKeyboard = document.getElementById('virtual-keyboard');
const vkBtnClose = document.getElementById('vk-btn-close');
const vkTargetIndicator = document.getElementById('vk-target-indicator');
const vkKeyBackspace = document.getElementById('vk-key-backspace');
const vkKeyClear = document.getElementById('vk-key-clear');
const vkKeyCaps = document.getElementById('vk-key-caps');
const vkKeyLeft = document.getElementById('vk-key-left');
const vkKeyRight = document.getElementById('vk-key-right');
const vkKeySpace = document.getElementById('vk-key-space');
const vkKeyDone = document.getElementById('vk-key-done');

const videoModal = document.getElementById('video-modal');
const modalScreen = document.getElementById('modal-screen');
const modalVideoTitle = document.getElementById('modal-video-title');
const modalChannel = document.getElementById('modal-channel');
const modalMeta = document.getElementById('modal-meta');
const modalAvatar = document.getElementById('modal-avatar');
const modalTag = document.getElementById('modal-tag');
const modalCloseBtn = document.getElementById('modal-close');
const btnYoutubeLink = document.getElementById('btn-youtube-link');

const btnPrevPage = document.getElementById('btn-prev-page');
const btnNextPage = document.getElementById('btn-next-page');
const paginationDots = document.getElementById('pagination-dots');
const pageCounterText = document.getElementById('page-counter-text');
const paginationBar = document.getElementById('pagination-bar');
const gridWrapper = document.getElementById('video-grid-wrapper');

let currentMode = 'inaba';
let currentCategory = 'All';
let currentSearchQuery = '';
let activePlayingVideo = null;
let isCapsLock = false;

let currentVideoList = [];
let currentPage = 1;
const itemsPerPage = 8;
let totalPages = 1;

let dotWindowStart = 1;
const maxDots = 10;

let isInitialIntro = true;
let isSwitchingCategories = false;
let dragStartX = 0;
let isDragging = false;
let activeKeyboardInput = null;

const FALLBACK_THUMBNAIL = '../osage-bg.png';
const RECENTS_STORAGE_KEY = 'osage_watch_history';

let introTimeouts = [];


/* ==========================================================================
   2. AUTO-SCROLL CHIPS & TAB INDICATOR SYNC
   ========================================================================== */

function scrollChipIntoView(chipElement) {
    if (!chipsContainer || !chipElement) return;
    const containerWidth = chipsContainer.clientWidth;
    const chipLeft = chipElement.offsetLeft;
    const chipWidth = chipElement.offsetWidth;

    const targetScrollLeft = chipLeft - (containerWidth / 2) + (chipWidth / 2);

    chipsContainer.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
    });
}

if (chipsContainer) {
    chipsContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            chipsContainer.scrollLeft += e.deltaY;
        }
    }, { passive: false });
}

function updateModeTabIndicator() {
    const activeTab = document.querySelector('.mode-tab.active');
    const container = document.querySelector('.mode-switch-container');
    if (modeTabIndicator && activeTab && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        if (activeRect.width > 0) {
            const leftOffset = activeRect.left - containerRect.left;
            modeTabIndicator.style.width = `${activeRect.width}px`;
            modeTabIndicator.style.transform = `translateX(${leftOffset}px)`;
        }
    }
}


/* ==========================================================================
   3. WATCH HISTORY TRACKER
   ========================================================================== */

function getWatchHistory() {
    try {
        const stored = localStorage.getItem(RECENTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {}
    return [];
}

function recordVideoPlay(video) {
    try {
        let history = getWatchHistory();
        history = history.filter(item => item.id !== video.id);
        history.unshift({
            id: video.id,
            mode: currentMode,
            timestamp: Date.now()
        });
        if (history.length > 50) history.pop();
        localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {}
}


/* ==========================================================================
   4. MODE SWITCHER & CATEGORY CHIP TRANSITIONS
   ========================================================================== */

function setMode(mode) {
    if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit') || isSwitchingCategories) return;
    if (currentMode === mode) return;

    currentMode = mode;
    currentCategory = 'All';
    currentSearchQuery = '';

    if (typeof resetCustomEditState === 'function') {
        resetCustomEditState();
    }

    if (searchInput) {
        searchInput.value = '';
        if (currentMode === 'inaba') {
            searchInput.placeholder = "Click to search songs, albums, lyrics...";
        } else {
            searchInput.placeholder = "Click to search custom videos...";
        }
    }

    if (clearSearchBtn) clearSearchBtn.classList.remove('active');
    closeVirtualKeyboard();

    if (chipsContainer) {
        chipsContainer.scrollTo({ left: 0, behavior: 'smooth' });
    }

    if (currentMode === 'inaba') {
        if (tabInaba) tabInaba.classList.add('active');
        if (tabCustom) tabCustom.classList.remove('active');
        if (btnCustomAdd) btnCustomAdd.classList.remove('btn-visible');
        animateCategorySwitch(inabaCategories, 'to-inaba');
    } else {
        if (tabCustom) tabCustom.classList.add('active');
        if (tabInaba) tabInaba.classList.remove('active');
        if (btnCustomAdd) btnCustomAdd.classList.add('btn-visible');
        animateCategorySwitch(getStoredCustomCategories(), 'to-custom');
    }

    updateModeTabIndicator();
    fetchAndFilterVideos(true);
}

function animateCategorySwitch(newCategories, direction) {
    if (!chipsContainer) return;
    const existingChips = Array.from(chipsContainer.querySelectorAll('.chip-btn'));

    if (existingChips.length === 0) {
        renderCategoryChips(newCategories);
        return;
    }

    isSwitchingCategories = true;

    existingChips.forEach((chip, index) => {
        const reverseIdx = (existingChips.length - 1) - index;
        const delay = direction === 'to-custom' ? reverseIdx * 0.02 : index * 0.02;
        chip.style.animationDelay = `${delay}s`;
        chip.className = `chip-btn ${direction === 'to-custom' ? 'exit-left' : 'exit-right'}`;
    });

    const exitDuration = (existingChips.length * 0.02 + 0.22) * 1000;

    setTimeout(() => {
        chipsContainer.innerHTML = '';
        chipsContainer.scrollLeft = 0;

        newCategories.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = `chip-btn ${cat === currentCategory ? 'active' : ''} ${direction === 'to-custom' ? 'enter-right' : 'enter-left'}`;
            btn.style.animationDelay = `${index * 0.03}s`;
            btn.textContent = cat;

            btn.addEventListener('click', () => {
                if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
                chipsContainer.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = cat;
                scrollChipIntoView(btn);
                fetchAndFilterVideos(true);
            });

            chipsContainer.appendChild(btn);
        });

        setTimeout(() => {
            isSwitchingCategories = false;
        }, (newCategories.length * 0.03 + 0.28) * 1000);

    }, exitDuration);
}

function renderCategoryChips(categories) {
    if (!chipsContainer) return;
    chipsContainer.innerHTML = '';
    categories.forEach(cat => {
        const isProtected = typeof PROTECTED_CATEGORIES !== 'undefined' ? PROTECTED_CATEGORIES.includes(cat) : true;
        const isDelMode = typeof isCustomDeleteMode !== 'undefined' && isCustomDeleteMode;
        const isSelectedForDel = isDelMode && typeof selectedCategoriesForDeletion !== 'undefined' && selectedCategoriesForDeletion.has(cat);

        const btn = document.createElement('button');
        btn.className = `chip-btn ${cat === currentCategory && !isDelMode ? 'active' : ''} ${isSelectedForDel ? 'tag-delete-selected' : ''} ${isDelMode && !isProtected ? 'jiggle-item' : ''}`;
        btn.innerHTML = `<span>${cat}</span>`;

        btn.addEventListener('click', (e) => {
            if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;

            if (isDelMode) {
                if (isProtected) return;

                const customPool = typeof getCustomVideos === 'function' ? getCustomVideos() : [];

                if (selectedCategoriesForDeletion.has(cat)) {
                    selectedCategoriesForDeletion.delete(cat);
                    btn.classList.remove('tag-delete-selected');
                    customPool.forEach(v => {
                        if (v.category && v.category.includes(cat)) {
                            selectedVideosForDeletion.delete(v.id);
                        }
                    });
                } else {
                    selectedCategoriesForDeletion.add(cat);
                    btn.classList.add('tag-delete-selected');
                    customPool.forEach(v => {
                        if (v.category && v.category.includes(cat)) {
                            selectedVideosForDeletion.add(v.id);
                        }
                    });
                }
                if (typeof syncDeleteSelectionHighlight === 'function') {
                    syncDeleteSelectionHighlight();
                }
                return;
            }

            chipsContainer.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = cat;
            scrollChipIntoView(btn);
            fetchAndFilterVideos(true);
        });

        chipsContainer.appendChild(btn);
    });
}


/* ==========================================================================
   5. AUTO DESCRIPTION, TITLE MARQUEE & PAGINATION ENGINE
   ========================================================================== */

function getAutoDescription(video) {
    if (video.description && video.description.trim()) {
        return video.description;
    }

    if (currentMode === 'inaba') {
        const vocalName = video.vocal || "歌愛ユキ";
        const albumName = video.album || "Inabakumori Works";
        return `作詞・作曲・編曲：稲葉曇 • イラスト：ぬくぬくにぎりめし / Vo. ${vocalName} • ${albumName} Official Release.`;
    }
    return `Custom video stream added to collection.`;
}

function setupCardTitleScroll(card) {
    const titleContainer = card.querySelector('.card-title');
    const titleText = card.querySelector('.card-title-text');
    if (!titleContainer || !titleText) return;

    let scrollRaf = null;
    let scrollTimeout = null;

    function stopScroll() {
        if (scrollRaf) {
            cancelAnimationFrame(scrollRaf);
            scrollRaf = null;
        }
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        titleText.style.transform = 'translateX(0px)';
    }

    card.addEventListener('mouseenter', () => {
        if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
        stopScroll();

        const maxScroll = titleText.scrollWidth - titleContainer.clientWidth;
        if (maxScroll <= 4) return;

        const SPEED_PX_PER_SEC = 28;
        const scrollDuration = Math.max(1200, (maxScroll / SPEED_PX_PER_SEC) * 1000);
        const PAUSE_DURATION = 1500;

        let state = "WAIT_START";
        let startTime = null;

        scrollTimeout = setTimeout(() => {
            state = "SCROLL_LEFT";
            startTime = performance.now();

            function step(now) {
                if (!titleText || !titleContainer) return;

                const curMax = titleText.scrollWidth - titleContainer.clientWidth;
                if (curMax <= 4) {
                    titleText.style.transform = 'translateX(0px)';
                    return;
                }

                if (state === "SCROLL_LEFT") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    titleText.style.transform = `translateX(-${progress * curMax}px)`;

                    if (progress >= 1) {
                        state = "WAIT_END";
                        scrollTimeout = setTimeout(() => {
                            state = "SCROLL_RIGHT";
                            startTime = performance.now();
                            scrollRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                } else if (state === "SCROLL_RIGHT") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    titleText.style.transform = `translateX(-${(1 - progress) * curMax}px)`;

                    if (progress >= 1) {
                        state = "WAIT_START";
                        scrollTimeout = setTimeout(() => {
                            state = "SCROLL_LEFT";
                            startTime = performance.now();
                            scrollRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                }

                scrollRaf = requestAnimationFrame(step);
            }

            scrollRaf = requestAnimationFrame(step);
        }, PAUSE_DURATION);
    });

    card.addEventListener('mouseleave', () => {
        stopScroll();
    });
}

function setupCardDescScroll(card) {
    const descBox = card.querySelector('.card-desc-box');
    if (!descBox) return;

    let scrollRaf = null;
    let scrollTimeout = null;

    function stopScroll() {
        if (scrollRaf) {
            cancelAnimationFrame(scrollRaf);
            scrollRaf = null;
        }
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        descBox.scrollTop = 0;
    }

    card.addEventListener('mouseenter', () => {
        if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
        stopScroll();

        const maxScroll = descBox.scrollHeight - descBox.clientHeight;
        if (maxScroll <= 4) return;

        const SPEED_PX_PER_SEC = 22;
        const scrollDuration = Math.max(1800, (maxScroll / SPEED_PX_PER_SEC) * 1000);
        const PAUSE_DURATION = 3000;

        let state = "WAIT_TOP";
        let startTime = null;

        scrollTimeout = setTimeout(() => {
            state = "SCROLL_DOWN";
            startTime = performance.now();

            function step(now) {
                if (!descBox) return;

                const curMax = descBox.scrollHeight - descBox.clientHeight;
                if (curMax <= 4) {
                    descBox.scrollTop = 0;
                    return;
                }

                if (state === "SCROLL_DOWN") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    descBox.scrollTop = progress * curMax;

                    if (progress >= 1) {
                        state = "WAIT_BOTTOM";
                        scrollTimeout = setTimeout(() => {
                            state = "SCROLL_UP";
                            startTime = performance.now();
                            scrollRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                } else if (state === "SCROLL_UP") {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / scrollDuration, 1);
                    descBox.scrollTop = (1 - progress) * curMax;

                    if (progress >= 1) {
                        state = "WAIT_TOP";
                        scrollTimeout = setTimeout(() => {
                            state = "SCROLL_DOWN";
                            startTime = performance.now();
                            scrollRaf = requestAnimationFrame(step);
                        }, PAUSE_DURATION);
                        return;
                    }
                }

                scrollRaf = requestAnimationFrame(step);
            }

            scrollRaf = requestAnimationFrame(step);
        }, PAUSE_DURATION);
    });

    card.addEventListener('mouseleave', () => {
        stopScroll();
    });
}

function fetchAndFilterVideos(animateFlip = false) {
    let pool = currentMode === 'inaba' ? (typeof inabaVideoData !== 'undefined' ? [...inabaVideoData] : []) : (typeof getCustomVideos === 'function' ? getCustomVideos() : []);
    let list = [];

    if (currentCategory === 'All') {
        list = [...pool].sort((a, b) => {
            const dateA = new Date(a.releaseDate).getTime() || 0;
            const dateB = new Date(b.releaseDate).getTime() || 0;
            return dateB - dateA;
        });
    } else if (currentCategory === 'Popular') {
        list = [...pool].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else if (currentCategory === 'Recents') {
        const history = getWatchHistory();
        const historyIds = history.map(h => h.id);
        const map = new Map(pool.map(v => [v.id, v]));

        historyIds.forEach(id => {
            if (map.has(id)) {
                list.push(map.get(id));
            }
        });
    } else {
        list = pool.filter(v => v.category && v.category.includes(currentCategory));
    }

    if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        list = list.filter(v =>
            v.title.toLowerCase().includes(q) ||
            (v.channel && v.channel.toLowerCase().includes(q)) ||
            (v.description && v.description.toLowerCase().includes(q)) ||
            (v.vocal && v.vocal.toLowerCase().includes(q)) ||
            (v.album && v.album.toLowerCase().includes(q))
        );
    }

    currentVideoList = list;
    totalPages = Math.max(1, Math.ceil(currentVideoList.length / itemsPerPage));
    currentPage = 1;
    dotWindowStart = 1;

    if (typeof updateTopBadgeUI === 'function') {
        updateTopBadgeUI();
    }
    renderCurrentPage(animateFlip);
}

function renderCurrentPage(animateFlip = false) {
    if (!videoGrid || document.getElementById('intro-loader')) return;
    videoGrid.innerHTML = '';

    if (btnPrevPage) {
        btnPrevPage.disabled = (currentPage <= 1);
    }
    if (btnNextPage) {
        btnNextPage.disabled = (currentPage >= totalPages);
    }

    if (!isInitialIntro) {
        updatePaginationUI();
    }

    if (currentVideoList.length === 0) {
        if (isInitialIntro) return;

        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.style.gridColumn = '1 / -1';
        emptyState.style.gridRow = '1 / -1';
        emptyState.style.display = 'flex';
        emptyState.style.flexDirection = 'column';
        emptyState.style.alignItems = 'center';
        emptyState.style.justifyContent = 'center';
        emptyState.style.color = 'rgba(255, 255, 255, 0.4)';

        let msgTitle = "No Videos Found";
        let msgDesc = "Try adjusting your search query or category filters.";

        if (currentCategory === 'Recents') {
            msgTitle = "No Recent Videos";
            msgDesc = "Play any video to see your watch history appear here.";
        }

        emptyState.innerHTML = `
            <i class="fa-solid fa-clock-rotate-left fa-3x" style="margin-bottom: 16px; opacity: 0.5;"></i>
            <h3 style="font-size: 1.1rem; color: #ffffff; margin-bottom: 6px;">${msgTitle}</h3>
            <p style="font-size: 0.85rem;">${msgDesc}</p>
        `;
        videoGrid.appendChild(emptyState);
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, currentVideoList.length);
    const pageItems = currentVideoList.slice(startIndex, endIndex);

    pageItems.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.setAttribute('data-id', video.id);

        const isCardSelectedForDel = (currentMode === 'custom' && typeof isCustomDeleteMode !== 'undefined' && isCustomDeleteMode && typeof selectedVideosForDeletion !== 'undefined' && selectedVideosForDeletion.has(video.id));

        if (currentMode === 'custom' && typeof isCustomDeleteMode !== 'undefined' && isCustomDeleteMode) {
            card.classList.add('jiggle-item');
            if (isCardSelectedForDel) {
                card.classList.add('card-delete-selected');
            }
        }

        if (isInitialIntro) {
            card.classList.add('intro-flip');
        } else if (animateFlip) {
            card.classList.add('fast-flip');
        }

        const isOfficialInaba = currentMode === 'inaba';
        const cardAvatarUrl = isOfficialInaba ? (typeof resolvedInabaAvatar !== 'undefined' ? resolvedInabaAvatar : '') : (video.avatar || (typeof DEFAULT_CUSTOM_AVATAR !== 'undefined' ? DEFAULT_CUSTOM_AVATAR : ''));
        const descSnippet = getAutoDescription(video);
        const dynamicStats = typeof getVideoStats === 'function' ? getVideoStats(video) : (video.stats || '');

        card.innerHTML = `
            <div class="thumb-box">
                <img src="${video.thumb}" class="thumb-image" alt="${video.title}" loading="lazy">
                <div class="play-overlay">
                    <i class="fa-solid fa-play"></i>
                </div>
                <span class="duration-pill">${video.duration || '3:00'}</span>
            </div>
            <div class="video-meta-row">
                <div class="card-avatar ${isOfficialInaba ? 'inaba-avatar' : ''}" style="background-image: url('${cardAvatarUrl}');"></div>
                <div class="card-content">
                    <div class="card-title" title="${video.title}">
                        <span class="card-title-text">${video.title}</span>
                    </div>
                    <div class="card-channel">
                        <span>${video.channel || 'Custom Video'}</span>
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div class="card-stats">${dynamicStats}</div>
                </div>
            </div>
            <div class="card-desc-box">
                <p class="card-desc-text">${descSnippet}</p>
            </div>
        `;

        const avatarDiv = card.querySelector('.card-avatar');
        if (avatarDiv && !isOfficialInaba) {
            const avatarImg = new Image();
            avatarImg.src = cardAvatarUrl;
            avatarImg.onerror = () => {
                avatarDiv.style.backgroundImage = `url('${DEFAULT_CUSTOM_AVATAR}')`;
            };
        }

        const thumbImg = card.querySelector('.thumb-image');
        if (thumbImg) {
            thumbImg.onerror = () => {
                thumbImg.src = FALLBACK_THUMBNAIL;
            };
            thumbImg.onload = () => {
                if (thumbImg.naturalWidth === 120 && thumbImg.naturalHeight === 90) {
                    thumbImg.src = FALLBACK_THUMBNAIL;
                }
            };
        }

        card.addEventListener('click', () => {
            if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;

            if (currentMode === 'custom' && typeof isCustomDeleteMode !== 'undefined' && isCustomDeleteMode) {
                if (selectedVideosForDeletion.has(video.id)) {
                    selectedVideosForDeletion.delete(video.id);
                } else {
                    selectedVideosForDeletion.add(video.id);
                }
                if (typeof syncDeleteSelectionHighlight === 'function') {
                    syncDeleteSelectionHighlight();
                }
                return;
            }

            openVideoModal(video);
        });

        setupCardTitleScroll(card);
        setupCardDescScroll(card);
        videoGrid.appendChild(card);
    });
}

function updatePaginationUI() {
    if (pageCounterText) {
        pageCounterText.textContent = `Page ${currentPage} / ${totalPages}`;
    }

    if (btnPrevPage) {
        btnPrevPage.disabled = (currentPage <= 1);
    }
    if (btnNextPage) {
        btnNextPage.disabled = (currentPage >= totalPages);
    }

    if (paginationDots) {
        paginationDots.innerHTML = '';

        if (totalPages <= maxDots) {
            dotWindowStart = 1;
        } else {
            if (currentPage < dotWindowStart) {
                dotWindowStart = currentPage;
            } else if (currentPage > dotWindowStart + maxDots - 1) {
                dotWindowStart = currentPage - maxDots + 1;
            }
            dotWindowStart = Math.max(1, Math.min(dotWindowStart, totalPages - maxDots + 1));
        }

        const endDot = Math.min(totalPages, dotWindowStart + maxDots - 1);

        for (let i = dotWindowStart; i <= endDot; i++) {
            const dot = document.createElement('div');
            dot.className = `page-dot ${i === currentPage ? 'active' : ''}`;

            dot.addEventListener('click', () => {
                if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
                goToPage(i);
            });
            paginationDots.appendChild(dot);
        }
    }
}

function playBottomBarChoreography() {
    if (!paginationDots) return;
    paginationDots.innerHTML = '';

    if (totalPages <= maxDots) {
        dotWindowStart = 1;
    } else {
        dotWindowStart = Math.max(1, Math.min(currentPage, totalPages - maxDots + 1));
    }
    const endDot = Math.min(totalPages, dotWindowStart + maxDots - 1);
    const countDots = endDot - dotWindowStart + 1;

    const totalDotsTimeMs = 1000;
    const intervalStep = countDots > 0 ? (totalDotsTimeMs / countDots) : 100;

    for (let i = 0; i < countDots; i++) {
        const pageNum = dotWindowStart + i;
        setTimeout(() => {
            const dot = document.createElement('div');
            dot.className = `page-dot intro-dot ${pageNum === currentPage ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
                goToPage(pageNum);
            });
            paginationDots.appendChild(dot);
        }, i * intervalStep);
    }

    setTimeout(() => {
        if (pageCounterText) {
            pageCounterText.textContent = `Page ${currentPage} / ${totalPages}`;
            pageCounterText.classList.add('anim-in');
        }

        if (tabInaba) {
            tabInaba.classList.add('anim-in');
        }

        setTimeout(() => {
            if (tabCustom) {
                tabCustom.classList.add('anim-in');
            }

            setTimeout(() => {
                if (modeTabIndicator) {
                    updateModeTabIndicator();
                    modeTabIndicator.classList.add('anim-in');
                }

                setTimeout(() => {
                    isInitialIntro = false;
                    document.body.classList.remove('is-intro');
                    updateModeTabIndicator();
                    updatePaginationUI();
                }, 350);

            }, 500);

        }, 500);

    }, totalDotsTimeMs);
}

function goToPage(page) {
    if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
    if (page < 1 || page > totalPages || page === currentPage) return;

    currentPage = page;
    renderCurrentPage(true);
}

if (btnPrevPage) {
    btnPrevPage.addEventListener('click', () => {
        if (!btnPrevPage.disabled) goToPage(currentPage - 1);
    });
}
if (btnNextPage) {
    btnNextPage.addEventListener('click', () => {
        if (!btnNextPage.disabled) goToPage(currentPage + 1);
    });
}


/* ==========================================================================
   6. DRAG TO SWIPE & KEYBOARD NAVIGATION
   ========================================================================== */

if (gridWrapper) {
    gridWrapper.addEventListener('mousedown', (e) => {
        if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
        if (videoModal && videoModal.classList.contains('active')) return;
        const cModal = document.getElementById('custom-add-modal');
        if (cModal && cModal.classList.contains('active')) return;
        isDragging = true;
        dragStartX = e.clientX;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const dragEndX = e.clientX;
        const dragDiff = dragStartX - dragEndX;
        const swipeThreshold = 80;

        if (dragDiff > swipeThreshold) {
            goToPage(currentPage + 1);
        } else if (dragDiff < -swipeThreshold) {
            goToPage(currentPage - 1);
        }
    });
}


/* ==========================================================================
   7. UNIVERSAL VIRTUAL KEYBOARD SYSTEM
   ========================================================================== */

function triggerInputEvents(inputElement) {
    if (!inputElement) return;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    if (typeof validateAllRequiredFields === 'function') {
        validateAllRequiredFields();
    }
}

function updateKeyboardCapsUI() {
    document.querySelectorAll('.virtual-keyboard .vk-key[data-key]').forEach(keyBtn => {
        const keyVal = keyBtn.getAttribute('data-key');
        if (/^[a-zA-Z]$/.test(keyVal)) {
            const transformed = isCapsLock ? keyVal.toUpperCase() : keyVal.toLowerCase();
            keyBtn.setAttribute('data-key', transformed);
            keyBtn.textContent = transformed;
        }
    });

    if (vkKeyCaps) {
        vkKeyCaps.classList.toggle('active', isCapsLock);
    }
}

function openVirtualKeyboardFor(targetInput, labelText = "Virtual Keyboard") {
    if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
    if (!targetInput || targetInput.disabled || targetInput.dataset.locked === 'true') return;

    document.querySelectorAll('.input-active').forEach(el => el.classList.remove('input-active'));
    activeKeyboardInput = targetInput;

    targetInput.classList.add('input-active');

    if (vkTargetIndicator) {
        vkTargetIndicator.textContent = labelText;
    }

    updateKeyboardCapsUI();

    if (virtualKeyboard) {
        virtualKeyboard.classList.add('show');
    }
}

function closeVirtualKeyboard() {
    if (virtualKeyboard) {
        virtualKeyboard.classList.remove('show');
    }
    if (searchBoxContainer) {
        searchBoxContainer.classList.remove('active');
    }

    const currentInput = activeKeyboardInput;
    if (activeKeyboardInput) {
        activeKeyboardInput.classList.remove('input-active');
    }
    activeKeyboardInput = null;

    if (currentInput) {
        triggerInputEvents(currentInput);
    }
    if (typeof validateAllRequiredFields === 'function') {
        validateAllRequiredFields();
    }
}

if (searchBoxContainer) {
    searchBoxContainer.addEventListener('click', (e) => {
        if (e.target.closest('#clear-search')) return;
        searchBoxContainer.classList.add('active');
        openVirtualKeyboardFor(searchInput, "Search Songs");
    });
}

const inputCUrl = document.getElementById('custom-input-url');
const inputCTitle = document.getElementById('custom-input-title');
const inputCChannel = document.getElementById('custom-input-channel');
const inputCAvatar = document.getElementById('custom-input-avatar');
const inputCDuration = document.getElementById('custom-input-duration');
const inputCViews = document.getElementById('custom-input-views');
const inputCDate = document.getElementById('custom-input-date');
const inputCDesc = document.getElementById('custom-input-desc');
const inputCNewTag = document.getElementById('custom-input-new-tag');

const customInputsConfig = [
    { el: inputCTitle, name: "Video Title" },
    { el: inputCChannel, name: "Creator / Channel Name" },
    { el: inputCAvatar, name: "Creator Avatar Image URL" },
    { el: inputCDuration, name: "Duration (e.g. 02:12)" },
    { el: inputCViews, name: "Views Count (e.g. 156096)" },
    { el: inputCDate, name: "Release Date (YYYY-MM-DD)" },
    { el: inputCDesc, name: "Custom Description" },
    { el: inputCNewTag, name: "New Category Name" },
    { el: inputCUrl, name: "YouTube URL or ID" }
];

customInputsConfig.forEach(({ el, name }) => {
    if (el) {
        el.addEventListener('click', (e) => {
            if (window.isFetchingMetadata && el === inputCUrl) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (el.disabled || el.dataset.locked === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            openVirtualKeyboardFor(el, name);
        });
    }
});

if (vkBtnClose) vkBtnClose.addEventListener('click', closeVirtualKeyboard);
if (vkKeyDone) vkKeyDone.addEventListener('click', closeVirtualKeyboard);

if (vkKeyCaps) {
    vkKeyCaps.addEventListener('click', (e) => {
        e.stopPropagation();
        isCapsLock = !isCapsLock;
        updateKeyboardCapsUI();
    });
}

if (vkKeyLeft) {
    vkKeyLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeKeyboardInput) return;
        const start = activeKeyboardInput.selectionStart || 0;
        const newPos = Math.max(0, start - 1);
        activeKeyboardInput.setSelectionRange(newPos, newPos);
        activeKeyboardInput.scrollLeft = Math.max(0, activeKeyboardInput.scrollLeft - 25);
    });
}

if (vkKeyRight) {
    vkKeyRight.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeKeyboardInput) return;
        const end = activeKeyboardInput.selectionEnd || 0;
        const newPos = Math.min(activeKeyboardInput.value.length, end + 1);
        activeKeyboardInput.setSelectionRange(newPos, newPos);
        activeKeyboardInput.scrollLeft += 25;
    });
}

document.querySelectorAll('.virtual-keyboard .vk-key[data-key]').forEach(keyBtn => {
    keyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeKeyboardInput) return;

        const char = keyBtn.getAttribute('data-key');
        const start = activeKeyboardInput.selectionStart || activeKeyboardInput.value.length;
        const end = activeKeyboardInput.selectionEnd || activeKeyboardInput.value.length;
        const val = activeKeyboardInput.value;

        activeKeyboardInput.value = val.slice(0, start) + char + val.slice(end);
        activeKeyboardInput.setSelectionRange(start + char.length, start + char.length);

        if (activeKeyboardInput === searchInput) {
            currentSearchQuery = searchInput.value;
            if (clearSearchBtn) clearSearchBtn.classList.add('active');
            fetchAndFilterVideos(true);
        } else if (inputCUrl && activeKeyboardInput === inputCUrl && typeof validateCustomUrl === 'function') {
            validateCustomUrl(inputCUrl.value);
        }

        triggerInputEvents(activeKeyboardInput);
    });
});

if (vkKeyBackspace) {
    vkKeyBackspace.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeKeyboardInput || activeKeyboardInput.value.length === 0) return;

        const start = activeKeyboardInput.selectionStart || activeKeyboardInput.value.length;
        const end = activeKeyboardInput.selectionEnd || activeKeyboardInput.value.length;
        const val = activeKeyboardInput.value;

        if (start === end && start > 0) {
            activeKeyboardInput.value = val.slice(0, start - 1) + val.slice(end);
            activeKeyboardInput.setSelectionRange(start - 1, start - 1);
        } else if (start !== end) {
            activeKeyboardInput.value = val.slice(0, start) + val.slice(end);
            activeKeyboardInput.setSelectionRange(start, start);
        }

        if (activeKeyboardInput === searchInput) {
            currentSearchQuery = searchInput.value;
            if (clearSearchBtn) {
                if (currentSearchQuery.length > 0) {
                    clearSearchBtn.classList.add('active');
                } else {
                    clearSearchBtn.classList.remove('active');
                }
            }
            fetchAndFilterVideos(true);
        } else if (inputCUrl && activeKeyboardInput === inputCUrl && typeof validateCustomUrl === 'function') {
            validateCustomUrl(inputCUrl.value);
        }

        triggerInputEvents(activeKeyboardInput);
    });
}

if (vkKeySpace) {
    vkKeySpace.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeKeyboardInput) return;

        const start = activeKeyboardInput.selectionStart || activeKeyboardInput.value.length;
        const end = activeKeyboardInput.selectionEnd || activeKeyboardInput.value.length;
        const val = activeKeyboardInput.value;

        activeKeyboardInput.value = val.slice(0, start) + ' ' + val.slice(end);
        activeKeyboardInput.setSelectionRange(start + 1, start + 1);

        if (activeKeyboardInput === searchInput) {
            currentSearchQuery = searchInput.value;
            if (clearSearchBtn) clearSearchBtn.classList.add('active');
            fetchAndFilterVideos(true);
        } else if (inputCUrl && activeKeyboardInput === inputCUrl && typeof validateCustomUrl === 'function') {
            validateCustomUrl(inputCUrl.value);
        }

        triggerInputEvents(activeKeyboardInput);
    });
}

if (vkKeyClear) {
    vkKeyClear.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeKeyboardInput) return;

        activeKeyboardInput.value = '';

        if (activeKeyboardInput === searchInput) {
            currentSearchQuery = '';
            if (clearSearchBtn) clearSearchBtn.classList.remove('active');
            fetchAndFilterVideos(true);
        } else if (inputCUrl && activeKeyboardInput === inputCUrl && typeof validateCustomUrl === 'function') {
            validateCustomUrl('');
        }

        triggerInputEvents(activeKeyboardInput);
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
        currentSearchQuery = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.classList.remove('active');
        fetchAndFilterVideos(true);
    });
}


/* ==========================================================================
   8. VIDEO PLAYER MODAL & EMBED LOGIC
   ========================================================================== */

function openVideoModal(video) {
    if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
    if (!videoModal) return;
    activePlayingVideo = video;
    closeVirtualKeyboard();

    recordVideoPlay(video);

    const dynamicStats = typeof getVideoStats === 'function' ? getVideoStats(video) : (video.stats || '');

    if (modalVideoTitle) modalVideoTitle.textContent = video.title;
    if (modalChannel) modalChannel.textContent = video.channel || 'Custom Video';
    if (modalMeta) modalMeta.textContent = video.vocal ? `Vocal: ${video.vocal} • Official Release` : (dynamicStats || 'YouTube Video');
    if (modalTag) modalTag.textContent = currentMode === 'inaba' ? 'INABAKUMORI OFFICIAL' : 'CUSTOM EMBED';

    const targetAvatar = currentMode === 'inaba' ? (typeof resolvedInabaAvatar !== 'undefined' ? resolvedInabaAvatar : '') : (video.avatar || (typeof DEFAULT_CUSTOM_AVATAR !== 'undefined' ? DEFAULT_CUSTOM_AVATAR : ''));
    if (modalAvatar) {
        modalAvatar.style.backgroundImage = `url('${targetAvatar}')`;
        const testImg = new Image();
        testImg.src = targetAvatar;
        testImg.onerror = () => {
            modalAvatar.style.backgroundImage = `url('${DEFAULT_CUSTOM_AVATAR}')`;
        };
    }

    if (modalScreen) {
        modalScreen.innerHTML = `
            <img src="${video.thumb}" class="modal-screen-thumb" alt="${video.title}">
            <button class="modal-center-btn" id="modal-screen-play-btn">
                <i class="fa-solid fa-play"></i>
            </button>
        `;

        const thumbImg = modalScreen.querySelector('.modal-screen-thumb');
        if (thumbImg) {
            thumbImg.onerror = () => {
                thumbImg.src = FALLBACK_THUMBNAIL;
            };
        }

        const centerBtn = document.getElementById('modal-screen-play-btn');
        if (centerBtn) {
            centerBtn.addEventListener('click', () => {
                const icon = centerBtn.querySelector('i');
                if (icon.classList.contains('fa-play')) {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                } else {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            });
        }
    }

    if (btnYoutubeLink) {
        btnYoutubeLink.innerHTML = `<i class="fa-brands fa-youtube"></i> Watch on YouTube`;
        btnYoutubeLink.classList.remove('copied');
        btnYoutubeLink.onclick = (e) => {
            e.preventDefault();
            const ytUrl = `https://www.youtube.com/watch?v=${video.id}`;
            navigator.clipboard.writeText(ytUrl).then(() => {
                btnYoutubeLink.innerHTML = `<i class="fa-solid fa-check"></i> Link Copied!`;
                btnYoutubeLink.classList.add('copied');
                setTimeout(() => {
                    btnYoutubeLink.innerHTML = `<i class="fa-brands fa-youtube"></i> Watch on YouTube`;
                    btnYoutubeLink.classList.remove('copied');
                }, 2500);
            }).catch(() => {
                window.open(ytUrl, '_blank');
            });
        };
    }

    videoModal.classList.add('active');
}

if (modalAvatar) {
    modalAvatar.style.cursor = 'pointer';
    modalAvatar.setAttribute('title', 'Copy Channel Link');
    modalAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        const channelUrl = currentMode === 'inaba' ? "https://www.youtube.com/channel/UCNElM45JypxqAR73RoUQ10g" : (activePlayingVideo ? `https://www.youtube.com/watch?v=${activePlayingVideo.id}` : "");
        if (channelUrl) {
            navigator.clipboard.writeText(channelUrl).then(() => {
                modalAvatar.style.transform = 'scale(1.18)';
                setTimeout(() => {
                    modalAvatar.style.transform = '';
                }, 250);
            }).catch(() => {
                window.open(channelUrl, '_blank');
            });
        }
    });
}

function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    if (modalScreen) modalScreen.innerHTML = '';
    activePlayingVideo = null;

    if (currentCategory === 'Recents') {
        fetchAndFilterVideos(true);
    }
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);

if (videoModal) {
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
}


/* ==========================================================================
   9. SETTINGS BUTTON INTERACTION
   ========================================================================== */

if (btnSettings) {
    btnSettings.addEventListener('click', () => {
        if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
        closeVirtualKeyboard();

        btnSettings.style.transform = 'rotate(90deg) scale(1.1)';
        setTimeout(() => {
            btnSettings.style.transform = '';
        }, 300);
    });
}


/* ==========================================================================
   10. DYNAMIC REVERSE EXIT & INTRO SEQUENCE ENGINE
   ========================================================================== */

function clearAllIntroTimers() {
    introTimeouts.forEach(timer => clearTimeout(timer));
    introTimeouts = [];
}

function showOfflineToast(message = "No Internet Connection") {
    let toast = document.getElementById('offline-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'offline-toast';
        toast.className = 'offline-toast-popup';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `
        <i class="fa-solid fa-wifi"></i>
        <div class="offline-toast-content">
            <span>${message}</span>
            <small>Returning to Wallpaper Engine...</small>
        </div>
    `;
    void toast.offsetWidth;
    toast.classList.add('show');
}

function triggerGracefulExit(isOffline = false) {
    if (document.body.classList.contains('page-exit')) return;

    clearAllIntroTimers();
    closeVirtualKeyboard();

    if (videoModal && videoModal.classList.contains('active')) closeVideoModal();
    const cModal = document.getElementById('custom-add-modal');
    if (cModal && cModal.classList.contains('active') && typeof closeCustomModal === 'function') closeCustomModal();
    const wModal = document.getElementById('custom-warning-modal');
    if (wModal && wModal.classList.contains('active')) wModal.classList.remove('active');

    if (isOffline) {
        showOfflineToast("Offline Mode Detected");
    }

    const loader = document.getElementById('intro-loader');
    if (loader) {
        loader.classList.add('exit-down');
        setTimeout(() => loader.remove(), 250);
    }

    sessionStorage.setItem('from_video_player', 'true');
    document.body.classList.add('page-exit');
    document.body.classList.remove('is-intro');

    const allCards = Array.from(document.querySelectorAll('.video-card'));
    const visibleCards = [];

    allCards.forEach(card => {
        const style = window.getComputedStyle(card);
        const opacity = parseFloat(style.opacity);
        if (opacity > 0.05) {
            visibleCards.push(card);
        } else {
            card.style.display = 'none';
        }
    });

    let cardsDuration = 0.05;

    if (visibleCards.length > 0) {
        visibleCards.forEach((card, index) => {
            const reverseIdx = (visibleCards.length - 1) - index;
            const delay = 0.05 + (reverseIdx * 0.08);

            card.classList.remove('intro-flip', 'fast-flip');
            card.style.opacity = '1';
            card.style.animation = `cardFlipOut3D 0.25s cubic-bezier(0.4, 0, 1, 1) ${delay}s both`;
        });
        cardsDuration = (visibleCards.length * 0.08) + 0.25;
    }

    const chips = document.querySelectorAll('#filter-wrapper .chip-btn');
    chips.forEach(chip => {
        chip.style.animation = `slideContentLeftOut 0.22s cubic-bezier(0.4, 0, 1, 1) ${cardsDuration + 0.05}s both`;
    });

    const filterWrapper = document.getElementById('filter-wrapper');
    if (filterWrapper) {
        filterWrapper.style.animation = `slideUpBoxOut 0.3s cubic-bezier(0.4, 0, 1, 1) ${cardsDuration + 0.18}s both`;
    }

    const topbarRight = document.querySelector('#topbar .topbar-right');
    const topbarCenter = document.querySelector('#topbar .topbar-center');
    const topbarLeft = document.querySelector('#topbar .topbar-left');
    const topbar = document.getElementById('topbar');

    const topbarStartTime = cardsDuration + 0.30;

    if (topbarRight) topbarRight.style.animation = `slideContentLeftOut 0.2s cubic-bezier(0.4, 0, 1, 1) ${topbarStartTime}s both`;
    if (topbarCenter) topbarCenter.style.animation = `slideCenterLeftOut 0.2s cubic-bezier(0.4, 0, 1, 1) ${topbarStartTime + 0.06}s both`;
    if (topbarLeft) topbarLeft.style.animation = `slideContentLeftOut 0.2s cubic-bezier(0.4, 0, 1, 1) ${topbarStartTime + 0.12}s both`;
    if (topbar) topbar.style.animation = `slideUpBoxOut 0.3s cubic-bezier(0.4, 0, 1, 1) ${topbarStartTime + 0.18}s both`;

    const curtainDelay = topbarStartTime + 0.30;

    setTimeout(() => {
        document.body.classList.add('curtain-black');
    }, Math.round(curtainDelay * 1000));

    const totalExitTimeMs = Math.round((curtainDelay + 0.6) * 1000);

    setTimeout(() => {
        window.location.replace('../index.html');
    }, totalExitTimeMs);
}

window.addEventListener('offline', () => {
    triggerGracefulExit(true);
});

if (tabInaba) tabInaba.addEventListener('click', () => setMode('inaba'));
if (tabCustom) tabCustom.addEventListener('click', () => setMode('custom'));

if (btnBackHome) {
    btnBackHome.addEventListener('click', () => {
        triggerGracefulExit(false);
    });
}

function showIntroLoading() {
    if (!gridWrapper) return;

    const existing = document.getElementById('intro-loader');
    if (existing) existing.remove();

    const loader = document.createElement('div');
    loader.id = 'intro-loader';
    loader.className = 'intro-loading-state';
    loader.innerHTML = `
        <div class="intro-loading-spinner"></div>
        <span>Loading...</span>
    `;
    gridWrapper.appendChild(loader);
}

function startHub() {
    if (!navigator.onLine) {
        triggerGracefulExit(true);
        return;
    }

    if (typeof initDynamicAvatar === 'function') {
        initDynamicAvatar();
    }
    if (typeof syncYouTubeMetrics === 'function') {
        syncYouTubeMetrics();
    }

    if (btnCustomAdd) btnCustomAdd.classList.remove('btn-visible');
    if (typeof inabaCategories !== 'undefined') {
        renderCategoryChips(inabaCategories);
    }

    if (btnPrevPage) btnPrevPage.classList.remove('intro-nav');
    if (btnNextPage) btnNextPage.classList.remove('intro-nav');
    if (paginationBar) paginationBar.classList.remove('intro-bar');

    showIntroLoading();
    document.body.classList.add('is-intro');

    introTimeouts.push(setTimeout(() => {
        document.body.classList.add('anim-active');

        introTimeouts.push(setTimeout(() => {
            const loader = document.getElementById('intro-loader');
            if (loader) {
                loader.classList.add('exit-down');
                setTimeout(() => {
                    loader.remove();
                    fetchAndFilterVideos(false);
                }, 400);
            } else {
                fetchAndFilterVideos(false);
            }

            introTimeouts.push(setTimeout(() => {
                if (btnPrevPage) btnPrevPage.classList.add('intro-nav');
                if (btnNextPage) btnNextPage.classList.add('intro-nav');
                if (paginationBar) paginationBar.classList.add('intro-bar');
                playBottomBarChoreography();
            }, 8000));

        }, 6250));

    }, 1800));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHub);
} else {
    startHub();
}

window.addEventListener('resize', () => {
    updateModeTabIndicator();
});

document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;

    if (e.key === 'Escape') {
        closeVirtualKeyboard();
        if (videoModal && videoModal.classList.contains('active')) closeVideoModal();
        const cModal = document.getElementById('custom-add-modal');
        if (cModal && cModal.classList.contains('active') && typeof closeCustomModal === 'function') closeCustomModal();
        const wModal = document.getElementById('custom-warning-modal');
        if (wModal && wModal.classList.contains('active')) wModal.classList.remove('active');
        if (typeof isCustomEditMode !== 'undefined' && typeof isCustomDeleteMode !== 'undefined' && (isCustomEditMode || isCustomDeleteMode)) {
            if (typeof toggleCustomEditMode === 'function') {
                toggleCustomEditMode(false);
            }
        }
    }

    if (!videoModal || !videoModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
        if (e.key === 'ArrowRight') goToPage(currentPage + 1);
    }
});