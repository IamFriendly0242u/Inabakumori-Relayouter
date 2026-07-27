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
   2. INTERNATIONAL SPECIAL DAYS DATABASE
   ========================================================================== */

const specialObservances = {
    "1-1": ["New Year's Day", "Global Family Day"],
    "1-4": ["World Braille Day"],
    "1-24": ["International Day of Education"],
    "1-27": ["International Holocaust Remembrance Day"],
    "2-2": ["World Wetlands Day"],
    "2-4": ["World Cancer Day"],
    "2-14": ["Valentine's Day", "International Book Giving Day"],
    "2-20": ["World Day of Social Justice"],
    "2-21": ["International Mother Language Day"],
    "3-8": ["International Women's Day"],
    "3-14": ["International Day of Mathematics (Pi Day)"],
    "3-20": ["International Day of Happiness", "World Frog Day"],
    "3-21": ["World Poetry Day", "International Day of Forests"],
    "3-22": ["World Water Day"],
    "3-23": ["World Meteorological Day"],
    "4-7": ["World Health Day"],
    "4-12": ["International Day of Human Space Flight"],
    "4-22": ["Earth Day"],
    "4-23": ["World Book and Copyright Day"],
    "4-29": ["International Dance Day"],
    "5-1": ["International Workers' Day (May Day)"],
    "5-3": ["World Press Freedom Day"],
    "5-15": ["International Day of Families"],
    "5-20": ["World Bee Day"],
    "5-21": ["International Tea Day"],
    "5-22": ["International Day for Biological Diversity"],
    "6-1": ["Global Day of Parents", "World Milk Day"],
    "6-3": ["World Bicycle Day"],
    "6-5": ["World Environment Day"],
    "6-8": ["World Oceans Day"],
    "6-21": ["International Day of Yoga", "World Music Day"],
    "6-30": ["International Asteroid Day"],
    "7-6": ["World Zoonoses Day"],
    "7-7": ["World Kiswahili Language Day"],
    "7-11": ["World Population Day"],
    "7-15": ["World Youth Skills Day"],
    "7-17": ["World Day for International Justice"],
    "7-18": ["Nelson Mandela International Day"],
    "7-20": ["World Chess Day", "International Moon Day"],
    "7-26": ["International Day for Mangrove Ecosystem"],
    "7-27": ["National Scotch Day", "World Day for Grandparents"],
    "7-28": ["World Hepatitis Day"],
    "7-29": ["International Tiger Day"],
    "7-30": ["International Day of Friendship"],
    "8-8": ["International Cat Day"],
    "8-9": ["International Day of Indigenous Peoples"],
    "8-12": ["International Youth Day"],
    "8-13": ["International Left-Handers Day"],
    "8-19": ["World Humanitarian Day", "World Photography Day"],
    "8-26": ["International Dog Day"],
    "9-5": ["International Day of Charity"],
    "9-8": ["International Literacy Day"],
    "9-15": ["International Day of Democracy"],
    "9-21": ["International Day of Peace"],
    "9-27": ["World Tourism Day"],
    "9-29": ["World Heart Day"],
    "10-1": ["International Day of Older Persons", "International Coffee Day"],
    "10-4": ["World Animal Day"],
    "10-5": ["World Teachers' Day"],
    "10-10": ["World Mental Health Day"],
    "10-16": ["World Food Day"],
    "10-24": ["United Nations Day"],
    "10-31": ["Halloween", "World Cities Day"],
    "11-10": ["World Science Day for Peace and Development"],
    "11-16": ["International Day for Tolerance"],
    "11-20": ["World Children's Day"],
    "11-21": ["World Television Day"],
    "12-1": ["World AIDS Day"],
    "12-3": ["International Day of Persons with Disabilities"],
    "12-5": ["World Soil Day"],
    "12-10": ["Human Rights Day"],
    "12-18": ["International Migrants Day"],
    "12-25": ["Christmas Day"]
};


/* ==========================================================================
   3. CLOCK SYNC & PANEL DATA UPDATES
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

function updateLeftPanelData(dayNumber, dateObj) {
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

    if (calEventsList) {
        calEventsList.innerHTML = '';
        let key = `${monthNum}-${dayNumber}`;
        let events = specialObservances[key];

        if (events && events.length > 0) {
            events.forEach(evtText => {
                let div = document.createElement('div');
                div.classList.add('event-item');
                div.innerHTML = evtText;
                calEventsList.appendChild(div);
            });
        } else {
            let div = document.createElement('div');
            div.classList.add('event-item', 'no-event');
            div.innerHTML = 'No Special Observances';
            calEventsList.appendChild(div);
        }
    }
}


/* ==========================================================================
   4. NAVIGATION EVENT LISTENERS & AUTO RESET
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

function openLeftPanel(dayNumber, dateObj) {
    updateLeftPanelData(dayNumber, dateObj);

    if (isLeftPanelOpen()) {
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
        renderCalendar();
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
        if (calIsTransitioning) return;

        if (calIsYearPickerOpen) {
            calActiveYear--;
            if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;
            scrollToYear(calActiveYear, 500);
        } else {
            let wasPanelOpen = isLeftPanelOpen();
            calActiveMonth--;
            if (calActiveMonth < 0) {
                calActiveMonth = 11;
                calActiveYear--;
            }
            renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);
        }
    });
}

if (calNextBtn) {
    calNextBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsTransitioning) return;

        if (calIsYearPickerOpen) {
            calActiveYear++;
            if (calYearDisplay) calYearDisplay.innerHTML = calActiveYear;
            scrollToYear(calActiveYear, 500);
        } else {
            let wasPanelOpen = isLeftPanelOpen();
            calActiveMonth++;
            if (calActiveMonth > 11) {
                calActiveMonth = 0;
                calActiveYear++;
            }
            renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);
        }
    });
}

if (calMonthDisplay) {
    calMonthDisplay.addEventListener('click', (evt) => {
        evt.stopPropagation();
        if (calIsTransitioning) return;

        let now = new Date();
        let wasPanelOpen = isLeftPanelOpen();

        if (calIsYearPickerOpen) {
            toggleYearPicker(false, () => {
                calActiveMonth = now.getMonth();
                calActiveYear = now.getFullYear();
                renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);
            });
        } else {
            if (calActiveMonth === now.getMonth() && calActiveYear === now.getFullYear()) return;
            fadeTransition(() => {
                calActiveMonth = now.getMonth();
                calActiveYear = now.getFullYear();
                renderCalendar(wasPanelOpen ? getAutoTargetDay() : null);
            });
        }
    });
}

if (calYearDisplay) {
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
   5. TRANSITION HELPERS & YEAR PICKER LOGIC
   ========================================================================== */

function fadeTransition(updateCallback) {
    if (calIsTransitioning || !calDaysWrapper) return;
    calIsTransitioning = true;

    calDaysWrapper.classList.add('fading');
    if (calWeekdaysHeader) calWeekdaysHeader.classList.add('fading');

    setTimeout(() => {
        if (updateCallback) updateCallback();
        calDaysWrapper.classList.remove('fading');
        if (calWeekdaysHeader) calWeekdaysHeader.classList.remove('fading');

        setTimeout(() => {
            calIsTransitioning = false;
        }, 750);
    }, 750);
}

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
   6. CALENDAR RENDER ENGINE
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