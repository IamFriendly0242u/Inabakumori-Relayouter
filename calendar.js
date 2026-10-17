/* ==========================================================================
   1. DOM ELEMENTS SELECTION & GLOBAL STATE
   ========================================================================== */

let calDaysWrapper = document.getElementById('days-wrapper');
let calWeekdaysHeader = document.querySelector('.weekdays-header');
let calMonthDisplay = document.getElementById('monthDisplay');
let calYearDisplay = document.getElementById('yearDisplay');
let calPrevBtn = document.getElementById('cal-prev');
let calNextBtn = document.getElementById('cal-next');
let calYearsWrapper = document.getElementById('years-wrapper');
let calYearsList = document.getElementById('years-list');
let calPanelLeft = document.getElementById('calendar-panel-left');
let calRail = document.getElementById('cal-rail');
let calCloseBtn = document.getElementById('cal-close-btn');
let calScrollUp = document.getElementById('cal-scroll-up');
let calScrollDown = document.getElementById('cal-scroll-down');
let calPanelRight = document.getElementById('calendar-panel-right');
let calBody = document.getElementById('calendar-body');

let calPanelTop = document.getElementById('cal-panel-top');
let calPanelTime = document.getElementById('panel-time');
let calSelectedDayName = document.getElementById('cal-selected-day-name');
let calSelectedDateDisplay = document.getElementById('cal-selected-date-display');
let calEventsList = document.getElementById('cal-events-list');
let calTimeDisplayBottom = document.getElementById('timeDisplay');

let calRightDateDisplay = document.getElementById('cal-right-date-display');
let calRightCountBadge = document.getElementById('cal-right-count-badge');
let calSpecialInput = document.getElementById('cal-special-input');
let calSpecialAddBtn = document.getElementById('cal-special-add-btn');
let calTypeChips = document.getElementById('cal-type-chips');
let calSubfieldsContainer = document.getElementById('cal-subfields-container');
let calRightEventsList = document.getElementById('cal-right-events-list');

let calVkCloseBtn = document.getElementById('cal-vk-close');
let calVkBackspace = document.getElementById('cal-vk-backspace');
let calVkCaps = document.getElementById('cal-vk-caps');
let calVkClear = document.getElementById('cal-vk-clear');
let calVkLeft = document.getElementById('cal-vk-left');
let calVkRight = document.getElementById('cal-vk-right');
let calVkSpace = document.getElementById('cal-vk-space');
let calVkDone = document.getElementById('cal-vk-done');

let pageSelectorNav = document.getElementById('pageSelector');

let calCurrentDate = new Date();
let calActiveMonth = calCurrentDate.getMonth();
let calActiveYear = calCurrentDate.getFullYear();
let calIsYearPickerOpen = false;
let calIsTransitioning = false;
let calIsPanelAnimating = false;
let calIsRightPanelOpen = false;
let calIsContentLoading = false;
let calPendingClose = false;
let calContentLoadTimeout = null;
let calScrollAnimation = null;
let calSelectedDayElement = null;
let calBtnTimeout = null;
let calFadeDebounce = null;

let calActiveCategoryType = 'event';
let calIsCapsLock = false;

let eventMarqueeHandles = [];

const CAL_VIEW_SPECIAL_DAYS = "SPECIAL DAYS";
const CAL_VIEW_CALENDARS = "CALENDARS";
const CAL_VIEW_OBSERVANCES = "SPECIAL OBSERVANCES";

const calViewSequence = [
    CAL_VIEW_SPECIAL_DAYS,
    CAL_VIEW_CALENDARS,
    CAL_VIEW_OBSERVANCES
];

let calCurrentView = CAL_VIEW_CALENDARS;
let calActiveDayNum = 1;
let calActiveDateObj = new Date();

let calNationalHolidaysCache = {};
let calHolidayFetchStatus = "idle";
let calHolidayFetchErrorMsg = "";

const calMonthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL",
    "MAY", "JUNE", "JULY", "AUGUST",
    "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const calFullDayNames = [
    "SUNDAY", "MONDAY", "TUESDAY",
    "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
];


/* ==========================================================================
   2. CLOCK SYNC & PANEL DATA UPDATES
   ========================================================================== */

function syncPanelClock() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    if (calPanelTime) {
        calPanelTime.innerHTML = `${hours}:${minutes}${ampm}`;
    }
}

setInterval(syncPanelClock, 1000);
syncPanelClock();

async function detectUserCountryCode() {
    const cacheKey = "osage_detected_country_data";
    try {
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.code && Date.now() - (parsed.timestamp || 0) < 24 * 60 * 60 * 1000) {
                return parsed.code;
            }
        }
    } catch (e) {}

    if (navigator.onLine) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3500);
            const res = await fetch("https://api.country.is/", { signal: controller.signal });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                if (data && data.country && /^[A-Z]{2}$/i.test(data.country)) {
                    const code = data.country.toUpperCase();
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify({
                            code: code,
                            timestamp: Date.now()
                        }));
                    } catch (e) {}
                    return code;
                }
            }
        } catch (e) {}
    }

    try {
        const resolvedLocale = new Intl.DateTimeFormat().resolvedOptions().locale;
        if (resolvedLocale) {
            const loc = new Intl.Locale(resolvedLocale);
            if (loc.region && loc.region.length === 2) {
                return loc.region.toUpperCase();
            }
        }
    } catch (e) {}

    try {
        const navLangs = navigator.languages || [navigator.language];
        for (let l of navLangs) {
            if (l && l.includes("-")) {
                const parts = l.split("-");
                const region = parts[parts.length - 1].toUpperCase();
                if (region.length === 2 && /^[A-Z]{2}$/.test(region)) {
                    return region;
                }
            }
        }
    } catch (e) {}

    return "US";
}

async function loadNationalHolidays(year) {
    const country = await detectUserCountryCode();
    const cacheKey = `osage_holidays_${country}_${year}`;

    try {
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
            calNationalHolidaysCache = JSON.parse(saved);
            calHolidayFetchStatus = "success";
            calHolidayFetchErrorMsg = "";
            applySmartDefaultView();
            return;
        }
    } catch (e) {}

    if (!navigator.onLine) {
        calHolidayFetchStatus = "error";
        calHolidayFetchErrorMsg = "No internet connection to load national holidays.";
        applySmartDefaultView();
        return;
    }

    calHolidayFetchStatus = "loading";

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
            calHolidayFetchStatus = "error";
            calHolidayFetchErrorMsg = "Unable to fetch national calendar. Check your network connection.";
            applySmartDefaultView();
            return;
        }

        const data = await res.json();
        const mapped = {};

        data.forEach(item => {
            const parts = item.date.split('-');
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            const k = `${m}-${d}`;

            if (!mapped[k]) mapped[k] = [];
            mapped[k].push({
                name: item.localName || item.name,
                official: true
            });
        });

        calNationalHolidaysCache = mapped;
        calHolidayFetchStatus = "success";
        calHolidayFetchErrorMsg = "";

        try {
            localStorage.setItem(cacheKey, JSON.stringify(mapped));
        } catch (e) {}

        applySmartDefaultView();
    } catch (err) {
        calHolidayFetchStatus = "error";
        calHolidayFetchErrorMsg = "Unable to fetch national calendar. Check your network connection.";
        applySmartDefaultView();
    }
}

function applySmartDefaultView() {
    if (!isLeftPanelOpen()) return;

    const monthNum = calActiveDateObj.getMonth() + 1;
    const dayNumber = calActiveDayNum;
    const key = `${monthNum}-${dayNumber}`;

    const hasCustom = getStoredSpecialDays(monthNum, dayNumber);
    const hasNational = calNationalHolidaysCache && calNationalHolidaysCache[key] && calNationalHolidaysCache[key].length > 0;

    if (hasCustom && hasCustom.length > 0) {
        calCurrentView = CAL_VIEW_SPECIAL_DAYS;
    } else if (hasNational) {
        calCurrentView = CAL_VIEW_CALENDARS;
    } else {
        calCurrentView = CAL_VIEW_OBSERVANCES;
    }

    renderCurrentViewContent(false);
}

function getStoredSpecialDays(monthNum, dayNumber) {
    try {
        const raw = localStorage.getItem("osage_custom_special_days");
        if (raw) {
            const parsed = JSON.parse(raw);
            const key = `${monthNum}-${dayNumber}`;
            if (parsed && Array.isArray(parsed[key]) && parsed[key].length > 0) {
                return parsed[key];
            }
        }
    } catch (e) {}
    return null;
}

function updateScrollButtonsVisibility() {
    if (!calEventsList || !calScrollUp || !calScrollDown) return;

    if (calIsContentLoading || (calPanelLeft && calPanelLeft.classList.contains('rail-only'))) {
        calScrollUp.classList.add('hidden');
        calScrollDown.classList.add('hidden');
        return;
    }

    const scrollHeight = calEventsList.scrollHeight;
    const clientHeight = calEventsList.clientHeight;
    const scrollTop = calEventsList.scrollTop;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 4) {
        calScrollUp.classList.add('hidden');
        calScrollDown.classList.add('hidden');
        return;
    }

    if (scrollTop <= 2) {
        calScrollUp.classList.add('hidden');
    } else {
        calScrollUp.classList.remove('hidden');
    }

    if (scrollTop >= maxScroll - 2) {
        calScrollDown.classList.add('hidden');
    } else {
        calScrollDown.classList.remove('hidden');
    }
}

if (calEventsList) {
    calEventsList.addEventListener('scroll', updateScrollButtonsVisibility);
}

if (calScrollUp) {
    calScrollUp.addEventListener('click', (e) => {
        e.stopPropagation();
        if (calIsContentLoading || !calEventsList) return;
        calEventsList.scrollBy({ top: -56, behavior: 'smooth' });
    });
}

if (calScrollDown) {
    calScrollDown.addEventListener('click', (e) => {
        e.stopPropagation();
        if (calIsContentLoading || !calEventsList) return;
        calEventsList.scrollBy({ top: 56, behavior: 'smooth' });
    });
}

function stopEventMarquees() {
    eventMarqueeHandles.forEach(h => {
        if (h) {
            if (h.raf) cancelAnimationFrame(h.raf);
            if (h.timeout) clearTimeout(h.timeout);
        }
    });
    eventMarqueeHandles = [];
}

function createEventMarquee(wrapper, track, text, index, baseDelay) {
    if (!wrapper || !track) return;

    track.style.transform = "translateX(0px)";
    track.innerHTML = `<span>${text}</span>`;

    const handleObj = { raf: null, timeout: null };
    eventMarqueeHandles[index] = handleObj;

    const SPEED_PX_PER_SEC = 30;
    const PAUSE_DURATION = 3000;

    let initialWait = (baseDelay * 1000) + PAUSE_DURATION;

    handleObj.timeout = setTimeout(() => {
        let maxScroll = track.scrollWidth - wrapper.clientWidth;
        if (maxScroll <= 2) {
            track.style.transform = "translateX(0px)";
            return;
        }

        let scrollDuration = Math.max(1500, (maxScroll / SPEED_PX_PER_SEC) * 1000);
        let state = "SCROLL_RIGHT";
        let startTime = performance.now();

        function step(now) {
            if (!track || !wrapper) return;

            maxScroll = track.scrollWidth - wrapper.clientWidth;
            if (maxScroll <= 2) {
                track.style.transform = "translateX(0px)";
                return;
            }

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
                        maxScroll = track.scrollWidth - wrapper.clientWidth;
                        if (maxScroll <= 2) {
                            track.style.transform = "translateX(0px)";
                            return;
                        }
                        scrollDuration = Math.max(1500, (maxScroll / SPEED_PX_PER_SEC) * 1000);
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
    }, initialWait);
}

function cycleCalendarView() {
    if (calIsContentLoading || calIsPanelAnimating) return;

    const titleTextEl = document.querySelector('.events-header-title .title-text');
    const currentIndex = calViewSequence.indexOf(calCurrentView);
    const nextIndex = (currentIndex + 1) % calViewSequence.length;
    calCurrentView = calViewSequence[nextIndex];

    if (titleTextEl) {
        titleTextEl.classList.remove('slide-in-right', 'slide-out-left');
        void titleTextEl.offsetWidth;
        titleTextEl.classList.add('slide-out-left');

        setTimeout(() => {
            titleTextEl.textContent = calCurrentView;
            titleTextEl.classList.remove('slide-out-left');
            void titleTextEl.offsetWidth;
            titleTextEl.classList.add('slide-in-right');
            renderCurrentViewContent(true);
        }, 160);
    } else {
        renderCurrentViewContent(true);
    }
}

function renderCurrentViewContent(isManualSwitch = false) {
    const titleEl = document.querySelector('.events-header-title');
    if (titleEl) {
        titleEl.classList.add('clickable-tab');
        let textSpan = titleEl.querySelector('.title-text');
        if (!textSpan) {
            titleEl.innerHTML = `<span class="title-text">${calCurrentView}</span>`;
        } else {
            textSpan.textContent = calCurrentView;
        }

        titleEl.onclick = (e) => {
            e.stopPropagation();
            cycleCalendarView();
        };
    }

    if (!calEventsList) return;

    stopEventMarquees();
    calEventsList.innerHTML = '';
    calEventsList.scrollTop = 0;

    const monthNum = calActiveDateObj.getMonth() + 1;
    const dayNumber = calActiveDayNum;
    const key = `${monthNum}-${dayNumber}`;

    let itemsToRender = [];
    let emptyMessage = "";
    let isErrorState = false;

    if (calCurrentView === CAL_VIEW_SPECIAL_DAYS) {
        const specialDays = getStoredSpecialDays(monthNum, dayNumber);
        if (specialDays && specialDays.length > 0) {
            itemsToRender = specialDays;
        } else {
            emptyMessage = "No Special Days recorded. Please set up your special days first.";
        }
    } else if (calCurrentView === CAL_VIEW_CALENDARS) {
        if (calHolidayFetchStatus === "loading") {
            emptyMessage = "Fetching national holidays...";
        } else if (calHolidayFetchStatus === "error") {
            isErrorState = true;
            emptyMessage = calHolidayFetchErrorMsg || "Unable to fetch national calendar. Check your network connection.";
        } else {
            const holidays = calNationalHolidaysCache[key];
            if (holidays && holidays.length > 0) {
                itemsToRender = holidays;
            } else {
                emptyMessage = "No national holidays on this date.";
            }
        }
    } else if (calCurrentView === CAL_VIEW_OBSERVANCES) {
        const dataPool = (typeof specialObservances !== 'undefined') ? specialObservances : (window.specialObservances || null);
        const observances = dataPool ? dataPool[key] : null;

        if (observances && observances.length > 0) {
            itemsToRender = observances;
        } else {
            emptyMessage = "No special observances on this date.";
        }
    }

    let startDelay = isManualSwitch ? 0.05 : 0.25;
    let totalItems = itemsToRender.length > 0 ? itemsToRender.length : 1;
    let staggerStep = 0.12;
    let totalAnimTimeMs = ((startDelay + (totalItems - 1) * staggerStep) + 0.45) * 1000;

    calIsContentLoading = true;
    if (calCloseBtn) calCloseBtn.classList.add('controls-locked');
    if (calScrollUp) calScrollUp.classList.add('hidden');
    if (calScrollDown) calScrollDown.classList.add('hidden');

    if (calContentLoadTimeout) clearTimeout(calContentLoadTimeout);

    calContentLoadTimeout = setTimeout(() => {
        calIsContentLoading = false;
        if (calCloseBtn) calCloseBtn.classList.remove('controls-locked');
        updateScrollButtonsVisibility();

        if (calPendingClose) {
            calPendingClose = false;
            closeBothPanels();
            resetCalendarToCurrentDate();
        }
    }, totalAnimTimeMs);

    if (itemsToRender.length > 0) {
        itemsToRender.forEach((evt, idx) => {
            let div = document.createElement('div');
            div.classList.add('event-item');
            let itemDelay = startDelay + (idx * staggerStep);
            div.style.animationDelay = `${itemDelay.toFixed(2)}s`;

            let eventName = (typeof evt === 'object' && evt.name) ? evt.name : evt;
            let isOfficial = (typeof evt === 'object' && evt.official);
            let iconSrc = isOfficial ? 'assets/icons/icons8-check-32.png' : 'assets/icons/icons8-question-32.png';
            let iconTitle = isOfficial ? 'Official Observance' : 'Community Observance';

            div.innerHTML = `
                <div class="event-text-wrapper">
                    <div class="event-text-track">
                        <span>${eventName}</span>
                    </div>
                </div>
                <div class="event-badge" title="${iconTitle}">
                    <img src="${iconSrc}" alt="${iconTitle}">
                </div>
            `;

            calEventsList.appendChild(div);

            let wrapper = div.querySelector('.event-text-wrapper');
            let track = div.querySelector('.event-text-track');
            createEventMarquee(wrapper, track, eventName, idx, itemDelay);
        });
    } else {
        let div = document.createElement('div');
        div.classList.add('event-item', 'no-event');
        if (isErrorState) div.classList.add('error-event');
        div.style.animationDelay = `${startDelay}s`;
        div.innerHTML = emptyMessage;
        calEventsList.appendChild(div);
    }
}

function updateLeftPanelData(dayNumber, dateObj, isPanelAlreadyOpen = false) {
    calActiveDayNum = dayNumber;
    calActiveDateObj = dateObj;

    let dayOfWeek = calFullDayNames[dateObj.getDay()];
    let monthName = calMonthNames[dateObj.getMonth()];
    let yearNum = dateObj.getFullYear();
    let monthNum = dateObj.getMonth() + 1;

    if (calSelectedDayName) {
        calSelectedDayName.innerHTML = dayOfWeek;
    }
    if (calSelectedDateDisplay) {
        calSelectedDateDisplay.innerHTML = `${monthName} ${dayNumber}, ${yearNum}`;
    }

    const key = `${monthNum}-${dayNumber}`;
    const hasCustom = getStoredSpecialDays(monthNum, dayNumber);
    const hasNational = calNationalHolidaysCache && calNationalHolidaysCache[key] && calNationalHolidaysCache[key].length > 0;

    if (hasCustom && hasCustom.length > 0) {
        calCurrentView = CAL_VIEW_SPECIAL_DAYS;
    } else if (hasNational) {
        calCurrentView = CAL_VIEW_CALENDARS;
    } else {
        calCurrentView = CAL_VIEW_OBSERVANCES;
    }

    renderCurrentViewContent(isPanelAlreadyOpen);
}


/* ==========================================================================
   3. NAVIGATION EVENT LISTENERS & AUTO RESET
   ========================================================================== */

let calIsKeyboardAnimating = false;

function isLeftPanelOpen() {
    return calPanelLeft && !calPanelLeft.classList.contains('hide-panel');
}

function openRightPanel() {
    if (!calPanelRight || calIsContentLoading) return;
    calIsRightPanelOpen = true;
    calPanelRight.classList.remove('hide-panel');

    if (calPanelLeft) {
        calPanelLeft.classList.add('rail-only');
        calPanelLeft.classList.remove('hide-panel');
    }
    if (calRail) {
        calRail.classList.add('rail-visible');
    }
    if (calCloseBtn) {
        calCloseBtn.innerHTML = '&lt;';
    }
    updateScrollButtonsVisibility();
    renderRightPanelContent();
}

function closeRightPanel() {
    if (!calPanelRight) return;
    closeCalendarKeyboard();
    calIsRightPanelOpen = false;
    calPanelRight.classList.add('hide-panel');

    if (calPanelLeft && calPanelLeft.classList.contains('rail-only')) {
        calPanelLeft.classList.remove('rail-only');
    }
    if (calCloseBtn) {
        calCloseBtn.innerHTML = '&gt;';
    }
    setTimeout(updateScrollButtonsVisibility, 300);

    applySmartDefaultView();
}

function renderRightPanelContent() {
    if (!calPanelRight) return;

    if (!calRightDateDisplay) calRightDateDisplay = document.getElementById('cal-right-date-display');
    if (!calRightCountBadge) calRightCountBadge = document.getElementById('cal-right-count-badge');
    if (!calSpecialInput) calSpecialInput = document.getElementById('cal-special-input');
    if (!calTypeChips) calTypeChips = document.getElementById('cal-type-chips');
    if (!calSubfieldsContainer) calSubfieldsContainer = document.getElementById('cal-subfields-container');
    if (!calRightEventsList) calRightEventsList = document.getElementById('cal-right-events-list');

    const monthName = calMonthNames[calActiveDateObj.getMonth()];
    const dayNumber = calActiveDayNum;
    const yearNum = calActiveDateObj.getFullYear();
    const monthNum = calActiveDateObj.getMonth() + 1;

    if (calRightDateDisplay) {
        calRightDateDisplay.textContent = `${monthName} ${dayNumber}, ${yearNum}`;
    }

    if (calSpecialInput) {
        calSpecialInput.value = '';
    }

    renderCategoryChipsUI();
    renderSubfieldsUI();
    renderRightEventsList(monthNum, dayNumber);
}

function renderCategoryChipsUI() {
    if (!calTypeChips) calTypeChips = document.getElementById('cal-type-chips');
    if (!calTypeChips) return;

    calTypeChips.querySelectorAll('.cal-type-chip').forEach(chip => {
        const type = chip.getAttribute('data-type');
        chip.classList.toggle('active', type === calActiveCategoryType);

        chip.onclick = (e) => {
            e.stopPropagation();
            calActiveCategoryType = type;
            renderCategoryChipsUI();
            renderSubfieldsUI();
        };
    });
}

function renderSubfieldsUI() {
    if (!calSubfieldsContainer) calSubfieldsContainer = document.getElementById('cal-subfields-container');
    if (!calSubfieldsContainer) return;
    calSubfieldsContainer.innerHTML = '';

    if (calActiveCategoryType === 'task') {
        calSubfieldsContainer.innerHTML = `
            <div class="cal-subfield-row cal-subfield-note">
                <span>Task item with interactive checklist</span>
            </div>
        `;
    } else if (calActiveCategoryType === 'reminder') {
        calSubfieldsContainer.innerHTML = `
            <div class="cal-subfield-row">
                <span>Time:</span>
                <input type="time" id="cal-sub-time" value="12:00">
            </div>
        `;
    } else if (calActiveCategoryType === 'memo') {
        calSubfieldsContainer.innerHTML = `
            <div class="cal-subfield-row cal-subfield-note">
                <span>Freeform daily memo or note</span>
            </div>
        `;
    } else if (calActiveCategoryType === 'dday') {
        calSubfieldsContainer.innerHTML = `
            <div class="cal-subfield-row cal-subfield-note">
                <span>Calculates live D-Day countdown from today</span>
            </div>
        `;
    }
}

function calculateDDayBadge(dateObj) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'D-DAY';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

function renderRightEventsList(monthNum, dayNumber) {
    if (!calRightEventsList) calRightEventsList = document.getElementById('cal-right-events-list');
    if (!calRightCountBadge) calRightCountBadge = document.getElementById('cal-right-count-badge');
    if (!calRightEventsList) return;
    calRightEventsList.innerHTML = '';

    const specialDays = getStoredSpecialDays(monthNum, dayNumber);
    const count = specialDays ? specialDays.length : 0;

    if (calRightCountBadge) {
        if (count === 1) {
            calRightCountBadge.textContent = '1 EVENT SCHEDULED';
        } else if (count > 1) {
            calRightCountBadge.textContent = `${count} EVENTS SCHEDULED`;
        } else {
            calRightCountBadge.textContent = '0 EVENTS SCHEDULED';
        }
    }

    if (specialDays && specialDays.length > 0) {
        specialDays.forEach((evt, idx) => {
            const div = document.createElement('div');
            div.className = 'special-event-item';

            const itemType = (typeof evt === 'object' && evt.type) ? evt.type : 'event';
            const eventName = (typeof evt === 'object' && evt.name) ? evt.name : evt;
            const isDone = (typeof evt === 'object' && evt.done);

            if (itemType === 'task' && isDone) {
                div.classList.add('task-done');
            }

            let badgeHtml = '';
            let leadHtml = '';

            if (itemType === 'task') {
                leadHtml = `<input type="checkbox" class="special-task-checkbox" ${isDone ? 'checked' : ''}>`;
            } else if (itemType === 'dday') {
                const ddayText = calculateDDayBadge(calActiveDateObj);
                badgeHtml = `<span class="special-pill-badge pill-dday">${ddayText}</span>`;
            } else if (itemType === 'reminder') {
                const timeStr = evt.time || '12:00';
                badgeHtml = `<span class="special-pill-badge pill-reminder">${timeStr}</span>`;
            } else if (itemType === 'memo') {
                badgeHtml = `<span class="special-pill-badge pill-memo">MEMO</span>`;
            } else {
                badgeHtml = `<span class="special-pill-badge pill-event">EVENT</span>`;
            }

            div.innerHTML = `
                ${leadHtml}
                <div class="event-text-wrapper">
                    ${badgeHtml}
                    <div class="event-text-track">
                        <span>${eventName}</span>
                    </div>
                </div>
                <button type="button" class="special-event-del-btn" title="Delete entry">✕</button>
            `;

            const chk = div.querySelector('.special-task-checkbox');
            if (chk) {
                chk.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleTaskDone(monthNum, dayNumber, idx);
                });
            }

            const delBtn = div.querySelector('.special-event-del-btn');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteSpecialDay(monthNum, dayNumber, idx);
                });
            }

            calRightEventsList.appendChild(div);

            const wrapper = div.querySelector('.event-text-wrapper');
            const track = div.querySelector('.event-text-track');
            createEventMarquee(wrapper, track, eventName, 1000 + idx, 0.1);
        });
    } else {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'special-no-event';
        emptyDiv.textContent = 'No special days recorded for this date.';
        calRightEventsList.appendChild(emptyDiv);
    }
}

function toggleCalendarKeyboard() {
    if (calIsKeyboardAnimating) return;
    calIsKeyboardAnimating = true;

    if (!calBody) calBody = document.getElementById('calendar-body');
    if (calBody && calBody.classList.contains('keyboard-open')) {
        closeCalendarKeyboard();
    } else {
        openCalendarKeyboard();
    }

    setTimeout(() => {
        calIsKeyboardAnimating = false;
    }, 350);
}

function openCalendarKeyboard() {
    if (!calBody) calBody = document.getElementById('calendar-body');
    if (!calSpecialInput) calSpecialInput = document.getElementById('cal-special-input');
    if (calBody) calBody.classList.add('keyboard-open');
    if (calSpecialInput) calSpecialInput.classList.add('input-focused');
    updateCalKeyboardCapsUI();
}

function closeCalendarKeyboard() {
    if (!calBody) calBody = document.getElementById('calendar-body');
    if (!calSpecialInput) calSpecialInput = document.getElementById('cal-special-input');
    if (calBody) calBody.classList.remove('keyboard-open');
    if (calSpecialInput) calSpecialInput.classList.remove('input-focused');
}

function updateCalKeyboardCapsUI() {
    document.querySelectorAll('#cal-virtual-keyboard .cal-vk-key[data-key]').forEach(btn => {
        const keyVal = btn.getAttribute('data-key');
        if (/^[a-zA-Z]$/.test(keyVal)) {
            const transformed = calIsCapsLock ? keyVal.toUpperCase() : keyVal.toLowerCase();
            btn.setAttribute('data-key', transformed);
            btn.textContent = transformed;
        }
    });

    if (calVkCaps) {
        calVkCaps.classList.toggle('active', calIsCapsLock);
    }
}

if (calSpecialInput) {
    calSpecialInput.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCalendarKeyboard();
    });
}

if (calVkCloseBtn) calVkCloseBtn.addEventListener('click', closeCalendarKeyboard);
if (calVkDone) calVkDone.addEventListener('click', closeCalendarKeyboard);

if (calVkCaps) {
    calVkCaps.addEventListener('click', (e) => {
        e.stopPropagation();
        calIsCapsLock = !calIsCapsLock;
        updateCalKeyboardCapsUI();
    });
}

if (calVkLeft) {
    calVkLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!calSpecialInput) return;
        const start = calSpecialInput.selectionStart || 0;
        const newPos = Math.max(0, start - 1);
        calSpecialInput.setSelectionRange(newPos, newPos);
    });
}

if (calVkRight) {
    calVkRight.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!calSpecialInput) return;
        const end = calSpecialInput.selectionEnd || 0;
        const newPos = Math.min(calSpecialInput.value.length, end + 1);
        calSpecialInput.setSelectionRange(newPos, newPos);
    });
}

document.querySelectorAll('#cal-virtual-keyboard .cal-vk-key[data-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!calSpecialInput) return;

        const char = btn.getAttribute('data-key');
        const start = calSpecialInput.selectionStart || calSpecialInput.value.length;
        const end = calSpecialInput.selectionEnd || calSpecialInput.value.length;
        const val = calSpecialInput.value;

        calSpecialInput.value = val.slice(0, start) + char + val.slice(end);
        calSpecialInput.setSelectionRange(start + char.length, start + char.length);
    });
});

if (calVkBackspace) {
    calVkBackspace.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!calSpecialInput || calSpecialInput.value.length === 0) return;

        const start = calSpecialInput.selectionStart || calSpecialInput.value.length;
        const end = calSpecialInput.selectionEnd || calSpecialInput.value.length;
        const val = calSpecialInput.value;

        if (start === end && start > 0) {
            calSpecialInput.value = val.slice(0, start - 1) + val.slice(end);
            calSpecialInput.setSelectionRange(start - 1, start - 1);
        } else if (start !== end) {
            calSpecialInput.value = val.slice(0, start) + val.slice(end);
            calSpecialInput.setSelectionRange(start, start);
        }
    });
}

if (calVkSpace) {
    calVkSpace.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!calSpecialInput) return;

        const start = calSpecialInput.selectionStart || calSpecialInput.value.length;
        const end = calSpecialInput.selectionEnd || calSpecialInput.value.length;
        const val = calSpecialInput.value;

        calSpecialInput.value = val.slice(0, start) + ' ' + val.slice(end);
        calSpecialInput.setSelectionRange(start + 1, start + 1);
    });
}

if (calVkClear) {
    calVkClear.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!calSpecialInput) return;
        calSpecialInput.value = '';
    });
}

function addSpecialDay() {
    if (!calSpecialInput) calSpecialInput = document.getElementById('cal-special-input');
    if (!calSpecialInput) return;

    const text = calSpecialInput.value.trim();
    if (!text) return;

    const monthNum = calActiveDateObj.getMonth() + 1;
    const dayNumber = calActiveDayNum;
    const key = `${monthNum}-${dayNumber}`;

    let timeVal = '';
    const inputTime = document.getElementById('cal-sub-time');
    if (inputTime && calActiveCategoryType === 'reminder') {
        timeVal = inputTime.value || '12:00';
    }

    try {
        let store = {};
        const raw = localStorage.getItem("osage_custom_special_days");
        if (raw) {
            store = JSON.parse(raw) || {};
        }
        if (!Array.isArray(store[key])) {
            store[key] = [];
        }
        store[key].push({
            id: Date.now(),
            name: text,
            type: calActiveCategoryType,
            time: timeVal,
            done: false,
            official: false
        });
        localStorage.setItem("osage_custom_special_days", JSON.stringify(store));
    } catch (e) {}

    calSpecialInput.value = '';
    closeCalendarKeyboard();
    renderRightEventsList(monthNum, dayNumber);
}

function toggleTaskDone(monthNum, dayNumber, index) {
    const key = `${monthNum}-${dayNumber}`;
    try {
        const raw = localStorage.getItem("osage_custom_special_days");
        if (raw) {
            const store = JSON.parse(raw) || {};
            if (Array.isArray(store[key]) && store[key][index]) {
                store[key][index].done = !store[key][index].done;
                localStorage.setItem("osage_custom_special_days", JSON.stringify(store));
            }
        }
    } catch (e) {}

    renderRightEventsList(monthNum, dayNumber);
}

function deleteSpecialDay(monthNum, dayNumber, index) {
    const key = `${monthNum}-${dayNumber}`;
    try {
        const raw = localStorage.getItem("osage_custom_special_days");
        if (raw) {
            const store = JSON.parse(raw) || {};
            if (Array.isArray(store[key])) {
                store[key].splice(index, 1);
                if (store[key].length === 0) {
                    delete store[key];
                }
                localStorage.setItem("osage_custom_special_days", JSON.stringify(store));
            }
        }
    } catch (e) {}

    renderRightEventsList(monthNum, dayNumber);
}

if (calSpecialAddBtn) {
    calSpecialAddBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addSpecialDay();
    });
}

function closeBothPanels(force = false) {
    if (calIsPanelAnimating && !force) return;
    calIsPanelAnimating = true;
    if (calBtnTimeout) clearTimeout(calBtnTimeout);

    closeCalendarKeyboard();
    stopEventMarquees();

    if (calContentLoadTimeout) {
        clearTimeout(calContentLoadTimeout);
        calContentLoadTimeout = null;
    }
    calIsContentLoading = false;
    calPendingClose = false;

    if (calCloseBtn) {
        calCloseBtn.innerHTML = '&lt;';
        calCloseBtn.classList.remove('controls-locked');
    }

    if (calPanelTop) {
        calPanelTop.classList.add('hide-top-info');
    }

    if (calPanelRight) {
        calIsRightPanelOpen = false;
        calPanelRight.classList.add('hide-panel');
    }

    if (calPanelLeft) {
        calPanelLeft.classList.remove('rail-only');
        calPanelLeft.classList.add('hide-panel');
    }

    if (calSelectedDayElement) {
        let prevDay = calSelectedDayElement.getAttribute('data-day');
        if (prevDay) {
            calSelectedDayElement.innerHTML = prevDay;
        }
        calSelectedDayElement.classList.remove('selected-day');
        calSelectedDayElement = null;
    }

    if (calScrollUp) calScrollUp.classList.add('hidden');
    if (calScrollDown) calScrollDown.classList.add('hidden');

    calBtnTimeout = setTimeout(() => {
        if (calRail) {
            calRail.classList.remove('rail-visible');
        }
        if (calTimeDisplayBottom) {
            calTimeDisplayBottom.classList.remove('hide-time');
        }
        calIsPanelAnimating = false;
    }, 1200);
}

if (calCloseBtn) {
    calCloseBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsContentLoading || calIsPanelAnimating) return;

        if (calIsRightPanelOpen) {
            closeRightPanel();
        } else {
            closeLeftPanel();
        }
    });
}

function closeLeftPanel(force = false) {
    if (calIsContentLoading && !force) {
        calPendingClose = true;
        return;
    }

    if (calIsPanelAnimating && !force) return;
    if (calPanelLeft && calPanelLeft.classList.contains('hide-panel')) return;

    calIsPanelAnimating = true;
    if (calBtnTimeout) clearTimeout(calBtnTimeout);

    closeRightPanel();

    let eventItems = calEventsList ? calEventsList.querySelectorAll('.event-item') : [];

    if (eventItems.length > 0 && !force) {
        eventItems.forEach(item => {
            item.style.animationDelay = '0s';
            item.style.animation = 'none';
            void item.offsetWidth;
            item.classList.add('closing');
        });

        setTimeout(() => {
            executePanelClose();
        }, 400);
    } else {
        executePanelClose();
    }

    function executePanelClose() {
        stopEventMarquees();

        if (calCloseBtn) {
            calCloseBtn.innerHTML = '&lt;';
            calCloseBtn.classList.remove('controls-locked');
        }

        if (calPanelTop) {
            calPanelTop.classList.add('hide-top-info');
        }

        if (calPanelLeft) {
            calPanelLeft.classList.remove('rail-only');
            calPanelLeft.classList.add('hide-panel');
        }

        if (calSelectedDayElement) {
            let prevDay = calSelectedDayElement.getAttribute('data-day');
            if (prevDay) {
                calSelectedDayElement.innerHTML = prevDay;
            }
            calSelectedDayElement.classList.remove('selected-day');
            calSelectedDayElement = null;
        }

        if (calScrollUp) calScrollUp.classList.add('hidden');
        if (calScrollDown) calScrollDown.classList.add('hidden');

        calBtnTimeout = setTimeout(() => {
            if (calRail) {
                calRail.classList.remove('rail-visible');
            }
            if (calTimeDisplayBottom) {
                calTimeDisplayBottom.classList.remove('hide-time');
            }
            calIsPanelAnimating = false;
        }, 1200);
    }
}

function openLeftPanel(dayNumber, dateObj) {
    if (pageSelectorNav && !pageSelectorNav.classList.contains('at-end')) return;

    let wasOpen = isLeftPanelOpen();
    updateLeftPanelData(dayNumber, dateObj, wasOpen);

    if (wasOpen && !calIsRightPanelOpen) {
        return;
    }

    if (calIsPanelAnimating || calIsYearPickerOpen) return;

    calIsPanelAnimating = true;
    if (calBtnTimeout) clearTimeout(calBtnTimeout);

    closeRightPanel();

    if (calTimeDisplayBottom) {
        calTimeDisplayBottom.classList.add('hide-time');
    }

    if (calPanelTop) {
        calPanelTop.classList.add('hide-top-info');
    }

    if (calCloseBtn) {
        calCloseBtn.innerHTML = '&gt;';
    }

    if (calRail) {
        calRail.classList.remove('rail-visible');
    }

    if (calPanelLeft) {
        calPanelLeft.classList.remove('rail-only');
        calPanelLeft.classList.remove('hide-panel');
    }

    calBtnTimeout = setTimeout(() => {
        if (isLeftPanelOpen()) {
            if (calRail) calRail.classList.add('rail-visible');
            if (calPanelTop) calPanelTop.classList.remove('hide-top-info');
        }
        calIsPanelAnimating = false;
    }, 1200);
}

function triggerMonthChange(delta) {
    if (calIsYearPickerOpen || calIsContentLoading) return;

    calActiveMonth += delta;
    if (calActiveMonth < 0) {
        calActiveMonth = 11;
        calActiveYear--;
    } else if (calActiveMonth > 11) {
        calActiveMonth = 0;
        calActiveYear++;
    }

    if (calMonthDisplay) calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];
    if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);

    if (calDaysWrapper) calDaysWrapper.classList.add('fading');
    if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');

    if (calFadeDebounce) clearTimeout(calFadeDebounce);

    calFadeDebounce = setTimeout(() => {
        let wasPanelOpen = isLeftPanelOpen();
        void loadNationalHolidays(calActiveYear);
        renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);

        if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');
        calFadeDebounce = null;
    }, 300);
}

function resetCalendarToCurrentDate() {
    let realToday = new Date();
    let realMonth = realToday.getMonth();
    let realYear = realToday.getFullYear();

    if (calIsYearPickerOpen) {
        calIsYearPickerOpen = false;
        if (calYearsWrapper) calYearsWrapper.classList.add('hide-years');
        if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');
    }

    if (calActiveMonth !== realMonth || calActiveYear !== realYear) {
        calActiveMonth = realMonth;
        calActiveYear = realYear;

        if (calMonthDisplay) calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];
        if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);

        if (calDaysWrapper) calDaysWrapper.classList.add('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');

        if (calFadeDebounce) clearTimeout(calFadeDebounce);

        calFadeDebounce = setTimeout(() => {
            void loadNationalHolidays(calActiveYear);
            renderCalendar();
            if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
            if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');
            calFadeDebounce = null;
        }, 300);
    }
}

if (pageSelectorNav) {
    pageSelectorNav.querySelectorAll('i').forEach(navBtn => {
        navBtn.addEventListener('click', () => {
            setTimeout(() => {
                if (!pageSelectorNav.classList.contains('at-end')) {
                    if (isLeftPanelOpen() || calIsRightPanelOpen) {
                        if (calIsContentLoading) {
                            calPendingClose = true;
                        } else {
                            closeBothPanels();
                            resetCalendarToCurrentDate();
                        }
                    } else {
                        resetCalendarToCurrentDate();
                    }
                } else {
                    if (calPendingClose) {
                        calPendingClose = false;
                    }
                }
            }, 50);
        });
    });

    const pageObserver = new MutationObserver(() => {
        if (!pageSelectorNav.classList.contains('at-end')) {
            if (isLeftPanelOpen() || calIsRightPanelOpen) {
                if (calIsContentLoading) {
                    calPendingClose = true;
                } else {
                    closeBothPanels();
                    resetCalendarToCurrentDate();
                }
            } else {
                resetCalendarToCurrentDate();
            }
        } else {
            if (calPendingClose) {
                calPendingClose = false;
            }
        }
    });

    pageObserver.observe(pageSelectorNav, { attributes: true, attributeFilter: ['class'] });
}

function smoothScrollTo(element, target, duration) {
    if (!element) return;
    if (calScrollAnimation) cancelAnimationFrame(calScrollAnimation);

    let start = element.scrollTop;
    let change = target - start;
    let startTime = performance.now();

    function animateScroll(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        let easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        element.scrollTop = start + change * easeProgress;

        if (progress < 1) {
            calScrollAnimation = requestAnimationFrame(animateScroll);
        } else {
            calScrollAnimation = null;
        }
    }

    calScrollAnimation = requestAnimationFrame(animateScroll);
}

function scrollToYear(year, duration = 500) {
    if (!calYearsList) return;

    let items = calYearsList.querySelectorAll('.year-item');
    let targetItem = null;

    items.forEach(el => {
        let rawYear = parseInt(el.getAttribute('data-year'), 10);
        if (rawYear === year) {
            el.classList.add('active-year');
            targetItem = el;
        } else {
            el.classList.remove('active-year');
        }
    });

    if (targetItem) {
        let targetScroll = targetItem.offsetTop - (calYearsList.clientHeight / 2) + (targetItem.clientHeight / 2);
        smoothScrollTo(calYearsList, targetScroll, duration);
    }
}

function getAutoTargetDay() {
    let now = new Date();
    let isCurrentMonth = (now.getMonth() === calActiveMonth && now.getFullYear() === calActiveYear);
    return isCurrentMonth ? now.getDate() : 1;
}

if (calPrevBtn) {
    calPrevBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsContentLoading) return;
        if (calIsYearPickerOpen) {
            calActiveYear--;
            if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);
            scrollToYear(calActiveYear, 500);
        } else {
            triggerMonthChange(-1);
        }
    });
}

if (calNextBtn) {
    calNextBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsContentLoading) return;
        if (calIsYearPickerOpen) {
            calActiveYear++;
            if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);
            scrollToYear(calActiveYear, 500);
        } else {
            triggerMonthChange(1);
        }
    });
}

if (calMonthDisplay) {
    calMonthDisplay.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsContentLoading) return;

        let now = new Date();
        let wasPanelOpen = isLeftPanelOpen();

        if (calIsYearPickerOpen) {
            toggleYearPicker(false, () => {
                calActiveMonth = now.getMonth();
                calActiveYear = now.getFullYear();

                if (calMonthDisplay) calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];
                if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);

                if (calDaysWrapper) calDaysWrapper.classList.add('fading');
                if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');

                if (calFadeDebounce) clearTimeout(calFadeDebounce);

                calFadeDebounce = setTimeout(() => {
                    void loadNationalHolidays(calActiveYear);
                    renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);
                    if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
                    if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');
                    calFadeDebounce = null;
                }, 300);
            });
        } else {
            if (calActiveMonth === now.getMonth() && calActiveYear === now.getFullYear()) return;
            calActiveMonth = now.getMonth();
            calActiveYear = now.getFullYear();

            if (calMonthDisplay) calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];
            if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);

            if (calDaysWrapper) calDaysWrapper.classList.add('fading');
            if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');

            if (calFadeDebounce) clearTimeout(calFadeDebounce);

            calFadeDebounce = setTimeout(() => {
                void loadNationalHolidays(calActiveYear);
                renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);
                if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
                if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');
                calFadeDebounce = null;
            }, 300);
        }
    });
}

if (calYearDisplay) {
    calYearDisplay.innerHTML = String(calActiveYear);
    calYearDisplay.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsTransitioning || calIsContentLoading) return;

        if (isLeftPanelOpen()) {
            closeLeftPanel(true);
        }
        toggleYearPicker(!calIsYearPickerOpen);
    });
}

void loadNationalHolidays(calActiveYear);


/* ==========================================================================
   4. YEAR PICKER ENGINE
   ========================================================================== */

const CAL_MIN_YEAR = 1970;
const CAL_MAX_YEAR = 2099;

let yearScrollDebounce = null;

function initYearPicker() {
    if (!calYearsList) return;
    calYearsList.innerHTML = '';

    for (let y = CAL_MIN_YEAR; y <= CAL_MAX_YEAR; y++) {
        let item = document.createElement('div');
        item.className = 'year-item';
        item.setAttribute('data-year', String(y));
        item.textContent = String(y);

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (calIsTransitioning || calIsContentLoading) return;

            if (y === calActiveYear) {
                calActiveMonth = 0;
                calActiveDayNum = 1;
                calActiveDateObj = new Date(calActiveYear, 0, 1);

                if (calMonthDisplay) calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];

                toggleYearPicker(false, () => {
                    let wasPanelOpen = isLeftPanelOpen();
                    void loadNationalHolidays(calActiveYear);
                    renderCalendar(wasPanelOpen ? 1 : null);
                });
            } else {
                calActiveYear = y;
                if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);
                scrollToYear(calActiveYear, 350);
            }
        });

        calYearsList.appendChild(item);
    }

    calYearsList.addEventListener('scroll', () => {
        if (calScrollAnimation) return;
        if (yearScrollDebounce) clearTimeout(yearScrollDebounce);

        yearScrollDebounce = setTimeout(() => {
            const centerY = calYearsList.scrollTop + (calYearsList.clientHeight / 2);
            let closestItem = null;
            let minDiff = Infinity;

            calYearsList.querySelectorAll('.year-item').forEach(el => {
                const itemCenter = el.offsetTop + (el.clientHeight / 2);
                const diff = Math.abs(centerY - itemCenter);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestItem = el;
                }
            });

            if (closestItem) {
                const y = parseInt(closestItem.getAttribute('data-year'), 10);
                if (y && y !== calActiveYear) {
                    calActiveYear = y;
                    if (calYearDisplay) calYearDisplay.innerHTML = String(calActiveYear);
                    calYearsList.querySelectorAll('.year-item').forEach(el => {
                        el.classList.toggle('active-year', parseInt(el.getAttribute('data-year'), 10) === y);
                    });
                }
            }
        }, 50);
    });
}

function toggleYearPicker(open, callback = null) {
    if (!calYearsWrapper || calIsTransitioning) return;
    calIsTransitioning = true;
    calIsYearPickerOpen = open;

    if (calYearsList && calYearsList.children.length === 0) {
        initYearPicker();
    }

    if (open) {
        closeCalendarKeyboard();
        if (calDaysWrapper) calDaysWrapper.classList.add('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');
        calYearsWrapper.classList.remove('hide-years');

        setTimeout(() => {
            scrollToYear(calActiveYear, 300);
        }, 50);

        setTimeout(() => {
            calIsTransitioning = false;
            if (typeof callback === 'function') callback();
        }, 400);
    } else {
        calYearsWrapper.classList.add('hide-years');
        if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');

        setTimeout(() => {
            calIsTransitioning = false;
            if (typeof callback === 'function') callback();
        }, 400);
    }
}

initYearPicker();


/* ==========================================================================
   5. CALENDAR RENDER ENGINE
   ========================================================================== */

function renderCalendar(autoSelectDay = null) {
    if (!calDaysWrapper) return;
    calDaysWrapper.innerHTML = '';

    if (calMonthDisplay) {
        calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];
    }

    if (calYearDisplay) {
        calYearDisplay.innerHTML = String(calActiveYear);
    }

    let today = new Date();
    let isCurrentMonth = (today.getMonth() === calActiveMonth && today.getFullYear() === calActiveYear);
    let todayDate = today.getDate();

    let firstDayIndex = new Date(calActiveYear, calActiveMonth, 1).getDay();
    let lastDateMonth = new Date(calActiveYear, calActiveMonth + 1, 0).getDate();
    let lastDatePrevMonth = new Date(calActiveYear, calActiveMonth, 0).getDate();

    let beforeDays = [];
    let days = [];
    let afterDays = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
        beforeDays.push(lastDatePrevMonth - i);
    }

    for (let i = 1; i <= lastDateMonth; i++) {
        days.push(i);
    }

    let totalRendered = beforeDays.length + days.length;
    let remainingCells = 42 - totalRendered;

    for (let i = 1; i <= remainingCells; i++) {
        afterDays.push(i);
    }

    beforeDays.forEach(day => {
        let e = document.createElement('div');
        e.classList.add('beforeDays');
        e.innerHTML = String(day);
        calDaysWrapper.appendChild(e);
    });

    days.forEach(day => {
        let e = document.createElement('div');
        e.classList.add('valid-day');
        e.innerHTML = String(day);
        e.setAttribute('data-day', String(day));

        if (isCurrentMonth && day === todayDate) {
            e.classList.add('current-day');
        }

        if (autoSelectDay && day === autoSelectDay) {
            if (calSelectedDayElement) {
                let prevDay = calSelectedDayElement.getAttribute('data-day');
                if (prevDay) calSelectedDayElement.innerHTML = prevDay;
                calSelectedDayElement.classList.remove('selected-day');
            }
            calSelectedDayElement = e;
            e.classList.add('selected-day');
            e.innerHTML = `<img src="assets/icons/icons8-pencil-32.png" class="cal-day-pencil-icon" alt="Edit">`;
            let selectedDateObj = new Date(calActiveYear, calActiveMonth, day);
            openLeftPanel(day, selectedDateObj);
        }

        e.addEventListener('click', (evt) => {
            evt.stopPropagation();
            if (pageSelectorNav && !pageSelectorNav.classList.contains('at-end')) return;
            if (calIsTransitioning || calIsPanelAnimating || calIsYearPickerOpen || calIsContentLoading) return;

            if (calSelectedDayElement === e) {
                if (calIsRightPanelOpen) {
                    closeRightPanel();
                } else {
                    openRightPanel();
                }
                return;
            }

            if (calSelectedDayElement) {
                let prevDay = calSelectedDayElement.getAttribute('data-day');
                if (prevDay) {
                    calSelectedDayElement.innerHTML = prevDay;
                }
                calSelectedDayElement.classList.remove('selected-day');
            }

            calSelectedDayElement = e;
            e.classList.add('selected-day');
            e.innerHTML = `<img src="assets/icons/icons8-pencil-32.png" class="cal-day-pencil-icon" alt="Edit">`;

            closeRightPanel();

            let selectedDateObj = new Date(calActiveYear, calActiveMonth, day);
            openLeftPanel(day, selectedDateObj);
        });

        calDaysWrapper.appendChild(e);
    });

    afterDays.forEach(day => {
        let e = document.createElement('div');
        e.classList.add('afterDays');
        e.innerHTML = String(day);
        calDaysWrapper.appendChild(e);
    });
}

function updateCalendar(currentDay, month, year) {
    calActiveMonth = month;
    calActiveYear = year;
    renderCalendar();
}

renderCalendar();