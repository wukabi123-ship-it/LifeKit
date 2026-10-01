// ==============================
// LifeKit - Calculator
// ==============================


// ==============================
// Get Elements
// ==============================

const display = document.getElementById("calculatorDisplay");

const buttons = document.querySelectorAll(".calculator-button");


// ==============================
// Calculator Variables
// ==============================

let currentValue = "0";
let previousValue = null;
let currentOperator = null;
let waitingForNewValue = false;


// ==============================
// Update Display
// ==============================

function updateDisplay() {

    if (!display) {
        return;
    }

    display.textContent = currentValue;

}


// ==============================
// Enter Number
// ==============================

function enterNumber(number) {

    // If an error is showing, start again
    if (currentValue === "Error") {

        currentValue = number;
        waitingForNewValue = false;

        updateDisplay();

        return;
    }


    // Start a new number after an operator
    // or after completing a calculation
    if (waitingForNewValue) {

        currentValue = number;
        waitingForNewValue = false;

        updateDisplay();

        return;
    }


    // Replace the initial zero
    if (currentValue === "0") {

        currentValue = number;

    } else {

        currentValue += number;

    }


    updateDisplay();

}


// ==============================
// Enter Decimal
// ==============================

function enterDecimal() {

    // If an error is showing, start with 0.
    if (currentValue === "Error") {

        currentValue = "0.";
        waitingForNewValue = false;

        updateDisplay();

        return;
    }


    // Start a new decimal number
    if (waitingForNewValue) {

        currentValue = "0.";
        waitingForNewValue = false;

        updateDisplay();

        return;
    }


    // Prevent multiple decimal points
    if (!currentValue.includes(".")) {

        currentValue += ".";

        updateDisplay();

    }

}


// ==============================
// Choose Operator
// ==============================

function chooseOperator(operator) {

    // Ignore operators after an error
    if (currentValue === "Error") {
        return;
    }


    const inputValue = Number(currentValue);


    // If an operator already exists and the user
    // has entered a new number, calculate first.
    if (
        currentOperator !== null &&
        !waitingForNewValue
    ) {

        const result = performCalculation(
            previousValue,
            inputValue,
            currentOperator
        );


        if (result === null) {

            return;

        }


        currentValue = formatResult(result);

    }


    previousValue = Number(currentValue);

    currentOperator = operator;

    waitingForNewValue = true;

}


// ==============================
// Perform Calculation
// ==============================

function performCalculation(
    firstNumber,
    secondNumber,
    operator
) {

    let result;


    switch (operator) {

        case "+":

            result =
                firstNumber +
                secondNumber;

            break;


        case "-":

            result =
                firstNumber -
                secondNumber;

            break;


        case "*":

            result =
                firstNumber *
                secondNumber;

            break;


        case "/":

            if (secondNumber === 0) {

                currentValue = "Error";

                previousValue = null;

                currentOperator = null;

                waitingForNewValue = true;

                updateDisplay();

                return null;

            }


            result =
                firstNumber /
                secondNumber;

            break;


        default:

            return null;

    }


    return result;

}


// ==============================
// Calculate
// ==============================

function calculate() {

    if (
        currentOperator === null ||
        previousValue === null ||
        waitingForNewValue
    ) {

        return;

    }


    const currentNumber =
        Number(currentValue);


    const result =
        performCalculation(
            previousValue,
            currentNumber,
            currentOperator
        );


    if (result === null) {

        return;

    }


    currentValue =
        formatResult(result);

    previousValue =
        null;

    currentOperator =
        null;

    waitingForNewValue =
        true;


    updateDisplay();

}


// ==============================
// Percentage
// ==============================

function calculatePercent() {

    if (currentValue === "Error") {

        return;

    }


    const value =
        Number(currentValue);


    currentValue =
        formatResult(
            value / 100
        );


    updateDisplay();

}


// ==============================
// Delete Last Character
// ==============================

function deleteLastCharacter() {

    if (
        waitingForNewValue ||
        currentValue === "Error"
    ) {

        return;

    }


    if (
        currentValue.length <= 1
    ) {

        currentValue = "0";

    } else {

        currentValue =
            currentValue.slice(
                0,
                -1
            );

    }


    // Prevent a negative sign from remaining alone
    if (
        currentValue === "-" ||
        currentValue === ""
    ) {

        currentValue = "0";

    }


    updateDisplay();

}


// ==============================
// Clear Calculator
// ==============================

function clearCalculator() {

    currentValue = "0";

    previousValue = null;

    currentOperator = null;

    waitingForNewValue = false;


    updateDisplay();

}


// ==============================
// Format Result
// ==============================

function formatResult(value) {

    if (
        !Number.isFinite(value)
    ) {

        return "Error";

    }


    return String(
        Number(
            value.toPrecision(12)
        )
    );

}


// ==============================
// Handle Button Click
// ==============================

function handleButtonClick(button) {

    const number =
        button.dataset.number;

    const operator =
        button.dataset.operator;

    const action =
        button.dataset.action;


    // Number button
    if (
        number !== undefined
    ) {

        enterNumber(number);

        return;

    }


    // Operator button
    if (
        operator !== undefined
    ) {

        chooseOperator(operator);

        return;

    }


    // Action buttons
    switch (action) {

        case "decimal":

            enterDecimal();

            break;


        case "clear":

            clearCalculator();

            break;


        case "delete":

            deleteLastCharacter();

            break;


        case "percent":

            calculatePercent();

            break;


        case "equals":

            calculate();

            break;

    }

}


// ==============================
// Button Events
// ==============================

buttons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                handleButtonClick(button);

            }
        );

    }
);


// ==============================
// Keyboard Support
// ==============================

document.addEventListener(
    "keydown",
    function (event) {

        const key =
            event.key;


        // Numbers
        if (
            key >= "0" &&
            key <= "9"
        ) {

            enterNumber(key);

            return;

        }


        // Decimal
        if (
            key === "."
        ) {

            enterDecimal();

            return;

        }


        // Operators
        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            chooseOperator(key);

            return;

        }


        // Enter / Equals
        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;

        }


        // Backspace
        if (
            key === "Backspace"
        ) {

            event.preventDefault();

            deleteLastCharacter();

            return;

        }


        // Escape / Clear
        if (
            key === "Escape"
        ) {

            clearCalculator();

            return;

        }


        // Percentage
        if (
            key === "%"
        ) {

            calculatePercent();

        }

    }
);


// ==============================
// Initial Display
// ==============================

updateDisplay();