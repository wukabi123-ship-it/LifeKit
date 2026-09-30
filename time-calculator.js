// ==============================
// LifeKit - Time Calculator
// ==============================


// ==============================
// Get Elements
// ==============================

const format12Button =
    document.getElementById("format12Button");

const format24Button =
    document.getElementById("format24Button");


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


const calculateTimeButton =
    document.getElementById("calculateTimeButton");


const timeError =
    document.getElementById("timeError");


const mainResult =
    document.getElementById("mainResult");


const resultDescription =
    document.getElementById("resultDescription");


const totalMinutes =
    document.getElementById("totalMinutes");


const decimalHours =
    document.getElementById("decimalHours");


const copyResultButton =
    document.getElementById("copyResultButton");


const copyMessage =
    document.getElementById("copyMessage");


const quickTimeButtons =
    document.querySelectorAll(".quick-time-button");


// ==============================
// Variables
// ==============================

let timeFormat = "12";

let lastResult = "";


// ==============================
// Format Number
// ==============================

function formatTwoDigits(value) {

    return String(value).padStart(2, "0");

}


// ==============================
// 12-Hour To Minutes
// ==============================

function convert12HourToMinutes(
    hour,
    minute,
    period
) {

    let convertedHour = Number(hour);

    const convertedMinute = Number(minute);


    if (period === "AM") {

        if (convertedHour === 12) {

            convertedHour = 0;

        }

    } else {

        if (convertedHour !== 12) {

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

function minutesTo12Hour(minutes) {

    let hour =
        Math.floor(minutes / 60);

    const minute =
        minutes % 60;


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {

        hour = 12;

    }


    return {
        hour: hour,
        minute: minute,
        period: period
    };

}


// ==============================
// Minutes To 24-Hour
// ==============================

function minutesTo24Hour(minutes) {

    const hour =
        Math.floor(minutes / 60);

    const minute =
        minutes % 60;


    return {
        hour: hour,
        minute: minute
    };

}


// ==============================
// Get Time
// ==============================

function getTimeInMinutes(type) {

    let hour;

    let minute;

    let period;


    if (type === "start") {

        hour =
            Number(startHour.value);

        minute =
            Number(startMinute.value);

        period =
            startPeriod.textContent;

    } else {

        hour =
            Number(endHour.value);

        minute =
            Number(endMinute.value);

        period =
            endPeriod.textContent;

    }


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


    // 12-hour format

    if (timeFormat === "12") {

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


    // 24-hour format

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
// Set Time
// ==============================

function setTime(type, minutes) {

    minutes =
        (
            minutes +
            1440
        ) % 1440;


    let hour;

    let minute;

    let period;


    if (timeFormat === "12") {

        const result =
            minutesTo12Hour(minutes);


        hour =
            result.hour;

        minute =
            result.minute;

        period =
            result.period;

    } else {

        const result =
            minutesTo24Hour(minutes);


        hour =
            result.hour;

        minute =
            result.minute;

    }


    if (type === "start") {

        startHour.value =
            hour;

        startMinute.value =
            formatTwoDigits(minute);


        if (timeFormat === "12") {

            startPeriod.textContent =
                period;

        }

    } else {

        endHour.value =
            hour;

        endMinute.value =
            formatTwoDigits(minute);


        if (timeFormat === "12") {

            endPeriod.textContent =
                period;

        }

    }

}


// ==============================
// Change Time Format
// ==============================

function changeTimeFormat(format) {

    if (format === timeFormat) {

        return;

    }


    const startMinutes =
        getTimeInMinutes("start");


    const endMinutes =
        getTimeInMinutes("end");


    timeFormat =
        format;


    if (format === "12") {

        format12Button.classList.add("active");

        format24Button.classList.remove("active");


        startHour.min = "1";

        startHour.max = "12";


        endHour.min = "1";

        endHour.max = "12";


        startPeriod.style.display =
            "flex";

        endPeriod.style.display =
            "flex";


        if (startMinutes !== null) {

            setTime(
                "start",
                startMinutes
            );

        }


        if (endMinutes !== null) {

            setTime(
                "end",
                endMinutes
            );

        }

    } else {

        format24Button.classList.add("active");

        format12Button.classList.remove("active");


        startHour.min = "0";

        startHour.max = "23";


        endHour.min = "0";

        endHour.max = "23";


        startPeriod.style.display =
            "none";

        endPeriod.style.display =
            "none";


        if (startMinutes !== null) {

            setTime(
                "start",
                startMinutes
            );

        }


        if (endMinutes !== null) {

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

function togglePeriod(button) {

    if (button.textContent === "AM") {

        button.textContent = "PM";

    } else {

        button.textContent = "AM";

    }

}


// ==============================
// Calculate Duration
// ==============================

function calculateDuration() {

    clearError();


    const start =
        getTimeInMinutes("start");


    const end =
        getTimeInMinutes("end");


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


    // Explicit next day

    if (nextDay.checked) {

        if (difference <= 0) {

            difference += 1440;

        }

    }


    // Automatic next day

    else if (difference < 0) {

        difference += 1440;

    }


    displayResult(difference);

}


// ==============================
// Display Result
// ==============================

function displayResult(minutes) {

    const hours =
        Math.floor(minutes / 60);


    const remainingMinutes =
        minutes % 60;


    // Short result

    let shortResult = "";


    if (hours > 0) {

        shortResult =
            `${hours}h`;

    }


    if (remainingMinutes > 0) {

        if (shortResult !== "") {

            shortResult += " ";

        }


        shortResult +=
            `${remainingMinutes}m`;

    }


    if (shortResult === "") {

        shortResult = "0m";

    }


    // Long result

    let longResult = "";


    if (hours > 0) {

        longResult =
            `${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            }`;

    }


    if (remainingMinutes > 0) {

        if (longResult !== "") {

            longResult += " ";

        }


        longResult +=
            `${remainingMinutes} ${
                remainingMinutes === 1
                    ? "minute"
                    : "minutes"
            }`;

    }


    if (longResult === "") {

        longResult =
            "0 minutes";

    }


    const decimal =
        minutes / 60;


    // Update result

    mainResult.textContent =
        shortResult;


    resultDescription.textContent =
        longResult;


    totalMinutes.textContent =
        `${minutes} min`;


    decimalHours.textContent =
        `${decimal.toFixed(2)} h`;


    lastResult =
        `Duration: ${longResult}\n` +
        `Total minutes: ${minutes}\n` +
        `Decimal hours: ${decimal.toFixed(2)}`;


    copyResultButton.disabled =
        false;


    copyMessage.textContent =
        "";

}


// ==============================
// Error
// ==============================

function showError(message) {

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
// Quick Time
// ==============================

function setQuickTime(
    target,
    action
) {

    const now =
        new Date();


    let minutes = 0;


    if (action === "now") {

        minutes =
            now.getHours() * 60 +
            now.getMinutes();

    }


    if (action === "midnight") {

        minutes = 0;

    }


    if (action === "noon") {

        minutes = 720;

    }


    setTime(
        target,
        minutes
    );


    clearError();

}


// ==============================
// Copy Result
// ==============================

async function copyResult() {

    if (lastResult === "") {

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

        changeTimeFormat("12");

    }
);


format24Button.addEventListener(
    "click",
    function () {

        changeTimeFormat("24");

    }
);


// ==============================
// AM / PM Buttons
// ==============================

startPeriod.addEventListener(
    "click",
    function () {

        togglePeriod(startPeriod);

    }
);


endPeriod.addEventListener(
    "click",
    function () {

        togglePeriod(endPeriod);

    }
);


// ==============================
// Calculate Button
// ==============================

calculateTimeButton.addEventListener(
    "click",
    calculateDuration
);


// ==============================
// Copy Button
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
// Enter Key
// ==============================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Enter") {

            return;

        }


        const activeElement =
            document.activeElement;


        if (
            activeElement.tagName ===
            "INPUT"
        ) {

            calculateDuration();

        }

    }
);


// ==============================
// Initial State
// ==============================

format12Button.classList.add(
    "active"
);

format24Button.classList.remove(
    "active"
);

startPeriod.style.display =
    "flex";

endPeriod.style.display =
    "flex";
    