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
let calCloseBtn = document.getElementById('cal-close-btn');

let calPanelTop = document.getElementById('cal-panel-top');
let calPanelTime = document.getElementById('panel-time');
let calSelectedDayName = document.getElementById('cal-selected-day-name');
let calSelectedDateDisplay = document.getElementById('cal-selected-date-display');
let calEventsList = document.getElementById('cal-events-list');
let calTimeDisplayBottom = document.getElementById('timeDisplay');

let pageSelectorNav = document.getElementById('pageSelector');

let calCurrentDate = new Date();
let calActiveMonth = calCurrentDate.getMonth();
let calActiveYear = calCurrentDate.getFullYear();
let calIsYearPickerOpen = false;
let calIsTransitioning = false;
let calIsPanelAnimating = false;
let calScrollAnimation = null;
let calSelectedDayElement = null;
let calBtnTimeout = null;
let calFadeDebounce = null;

let eventMarqueeHandles = [];

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

function updateLeftPanelData(dayNumber, dateObj, isPanelAlreadyOpen = false) {
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

    stopEventMarquees();

    if (calEventsList) {
        calEventsList.innerHTML = '';
        let key = `${monthNum}-${dayNumber}`;
        let events = (typeof specialObservances !== 'undefined') ? specialObservances[key] : null;

        let startDelay = isPanelAlreadyOpen ? 0 : 1.5;

        if (events && events.length > 0) {
            events.forEach((evt, idx) => {
                let div = document.createElement('div');
                div.classList.add('event-item');
                let itemDelay = startDelay + (idx * 1.0);
                div.style.animationDelay = `${itemDelay}s`;

                let eventName = (typeof evt === 'object' && evt.name) ? evt.name : evt;
                let isOfficial = (typeof evt === 'object' && evt.official);
                let iconSrc = isOfficial ? 'assets/icons/icons8-check-32.png' : 'assets/icons/icons8-question-32.png';
                let iconTitle = isOfficial ? 'Official Observance' : 'Unofficial Observance';

                div.innerHTML = `
                    <div class="event-text-wrapper">
                        <div class="event-text-track">
                            <span>${eventName}</span>
                        </div>
                    </div>
                    <div class="event-badge" title="${iconTitle}">
                        <img src="${iconSrc}">
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
            div.style.animationDelay = `${startDelay}s`;
            div.innerHTML = 'No Special Observances';
            calEventsList.appendChild(div);
        }
    }
}


/* ==========================================================================
   3. NAVIGATION EVENT LISTENERS & AUTO RESET
   ========================================================================== */

function isLeftPanelOpen() {
    return calPanelLeft && !calPanelLeft.classList.contains('hide-panel');
}

if (calCloseBtn) {
    calCloseBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        closeLeftPanel();
    });
}

function closeLeftPanel(force = false) {
    if (calIsPanelAnimating && !force) return;
    if (calPanelLeft && calPanelLeft.classList.contains('hide-panel')) return;

    calIsPanelAnimating = true;
    if (calBtnTimeout) clearTimeout(calBtnTimeout);

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
        }

        if (calPanelTop) {
            calPanelTop.classList.add('hide-top-info');
        }

        if (calPanelLeft) {
            calPanelLeft.classList.add('hide-panel');
        }

        if (calSelectedDayElement) {
            calSelectedDayElement.classList.remove('selected-day');
            calSelectedDayElement = null;
        }

        calBtnTimeout = setTimeout(() => {
            if (calCloseBtn) {
                calCloseBtn.classList.remove('btn-visible');
            }
            if (calTimeDisplayBottom) {
                calTimeDisplayBottom.classList.remove('hide-time');
            }
            calIsPanelAnimating = false;
        }, 1500);
    }
}

function openLeftPanel(dayNumber, dateObj) {
    let wasOpen = isLeftPanelOpen();
    updateLeftPanelData(dayNumber, dateObj, wasOpen);

    if (wasOpen) {
        return;
    }

    if (calIsPanelAnimating || calIsYearPickerOpen) return;

    calIsPanelAnimating = true;
    if (calBtnTimeout) clearTimeout(calBtnTimeout);

    if (calTimeDisplayBottom) {
        calTimeDisplayBottom.classList.add('hide-time');
    }

    if (calPanelTop) {
        calPanelTop.classList.add('hide-top-info');
    }

    if (calCloseBtn) {
        calCloseBtn.innerHTML = '&gt;';
        calCloseBtn.classList.remove('btn-visible');
    }

    if (calPanelLeft) {
        calPanelLeft.classList.remove('hide-panel');
    }

    calBtnTimeout = setTimeout(() => {
        if (isLeftPanelOpen()) {
            if (calCloseBtn) calCloseBtn.classList.add('btn-visible');
            if (calPanelTop) calPanelTop.classList.remove('hide-top-info');
        }
        calIsPanelAnimating = false;
    }, 1500);
}

function triggerMonthChange(delta) {
    if (calIsYearPickerOpen) return;

    calActiveMonth += delta;
    if (calActiveMonth < 0) {
        calActiveMonth = 11;
        calActiveYear--;
    } else if (calActiveMonth > 11) {
        calActiveMonth = 0;
        calActiveYear++;
    }

    if (calMonthDisplay) calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];
    if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;

    if (calDaysWrapper) calDaysWrapper.classList.add('fading');
    if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');

    if (calFadeDebounce) clearTimeout(calFadeDebounce);

    calFadeDebounce = setTimeout(() => {
        let wasPanelOpen = isLeftPanelOpen();
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
        if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;

        if (calDaysWrapper) calDaysWrapper.classList.add('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');

        if (calFadeDebounce) clearTimeout(calFadeDebounce);

        calFadeDebounce = setTimeout(() => {
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
            if (!pageSelectorNav.classList.contains('at-end')) {
                if (isLeftPanelOpen()) {
                    closeLeftPanel(true);
                }
                resetCalendarToCurrentDate();
            }
        });
    });

    const pageObserver = new MutationObserver(() => {
        if (!pageSelectorNav.classList.contains('at-end')) {
            if (isLeftPanelOpen()) {
                closeLeftPanel(true);
            }
            resetCalendarToCurrentDate();
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
        let rawYear = parseInt(el.getAttribute('data-year'));
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
        if (calIsYearPickerOpen) {
            calActiveYear--;
            if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;
            scrollToYear(calActiveYear, 500);
        } else {
            triggerMonthChange(-1);
        }
    });
}

if (calNextBtn) {
    calNextBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsYearPickerOpen) {
            calActiveYear++;
            if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;
            scrollToYear(calActiveYear, 500);
        } else {
            triggerMonthChange(1);
        }
    });
}

if (calMonthDisplay) {
    calMonthDisplay.addEventListener('click', (evt) => {
        evt.stopPropagation();

        let now = new Date();
        let wasPanelOpen = isLeftPanelOpen();

        if (calIsYearPickerOpen) {
            toggleYearPicker(false, () => {
                calActiveMonth = now.getMonth();
                calActiveYear = now.getFullYear();

                if (calMonthDisplay) calMonthDisplay.innerHTML = calMonthNames[calActiveMonth];
                if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;

                if (calDaysWrapper) calDaysWrapper.classList.add('fading');
                if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');

                if (calFadeDebounce) clearTimeout(calFadeDebounce);

                calFadeDebounce = setTimeout(() => {
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
            if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;

            if (calDaysWrapper) calDaysWrapper.classList.add('fading');
            if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');

            if (calFadeDebounce) clearTimeout(calFadeDebounce);

            calFadeDebounce = setTimeout(() => {
                renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);
                if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
                if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');
                calFadeDebounce = null;
            }, 300);
        }
    });
}

if (calYearDisplay) {
    calYearDisplay.innerHTML = calActiveYear;
    calYearDisplay.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsTransitioning) return;

        if (isLeftPanelOpen()) {
            closeLeftPanel(true);
        }
        toggleYearPicker(!calIsYearPickerOpen);
    });
}


/* ==========================================================================
   4. TRANSITION HELPERS & YEAR PICKER LOGIC
   ========================================================================== */

function toggleYearPicker(show, onComplete) {
    if (calIsTransitioning) return;
    calIsTransitioning = true;
    calIsYearPickerOpen = show;

    if (show) {
        if (calDaysWrapper) calDaysWrapper.classList.add('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');

        setTimeout(() => {
            renderYearsList();
            if (calYearsWrapper) calYearsWrapper.classList.remove('hide-years');
            if (onComplete) onComplete();

            setTimeout(() => {
                calIsTransitioning = false;
            }, 750);
        }, 750);
    } else {
        if (calYearsWrapper) calYearsWrapper.classList.add('hide-years');

        setTimeout(() => {
            renderCalendar();
            if (calDaysWrapper) calDaysWrapper.classList.remove('fading');
            if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');
            if (onComplete) onComplete();

            setTimeout(() => {
                calIsTransitioning = false;
            }, 750);
        }, 750);
    }
}

function renderYearsList() {
    if (!calYearsList) return;
    calYearsList.innerHTML = '';

    let startYear = calActiveYear - 30;
    let endYear = calActiveYear + 30;

    for (let y = startYear; y <= endYear; y++) {
        let item = document.createElement('div');
        item.classList.add('year-item');
        item.setAttribute('data-year', y);
        item.innerHTML = y;

        if (y === calActiveYear) {
            item.classList.add('active-year');
        }

        item.addEventListener('click', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            if (calIsTransitioning) return;

            if (calActiveYear === y) {
                calActiveMonth = 0;
                toggleYearPicker(false);
            } else {
                calActiveYear = y;
                if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;
                scrollToYear(calActiveYear, 500);
            }
        });

        calYearsList.appendChild(item);
    }

    requestAnimationFrame(() => {
        let activeItem = calYearsList.querySelector('.active-year');
        if (activeItem && calYearsList) {
            let targetScroll = activeItem.offsetTop - (calYearsList.clientHeight / 2) + (activeItem.clientHeight / 2);
            calYearsList.scrollTop = targetScroll;
        }
    });
}


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
        calYearDisplay.innerHTML = calActiveYear;
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
        e.innerHTML = day;
        calDaysWrapper.appendChild(e);
    });

    days.forEach(day => {
        let e = document.createElement('div');
        e.classList.add('valid-day');
        e.innerHTML = day;

        if (isCurrentMonth && day === todayDate) {
            e.classList.add('current-day');
        }

        if (autoSelectDay && day === autoSelectDay) {
            if (calSelectedDayElement) {
                calSelectedDayElement.classList.remove('selected-day');
            }
            calSelectedDayElement = e;
            e.classList.add('selected-day');
            let selectedDateObj = new Date(calActiveYear, calActiveMonth, day);
            openLeftPanel(day, selectedDateObj);
        }

        e.addEventListener('click', (evt) => {
            evt.stopPropagation();
            if (calIsTransitioning || calIsPanelAnimating || calIsYearPickerOpen) return;

            if (calSelectedDayElement) {
                calSelectedDayElement.classList.remove('selected-day');
            }
            calSelectedDayElement = e;
            e.classList.add('selected-day');

            let selectedDateObj = new Date(calActiveYear, calActiveMonth, day);
            openLeftPanel(day, selectedDateObj);
        });

        calDaysWrapper.appendChild(e);
    });

    afterDays.forEach(day => {
        let e = document.createElement('div');
        e.classList.add('afterDays');
        e.innerHTML = day;
        calDaysWrapper.appendChild(e);
    });
}

function updateCalendar(currentDay, month, year, weekday) {
    calActiveMonth = month;
    calActiveYear = year;
    renderCalendar();
}

renderCalendar();