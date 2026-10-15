/* ==========================================================================
   1. DOM ELEMENTS & CONSTANTS CONFIGURATION
   ========================================================================== */

const btnCustomAdd = document.getElementById('btn-custom-add');
const chipsContainer = document.getElementById('category-chips');
const videoGrid = document.getElementById('video-grid');
const videoCountBadge = document.getElementById('video-count-badge');
const videoCountText = document.getElementById('video-count-text');

const customModal = document.getElementById('custom-add-modal');
const customModalClose = document.getElementById('custom-modal-close');
const btnCancelCustom = document.getElementById('btn-cancel-custom');
const btnSaveCustom = document.getElementById('btn-save-custom');
const urlInputWrapper = document.getElementById('url-input-wrapper');
const urlStatusText = document.getElementById('url-status-text');
const inputCustomUrl = document.getElementById('custom-input-url');
const inputCustomTitle = document.getElementById('custom-input-title');
const inputCustomChannel = document.getElementById('custom-input-channel');
const inputCustomAvatar = document.getElementById('custom-input-avatar');
const inputCustomDuration = document.getElementById('custom-input-duration');
const inputCustomViews = document.getElementById('custom-input-views');
const inputCustomDate = document.getElementById('custom-input-date');
const inputCustomDesc = document.getElementById('custom-input-desc');
const customDescStatus = document.getElementById('custom-desc-status');
const btnResetDesc = document.getElementById('btn-reset-desc');
const inputCustomNewTag = document.getElementById('custom-input-new-tag');
const btnCreateTag = document.getElementById('btn-create-tag');
const btnPasteClipboard = document.getElementById('btn-paste-clipboard');
const customLivePreview = document.getElementById('custom-live-preview');
const livePreviewImg = document.getElementById('live-preview-img');
const livePreviewTitle = document.getElementById('live-preview-title');
const livePreviewChannel = document.getElementById('live-preview-channel');
const customTagSelector = document.getElementById('custom-tag-selector');

const warningModal = document.getElementById('custom-warning-modal');
const btnDismissWarning = document.getElementById('btn-dismiss-warning');
const chkDontShowAgain = document.getElementById('chk-dont-show-again');

const CUSTOM_STORAGE_KEY = 'osage_custom_videos';
const CUSTOM_CATEGORIES_STORAGE_KEY = 'osage_custom_categories_list';
const CUSTOM_WARNING_SESSION_SUPPRESS = 'osage_custom_warning_suppressed';

const DEFAULT_CUSTOM_AVATAR = '../preview.gif';
const DEFAULT_CUSTOM_CATEGORIES = ['All', 'Popular', 'Recents'];
const PROTECTED_CATEGORIES = ['All', 'Popular', 'Recents', 'Custom'];

let isCustomEditMode = false;
let isCustomDeleteMode = false;
let selectedCategoriesForDeletion = new Set();
let selectedVideosForDeletion = new Set();

let currentDetectedVideoId = null;
let selectedTagsInModal = new Set();
let sessionCreatedTags = [];
let latestFetchedMeta = null;
let defaultFetchedDescription = '';
let isDescCustomized = false;
let isFetchingMetadata = false;
window.isFetchingMetadata = false;
let activeAbortController = null;
let hasSeenWarningInSession = false;


/* ==========================================================================
   2. STORAGE HELPERS & CATEGORIES MANAGEMENT
   ========================================================================== */

function getCustomVideos() {
    try {
        const stored = localStorage.getItem(CUSTOM_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveCustomVideo(videoObj) {
    try {
        const list = getCustomVideos();
        list.unshift(videoObj);
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        return false;
    }
}

function scrollTagChipIntoView(chipElement) {
    if (!customTagSelector || !chipElement) return;
    const containerWidth = customTagSelector.clientWidth;
    const chipLeft = chipElement.offsetLeft;
    const chipWidth = chipElement.offsetWidth;
    const targetScrollLeft = chipLeft - (containerWidth / 2) + (chipWidth / 2);

    customTagSelector.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
    });
}

if (customTagSelector) {
    customTagSelector.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            customTagSelector.scrollLeft += e.deltaY;
        }
    }, { passive: false });
}

function getStoredCustomCategories() {
    try {
        const stored = localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(c => c.toLowerCase() !== 'custom');
            }
        }
    } catch (e) {}
    return [...DEFAULT_CUSTOM_CATEGORIES];
}

function saveStoredCustomCategories(cats) {
    try {
        const cleanCats = cats.filter(c => c.toLowerCase() !== 'custom');
        localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(cleanCats));
    } catch (e) {}
}

function addCustomCategory(newCat) {
    if (!newCat || !newCat.trim()) return;
    const cleanCat = newCat.trim();
    if (cleanCat.toLowerCase() === 'custom') return;

    let cats = getStoredCustomCategories();
    const exists = cats.some(c => c.toLowerCase() === cleanCat.toLowerCase());

    if (!exists) {
        cats.push(cleanCat);
        saveStoredCustomCategories(cats);
        if (typeof currentMode !== 'undefined' && currentMode === 'custom' && !isCustomEditMode) {
            if (typeof renderCategoryChips === 'function') {
                renderCategoryChips(cats);
            }
        }
    }
}

function getAllAvailableCustomTags() {
    const stored = getStoredCustomCategories().filter(c => !PROTECTED_CATEGORIES.includes(c));
    const merged = [];

    stored.forEach(t => {
        if (t.toLowerCase() !== 'custom' && !merged.some(m => m.toLowerCase() === t.toLowerCase())) {
            merged.push(t);
        }
    });

    sessionCreatedTags.forEach(t => {
        if (t.toLowerCase() !== 'custom' && !merged.some(m => m.toLowerCase() === t.toLowerCase())) {
            merged.push(t);
        }
    });

    return merged;
}

function renderModalTagChips() {
    if (!customTagSelector) return;
    customTagSelector.innerHTML = '';

    const allTags = getAllAvailableCustomTags();

    allTags.forEach(tag => {
        const isSelected = selectedTagsInModal.has(tag);
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `tag-chip ${isSelected ? 'active' : ''}`;
        chip.setAttribute('data-tag', tag);
        chip.innerHTML = `<span>${tag}</span>`;

        chip.addEventListener('click', () => {
            if (isFetchingMetadata || !currentDetectedVideoId) return;

            if (selectedTagsInModal.has(tag)) {
                selectedTagsInModal.delete(tag);
                chip.classList.remove('active');
            } else {
                selectedTagsInModal.add(tag);
                chip.classList.add('active');
            }

            scrollTagChipIntoView(chip);
            validateAllRequiredFields();
        });

        customTagSelector.appendChild(chip);
    });
}

if (inputCustomNewTag) {
    inputCustomNewTag.addEventListener('input', () => {
        validateAllRequiredFields();
    });
}


/* ==========================================================================
   3. DELETE MODE SELECTION & SEQUENTIAL DELETION ENGINE
   ========================================================================== */

function syncDeleteSelectionHighlight() {
    if (!isCustomDeleteMode || (typeof currentMode !== 'undefined' && currentMode !== 'custom')) return;

    const customPool = getCustomVideos();
    const nonProtectedCategories = getStoredCustomCategories().filter(c => !PROTECTED_CATEGORIES.includes(c));

    nonProtectedCategories.forEach(cat => {
        const videosInTag = customPool.filter(v => v.category && v.category.includes(cat));
        if (videosInTag.length > 0 && videosInTag.every(v => selectedVideosForDeletion.has(v.id))) {
            selectedCategoriesForDeletion.add(cat);
        } else {
            selectedCategoriesForDeletion.delete(cat);
        }
    });

    if (chipsContainer) {
        chipsContainer.querySelectorAll('.chip-btn').forEach(btn => {
            const catName = btn.querySelector('span') ? btn.querySelector('span').textContent.trim() : btn.textContent.trim();
            if (selectedCategoriesForDeletion.has(catName)) {
                btn.classList.add('tag-delete-selected');
            } else {
                btn.classList.remove('tag-delete-selected');
            }
        });
    }

    if (videoGrid) {
        videoGrid.querySelectorAll('.video-card').forEach(card => {
            const vidId = card.getAttribute('data-id');
            if (selectedVideosForDeletion.has(vidId)) {
                card.classList.add('card-delete-selected');
            } else {
                card.classList.remove('card-delete-selected');
            }
        });
    }

    updateTopBadgeUI();
}

function updateTopBadgeUI() {
    if (!videoCountBadge || !videoCountText) return;

    let badgeIcon = videoCountBadge.querySelector('i');
    if (!badgeIcon) {
        badgeIcon = document.createElement('i');
        videoCountBadge.prepend(badgeIcon);
    }

    if (!isCustomDeleteMode) {
        videoCountBadge.classList.remove('delete-mode-badge', 'badge-action-delete');
        badgeIcon.className = 'fa-solid fa-film';
        if (typeof currentVideoList !== 'undefined') {
            videoCountText.textContent = `${currentVideoList.length} Videos`;
        }
        return;
    }

    const customPool = getCustomVideos();
    const existingVidIds = new Set(customPool.map(v => v.id));
    for (let id of Array.from(selectedVideosForDeletion)) {
        if (!existingVidIds.has(id)) {
            selectedVideosForDeletion.delete(id);
        }
    }

    const existingCats = new Set(getStoredCustomCategories());
    for (let cat of Array.from(selectedCategoriesForDeletion)) {
        if (!existingCats.has(cat)) {
            selectedCategoriesForDeletion.delete(cat);
        }
    }

    if (customPool.length === 0) {
        exitDeleteMode(true);
        return;
    }

    const catCount = selectedCategoriesForDeletion.size;
    const vidCount = selectedVideosForDeletion.size;

    videoCountBadge.classList.add('delete-mode-badge');

    if (catCount === 0 && vidCount === 0) {
        videoCountBadge.classList.remove('badge-action-delete');
        badgeIcon.className = 'fa-solid fa-check';
        videoCountText.textContent = 'Done';
    } else {
        videoCountBadge.classList.add('badge-action-delete');
        badgeIcon.className = 'fa-solid fa-trash-can';

        let parts = [];
        if (catCount > 0) {
            parts.push(`${catCount} ${catCount === 1 ? 'Category' : 'Categories'}`);
        }
        if (vidCount > 0) {
            parts.push(`${vidCount} ${vidCount === 1 ? 'Video' : 'Videos'}`);
        }

        const summaryText = parts.join(' & ');
        videoCountText.textContent = `Delete ${summaryText}`;
    }
}

if (videoCountBadge) {
    videoCountBadge.addEventListener('click', () => {
        if (!isCustomDeleteMode || document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;

        const catCount = selectedCategoriesForDeletion.size;
        const vidCount = selectedVideosForDeletion.size;

        if (catCount === 0 && vidCount === 0) {
            exitDeleteMode(false);
        } else {
            performBatchDelete();
        }
    });
}

function performBatchDelete() {
    if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;

    const selectedCats = Array.from(selectedCategoriesForDeletion);
    const selectedVids = Array.from(selectedVideosForDeletion);

    if (selectedCats.length === 0 && selectedVids.length === 0) {
        exitDeleteMode(false);
        return;
    }

    if (videoGrid) videoGrid.style.pointerEvents = 'none';
    if (chipsContainer) chipsContainer.style.pointerEvents = 'none';
    if (videoCountBadge) videoCountBadge.style.pointerEvents = 'none';

    const allCards = Array.from(videoGrid.querySelectorAll('.video-card'));
    const targetCards = allCards.filter(card => selectedVideosForDeletion.has(card.getAttribute('data-id')));
    const reversedCards = targetCards.reverse();

    const CARD_FLIP_DURATION = 1.0;
    const CARD_STAGGER_DELAY = 0.25;

    let cardAnimTotalTime = 0;

    if (reversedCards.length > 0) {
        reversedCards.forEach((card, index) => {
            card.classList.remove('jiggle-item');
            const delay = index * CARD_STAGGER_DELAY;
            card.style.setProperty('animation', `cardFlipOut3D ${CARD_FLIP_DURATION}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`, 'important');
        });
        cardAnimTotalTime = ((reversedCards.length - 1) * CARD_STAGGER_DELAY + CARD_FLIP_DURATION) * 1000;
    }

    setTimeout(() => {
        const allChips = Array.from(chipsContainer.querySelectorAll('.chip-btn'));
        const targetChips = allChips.filter(chip => {
            const catName = chip.querySelector('span') ? chip.querySelector('span').textContent.trim() : chip.textContent.trim();
            return selectedCategoriesForDeletion.has(catName);
        });

        const reversedChips = targetChips.reverse();

        const CHIP_SLIDE_DURATION = 0.6;
        const CHIP_STAGGER_DELAY = 0.15;

        let chipAnimTotalTime = 0;

        if (reversedChips.length > 0) {
            reversedChips.forEach((chip, index) => {
                chip.classList.remove('jiggle-item');
                const delay = index * CHIP_STAGGER_DELAY;
                chip.style.setProperty('animation', `chipSlideUpOut ${CHIP_SLIDE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`, 'important');
            });
            chipAnimTotalTime = ((reversedChips.length - 1) * CHIP_STAGGER_DELAY + CHIP_SLIDE_DURATION) * 1000;
        }

        setTimeout(() => {
            if (selectedCats.length > 0) {
                let cats = getStoredCustomCategories();
                cats = cats.filter(c => !selectedCats.includes(c));
                saveStoredCustomCategories(cats);

                if (typeof currentCategory !== 'undefined' && selectedCats.includes(currentCategory)) {
                    currentCategory = 'All';
                }
            }

            if (selectedVids.length > 0) {
                let customPool = getCustomVideos();
                customPool = customPool.filter(v => !selectedVids.includes(v.id));
                try {
                    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customPool));
                } catch (e) {}
            }

            selectedCategoriesForDeletion.clear();
            selectedVideosForDeletion.clear();

            if (videoGrid) videoGrid.style.pointerEvents = '';
            if (chipsContainer) chipsContainer.style.pointerEvents = '';
            if (videoCountBadge) videoCountBadge.style.pointerEvents = '';

            exitDeleteMode(true);
        }, chipAnimTotalTime + 100);

    }, cardAnimTotalTime + 50);
}

function resetCustomEditState() {
    isCustomEditMode = false;
    isCustomDeleteMode = false;
    selectedCategoriesForDeletion.clear();
    selectedVideosForDeletion.clear();

    if (chipsContainer) {
        chipsContainer.classList.remove('edit-align-right');
    }

    if (btnCustomAdd) {
        btnCustomAdd.classList.remove('edit-active');
        btnCustomAdd.innerHTML = `<img src="../assets/icons/icons8-pencil-32.png" alt="Manage">`;
        btnCustomAdd.title = "Manage Custom Videos";
    }

    updateTopBadgeUI();
}

function toggleCustomEditMode(forcedState = null) {
    if (typeof isSwitchingCategories !== 'undefined' && isSwitchingCategories) return;
    const targetState = forcedState !== null ? forcedState : (!isCustomEditMode && !isCustomDeleteMode);

    if (isCustomDeleteMode) {
        exitDeleteMode(false);
        return;
    }

    isCustomEditMode = targetState;

    if (btnCustomAdd) {
        if (isCustomEditMode) {
            btnCustomAdd.classList.add('edit-active');
            btnCustomAdd.innerHTML = `<img src="../assets/icons/icons8-progress-indicator-32.png" alt="Close Edit">`;
            btnCustomAdd.title = "Close Manage Mode";
        } else {
            btnCustomAdd.classList.remove('edit-active');
            btnCustomAdd.innerHTML = `<img src="../assets/icons/icons8-pencil-32.png" alt="Manage">`;
            btnCustomAdd.title = "Manage Custom Videos";
        }
    }

    const existingChips = Array.from(chipsContainer.querySelectorAll('.chip-btn'));
    if (typeof isSwitchingCategories !== 'undefined') isSwitchingCategories = true;

    existingChips.forEach((chip, index) => {
        chip.style.animationDelay = `${index * 0.02}s`;
        chip.className = `chip-btn ${isCustomEditMode ? 'exit-left' : 'exit-right'}`;
    });

    const exitDuration = (existingChips.length * 0.02 + 0.22) * 1000;

    setTimeout(() => {
        chipsContainer.innerHTML = '';
        chipsContainer.scrollLeft = 0;

        if (isCustomEditMode) {
            chipsContainer.classList.add('edit-align-right');

            const customizeBtn = document.createElement('button');
            customizeBtn.className = `chip-btn chip-action-customize enter-right`;
            customizeBtn.style.animationDelay = `0.02s`;
            customizeBtn.innerHTML = `<i class="fa-solid fa-plus"></i> <span>Customize</span>`;

            customizeBtn.addEventListener('click', () => {
                openAddCustomModal();
            });

            const removeBtn = document.createElement('button');
            removeBtn.className = `chip-btn chip-action-delete enter-right`;
            removeBtn.style.animationDelay = `0.06s`;
            removeBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i> <span>Remove</span>`;

            removeBtn.addEventListener('click', () => {
                enterCustomDeleteMode();
            });

            chipsContainer.appendChild(customizeBtn);
            chipsContainer.appendChild(removeBtn);
        } else {
            chipsContainer.classList.remove('edit-align-right');
            if (typeof renderCategoryChips === 'function') {
                renderCategoryChips(getStoredCustomCategories());
            }
        }

        setTimeout(() => {
            if (typeof isSwitchingCategories !== 'undefined') isSwitchingCategories = false;
            if (typeof renderCurrentPage === 'function') {
                renderCurrentPage(false);
            }
        }, 350);

    }, exitDuration);
}

function enterCustomDeleteMode() {
    if (typeof isSwitchingCategories !== 'undefined' && isSwitchingCategories) return;
    isCustomEditMode = false;
    isCustomDeleteMode = true;
    selectedCategoriesForDeletion.clear();
    selectedVideosForDeletion.clear();

    const existingChips = Array.from(chipsContainer.querySelectorAll('.chip-btn'));
    if (typeof isSwitchingCategories !== 'undefined') isSwitchingCategories = true;

    existingChips.forEach((chip, index) => {
        chip.style.animationDelay = `${index * 0.02}s`;
        chip.className = `chip-btn exit-right`;
    });

    const exitDuration = (existingChips.length * 0.02 + 0.22) * 1000;

    setTimeout(() => {
        chipsContainer.innerHTML = '';
        chipsContainer.classList.remove('edit-align-right');
        chipsContainer.scrollLeft = 0;

        const cats = getStoredCustomCategories();
        cats.forEach((cat, index) => {
            const isProtected = PROTECTED_CATEGORIES.includes(cat);

            const btn = document.createElement('button');
            btn.className = `chip-btn enter-left ${!isProtected ? 'jiggle-item' : ''}`;
            btn.style.animationDelay = `${index * 0.03}s`;
            btn.innerHTML = `<span>${cat}</span>`;

            btn.addEventListener('click', (e) => {
                if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
                if (isProtected) return;

                const customPool = getCustomVideos();
                const videosInCat = customPool.filter(v => v.category && v.category.includes(cat));

                if (selectedCategoriesForDeletion.has(cat)) {
                    selectedCategoriesForDeletion.delete(cat);
                    btn.classList.remove('tag-delete-selected');
                    videosInCat.forEach(v => {
                        selectedVideosForDeletion.delete(v.id);
                    });
                } else {
                    selectedCategoriesForDeletion.add(cat);
                    btn.classList.add('tag-delete-selected');
                    videosInCat.forEach(v => {
                        selectedVideosForDeletion.add(v.id);
                    });
                }
                syncDeleteSelectionHighlight();
            });

            chipsContainer.appendChild(btn);
        });

        setTimeout(() => {
            if (typeof isSwitchingCategories !== 'undefined') isSwitchingCategories = false;
            updateTopBadgeUI();
            if (typeof renderCurrentPage === 'function') {
                renderCurrentPage(false);
            }
        }, 350);

    }, exitDuration);
}

function exitDeleteMode(didDeleteAny = false) {
    isCustomDeleteMode = false;
    isCustomEditMode = false;
    selectedCategoriesForDeletion.clear();
    selectedVideosForDeletion.clear();

    if (btnCustomAdd) {
        btnCustomAdd.classList.remove('edit-active');
        btnCustomAdd.innerHTML = `<img src="../assets/icons/icons8-pencil-32.png" alt="Manage">`;
        btnCustomAdd.title = "Manage Custom Videos";
    }

    if (chipsContainer) {
        chipsContainer.classList.remove('edit-align-right');
    }

    if (typeof renderCategoryChips === 'function') {
        renderCategoryChips(getStoredCustomCategories());
    }
    updateTopBadgeUI();
    if (typeof fetchAndFilterVideos === 'function') {
        fetchAndFilterVideos(true);
    }
}


/* ==========================================================================
   4. MODAL WARNING & VALIDATION UTILITIES
   ========================================================================== */

function showCustomModeWarning() {
    if (!warningModal) return;
    if (sessionStorage.getItem(CUSTOM_WARNING_SESSION_SUPPRESS) === 'true') return;

    if (!hasSeenWarningInSession) {
        hasSeenWarningInSession = true;
        warningModal.classList.remove('closing');
        warningModal.classList.add('active');
    }
}

function dismissWarningModal() {
    if (!warningModal) return;
    hasSeenWarningInSession = true;

    if (chkDontShowAgain && chkDontShowAgain.checked) {
        sessionStorage.setItem(CUSTOM_WARNING_SESSION_SUPPRESS, 'true');
    }

    warningModal.classList.add('closing');

    setTimeout(() => {
        warningModal.classList.remove('active', 'closing');
        if (typeof currentMode !== 'undefined' && currentMode === 'custom') {
            toggleCustomEditMode();
        } else {
            openAddCustomModal();
        }
    }, 350);
}

if (btnDismissWarning) {
    btnDismissWarning.addEventListener('click', dismissWarningModal);
}

if (warningModal) {
    warningModal.addEventListener('click', (e) => {
        if (e.target === warningModal) {
            dismissWarningModal();
        }
    });
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getTodayISODate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function parseViewCountString(raw) {
    if (!raw) return 0;
    if (typeof raw === 'number') return raw;
    const cleanDigits = String(raw).replace(/[^0-9]/g, '');
    return cleanDigits ? parseInt(cleanDigits, 10) : 0;
}

function normalizeDurationInput(raw) {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';

    const cleanDigits = digits.replace(/^0+(?=\d)/, '');
    const len = cleanDigits.length;

    if (len <= 2) {
        return cleanDigits;
    }
    if (len === 3) {
        const mm = cleanDigits.slice(0, 1).padStart(2, '0');
        const ss = cleanDigits.slice(1);
        return `${mm}:${ss}`;
    }
    if (len === 4) {
        const mm = cleanDigits.slice(0, 2);
        const ss = cleanDigits.slice(2);
        return `${mm}:${ss}`;
    }
    if (len === 5) {
        const hh = cleanDigits.slice(0, 1).padStart(2, '0');
        const mm = cleanDigits.slice(1, 3);
        const ss = cleanDigits.slice(3);
        return `${hh}:${mm}:${ss}`;
    }
    if (len === 6) {
        const hh = cleanDigits.slice(0, 2);
        const mm = cleanDigits.slice(2, 4);
        const ss = cleanDigits.slice(4);
        return `${hh}:${mm}:${ss}`;
    }

    const ss = cleanDigits.slice(-2);
    const mm = cleanDigits.slice(-4, -2);
    const hh = cleanDigits.slice(0, -4);
    return `${hh}:${mm}:${ss}`;
}

function validateDurationValue(val) {
    if (!val || typeof val !== 'string') return false;
    const str = val.trim();
    if (!str) return false;

    if (/^\d{1,2}$/.test(str)) {
        const ss = parseInt(str, 10);
        return ss < 60 && ss > 0;
    }

    const parts = str.split(':').map(p => parseInt(p, 10));
    if (parts.some(isNaN)) return false;

    if (parts.length === 2) {
        const [mm, ss] = parts;
        return mm < 60 && ss < 60 && (mm > 0 || ss > 0);
    }
    if (parts.length === 3) {
        const [hh, mm, ss] = parts;
        return mm < 60 && ss < 60 && (hh > 0 || mm > 0 || ss > 0);
    }
    return false;
}

function normalizeDateInput(raw) {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function validateDateValue(dateStr) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return false;

    const [yyyy, mm, dd] = dateStr.trim().split('-').map(Number);
    if (yyyy < 1970 || yyyy > 2099) return false;
    if (mm < 1 || mm > 12) return false;

    const daysInMonths = [31, isLeapYear(yyyy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (dd < 1 || dd > daysInMonths[mm - 1]) return false;

    return true;
}

function unescapeHtmlString(str) {
    if (!str) return '';
    return str
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\u0026/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function normalizeToISODate(rawDate) {
    if (!rawDate) return '';

    if (typeof rawDate === 'number') {
        const d = new Date(rawDate > 1e11 ? rawDate : rawDate * 1000);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }

    const str = String(rawDate).trim().replace(/\\/g, '');
    const isoMatch = str.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoMatch) return isoMatch[0];

    const monthMap = {
        'jan': '01', 'january': '01', 'januari': '01',
        'feb': '02', 'february': '02', 'februari': '02',
        'mar': '03', 'march': '03', 'maret': '03',
        'apr': '04', 'april': '04',
        'may': '05', 'mei': '05',
        'jun': '06', 'june': '06', 'juni': '06',
        'jul': '07', 'july': '07', 'juli': '07',
        'aug': '08', 'august': '08', 'agustus': '08', 'agu': '08',
        'sep': '09', 'september': '09',
        'oct': '10', 'october': '10', 'oktober': '10', 'okt': '10',
        'nov': '11', 'november': '11',
        'dec': '12', 'december': '12', 'desember': '12', 'des': '12'
    };

    const dmyMatch = str.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
    if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const mKey = dmyMatch[2].toLowerCase();
        const year = dmyMatch[3];
        if (monthMap[mKey]) return `${year}-${monthMap[mKey]}-${day}`;
    }

    const mdyMatch = str.match(/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (mdyMatch) {
        const day = mdyMatch[2].padStart(2, '0');
        const mKey = mdyMatch[1].toLowerCase();
        const year = mdyMatch[3];
        if (monthMap[mKey]) return `${year}-${monthMap[mKey]}-${day}`;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }

    return '';
}

function parseISO8601DurationLocal(isoStr) {
    if (!isoStr) return '';
    const match = isoStr.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
    if (!match) return '';

    const days = parseInt(match[1] || 0, 10);
    const hours = parseInt(match[2] || 0, 10) + (days * 24);
    const minutes = parseInt(match[3] || 0, 10);
    const seconds = parseInt(match[4] || 0, 10);
    const padSec = seconds.toString().padStart(2, '0');

    if (hours > 0) {
        const padMin = minutes.toString().padStart(2, '0');
        return `${hours}:${padMin}:${padSec}`;
    }
    return `${minutes}:${padSec}`;
}

function formatSecondsToMMSSLocal(sec) {
    const s = parseInt(sec, 10) || 0;
    if (s <= 0) return '';
    const hrs = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const remainder = s % 60;
    const padSec = remainder.toString().padStart(2, '0');
    if (hrs > 0) {
        return `${hrs}:${m.toString().padStart(2, '0')}:${padSec}`;
    }
    return `${m}:${padSec}`;
}

function validateAndExtractYouTubeID(input) {
    if (!input || !input.trim()) {
        return { valid: false, id: null, reason: "Waiting for input..." };
    }

    const str = input.trim();
    let videoId = null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
        videoId = str;
    } else {
        let parsedUrl;
        try {
            const urlToParse = (str.startsWith('http://') || str.startsWith('https://')) ? str : 'https://' + str;
            parsedUrl = new URL(urlToParse);
        } catch (e) {
            return { valid: false, id: null, reason: "Only YouTube links are allowed!" };
        }

        const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');

        if (hostname !== 'youtube.com' && hostname !== 'youtu.be' && hostname !== 'music.youtube.com') {
            return { valid: false, id: null, reason: "Only YouTube links are allowed!" };
        }

        const pathname = parsedUrl.pathname;

        if (pathname.includes('/shorts/')) {
            return { valid: false, id: null, reason: "YouTube Shorts are not supported!" };
        }
        if (pathname.includes('/post/') || pathname.includes('/community')) {
            return { valid: false, id: null, reason: "Community Posts are not supported!" };
        }
        if (pathname.startsWith('/@') || pathname.includes('/channel/') || pathname.includes('/c/') || pathname.includes('/user/')) {
            return { valid: false, id: null, reason: "Channel links are not supported!" };
        }
        if (pathname === '/playlist' && !parsedUrl.searchParams.get('v')) {
            return { valid: false, id: null, reason: "Playlist links are not supported!" };
        }

        if (hostname === 'youtu.be') {
            const pathId = pathname.replace(/^\/+/, '').split('/')[0];
            if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
                videoId = pathId;
            }
        } else if (hostname === 'youtube.com' || hostname === 'music.youtube.com') {
            if (pathname === '/watch') {
                const vParam = parsedUrl.searchParams.get('v');
                if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
                    videoId = vParam;
                }
            } else if (pathname.startsWith('/embed/') || pathname.startsWith('/v/')) {
                const parts = pathname.split('/');
                const embedId = parts[2];
                if (embedId && /^[a-zA-Z0-9_-]{11}$/.test(embedId)) {
                    videoId = embedId;
                }
            }
        }
    }

    if (!videoId) {
        return { valid: false, id: null, reason: "Invalid YouTube Video Link" };
    }

    if (typeof inabaVideoData !== 'undefined' && Array.isArray(inabaVideoData)) {
        const isInabaDuplicate = inabaVideoData.some(v => v.id === videoId);
        if (isInabaDuplicate) {
            return { valid: false, id: null, reason: "This video is already in Inabakumori Mode!" };
        }
    }

    const existingCustomVideos = getCustomVideos();
    const isDuplicate = existingCustomVideos.some(v => v.id === videoId);
    if (isDuplicate) {
        return { valid: false, id: null, reason: "This YouTube video is already in your collection!" };
    }

    return { valid: true, id: videoId, reason: "Valid YouTube Video URL" };
}

function resolvePrimaryCreatorHandle(rawAuthorStr) {
    if (!rawAuthorStr) return '';
    const cleanStr = rawAuthorStr.trim();
    const splitMatch = cleanStr.split(/\s+(?:dan|and|&|x|feat\.?|ft\.?)\s+/i);
    const primaryName = splitMatch[0].trim();
    return primaryName || cleanStr;
}

function setFieldLockState(inputElement, isAutoFilled) {
    if (!inputElement) return;

    inputElement.disabled = false;
    inputElement.readOnly = true;

    if (isAutoFilled) {
        inputElement.dataset.locked = "true";
        inputElement.style.pointerEvents = "none";
        inputElement.style.opacity = "0.45";
        inputElement.classList.add("auto-locked");
        inputElement.classList.remove("manual-allowed");
    } else {
        inputElement.dataset.locked = "false";
        inputElement.style.pointerEvents = "auto";
        inputElement.style.opacity = "1";
        inputElement.classList.remove("auto-locked");
        inputElement.classList.add("manual-allowed");
    }
}

function applyFieldLockStates(meta) {
    const hasId = Boolean(currentDetectedVideoId);

    if (!hasId) {
        setFormInputsLocked(true);
        return;
    }

    setFieldLockState(inputCustomTitle, Boolean(meta && meta.title && meta.title.trim()));
    setFieldLockState(inputCustomChannel, Boolean(meta && meta.channel && meta.channel.trim()));
    setFieldLockState(inputCustomAvatar, Boolean(meta && meta.avatar && meta.avatar.trim()));
    setFieldLockState(inputCustomDuration, Boolean(meta && meta.duration && meta.duration.trim()));
    setFieldLockState(inputCustomViews, Boolean(meta && meta.viewsCount && meta.viewsCount > 0));
    setFieldLockState(inputCustomDate, Boolean(meta && meta.isDateFetched === true));

    if (inputCustomDesc) {
        inputCustomDesc.disabled = false;
        inputCustomDesc.readOnly = true;
        inputCustomDesc.dataset.locked = "false";
        inputCustomDesc.style.pointerEvents = "auto";
        inputCustomDesc.style.opacity = "1";
        inputCustomDesc.classList.remove("auto-locked", "manual-allowed");
    }

    if (customTagSelector) {
        customTagSelector.style.pointerEvents = "auto";
        customTagSelector.style.opacity = "1";
    }
    if (inputCustomNewTag) {
        inputCustomNewTag.disabled = false;
        inputCustomNewTag.readOnly = true;
        inputCustomNewTag.dataset.locked = "false";
        inputCustomNewTag.style.pointerEvents = "auto";
        inputCustomNewTag.style.opacity = "1";
        inputCustomNewTag.classList.remove("auto-locked", "manual-allowed");
    }
    if (btnCreateTag) {
        btnCreateTag.disabled = false;
        btnCreateTag.style.pointerEvents = "auto";
        btnCreateTag.style.opacity = "1";
    }
}

function setFormInputsLocked(locked) {
    const inputsToLock = [
        inputCustomTitle,
        inputCustomChannel,
        inputCustomAvatar,
        inputCustomDuration,
        inputCustomViews,
        inputCustomDate,
        inputCustomDesc,
        inputCustomNewTag,
        btnCreateTag
    ];

    inputsToLock.forEach(el => {
        if (el) {
            el.disabled = false;
            el.readOnly = true;
            el.dataset.locked = locked ? "true" : "false";
            el.style.pointerEvents = locked ? 'none' : 'auto';
            el.style.opacity = locked ? '0.45' : '1';
            el.classList.remove('auto-locked', 'manual-allowed');
        }
    });

    if (customTagSelector) {
        customTagSelector.style.pointerEvents = locked ? 'none' : 'auto';
        customTagSelector.style.opacity = locked ? '0.45' : '1';
    }

    if (btnResetDesc) {
        btnResetDesc.classList.add('hide-btn');
    }
}

function validateAllRequiredFields() {
    if (!btnSaveCustom) return false;

    if (isFetchingMetadata || !currentDetectedVideoId) {
        btnSaveCustom.disabled = true;
        return false;
    }

    const t = inputCustomTitle ? inputCustomTitle.value.trim() : '';
    const ch = inputCustomChannel ? inputCustomChannel.value.trim() : '';
    const av = inputCustomAvatar ? inputCustomAvatar.value.trim() : '';
    const dur = inputCustomDuration ? inputCustomDuration.value.trim() : '';
    const vw = inputCustomViews ? inputCustomViews.value.trim() : '';
    const dt = inputCustomDate ? inputCustomDate.value.trim() : '';

    const hasTitle = t.length > 0;
    const hasChannel = ch.length > 0;
    const hasAvatar = av.length > 0;
    const isDurValid = validateDurationValue(dur);
    const hasViews = vw.length > 0 && !isNaN(parseInt(vw.replace(/[^0-9]/g, ''), 10));
    const isDateValid = validateDateValue(dt);
    const hasValidTag = selectedTagsInModal.size > 0 && !selectedTagsInModal.has('Custom') && !selectedTagsInModal.has('custom');

    if (inputCustomDuration) {
        if (dur.length > 0 && !isDurValid) {
            inputCustomDuration.classList.add('input-invalid');
        } else {
            inputCustomDuration.classList.remove('input-invalid');
        }
    }

    if (inputCustomDate) {
        if (dt.length > 0 && !isDateValid) {
            inputCustomDate.classList.add('input-invalid');
        } else {
            inputCustomDate.classList.remove('input-invalid');
        }
    }

    const allValid = hasTitle && hasChannel && hasAvatar && isDurValid && hasViews && isDateValid && hasValidTag;
    btnSaveCustom.disabled = !allValid;
    return allValid;
}

window.validateAllRequiredFields = validateAllRequiredFields;

function setModalFetchingState(fetching) {
    isFetchingMetadata = fetching;
    window.isFetchingMetadata = fetching;

    const liveBadge = customLivePreview ? customLivePreview.querySelector('.live-preview-badge') : null;
    if (liveBadge) {
        liveBadge.textContent = fetching ? 'LOADING...' : 'YOUTUBE READY';
        liveBadge.style.color = fetching ? '#facc15' : '#4ade80';
    }

    if (btnPasteClipboard) {
        btnPasteClipboard.disabled = fetching;
    }

    if (inputCustomUrl) {
        inputCustomUrl.dataset.locked = fetching ? "true" : "false";
        inputCustomUrl.style.pointerEvents = fetching ? "none" : "auto";
    }

    if (btnCancelCustom) {
        btnCancelCustom.disabled = false;
        btnCancelCustom.style.pointerEvents = 'auto';
        btnCancelCustom.style.opacity = '1';
    }

    if (customModalClose) {
        customModalClose.disabled = false;
        customModalClose.style.pointerEvents = 'auto';
        customModalClose.style.opacity = '1';
    }

    if (fetching) {
        setFormInputsLocked(true);
        if (btnSaveCustom) btnSaveCustom.disabled = true;
    } else {
        if (!currentDetectedVideoId) {
            setFormInputsLocked(true);
        }
        validateAllRequiredFields();
    }
}

function handleCustomDescInput() {
    if (!inputCustomDesc) return;
    const currentVal = inputCustomDesc.value;

    if (currentVal.length > 0) {
        isDescCustomized = true;
        inputCustomDesc.classList.remove('default-desc-active');
        if (defaultFetchedDescription) {
            btnResetDesc.classList.remove('hide-btn');
        } else {
            btnResetDesc.classList.add('hide-btn');
        }
    } else {
        if (defaultFetchedDescription) {
            isDescCustomized = false;
            inputCustomDesc.placeholder = "The Description Is Set As Default";
            inputCustomDesc.classList.add('default-desc-active');
            btnResetDesc.classList.add('hide-btn');
        } else {
            isDescCustomized = false;
            inputCustomDesc.placeholder = "The video description is not set";
            inputCustomDesc.classList.remove('default-desc-active');
            btnResetDesc.classList.add('hide-btn');
        }
    }

    if (customDescStatus) {
        customDescStatus.textContent = "OPTIONAL";
        customDescStatus.className = "optional-badge";
    }

    validateAllRequiredFields();
}

if (btnResetDesc) {
    btnResetDesc.addEventListener('click', (e) => {
        e.stopPropagation();
        if (defaultFetchedDescription && inputCustomDesc) {
            inputCustomDesc.value = '';
            inputCustomDesc.placeholder = "The Description Is Set As Default";
            inputCustomDesc.classList.add('default-desc-active');
            isDescCustomized = false;
            btnResetDesc.classList.add('hide-btn');
            validateAllRequiredFields();
        }
    });
}

function attachInputValidationEvents() {
    [inputCustomTitle, inputCustomChannel, inputCustomAvatar, inputCustomViews].forEach(inp => {
        if (inp) {
            inp.addEventListener('input', validateAllRequiredFields);
            inp.addEventListener('change', validateAllRequiredFields);
        }
    });

    if (inputCustomDesc) {
        inputCustomDesc.addEventListener('input', handleCustomDescInput);
        inputCustomDesc.addEventListener('change', handleCustomDescInput);
    }

    if (inputCustomDuration) {
        inputCustomDuration.addEventListener('input', () => {
            inputCustomDuration.value = normalizeDurationInput(inputCustomDuration.value);
            validateAllRequiredFields();
        });
        inputCustomDuration.addEventListener('change', () => {
            inputCustomDuration.value = normalizeDurationInput(inputCustomDuration.value);
            validateAllRequiredFields();
        });
    }

    if (inputCustomDate) {
        inputCustomDate.addEventListener('input', () => {
            inputCustomDate.value = normalizeDateInput(inputCustomDate.value);
            validateAllRequiredFields();
        });
        inputCustomDate.addEventListener('change', () => {
            inputCustomDate.value = normalizeDateInput(inputCustomDate.value);
            validateAllRequiredFields();
        });
    }
}
attachInputValidationEvents();


/* ==========================================================================
   5. METADATA SCRAPING & API RESOLVER
   ========================================================================== */

function extractFromRawHtml(rawHtml, meta) {
    if (!rawHtml) return;

    const dateMetaMatch = rawHtml.match(/<meta[^>]*itemprop=["'](?:datePublished|uploadDate)["'][^>]*content=["']([^"']+)["']/i) ||
        rawHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*itemprop=["'](?:datePublished|uploadDate)["']/i);
    if (dateMetaMatch && dateMetaMatch[1] && !meta.releaseDate) {
        const parsed = normalizeToISODate(dateMetaMatch[1]);
        if (parsed) {
            meta.releaseDate = parsed;
            meta.isDateFetched = true;
        }
    }

    const durMetaMatch = rawHtml.match(/<meta[^>]*itemprop=["']duration["'][^>]*content=["']([^"']+)["']/i) ||
        rawHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*itemprop=["']duration["']/i);
    if (durMetaMatch && durMetaMatch[1] && !meta.duration) {
        meta.duration = parseISO8601DurationLocal(durMetaMatch[1]);
    }

    const countMetaMatch = rawHtml.match(/<meta[^>]*itemprop=["']interactionCount["'][^>]*content=["']([^"']+)["']/i) ||
        rawHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*itemprop=["']interactionCount["']/i);
    if (countMetaMatch && countMetaMatch[1] && (!meta.viewsCount || meta.viewsCount === 0)) {
        const v = parseInt(countMetaMatch[1], 10);
        if (v > 0) meta.viewsCount = v;
    }

    try {
        const jsonMatch = rawHtml.match(/var\s+ytInitialPlayerResponse\s*=\s*(\{.+?\});/s) ||
            rawHtml.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
        if (jsonMatch && jsonMatch[1]) {
            const data = JSON.parse(jsonMatch[1]);
            const micro = data.microformat?.playerMicroformatRenderer;
            const details = data.videoDetails;

            if (micro?.publishDate && !meta.releaseDate) {
                meta.releaseDate = normalizeToISODate(micro.publishDate);
                meta.isDateFetched = true;
            } else if (micro?.uploadDate && !meta.releaseDate) {
                meta.releaseDate = normalizeToISODate(micro.uploadDate);
                meta.isDateFetched = true;
            }

            if (details?.lengthSeconds && !meta.duration) {
                meta.duration = formatSecondsToMMSSLocal(details.lengthSeconds);
            }
            if (details?.viewCount && (!meta.viewsCount || meta.viewsCount === 0)) {
                meta.viewsCount = parseInt(details.viewCount, 10);
            }
            if (details?.title && !meta.title) {
                meta.title = details.title;
            }
            if (details?.author && !meta.channel) {
                meta.channel = details.author;
            }
            if (details?.shortDescription && !meta.description) {
                meta.description = unescapeHtmlString(details.shortDescription);
            }
        }
    } catch (e) {}

    const html = unescapeHtmlString(rawHtml);

    if (!meta.releaseDate) {
        const publishMatch = html.match(/"publishDate"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i) ||
            html.match(/"uploadDate"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i) ||
            html.match(/"datePublished"\s*content="(\d{4}-\d{2}-\d{2})"/i) ||
            html.match(/"datePublished"\s*:\s*"([^"]+)"/i) ||
            html.match(/(?:Premiered|Uploaded on|Published on|Perdana pada)\s+([^"<]+)/i);
        if (publishMatch && publishMatch[1]) {
            const parsedD = normalizeToISODate(publishMatch[1]);
            if (parsedD) {
                meta.releaseDate = parsedD;
                meta.isDateFetched = true;
            }
        }
    }

    if (!meta.duration) {
        const durMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/i) ||
            html.match(/"lengthSeconds"\s*:\s*"(\d+)"/i);
        if (durMatch && durMatch[1]) {
            if (durMatch[0].includes('approxDurationMs')) {
                meta.duration = formatSecondsToMMSSLocal(Math.floor(parseInt(durMatch[1], 10) / 1000));
            } else {
                meta.duration = formatSecondsToMMSSLocal(parseInt(durMatch[1], 10));
            }
        }
    }

    if (!meta.viewsCount || meta.viewsCount === 0) {
        const viewMatch = html.match(/"viewCount"\s*:\s*"(\d+)"/i);
        if (viewMatch && viewMatch[1]) {
            const parsed = parseViewCountString(viewMatch[1]);
            if (parsed > 0) meta.viewsCount = parsed;
        }
    }

    if (!meta.title) {
        const titleMatch = html.match(/<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i) ||
            html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            meta.title = titleMatch[1].replace(/ - YouTube$/, '').trim();
        }
    }

    if (!meta.description) {
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        if (descMatch && descMatch[1]) {
            meta.description = unescapeHtmlString(descMatch[1].trim());
        }
    }
}

async function fetchFullYouTubeMetadata(videoId, signal) {
    let meta = {
        title: '',
        channel: '',
        avatar: '',
        duration: '',
        viewsCount: 0,
        releaseDate: '',
        isDateFetched: false,
        description: ''
    };

    const tasks = [];

    tasks.push(
        (async () => {
            try {
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
                                hl: "en"
                            }
                        }
                    }),
                    signal
                });
                if (innertubeRes.ok) {
                    const data = await innertubeRes.json();
                    if (data) {
                        const details = data.videoDetails;
                        const micro = data.microformat?.playerMicroformatRenderer;

                        if (details?.title && !meta.title) meta.title = details.title;
                        if (details?.author && !meta.channel) meta.channel = details.author;
                        if (details?.lengthSeconds && !meta.duration) {
                            meta.duration = formatSecondsToMMSSLocal(details.lengthSeconds);
                        }
                        if (details?.viewCount && (!meta.viewsCount || meta.viewsCount === 0)) {
                            meta.viewsCount = parseInt(details.viewCount, 10);
                        }
                        if (details?.shortDescription && !meta.description) {
                            meta.description = unescapeHtmlString(details.shortDescription);
                        }
                        if (micro?.publishDate && !meta.releaseDate) {
                            meta.releaseDate = normalizeToISODate(micro.publishDate);
                            meta.isDateFetched = true;
                        } else if (micro?.uploadDate && !meta.releaseDate) {
                            meta.releaseDate = normalizeToISODate(micro.uploadDate);
                            meta.isDateFetched = true;
                        }
                    }
                }
            } catch (e) {}
        })(),

        (async () => {
            try {
                const innertubeRes = await fetch("https://www.youtube.com/youtubei/v1/player?key=AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        videoId: videoId,
                        context: {
                            client: {
                                clientName: "WEB",
                                clientVersion: "2.20240101.00.00",
                                hl: "en"
                            }
                        }
                    }),
                    signal
                });
                if (innertubeRes.ok) {
                    const data = await innertubeRes.json();
                    if (data) {
                        const details = data.videoDetails;
                        const micro = data.microformat?.playerMicroformatRenderer;

                        if (details?.title && !meta.title) meta.title = details.title;
                        if (details?.author && !meta.channel) meta.channel = details.author;
                        if (details?.lengthSeconds && !meta.duration) {
                            meta.duration = formatSecondsToMMSSLocal(details.lengthSeconds);
                        }
                        if (details?.viewCount && (!meta.viewsCount || meta.viewsCount === 0)) {
                            meta.viewsCount = parseInt(details.viewCount, 10);
                        }
                        if (details?.shortDescription && !meta.description) {
                            meta.description = unescapeHtmlString(details.shortDescription);
                        }
                        if (micro?.publishDate && !meta.releaseDate) {
                            meta.releaseDate = normalizeToISODate(micro.publishDate);
                            meta.isDateFetched = true;
                        } else if (micro?.uploadDate && !meta.releaseDate) {
                            meta.releaseDate = normalizeToISODate(micro.uploadDate);
                            meta.isDateFetched = true;
                        }
                    }
                }
            } catch (e) {}
        })(),

        (async () => {
            try {
                const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, { signal });
                if (oembedRes.ok) {
                    const oembedData = await oembedRes.json();
                    if (!meta.title) meta.title = oembedData.title || '';
                    if (!meta.channel) meta.channel = oembedData.author_name || '';
                    if (oembedData.author_url) {
                        const handleMatch = oembedData.author_url.trim().match(/@([a-zA-Z0-9_.-]+)/);
                        if (handleMatch) {
                            meta.avatar = `https://unavatar.io/youtube/@${handleMatch[1]}`;
                        } else {
                            const channelIdMatch = oembedData.author_url.trim().match(/channel\/(UC[a-zA-Z0-9_-]+)/);
                            if (channelIdMatch) {
                                meta.avatar = `https://unavatar.io/youtube/${channelIdMatch[1]}`;
                            }
                        }
                    }
                }
            } catch (e) {}
        })(),

        (async () => {
            try {
                const rydRes = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`, { signal });
                if (rydRes.ok) {
                    const rydData = await rydRes.json();
                    if (rydData && rydData.viewCount && (!meta.viewsCount || meta.viewsCount === 0)) {
                        meta.viewsCount = parseInt(rydData.viewCount, 10);
                    }
                }
            } catch (e) {}
        })(),

        (async () => {
            const apiEndpoints = [
                `https://inv.nadeko.net/api/v1/videos/${videoId}`,
                `https://invidious.nerdvpn.de/api/v1/videos/${videoId}`,
                `https://invidious.jing.rocks/api/v1/videos/${videoId}`,
                `https://iv.melmac.space/api/v1/videos/${videoId}`,
                `https://yt.artemislena.eu/api/v1/videos/${videoId}`
            ];

            for (let ep of apiEndpoints) {
                if (meta.releaseDate && meta.duration && meta.title && meta.viewsCount > 0 && meta.description) break;
                try {
                    const subController = new AbortController();
                    const tid = setTimeout(() => subController.abort(), 3500);
                    const res = await fetch(ep, { signal: subController.signal });
                    clearTimeout(tid);

                    if (res.ok) {
                        const data = await res.json();
                        if (data) {
                            if (!meta.title) meta.title = data.title || '';
                            if (!meta.channel) meta.channel = data.author || data.uploader || '';
                            if (!meta.duration && (typeof data.lengthSeconds === 'number' || typeof data.lengthSeconds === 'string')) {
                                meta.duration = formatSecondsToMMSSLocal(data.lengthSeconds);
                            }
                            if (!meta.viewsCount || meta.viewsCount === 0) {
                                const v = parseInt(data.viewCount || data.views, 10);
                                if (v > 0) meta.viewsCount = v;
                            }
                            if (!meta.releaseDate) {
                                const rawD = data.published || data.uploadDate || data.publishedText;
                                if (rawD) {
                                    const parsed = normalizeToISODate(rawD);
                                    if (parsed) {
                                        meta.releaseDate = parsed;
                                        meta.isDateFetched = true;
                                    }
                                }
                            }
                            if (!meta.avatar) {
                                if (data.authorThumbnails && data.authorThumbnails.length > 0) {
                                    meta.avatar = data.authorThumbnails[data.authorThumbnails.length - 1].url;
                                }
                            }
                            if (!meta.description && data.description) {
                                meta.description = unescapeHtmlString(data.description);
                            }
                        }
                    }
                } catch (e) {}
            }
        })(),

        (async () => {
            const proxyEndpoints = [
                `https://corsproxy.io/?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}`,
                `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}`
            ];

            for (let proxyUrl of proxyEndpoints) {
                if (meta.releaseDate && meta.duration && meta.title && meta.viewsCount > 0 && meta.description) break;
                try {
                    const subController = new AbortController();
                    const tid = setTimeout(() => subController.abort(), 4000);
                    const res = await fetch(proxyUrl, { signal: subController.signal });
                    clearTimeout(tid);

                    if (res.ok) {
                        let rawHtml = '';
                        if (proxyUrl.includes('allorigins.win/get')) {
                            const jsonRes = await res.json();
                            rawHtml = jsonRes.contents || '';
                        } else {
                            rawHtml = await res.text();
                        }
                        extractFromRawHtml(rawHtml, meta);
                    }
                } catch (e) {}
            }
        })()
    );

    if (typeof YOUTUBE_API_KEY !== 'undefined' && YOUTUBE_API_KEY) {
        tasks.push((async () => {
            try {
                const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`, { signal });
                if (apiRes.ok) {
                    const apiData = await apiRes.json();
                    const item = apiData?.items?.[0];
                    if (item) {
                        if (item.snippet?.title) meta.title = item.snippet.title;
                        if (item.snippet?.channelTitle) meta.channel = item.snippet.channelTitle;
                        if (item.snippet?.publishedAt) {
                            meta.releaseDate = normalizeToISODate(item.snippet.publishedAt);
                            meta.isDateFetched = true;
                        }
                        if (item.snippet?.description) {
                            meta.description = unescapeHtmlString(item.snippet.description);
                        }
                        if (item.statistics?.viewCount) meta.viewsCount = parseInt(item.statistics.viewCount, 10);
                        if (item.contentDetails?.duration) meta.duration = parseISO8601DurationLocal(item.contentDetails.duration);
                    }
                }
            } catch (e) {}
        })());
    }

    await Promise.allSettled(tasks);

    if (!meta.avatar && meta.channel) {
        const primaryChannel = resolvePrimaryCreatorHandle(meta.channel);
        meta.avatar = `https://unavatar.io/youtube/${encodeURIComponent(primaryChannel)}`;
    }

    return meta;
}

function updateValidationUI(result) {
    if (!urlInputWrapper || !urlStatusText || !btnSaveCustom) return;

    urlInputWrapper.classList.remove('state-valid', 'state-invalid', 'state-fetching');
    urlStatusText.classList.remove('status-valid', 'status-invalid', 'status-fetching');

    if (!inputCustomUrl || !inputCustomUrl.value.trim()) {
        urlStatusText.textContent = "Waiting for input...";
        if (activeAbortController) {
            activeAbortController.abort();
            activeAbortController = null;
        }
        setModalFetchingState(false);
        hideLivePreview();
        currentDetectedVideoId = null;
        latestFetchedMeta = null;
        defaultFetchedDescription = '';
        isDescCustomized = false;
        setFormInputsLocked(true);
        return;
    }

    if (result.valid) {
        urlInputWrapper.classList.add('state-fetching');
        urlStatusText.classList.add('status-fetching');
        urlStatusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fetching video metadata...`;
        currentDetectedVideoId = result.id;
        showLivePreview(result.id);
    } else {
        urlInputWrapper.classList.add('state-invalid');
        urlStatusText.classList.add('status-invalid');
        urlStatusText.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${result.reason}`;
        if (activeAbortController) {
            activeAbortController.abort();
            activeAbortController = null;
        }
        setModalFetchingState(false);
        hideLivePreview();
        currentDetectedVideoId = null;
        latestFetchedMeta = null;
        defaultFetchedDescription = '';
        isDescCustomized = false;
        setFormInputsLocked(true);
    }
}

function validateCustomUrl(val) {
    const res = validateAndExtractYouTubeID(val);
    updateValidationUI(res);
}

async function showLivePreview(videoId) {
    if (!customLivePreview || !livePreviewImg) return;

    if (activeAbortController) {
        activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    if (typeof closeVirtualKeyboard === 'function') {
        closeVirtualKeyboard();
    }
    setModalFetchingState(true);

    livePreviewImg.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    livePreviewImg.onerror = () => {
        livePreviewImg.src = FALLBACK_THUMBNAIL;
    };

    if (livePreviewTitle) livePreviewTitle.textContent = `Video ID: ${videoId}`;
    if (livePreviewChannel) livePreviewChannel.textContent = "Fetching video details...";
    customLivePreview.classList.remove('hide-preview');

    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT_60S')), 60000);
        });

        const meta = await Promise.race([
            fetchFullYouTubeMetadata(videoId, activeAbortController.signal),
            timeoutPromise
        ]);

        if (meta && currentDetectedVideoId === videoId) {
            latestFetchedMeta = meta;
            defaultFetchedDescription = meta.description ? meta.description.trim() : "";
            isDescCustomized = false;

            const displayTitle = meta.title || "";
            const displayChannel = meta.channel || "";
            const primaryCreator = resolvePrimaryCreatorHandle(displayChannel);
            const displayAvatar = meta.avatar || (primaryCreator ? `https://unavatar.io/youtube/${encodeURIComponent(primaryCreator)}` : "");
            const displayDuration = meta.duration || "";
            const isDateActuallyFetched = Boolean(meta.isDateFetched && meta.releaseDate);
            const displayDate = isDateActuallyFetched ? meta.releaseDate : getTodayISODate();
            const displayViews = (meta.viewsCount && meta.viewsCount > 0) ? meta.viewsCount.toString() : "";

            if (livePreviewTitle) livePreviewTitle.textContent = displayTitle || `Custom Video (${videoId})`;
            if (livePreviewChannel) livePreviewChannel.textContent = displayChannel || "YouTube Creator";

            if (inputCustomTitle) {
                inputCustomTitle.value = displayTitle;
                inputCustomTitle.placeholder = displayTitle || "Enter video title...";
            }
            if (inputCustomChannel) {
                inputCustomChannel.value = displayChannel;
                inputCustomChannel.placeholder = displayChannel || "Enter creator name...";
            }
            if (inputCustomAvatar) {
                inputCustomAvatar.value = displayAvatar;
                inputCustomAvatar.placeholder = displayAvatar || "Enter avatar image URL...";
            }
            if (inputCustomDuration) {
                inputCustomDuration.value = displayDuration;
                inputCustomDuration.placeholder = displayDuration || "e.g. 02:12";
            }
            if (inputCustomViews) {
                inputCustomViews.value = displayViews;
                inputCustomViews.placeholder = displayViews || "e.g. 156096";
            }
            if (inputCustomDate) {
                inputCustomDate.value = displayDate;
                inputCustomDate.placeholder = displayDate || "YYYY-MM-DD";
            }

            if (inputCustomDesc) {
                inputCustomDesc.value = '';
                if (defaultFetchedDescription) {
                    inputCustomDesc.placeholder = "The Description Is Set As Default";
                    inputCustomDesc.classList.add('default-desc-active');
                } else {
                    inputCustomDesc.placeholder = "The video description is not set";
                    inputCustomDesc.classList.remove('default-desc-active');
                }
            }

            if (customDescStatus) {
                customDescStatus.textContent = "OPTIONAL";
                customDescStatus.className = "optional-badge";
            }

            if (btnResetDesc) {
                btnResetDesc.classList.add('hide-btn');
            }

            if (urlStatusText && urlInputWrapper) {
                urlInputWrapper.classList.remove('state-fetching', 'state-invalid');
                urlInputWrapper.classList.add('state-valid');
                urlStatusText.classList.remove('status-fetching', 'status-invalid');
                urlStatusText.classList.add('status-valid');
                urlStatusText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Valid YouTube Video URL`;
            }

            applyFieldLockStates({
                title: displayTitle,
                channel: displayChannel,
                avatar: displayAvatar,
                duration: displayDuration,
                viewsCount: meta.viewsCount,
                releaseDate: displayDate,
                isDateFetched: isDateActuallyFetched,
                description: defaultFetchedDescription
            });
        }
    } catch (err) {
        if (err.name === 'AbortError') return;
        applyFieldLockStates(null);
    } finally {
        activeAbortController = null;
        setModalFetchingState(false);
    }
}

function hideLivePreview() {
    if (customLivePreview) {
        customLivePreview.classList.add('hide-preview');
    }
}


/* ==========================================================================
   6. CUSTOM MODAL CONTROLS & SAVE ENGINE
   ========================================================================== */

if (btnCreateTag) {
    btnCreateTag.addEventListener('click', () => {
        if (isFetchingMetadata || !currentDetectedVideoId) return;

        const newTagVal = inputCustomNewTag ? inputCustomNewTag.value.trim() : '';
        if (newTagVal) {
            if (newTagVal.toLowerCase() === 'custom') {
                if (inputCustomNewTag) inputCustomNewTag.value = '';
                return;
            }

            const allCurrentTags = getAllAvailableCustomTags();
            const existingMatch = allCurrentTags.find(t => t.toLowerCase() === newTagVal.toLowerCase());

            if (existingMatch) {
                selectedTagsInModal.add(existingMatch);
            } else {
                sessionCreatedTags.push(newTagVal);
                selectedTagsInModal.add(newTagVal);
            }

            if (inputCustomNewTag) inputCustomNewTag.value = '';
            renderModalTagChips();

            const targetChip = customTagSelector.querySelector(`.tag-chip[data-tag="${existingMatch || newTagVal}"]`);
            if (targetChip) {
                scrollTagChipIntoView(targetChip);
            }

            if (typeof closeVirtualKeyboard === 'function') {
                closeVirtualKeyboard();
            }
            validateAllRequiredFields();
        }
    });
}

if (btnPasteClipboard) {
    btnPasteClipboard.addEventListener('click', async () => {
        if (isFetchingMetadata) return;

        try {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                throw new Error();
            }
            const text = await navigator.clipboard.readText();
            if (text && inputCustomUrl) {
                inputCustomUrl.value = text.trim();
                validateCustomUrl(inputCustomUrl.value);

                btnPasteClipboard.classList.add('pasted');
                btnPasteClipboard.innerHTML = `<i class="fa-solid fa-check"></i> <span>Pasted!</span>`;
                setTimeout(() => {
                    btnPasteClipboard.classList.remove('pasted');
                    btnPasteClipboard.innerHTML = `<i class="fa-solid fa-paste"></i> <span>Paste</span>`;
                }, 2000);
            }
        } catch (err) {
            btnPasteClipboard.innerHTML = `<i class="fa-solid fa-keyboard"></i> <span>Type</span>`;
            setTimeout(() => {
                btnPasteClipboard.innerHTML = `<i class="fa-solid fa-paste"></i> <span>Paste</span>`;
            }, 2000);
            if (typeof openVirtualKeyboardFor === 'function') {
                openVirtualKeyboardFor(inputCustomUrl, "YouTube URL or ID");
            }
        }
    });
}

function openAddCustomModal() {
    if (document.body.classList.contains('is-intro') || document.body.classList.contains('page-exit')) return;
    if (typeof closeVirtualKeyboard === 'function') {
        closeVirtualKeyboard();
    }

    if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
    }

    latestFetchedMeta = null;
    currentDetectedVideoId = null;
    defaultFetchedDescription = '';
    isDescCustomized = false;
    selectedTagsInModal.clear();
    sessionCreatedTags = [];

    if (inputCustomUrl) inputCustomUrl.value = '';
    if (inputCustomTitle) {
        inputCustomTitle.value = '';
        inputCustomTitle.placeholder = "Auto-fetching title...";
        inputCustomTitle.classList.remove('input-invalid');
    }
    if (inputCustomChannel) {
        inputCustomChannel.value = '';
        inputCustomChannel.placeholder = "Auto-fetching creator...";
        inputCustomChannel.classList.remove('input-invalid');
    }
    if (inputCustomAvatar) {
        inputCustomAvatar.value = '';
        inputCustomAvatar.placeholder = "Auto-fetching avatar...";
        inputCustomAvatar.classList.remove('input-invalid');
    }
    if (inputCustomDuration) {
        inputCustomDuration.value = '';
        inputCustomDuration.placeholder = "e.g. 02:12";
        inputCustomDuration.classList.remove('input-invalid');
    }
    if (inputCustomViews) {
        inputCustomViews.value = '';
        inputCustomViews.placeholder = "e.g. 156096";
        inputCustomViews.classList.remove('input-invalid');
    }
    if (inputCustomDate) {
        inputCustomDate.value = '';
        inputCustomDate.placeholder = "YYYY-MM-DD";
        inputCustomDate.classList.remove('input-invalid');
    }
    if (inputCustomDesc) {
        inputCustomDesc.value = '';
        inputCustomDesc.placeholder = "The video description is not set";
        inputCustomDesc.classList.remove('manual-allowed', 'default-desc-active');
    }
    if (customDescStatus) {
        customDescStatus.textContent = "OPTIONAL";
        customDescStatus.className = "optional-badge";
    }
    if (btnResetDesc) {
        btnResetDesc.classList.add('hide-btn');
    }
    if (inputCustomNewTag) {
        inputCustomNewTag.value = '';
        inputCustomNewTag.dataset.locked = "false";
        inputCustomNewTag.style.pointerEvents = "auto";
        inputCustomNewTag.style.opacity = "1";
        inputCustomNewTag.classList.remove('manual-allowed');
    }

    renderModalTagChips();
    if (customTagSelector) {
        customTagSelector.scrollTo({ left: 0, behavior: 'smooth' });
    }

    validateCustomUrl('');
    setFormInputsLocked(true);
    setModalFetchingState(false);

    if (customModal) {
        customModal.classList.remove('hide-preview');
        customModal.classList.add('active');
    }
    validateAllRequiredFields();
}

if (btnCustomAdd) {
    btnCustomAdd.addEventListener('click', () => {
        const isSuppressed = sessionStorage.getItem(CUSTOM_WARNING_SESSION_SUPPRESS) === 'true';
        if (!hasSeenWarningInSession && !isSuppressed) {
            showCustomModeWarning();
            return;
        }

        if (typeof currentMode !== 'undefined' && currentMode === 'custom') {
            toggleCustomEditMode();
        } else {
            openAddCustomModal();
        }
    });
}

function closeCustomModal() {
    if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
    }
    isFetchingMetadata = false;
    window.isFetchingMetadata = false;

    if (customModal) customModal.classList.remove('active');
    if (typeof closeVirtualKeyboard === 'function') {
        closeVirtualKeyboard();
    }
    hideLivePreview();
}

if (customModalClose) customModalClose.addEventListener('click', closeCustomModal);
if (btnCancelCustom) btnCancelCustom.addEventListener('click', closeCustomModal);

if (btnSaveCustom) {
    btnSaveCustom.addEventListener('click', () => {
        if (!validateAllRequiredFields()) return;

        const videoId = currentDetectedVideoId;
        const meta = latestFetchedMeta || {};

        const finalTitle = (inputCustomTitle && inputCustomTitle.value.trim()) || meta.title || `Custom Video (${videoId})`;
        const finalChannel = (inputCustomChannel && inputCustomChannel.value.trim()) || meta.channel || 'Custom Creator';
        const primaryCreator = resolvePrimaryCreatorHandle(finalChannel);
        const finalAvatar = (inputCustomAvatar && inputCustomAvatar.value.trim()) || meta.avatar || (primaryCreator ? `https://unavatar.io/youtube/${encodeURIComponent(primaryCreator)}` : DEFAULT_CUSTOM_AVATAR);

        let finalDuration = (inputCustomDuration && inputCustomDuration.value.trim()) || meta.duration || "3:00";
        if (/^\d{1,2}$/.test(finalDuration)) {
            finalDuration = `0:${finalDuration.padStart(2, '0')}`;
        }

        let finalViews = 0;
        if (inputCustomViews && inputCustomViews.value.trim()) {
            finalViews = parseInt(inputCustomViews.value.replace(/[^0-9]/g, ''), 10) || 0;
        } else if (meta.viewsCount) {
            finalViews = meta.viewsCount;
        }

        const finalDate = (inputCustomDate && inputCustomDate.value.trim()) || meta.releaseDate || getTodayISODate();
        const finalTagsArray = Array.from(selectedTagsInModal).filter(t => t.toLowerCase() !== 'custom');
        const primaryTagDisplay = finalTagsArray.length > 0 ? finalTagsArray[0] : 'Custom';

        let finalDesc = "";
        if (isDescCustomized && inputCustomDesc && inputCustomDesc.value.trim().length > 0) {
            finalDesc = inputCustomDesc.value.trim();
        } else if (defaultFetchedDescription) {
            finalDesc = defaultFetchedDescription;
        } else if (meta.description) {
            finalDesc = meta.description.trim();
        } else {
            finalDesc = `Custom video stream added to ${primaryTagDisplay} collection.`;
        }

        finalTagsArray.forEach(t => {
            addCustomCategory(t);
        });

        const customObj = {
            id: videoId,
            title: finalTitle,
            channel: finalChannel,
            avatar: finalAvatar,
            description: finalDesc,
            category: ["All", ...finalTagsArray],
            duration: finalDuration,
            releaseDate: finalDate,
            viewsCount: finalViews,
            thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            stats: `${formatViewsCount(finalViews)} views • ${formatReleaseDate(finalDate)}`
        };

        saveCustomVideo(customObj);
        closeCustomModal();

        if (typeof currentMode !== 'undefined' && currentMode === 'custom' && !isCustomEditMode && !isCustomDeleteMode) {
            if (typeof renderCategoryChips === 'function') {
                renderCategoryChips(getStoredCustomCategories());
            }
        }
        if (typeof fetchAndFilterVideos === 'function') {
            fetchAndFilterVideos(true);
        }
    });
}