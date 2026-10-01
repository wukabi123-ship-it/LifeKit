// ==============================
// LifeKit - Time & Date Calculator
// ==============================


// ==============================
// Get Elements
// ==============================

const format12Button =
    document.getElementById("format12Button");

const format24Button =
    document.getElementById("format24Button");


const timeOnlyButton =
    document.getElementById("timeOnlyButton");

const dateTimeButton =
    document.getElementById("dateTimeButton");


const startDateGroup =
    document.getElementById("startDateGroup");

const endDateGroup =
    document.getElementById("endDateGroup");


const startDay =
    document.getElementById("startDay");

const startMonth =
    document.getElementById("startMonth");

const startYear =
    document.getElementById("startYear");


const endDay =
    document.getElementById("endDay");

const endMonth =
    document.getElementById("endMonth");

const endYear =
    document.getElementById("endYear");


const startCalendarButton =
    document.getElementById("startCalendarButton");

const endCalendarButton =
    document.getElementById("endCalendarButton");


const startCalendar =
    document.getElementById("startCalendar");

const endCalendar =
    document.getElementById("endCalendar");


const startCalendarTitle =
    document.getElementById("startCalendarTitle");

const endCalendarTitle =
    document.getElementById("endCalendarTitle");


const startCalendarGrid =
    document.getElementById("startCalendarGrid");

const endCalendarGrid =
    document.getElementById("endCalendarGrid");


const startPreviousMonth =
    document.getElementById("startPreviousMonth");

const startNextMonth =
    document.getElementById("startNextMonth");

const endPreviousMonth =
    document.getElementById("endPreviousMonth");

const endNextMonth =
    document.getElementById("endNextMonth");


const startTodayButton =
    document.getElementById("startTodayButton");

const endTodayButton =
    document.getElementById("endTodayButton");


const startCloseCalendar =
    document.getElementById("startCloseCalendar");

const endCloseCalendar =
    document.getElementById("endCloseCalendar");


const startHour =
    document.getElementById("startHour");

const startMinute =
    document.getElementById("startMinute");

const startPeriod =
    document.getElementById("startPeriod");


const endHour =
    document.getElementById("endHour");

const endMinute =
    document.getElementById("endMinute");

const endPeriod =
    document.getElementById("endPeriod");


const nextDay =
    document.getElementById("nextDay");

const nextDayOption =
    document.getElementById("nextDayOption");


const calculateTimeButton =
    document.getElementById("calculateTimeButton");


const timeError =
    document.getElementById("timeError");


const mainResult =
    document.getElementById("mainResult");


const resultDescription =
    document.getElementById("resultDescription");


const calendarResult =
    document.getElementById("calendarResult");


const totalDays =
    document.getElementById("totalDays");

const totalWeeks =
    document.getElementById("totalWeeks");

const totalHours =
    document.getElementById("totalHours");

const totalMinutes =
    document.getElementById("totalMinutes");

const decimalHours =
    document.getElementById("decimalHours");

const totalSeconds =
    document.getElementById("totalSeconds");


const copyResultButton =
    document.getElementById("copyResultButton");

const copyMessage =
    document.getElementById("copyMessage");


const quickTimeButtons =
    document.querySelectorAll(
        ".quick-time-button"
    );


// ==============================
// Variables
// ==============================

let timeFormat = "12";

let calculationMode = "time";

let lastResult = "";


const calendarViews = {
    start: null,
    end: null
};


// ==============================
// Constants
// ==============================

const MINUTES_PER_DAY =
    1440;

const MINUTES_PER_HOUR =
    60;

const MILLISECONDS_PER_SECOND =
    1000;

const MILLISECONDS_PER_MINUTE =
    60 * 1000;

const MILLISECONDS_PER_HOUR =
    60 * 60 * 1000;

const MILLISECONDS_PER_DAY =
    24 * 60 * 60 * 1000;


const MIN_YEAR = 1;

const MAX_YEAR = 9999;


// ==============================
// Month Names
// ==============================

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


// ==============================
// Format Number
// ==============================

function formatTwoDigits(
    value
) {

    return String(value).padStart(
        2,
        "0"
    );

}


// ==============================
// Get Today's Parts
// ==============================

function getTodayParts() {

    const now =
        new Date();


    return {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };

}


// ==============================
// Check Leap Year
// ==============================

function isLeapYear(
    year
) {

    return (
        year % 400 === 0 ||
        (
            year % 4 === 0 &&
            year % 100 !== 0
        )
    );

}


// ==============================
// Days In Month
// ==============================

function daysInMonth(
    year,
    month
) {

    const days = [
        31,
        isLeapYear(year)
            ? 29
            : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];


    return days[month - 1];

}


// ==============================
// Create Safe Date
// ==============================

function createSafeDate(
    year,
    month,
    day,
    hour = 0,
    minute = 0
) {

    const date =
        new Date(0);


    date.setHours(
        0,
        0,
        0,
        0
    );


    date.setFullYear(
        year,
        month - 1,
        day
    );


    date.setHours(
        hour,
        minute,
        0,
        0
    );


    return date;

}


// ==============================
// Get Date Parts From Inputs
// ==============================

function getDateParts(
    type
) {

    if (
        type === "start"
    ) {

        return {
            day: Number(startDay.value),
            month: Number(startMonth.value),
            year: Number(startYear.value)
        };

    }


    return {
        day: Number(endDay.value),
        month: Number(endMonth.value),
        year: Number(endYear.value)
    };

}


// ==============================
// Set Date Parts
// ==============================

function setDateParts(
    type,
    day,
    month,
    year
) {

    if (
        type === "start"
    ) {

        startDay.value =
            day;

        startMonth.value =
            month;

        startYear.value =
            year;


        return;

    }


    endDay.value =
        day;

    endMonth.value =
        month;

    endYear.value =
        year;

}


// ==============================
// Validate Date Parts
// ==============================

function validateDateParts(
    parts
) {

    if (
        !Number.isInteger(parts.day) ||
        !Number.isInteger(parts.month) ||
        !Number.isInteger(parts.year)
    ) {

        return false;

    }


    if (
        parts.year < MIN_YEAR ||
        parts.year > MAX_YEAR
    ) {

        return false;

    }


    if (
        parts.month < 1 ||
        parts.month > 12
    ) {

        return false;

    }


    const maximumDay =
        daysInMonth(
            parts.year,
            parts.month
        );


    if (
        parts.day < 1 ||
        parts.day > maximumDay
    ) {

        return false;

    }


    return true;

}


// ==============================
// Validate Date Input
// ==============================

function validateDateInput(
    type,
    label
) {

    const parts =
        getDateParts(
            type
        );


    const valid =
        validateDateParts(
            parts
        );


    const dayInput =
        type === "start"
            ? startDay
            : endDay;


    const monthInput =
        type === "start"
            ? startMonth
            : endMonth;


    const yearInput =
        type === "start"
            ? startYear
            : endYear;


    dayInput.classList.remove(
        "invalid"
    );

    monthInput.classList.remove(
        "invalid"
    );

    yearInput.classList.remove(
        "invalid"
    );


    if (
        !valid
    ) {

        dayInput.classList.add(
            "invalid"
        );

        monthInput.classList.add(
            "invalid"
        );

        yearInput.classList.add(
            "invalid"
        );


        showError(
            `${label} must be a valid date.`
        );


        return false;

    }


    return true;

}


// ==============================
// Normalize Input Range
// ==============================

function normalizeInputRange(
    input,
    min,
    max
) {

    if (
        input.value === ""
    ) {

        return;

    }


    let value =
        Number(
            input.value
        );


    if (
        !Number.isFinite(value)
    ) {

        input.value =
            min;


        return;

    }


    value =
        Math.trunc(
            value
        );


    if (
        value < min
    ) {

        value = min;

    }


    if (
        value > max
    ) {

        value = max;

    }


    input.value =
        value;

}


// ==============================
// Normalize Date Inputs
// ==============================

function normalizeDateInputs(
    type
) {

    const dayInput =
        type === "start"
            ? startDay
            : endDay;


    const monthInput =
        type === "start"
            ? startMonth
            : endMonth;


    const yearInput =
        type === "start"
            ? startYear
            : endYear;


    normalizeInputRange(
        dayInput,
        1,
        31
    );


    normalizeInputRange(
        monthInput,
        1,
        12
    );


    normalizeInputRange(
        yearInput,
        MIN_YEAR,
        MAX_YEAR
    );

}


// ==============================
// Set Date To Today
// ==============================

function setToday(
    type
) {

    const today =
        getTodayParts();


    setDateParts(
        type,
        today.day,
        today.month,
        today.year
    );


    const dayInput =
        type === "start"
            ? startDay
            : endDay;


    const monthInput =
        type === "start"
            ? startMonth
            : endMonth;


    const yearInput =
        type === "start"
            ? startYear
            : endYear;


    dayInput.classList.remove(
        "invalid"
    );

    monthInput.classList.remove(
        "invalid"
    );

    yearInput.classList.remove(
        "invalid"
    );


    clearError();

    clearCopyMessage();

}


// ==============================
// Format Date For Display
// ==============================

function formatReadableDate(
    date
) {

    if (
        !(date instanceof Date) ||
        Number.isNaN(date.getTime())
    ) {

        return "";

    }


    const day =
        date.getDate();


    const month =
        MONTH_NAMES[
            date.getMonth()
        ];


    const year =
        date.getFullYear();


    return `${day} ${month} ${year}`;

}


// ==============================
// Format Date + Time For Copy
// ==============================

function formatDateTimeForCopy(
    date
) {

    const day =
        date.getDate();


    const month =
        MONTH_NAMES[
            date.getMonth()
        ];


    const year =
        date.getFullYear();


    const hours =
        date.getHours();


    const minutes =
        formatTwoDigits(
            date.getMinutes()
        );


    if (
        timeFormat === "24"
    ) {

        return (
            `${day} ${month} ${year}, ` +
            `${formatTwoDigits(hours)}:${minutes}`
        );

    }


    const period =
        hours >= 12
            ? "PM"
            : "AM";


    let displayHour =
        hours % 12;


    if (
        displayHour === 0
    ) {

        displayHour = 12;

    }


    return (
        `${day} ${month} ${year}, ` +
        `${displayHour}:${minutes} ${period}`
    );

}


// ==============================
// Get Time In Minutes
// ==============================

function getTimeInMinutes(
    type
) {

    const hourInput =
        type === "start"
            ? startHour
            : endHour;


    const minuteInput =
        type === "start"
            ? startMinute
            : endMinute;


    const period =
        type === "start"
            ? startPeriod.textContent.trim()
            : endPeriod.textContent.trim();


    const hour =
        Number(
            hourInput.value
        );


    const minute =
        Number(
            minuteInput.value
        );


    if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute)
    ) {

        return null;

    }


    if (
        minute < 0 ||
        minute > 59
    ) {

        return null;

    }


    if (
        timeFormat === "12"
    ) {

        if (
            hour < 1 ||
            hour > 12
        ) {

            return null;

        }


        return convert12HourToMinutes(
            hour,
            minute,
            period
        );

    }


    if (
        hour < 0 ||
        hour > 23
    ) {

        return null;

    }


    return (
        hour * 60 +
        minute
    );

}


// ==============================
// 12-Hour To Minutes
// ==============================

function convert12HourToMinutes(
    hour,
    minute,
    period
) {

    let convertedHour =
        Number(hour);


    const convertedMinute =
        Number(minute);


    if (
        period === "AM"
    ) {

        if (
            convertedHour === 12
        ) {

            convertedHour = 0;

        }

    } else {

        if (
            convertedHour !== 12
        ) {

            convertedHour += 12;

        }

    }


    return (
        convertedHour * 60 +
        convertedMinute
    );

}


// ==============================
// Minutes To 12-Hour
// ==============================

function minutesTo12Hour(
    minutes
) {

    let hour =
        Math.floor(
            minutes / 60
        );


    const minute =
        minutes % 60;


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (
        hour === 0
    ) {

        hour = 12;

    }


    return {
        hour,
        minute,
        period
    };

}


// ==============================
// Minutes To 24-Hour
// ==============================

function minutesTo24Hour(
    minutes
) {

    const hour =
        Math.floor(
            minutes / 60
        );


    const minute =
        minutes % 60;


    return {
        hour,
        minute
    };

}


// ==============================
// Set Time
// ==============================

function setTime(
    type,
    minutes
) {

    minutes =
        (
            Number(minutes) +
            MINUTES_PER_DAY
        ) %
        MINUTES_PER_DAY;


    let hour;

    let minute;

    let period;


    if (
        timeFormat === "12"
    ) {

        const result =
            minutesTo12Hour(
                minutes
            );


        hour =
            result.hour;

        minute =
            result.minute;

        period =
            result.period;

    } else {

        const result =
            minutesTo24Hour(
                minutes
            );


        hour =
            result.hour;

        minute =
            result.minute;

    }


    if (
        type === "start"
    ) {

        startHour.value =
            hour;

        startMinute.value =
            formatTwoDigits(
                minute
            );


        if (
            timeFormat === "12"
        ) {

            startPeriod.textContent =
                period;

        }

    } else {

        endHour.value =
            hour;

        endMinute.value =
            formatTwoDigits(
                minute
            );


        if (
            timeFormat === "12"
        ) {

            endPeriod.textContent =
                period;

        }

    }

}


// ==============================
// Get Date + Time
// ==============================

function getDateTime(
    type
) {

    const parts =
        getDateParts(
            type
        );


    if (
        !validateDateParts(
            parts
        )
    ) {

        return null;

    }


    const minutes =
        getTimeInMinutes(
            type
        );


    if (
        minutes === null
    ) {

        return null;

    }


    const hour =
        Math.floor(
            minutes / 60
        );


    const minute =
        minutes % 60;


    return createSafeDate(
        parts.year,
        parts.month,
        parts.day,
        hour,
        minute
    );

}


// ==============================
// Calculation Mode
// ==============================

function changeCalculationMode(
    mode
) {

    calculationMode =
        mode;


    const isDateTime =
        mode === "datetime";


    timeOnlyButton.classList.toggle(
        "active",
        !isDateTime
    );


    dateTimeButton.classList.toggle(
        "active",
        isDateTime
    );


    startDateGroup.style.display =
        isDateTime
            ? "block"
            : "none";


    endDateGroup.style.display =
        isDateTime
            ? "block"
            : "none";


    nextDayOption.style.display =
        isDateTime
            ? "none"
            : "flex";


    closeCalendar(
        "start"
    );


    closeCalendar(
        "end"
    );


    if (
        isDateTime
    ) {

        initializeDateInputs();

    }


    clearError();

    clearCopyMessage();

}


// ==============================
// Change Time Format
// ==============================

function changeTimeFormat(
    format
) {

    if (
        format === timeFormat
    ) {

        return;

    }


    const startMinutes =
        getTimeInMinutes(
            "start"
        );


    const endMinutes =
        getTimeInMinutes(
            "end"
        );


    timeFormat =
        format;


    if (
        format === "12"
    ) {

        format12Button.classList.add(
            "active"
        );


        format24Button.classList.remove(
            "active"
        );


        startHour.min =
            "1";

        startHour.max =
            "12";

        endHour.min =
            "1";

        endHour.max =
            "12";


        startPeriod.style.display =
            "flex";

        endPeriod.style.display =
            "flex";


        if (
            startMinutes !== null
        ) {

            setTime(
                "start",
                startMinutes
            );

        }


        if (
            endMinutes !== null
        ) {

            setTime(
                "end",
                endMinutes
            );

        }

    } else {

        format24Button.classList.add(
            "active"
        );


        format12Button.classList.remove(
            "active"
        );


        startHour.min =
            "0";

        startHour.max =
            "23";

        endHour.min =
            "0";

        endHour.max =
            "23";


        startPeriod.style.display =
            "none";

        endPeriod.style.display =
            "none";


        if (
            startMinutes !== null
        ) {

            setTime(
                "start",
                startMinutes
            );

        }


        if (
            endMinutes !== null
        ) {

            setTime(
                "end",
                endMinutes
            );

        }

    }


    clearError();

}


// ==============================
// Toggle AM / PM
// ==============================

function togglePeriod(
    button
) {

    if (
        button.textContent.trim() ===
        "AM"
    ) {

        button.textContent =
            "PM";

    } else {

        button.textContent =
            "AM";

    }


    clearError();

}


// ==============================
// Initialize Date Inputs
// ==============================

function initializeDateInputs() {

    const today =
        getTodayParts();


    if (
        startYear.value === ""
    ) {

        startDay.value =
            today.day;

        startMonth.value =
            today.month;

        startYear.value =
            today.year;

    }


    if (
        endYear.value === ""
    ) {

        endDay.value =
            today.day;

        endMonth.value =
            today.month;

        endYear.value =
            today.year;

    }

}


// ==============================
// Calendar Elements
// ==============================

function getCalendarElements(
    type
) {

    if (
        type === "start"
    ) {

        return {
            inputDay: startDay,
            inputMonth: startMonth,
            inputYear: startYear,
            button: startCalendarButton,
            calendar: startCalendar,
            title: startCalendarTitle,
            grid: startCalendarGrid
        };

    }


    return {
        inputDay: endDay,
        inputMonth: endMonth,
        inputYear: endYear,
        button: endCalendarButton,
        calendar: endCalendar,
        title: endCalendarTitle,
        grid: endCalendarGrid
    };

}


// ==============================
// Open Calendar
// ==============================

function openCalendar(
    type
) {

    const elements =
        getCalendarElements(
            type
        );


    closeOtherCalendar(
        type
    );


    const parts =
        getDateParts(
            type
        );


    let year =
        parts.year;

    let month =
        parts.month;


    if (
        !validateDateParts(
            parts
        )
    ) {

        const today =
            getTodayParts();


        year =
            today.year;

        month =
            today.month;

    }


    calendarViews[type] =
        {
            year,
            month
        };


    elements.calendar.style.display =
        "block";


    elements.button.setAttribute(
        "aria-expanded",
        "true"
    );


    renderCalendar(
        type
    );

}


// ==============================
// Close Calendar
// ==============================

function closeCalendar(
    type
) {

    const elements =
        getCalendarElements(
            type
        );


    elements.calendar.style.display =
        "none";


    elements.button.setAttribute(
        "aria-expanded",
        "false"
    );

}


// ==============================
// Close Other Calendar
// ==============================

function closeOtherCalendar(
    currentType
) {

    const otherType =
        currentType === "start"
            ? "end"
            : "start";


    closeCalendar(
        otherType
    );

}


// ==============================
// Render Calendar
// ==============================

function renderCalendar(
    type
) {

    const elements =
        getCalendarElements(
            type
        );


    if (
        !calendarViews[type]
    ) {

        const today =
            getTodayParts();


        calendarViews[type] =
            {
                year: today.year,
                month: today.month
            };

    }


    const year =
        calendarViews[type].year;


    const month =
        calendarViews[type].month;


    elements.title.textContent =
        `${MONTH_NAMES[month - 1]} ${year}`;


    elements.grid.innerHTML =
        "";


    const firstDate =
        createSafeDate(
            year,
            month,
            1
        );


    const firstDay =
        firstDate.getDay();


    const numberOfDays =
        daysInMonth(
            year,
            month
        );


    const previousMonth =
        month === 1
            ? 12
            : month - 1;


    const previousMonthYear =
        month === 1
            ? year - 1
            : year;


    const previousMonthDays =
        year === MIN_YEAR &&
        month === 1
            ? 0
            : daysInMonth(
                previousMonthYear,
                previousMonth
            );


    const parts =
        getDateParts(
            type
        );


    const selectedDateValid =
        validateDateParts(
            parts
        );


    const today =
        getTodayParts();


    for (
        let index = 0;
        index < 42;
        index++
    ) {

        const dayButton =
            document.createElement(
                "button"
            );


        dayButton.type =
            "button";


        dayButton.className =
            "calendar-day";


        let displayYear =
            year;


        let displayMonth =
            month;


        let displayDay;


        let isCurrentMonth =
            true;


        if (
            index < firstDay
        ) {

            displayDay =
                previousMonthDays -
                firstDay +
                index +
                1;


            displayMonth =
                previousMonth;

            displayYear =
                previousMonthYear;


            isCurrentMonth =
                false;

        } else if (
            index <
            firstDay +
            numberOfDays
        ) {

            displayDay =
                index -
                firstDay +
                1;

        } else {

            displayDay =
                index -
                firstDay -
                numberOfDays +
                1;


            displayMonth =
                month === 12
                    ? 1
                    : month + 1;


            displayYear =
                month === 12
                    ? year + 1
                    : year;


            isCurrentMonth =
                false;

        }


        if (
            !isCurrentMonth
        ) {

            dayButton.classList.add(
                "other-month"
            );

        }


        const validYear =
            displayYear >= MIN_YEAR &&
            displayYear <= MAX_YEAR;


        const validDate =
            validYear &&
            displayMonth >= 1 &&
            displayMonth <= 12 &&
            displayDay >= 1 &&
            displayDay <=
                daysInMonth(
                    displayYear,
                    displayMonth
                );


        if (
            !validDate
        ) {

            dayButton.disabled =
                true;

            dayButton.textContent =
                "";

            elements.grid.appendChild(
                dayButton
            );

            continue;

        }


        if (
            selectedDateValid &&
            parts.year === displayYear &&
            parts.month === displayMonth &&
            parts.day === displayDay
        ) {

            dayButton.classList.add(
                "selected"
            );

        }


        if (
            today.year === displayYear &&
            today.month === displayMonth &&
            today.day === displayDay
        ) {

            dayButton.classList.add(
                "today"
            );

        }


        dayButton.textContent =
            displayDay;


        dayButton.setAttribute(
            "aria-label",
            `${displayDay} ${MONTH_NAMES[displayMonth - 1]} ${displayYear}`
        );


        dayButton.addEventListener(
            "click",
            function () {

                setDateParts(
                    type,
                    displayDay,
                    displayMonth,
                    displayYear
                );


                const inputDay =
                    type === "start"
                        ? startDay
                        : endDay;


                const inputMonth =
                    type === "start"
                        ? startMonth
                        : endMonth;


                const inputYear =
                    type === "start"
                        ? startYear
                        : endYear;


                inputDay.classList.remove(
                    "invalid"
                );

                inputMonth.classList.remove(
                    "invalid"
                );

                inputYear.classList.remove(
                    "invalid"
                );


                clearError();

                clearCopyMessage();


                closeCalendar(
                    type
                );

            }
        );


        elements.grid.appendChild(
            dayButton
        );

    }


    elements.inputDay.min =
        "1";

    elements.inputDay.max =
        "31";


    elements.inputMonth.min =
        "1";

    elements.inputMonth.max =
        "12";


    elements.inputYear.min =
        String(MIN_YEAR);

    elements.inputYear.max =
        String(MAX_YEAR);


    elements.inputDay.setAttribute(
        "aria-valuemin",
        "1"
    );

    elements.inputDay.setAttribute(
        "aria-valuemax",
        "31"
    );

}


// ==============================
// Move Calendar Month
// ==============================

function moveCalendarMonth(
    type,
    offset
) {

    if (
        !calendarViews[type]
    ) {

        const today =
            getTodayParts();


        calendarViews[type] =
            {
                year: today.year,
                month: today.month
            };

    }


    let year =
        calendarViews[type].year;


    let month =
        calendarViews[type].month +
        offset;


    if (
        month < 1
    ) {

        month = 12;

        year--;

    }


    if (
        month > 12
    ) {

        month = 1;

        year++;

    }


    if (
        year < MIN_YEAR ||
        year > MAX_YEAR
    ) {

        return;

    }


    calendarViews[type] =
        {
            year,
            month
        };


    renderCalendar(
        type
    );

}


// ==============================
// Update Calendar Navigation
// ==============================

function updateCalendarNavigation(
    type
) {

    const previousButton =
        type === "start"
            ? startPreviousMonth
            : endPreviousMonth;


    const nextButton =
        type === "start"
            ? startNextMonth
            : endNextMonth;


    const view =
        calendarViews[type];


    if (!view) {

        return;

    }


    previousButton.disabled =
        view.year === MIN_YEAR &&
        view.month === 1;


    nextButton.disabled =
        view.year === MAX_YEAR &&
        view.month === 12;

}


// ==============================
// Go To Today
// ==============================

function goToToday(
    type
) {

    const today =
        getTodayParts();


    setDateParts(
        type,
        today.day,
        today.month,
        today.year
    );


    calendarViews[type] =
        {
            year: today.year,
            month: today.month
        };


    const inputDay =
        type === "start"
            ? startDay
            : endDay;


    const inputMonth =
        type === "start"
            ? startMonth
            : endMonth;


    const inputYear =
        type === "start"
            ? startYear
            : endYear;


    inputDay.classList.remove(
        "invalid"
    );

    inputMonth.classList.remove(
        "invalid"
    );

    inputYear.classList.remove(
        "invalid"
    );


    clearError();

    clearCopyMessage();


    renderCalendar(
        type
    );

}


// ==============================
// Add Years Safely
// ==============================

function addYearsClamped(
    date,
    years
) {

    const result =
        new Date(
            date.getTime()
        );


    const originalDay =
        result.getDate();


    result.setDate(
        1
    );


    result.setFullYear(
        result.getFullYear() +
        years
    );


    const maximumDay =
        daysInMonth(
            result.getFullYear(),
            result.getMonth() + 1
        );


    result.setDate(
        Math.min(
            originalDay,
            maximumDay
        )
    );


    return result;

}


// ==============================
// Add Months Safely
// ==============================

function addMonthsClamped(
    date,
    months
) {

    const result =
        new Date(
            date.getTime()
        );


    const originalDay =
        result.getDate();


    result.setDate(
        1
    );


    result.setMonth(
        result.getMonth() +
        months
    );


    const maximumDay =
        daysInMonth(
            result.getFullYear(),
            result.getMonth() + 1
        );


    result.setDate(
        Math.min(
            originalDay,
            maximumDay
        )
    );


    return result;

}


// ==============================
// Add Days
// ==============================

function addDays(
    date,
    days
) {

    const result =
        new Date(
            date.getTime()
        );


    result.setDate(
        result.getDate() +
        days
    );


    return result;

}


// ==============================
// Calendar Difference
// ==============================

function getCalendarDifference(
    start,
    end
) {

    let cursor =
        new Date(
            start.getTime()
        );


    let years =
        Math.max(
            0,
            end.getFullYear() -
            cursor.getFullYear()
        );


    let candidate =
        addYearsClamped(
            cursor,
            years
        );


    if (
        candidate.getTime() >
        end.getTime()
    ) {

        years--;

        candidate =
            addYearsClamped(
                cursor,
                years
            );

    }


    cursor =
        candidate;


    let months =
        Math.max(
            0,
            (
                end.getFullYear() -
                cursor.getFullYear()
            ) * 12 +
            (
                end.getMonth() -
                cursor.getMonth()
            )
        );


    candidate =
        addMonthsClamped(
            cursor,
            months
        );


    if (
        candidate.getTime() >
        end.getTime()
    ) {

        months--;

        candidate =
            addMonthsClamped(
                cursor,
                months
            );

    }


    cursor =
        candidate;


    let days =
        Math.max(
            0,
            Math.floor(
                (
                    end.getTime() -
                    cursor.getTime()
                ) /
                MILLISECONDS_PER_DAY
            )
        );


    candidate =
        addDays(
            cursor,
            days
        );


    while (
        candidate.getTime() >
        end.getTime()
    ) {

        days--;

        candidate =
            addDays(
                cursor,
                days
            );

    }


    while (
        addDays(
            candidate,
            1
        ).getTime() <=
        end.getTime()
    ) {

        days++;

        candidate =
            addDays(
                candidate,
                1
            );

    }


    cursor =
        candidate;


    const remainingMilliseconds =
        Math.max(
            0,
            end.getTime() -
            cursor.getTime()
        );


    const hours =
        Math.floor(
            remainingMilliseconds /
            MILLISECONDS_PER_HOUR
        );


    const minutes =
        Math.floor(
            (
                remainingMilliseconds %
                MILLISECONDS_PER_HOUR
            ) /
            MILLISECONDS_PER_MINUTE
        );


    const seconds =
        Math.floor(
            (
                remainingMilliseconds %
                MILLISECONDS_PER_MINUTE
            ) /
            MILLISECONDS_PER_SECOND
        );


    return {
        years,
        months,
        days,
        hours,
        minutes,
        seconds
    };

}


// ==============================
// Format Calendar Part
// ==============================

function formatCalendarPart(
    value,
    singular,
    plural
) {

    return `${value} ${
        value === 1
            ? singular
            : plural
    }`;

}


// ==============================
// Build Calendar Result
// ==============================

function buildCalendarResult(
    difference
) {

    return [
        formatCalendarPart(
            difference.years,
            "year",
            "years"
        ),

        formatCalendarPart(
            difference.months,
            "month",
            "months"
        ),

        formatCalendarPart(
            difference.days,
            "day",
            "days"
        ),

        formatCalendarPart(
            difference.hours,
            "hour",
            "hours"
        ),

        formatCalendarPart(
            difference.minutes,
            "minute",
            "minutes"
        ),

        formatCalendarPart(
            difference.seconds,
            "second",
            "seconds"
        )

    ].join(", ");

}


// ==============================
// Build Short Calendar Result
// ==============================

function buildShortCalendarResult(
    difference
) {

    const parts = [];


    if (
        difference.years > 0
    ) {

        parts.push(
            `${difference.years}y`
        );

    }


    if (
        difference.months > 0
    ) {

        parts.push(
            `${difference.months}mo`
        );

    }


    if (
        difference.days > 0
    ) {

        parts.push(
            `${difference.days}d`
        );

    }


    if (
        difference.hours > 0
    ) {

        parts.push(
            `${difference.hours}h`
        );

    }


    if (
        difference.minutes > 0
    ) {

        parts.push(
            `${difference.minutes}m`
        );

    }


    if (
        difference.seconds > 0
    ) {

        parts.push(
            `${difference.seconds}s`
        );

    }


    if (
        parts.length === 0
    ) {

        return "0s";

    }


    return parts.join(" ");

}


// ==============================
// Display Time Only Result
// ==============================

function displayTimeOnlyResult(
    minutes
) {

    const hours =
        Math.floor(
            minutes /
            MINUTES_PER_HOUR
        );


    const remainingMinutes =
        minutes %
        MINUTES_PER_HOUR;


    let shortResult = "";


    if (
        hours > 0
    ) {

        shortResult =
            `${hours}h`;

    }


    if (
        remainingMinutes > 0
    ) {

        if (
            shortResult !== ""
        ) {

            shortResult +=
                " ";

        }


        shortResult +=
            `${remainingMinutes}m`;

    }


    if (
        shortResult === ""
    ) {

        shortResult =
            "0m";

    }


    let longResult = "";


    if (
        hours > 0
    ) {

        longResult =
            `${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            }`;

    }


    if (
        remainingMinutes > 0
    ) {

        if (
            longResult !== ""
        ) {

            longResult +=
                " ";

        }


        longResult +=
            `${remainingMinutes} ${
                remainingMinutes === 1
                    ? "minute"
                    : "minutes"
            }`;

    }


    if (
        longResult === ""
    ) {

        longResult =
            "0 minutes";

    }


    const days =
        minutes /
        MINUTES_PER_DAY;


    const weeks =
        days / 7;


    const hoursDecimal =
        minutes /
        MINUTES_PER_HOUR;


    const seconds =
        minutes * 60;


    mainResult.textContent =
        shortResult;


    resultDescription.textContent =
        longResult;


    calendarResult.innerHTML =
        `
            <strong>Calendar breakdown</strong>
            Time-only duration: ${longResult}
        `;


    totalDays.textContent =
        `${days.toFixed(2)} d`;


    totalWeeks.textContent =
        `${weeks.toFixed(2)} wk`;


    totalHours.textContent =
        `${hoursDecimal.toFixed(2)} h`;


    totalMinutes.textContent =
        `${minutes} min`;


    decimalHours.textContent =
        `${hoursDecimal.toFixed(2)} h`;


    totalSeconds.textContent =
        `${seconds} sec`;


    lastResult =
        `Calculation type: Time Only\n` +
        `Duration: ${longResult}\n` +
        `Total days: ${days.toFixed(2)}\n` +
        `Total weeks: ${weeks.toFixed(2)}\n` +
        `Total hours: ${hoursDecimal.toFixed(2)}\n` +
        `Total minutes: ${minutes}\n` +
        `Decimal hours: ${hoursDecimal.toFixed(2)}\n` +
        `Total seconds: ${seconds}`;


    copyResultButton.disabled =
        false;


    clearCopyMessage();

}


// ==============================
// Display Date-Time Result
// ==============================

function displayDateTimeResult(
    start,
    end
) {

    const differenceMilliseconds =
        end.getTime() -
        start.getTime();


    const totalDaysValue =
        differenceMilliseconds /
        MILLISECONDS_PER_DAY;


    const totalWeeksValue =
        totalDaysValue /
        7;


    const totalHoursValue =
        differenceMilliseconds /
        MILLISECONDS_PER_HOUR;


    const totalMinutesValue =
        differenceMilliseconds /
        MILLISECONDS_PER_MINUTE;


    const totalSecondsValue =
        Math.floor(
            differenceMilliseconds /
            MILLISECONDS_PER_SECOND
        );


    const calendarDifference =
        getCalendarDifference(
            start,
            end
        );


    const calendarLong =
        buildCalendarResult(
            calendarDifference
        );


    const calendarShort =
        buildShortCalendarResult(
            calendarDifference
        );


    mainResult.textContent =
        calendarShort;


    resultDescription.textContent =
        calendarLong;


    calendarResult.innerHTML =
        `
            <strong>Calendar breakdown</strong>
            ${calendarLong}
        `;


    totalDays.textContent =
        `${totalDaysValue.toFixed(2)} d`;


    totalWeeks.textContent =
        `${totalWeeksValue.toFixed(2)} wk`;


    totalHours.textContent =
        `${totalHoursValue.toFixed(2)} h`;


    totalMinutes.textContent =
        `${totalMinutesValue.toFixed(2)} min`;


    decimalHours.textContent =
        `${totalHoursValue.toFixed(2)} h`;


    totalSeconds.textContent =
        `${totalSecondsValue} sec`;


    lastResult =
        `Calculation type: Date + Time\n` +
        `Start: ${formatDateTimeForCopy(start)}\n` +
        `End: ${formatDateTimeForCopy(end)}\n` +
        `Calendar difference: ${calendarLong}\n` +
        `Total days: ${totalDaysValue.toFixed(2)}\n` +
        `Total weeks: ${totalWeeksValue.toFixed(2)}\n` +
        `Total hours: ${totalHoursValue.toFixed(2)}\n` +
        `Total minutes: ${totalMinutesValue.toFixed(2)}\n` +
        `Decimal hours: ${totalHoursValue.toFixed(2)}\n` +
        `Total seconds: ${totalSecondsValue}`;


    copyResultButton.disabled =
        false;


    clearCopyMessage();

}


// ==============================
// Calculate Duration
// ==============================

function calculateDuration() {

    clearError();

    clearCopyMessage();


    // ==============================
    // Date + Time
    // ==============================

    if (
        calculationMode ===
        "datetime"
    ) {

        normalizeDateInputs(
            "start"
        );


        normalizeDateInputs(
            "end"
        );


        if (
            !validateDateInput(
                "start",
                "Start date"
            )
        ) {

            return;

        }


        if (
            !validateDateInput(
                "end",
                "End date"
            )
        ) {

            return;

        }


        normalizeNumberInput(
            startHour,
            timeFormat === "12"
                ? 1
                : 0,
            timeFormat === "12"
                ? 12
                : 23,
            "Start hour"
        );


        normalizeNumberInput(
            startMinute,
            0,
            59,
            "Start minute"
        );


        normalizeNumberInput(
            endHour,
            timeFormat === "12"
                ? 1
                : 0,
            timeFormat === "12"
                ? 12
                : 23,
            "End hour"
        );


        normalizeNumberInput(
            endMinute,
            0,
            59,
            "End minute"
        );


        const start =
            getDateTime(
                "start"
            );


        const end =
            getDateTime(
                "end"
            );


        if (
            start === null ||
            end === null
        ) {

            showError(
                "Please enter valid dates and times."
            );


            return;

        }


        if (
            end.getTime() <
            start.getTime()
        ) {

            showError(
                "The end date and time must be after the start date and time."
            );


            return;

        }


        displayDateTimeResult(
            start,
            end
        );


        return;

    }


    // ==============================
    // Time Only
    // ==============================

    normalizeNumberInput(
        startHour,
        timeFormat === "12"
            ? 1
            : 0,
        timeFormat === "12"
            ? 12
            : 23,
        "Start hour"
    );


    normalizeNumberInput(
        startMinute,
        0,
        59,
        "Start minute"
    );


    normalizeNumberInput(
        endHour,
        timeFormat === "12"
            ? 1
            : 0,
        timeFormat === "12"
            ? 12
            : 23,
        "End hour"
    );


    normalizeNumberInput(
        endMinute,
        0,
        59,
        "End minute"
    );


    const start =
        getTimeInMinutes(
            "start"
        );


    const end =
        getTimeInMinutes(
            "end"
        );


    if (
        start === null ||
        end === null
    ) {

        showError(
            "Please enter valid times."
        );


        return;

    }


    let difference =
        end - start;


    if (
        nextDay.checked
    ) {

        if (
            difference <= 0
        ) {

            difference +=
                MINUTES_PER_DAY;

        }

    } else if (
        difference < 0
    ) {

        difference +=
            MINUTES_PER_DAY;

    }


    displayTimeOnlyResult(
        difference
    );

}


// ==============================
// Generic Number Validation
// ==============================

function normalizeNumberInput(
    input,
    min,
    max,
    label
) {

    if (
        input.value === ""
    ) {

        showError(
            `${label} is required.`
        );


        return false;

    }


    let value =
        Number(
            input.value
        );


    if (
        !Number.isFinite(value)
    ) {

        input.value =
            min;


        showError(
            `${label} must be a valid number.`
        );


        return false;

    }


    value =
        Math.trunc(
            value
        );


    if (
        value < min
    ) {

        input.value =
            min;


        showError(
            `${label} cannot be below ${min}. It was adjusted to ${min}.`
        );

    } else if (
        value > max
    ) {

        input.value =
            max;


        showError(
            `${label} cannot exceed ${max}. It was adjusted to ${max}.`
        );

    } else {

        input.value =
            value;

    }


    input.classList.remove(
        "invalid"
    );


    return true;

}


// ==============================
// Error
// ==============================

function showError(
    message
) {

    timeError.textContent =
        message;

}


// ==============================
// Clear Error
// ==============================

function clearError() {

    timeError.textContent =
        "";

}


// ==============================
// Clear Copy Message
// ==============================

function clearCopyMessage() {

    copyMessage.textContent =
        "";

}


// ==============================
// Quick Time
// ==============================

function setQuickTime(
    target,
    action
) {

    const now =
        new Date();


    let minutes = 0;


    if (
        action === "now"
    ) {

        minutes =
            now.getHours() * 60 +
            now.getMinutes();


        if (
            calculationMode ===
            "datetime"
        ) {

            setDateParts(
                target,
                now.getDate(),
                now.getMonth() + 1,
                now.getFullYear()
            );

        }

    }


    if (
        action === "midnight"
    ) {

        minutes = 0;

    }


    if (
        action === "noon"
    ) {

        minutes = 720;

    }


    setTime(
        target,
        minutes
    );


    clearError();

    clearCopyMessage();

}


// ==============================
// Copy Result
// ==============================

async function copyResult() {

    if (
        lastResult === ""
    ) {

        return;

    }


    try {

        await navigator.clipboard.writeText(
            lastResult
        );


        copyMessage.textContent =
            "Copied!";


        setTimeout(
            function () {

                copyMessage.textContent =
                    "";

            },
            2000
        );

    } catch (error) {

        copyMessage.textContent =
            "Copy failed. Please copy the result manually.";

    }

}


// ==============================
// Format Buttons
// ==============================

format12Button.addEventListener(
    "click",
    function () {

        changeTimeFormat(
            "12"
        );

    }
);


format24Button.addEventListener(
    "click",
    function () {

        changeTimeFormat(
            "24"
        );

    }
);


// ==============================
// Calculation Mode Buttons
// ==============================

timeOnlyButton.addEventListener(
    "click",
    function () {

        changeCalculationMode(
            "time"
        );

    }
);


dateTimeButton.addEventListener(
    "click",
    function () {

        changeCalculationMode(
            "datetime"
        );

    }
);


// ==============================
// AM / PM
// ==============================

startPeriod.addEventListener(
    "click",
    function () {

        togglePeriod(
            startPeriod
        );

    }
);


endPeriod.addEventListener(
    "click",
    function () {

        togglePeriod(
            endPeriod
        );

    }
);


// ==============================
// Calculate
// ==============================

calculateTimeButton.addEventListener(
    "click",
    calculateDuration
);


// ==============================
// Copy
// ==============================

copyResultButton.addEventListener(
    "click",
    copyResult
);


// ==============================
// Quick Buttons
// ==============================

quickTimeButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const target =
                    button.dataset.target;


                const action =
                    button.dataset.action;


                setQuickTime(
                    target,
                    action
                );

            }
        );

    }
);


// ==============================
// Calendar - Start
// ==============================

startCalendarButton.addEventListener(
    "click",
    function () {

        if (
            startCalendar.style.display ===
            "block"
        ) {

            closeCalendar(
                "start"
            );

        } else {

            openCalendar(
                "start"
            );

        }

    }
);


startPreviousMonth.addEventListener(
    "click",
    function () {

        moveCalendarMonth(
            "start",
            -1
        );


        updateCalendarNavigation(
            "start"
        );

    }
);


startNextMonth.addEventListener(
    "click",
    function () {

        moveCalendarMonth(
            "start",
            1
        );


        updateCalendarNavigation(
            "start"
        );

    }
);


startTodayButton.addEventListener(
    "click",
    function () {

        goToToday(
            "start"
        );


        updateCalendarNavigation(
            "start"
        );

    }
);


startCloseCalendar.addEventListener(
    "click",
    function () {

        closeCalendar(
            "start"
        );

    }
);


// ==============================
// Calendar - End
// ==============================

endCalendarButton.addEventListener(
    "click",
    function () {

        if (
            endCalendar.style.display ===
            "block"
        ) {

            closeCalendar(
                "end"
            );

        } else {

            openCalendar(
                "end"
            );

        }

    }
);


endPreviousMonth.addEventListener(
    "click",
    function () {

        moveCalendarMonth(
            "end",
            -1
        );


        updateCalendarNavigation(
            "end"
        );

    }
);


endNextMonth.addEventListener(
    "click",
    function () {

        moveCalendarMonth(
            "end",
            1
        );


        updateCalendarNavigation(
            "end"
        );

    }
);


endTodayButton.addEventListener(
    "click",
    function () {

        goToToday(
            "end"
        );


        updateCalendarNavigation(
            "end"
        );

    }
);


endCloseCalendar.addEventListener(
    "click",
    function () {

        closeCalendar(
            "end"
        );

    }
);


// ==============================
// Date Input Events
// ==============================

[
    startDay,
    startMonth,
    startYear,
    endDay,
    endMonth,
    endYear
].forEach(
    function (input) {

        input.addEventListener(
            "input",
            function () {

                input.classList.remove(
                    "invalid"
                );


                clearError();

                clearCopyMessage();

            }
        );


        input.addEventListener(
            "blur",
            function () {

                const type =
                    (
                        input === startDay ||
                        input === startMonth ||
                        input === startYear
                    )
                        ? "start"
                        : "end";


                normalizeDateInputs(
                    type
                );


                validateDateInput(
                    type,
                    type === "start"
                        ? "Start date"
                        : "End date"
                );

            }
        );

    }
);


// ==============================
// Time Input Validation
// ==============================

startHour.addEventListener(
    "blur",
    function () {

        normalizeNumberInput(
            startHour,
            timeFormat === "12"
                ? 1
                : 0,
            timeFormat === "12"
                ? 12
                : 23,
            "Start hour"
        );

    }
);


startMinute.addEventListener(
    "blur",
    function () {

        normalizeNumberInput(
            startMinute,
            0,
            59,
            "Start minute"
        );

    }
);


endHour.addEventListener(
    "blur",
    function () {

        normalizeNumberInput(
            endHour,
            timeFormat === "12"
                ? 1
                : 0,
            timeFormat === "12"
                ? 12
                : 23,
            "End hour"
        );

    }
);


endMinute.addEventListener(
    "blur",
    function () {

        normalizeNumberInput(
            endMinute,
            0,
            59,
            "End minute"
        );

    }
);


// ==============================
// Clear Time Validation
// ==============================

[
    startHour,
    startMinute,
    endHour,
    endMinute
].forEach(
    function (input) {

        input.addEventListener(
            "input",
            function () {

                input.classList.remove(
                    "invalid"
                );


                clearError();

                clearCopyMessage();

            }
        );

    }
);


// ==============================
// Enter Key
// ==============================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        const activeElement =
            document.activeElement;


        if (
            activeElement.tagName ===
                "INPUT" &&
            activeElement.type !==
                "checkbox"
        ) {

            calculateDuration();

        }

    }
);


// ==============================
// Escape Closes Calendars
// ==============================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeCalendar(
                "start"
            );

            closeCalendar(
                "end"
            );

        }

    }
);


// ==============================
// Initial State
// ==============================

const initialToday =
    getTodayParts();


startDay.value =
    initialToday.day;

startMonth.value =
    initialToday.month;

startYear.value =
    initialToday.year;


endDay.value =
    initialToday.day;

endMonth.value =
    initialToday.month;

endYear.value =
    initialToday.year;


format12Button.classList.add(
    "active"
);

format24Button.classList.remove(
    "active"
);


timeOnlyButton.classList.add(
    "active"
);

dateTimeButton.classList.remove(
    "active"
);


startPeriod.style.display =
    "flex";

endPeriod.style.display =
    "flex";


startDateGroup.style.display =
    "none";

endDateGroup.style.display =
    "none";


nextDayOption.style.display =
    "flex";


closeCalendar(
    "start"
);

closeCalendar(
    "end"
);


// ==============================
// Initial Calendar Navigation
// ==============================

calendarViews.start =
    {
        year: initialToday.year,
        month: initialToday.month
    };


calendarViews.end =
    {
        year: initialToday.year,
        month: initialToday.month
    };


updateCalendarNavigation(
    "start"
);

updateCalendarNavigation(
    "end"
);