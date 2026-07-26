/* ==========================================================================
   1. DOM ELEMENTS SELECTION
   ========================================================================== */

let daysWrapper = document.getElementById('days-wrapper');


/* ==========================================================================
   2. CALENDAR RENDER ENGINE
   ========================================================================== */

function updateCalendar(currentDay, month, year, weekday) {
    daysWrapper.innerHTML = '';
    let days = [];
    let beforeDays = [];
    let afterDays = [];
    let totalDays = [];

    let weekdayOfDayOne = getFirstDateWeekday(month);
    let lastDayLastMonth = getLastDate(month - 1);

    for (let i = weekdayOfDayOne - 1; i >= 0; i--) {
        let beforeDay = lastDayLastMonth - i;
        beforeDays.push(beforeDay);
    }
    totalDays = totalDays.concat(beforeDays);

    for (let i = 1; i <= getLastDate(month); i++) {
        days.push(i);
    }
    totalDays = totalDays.concat(days);

    for (let i = 1; i <= 42 - totalDays.length; i++) {
        afterDays.push(i);
    }
    totalDays = totalDays.concat(afterDays);

    beforeDays.forEach(day => {
        let e = document.createElement('div');
        e.classList.add('beforeDays');
        e.innerHTML = day;
        daysWrapper.appendChild(e);
    });

    days.forEach(day => {
        let e = document.createElement('div');
        e.innerHTML = day;
        if (day == currentDay) e.classList.add('current-day');
        daysWrapper.appendChild(e);
    });

    afterDays.forEach(day => {
        let e = document.createElement('div');
        e.classList.add('beforeDays');
        e.innerHTML = day;
        daysWrapper.appendChild(e);
    });
}


/* ==========================================================================
   3. DATE CALCULATION HELPER FUNCTIONS
   ========================================================================== */

function getLastDate(month) {
    let date = new Date();
    date.setMonth(month + 1);
    date.setDate(0);
    return date.getDate();
}

function getFirstDateWeekday(month) {
    let date = new Date();
    date.setMonth(month);
    date.setDate(1);
    return date.getDay();
}