/* ==========================================================================
   1. INITIALIZATION & INTERVALS
   ========================================================================== */

setInterval(updateTime, 1000);
updateTime();

checkDayChange.previousDay = new Date().getDate();
setInterval(checkDayChange, 60000);


/* ==========================================================================
   2. TIME & DATE DISPLAY UPDATER
   ========================================================================== */

function updateTime() {
    let date = new Date();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let day = date.getDate();
    let year = date.getFullYear();
    let month = "";
    let monthNumber = date.getMonth() + 1;

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let displayHour = (hour + 11) % 12 + 1;
    let period = hour < 12 ? "AM" : "PM";
    time.innerHTML = displayHour + ":" + minutes + period;
    time1.innerHTML = displayHour + ":" + minutes + period;

    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    const weekday = [
        "Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    month = months[monthNumber - 1];
    dateDisplay.innerHTML = weekday[date.getDay()] + ", " + month + " " + day + ", " + year;
    dateDisplay1.innerHTML = weekday[date.getDay()] + ", " + month + " " + day + ", " + year;

    if (!updateTime.updatedDate) {
        if (typeof updateCalendar === 'function') {
            updateCalendar(day, monthNumber - 1, year, date.getDay());
        }
        updateTime.updatedDate = true;
    }
}


/* ==========================================================================
   3. DAY CHANGE CHECKER
   ========================================================================== */

function checkDayChange() {
    let currentDate = new Date();
    let currentDay = currentDate.getDate();

    if (currentDay !== checkDayChange.previousDay) {
        let day = currentDate.getDate();
        let monthNumber = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        if (typeof updateCalendar === 'function') {
            updateCalendar(day, monthNumber - 1, year, currentDate.getDay());
        }
        checkDayChange.previousDay = currentDay;
    }
}