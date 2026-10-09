
const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.querySelectorAll(".buttons button");

let expression = "";
let justCalculated = false;

function updateDisplay() {
    display.textContent = expression || "0";
}

function clearAll() {
    expression = "";
    history.textContent = "Ready to calculate";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function addValue(value) {
    if (justCalculated) {
        if (/[0-9.]/.test(value)) {
            expression = "";
        }
        justCalculated = false;
    }

    if (/[+\-*/]/.test(value)) {
        if (!expression && value !== "-") return;

        if (/[+\-*/]$/.test(expression)) {
            expression = expression.slice(0, -1);
        }
    }

    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/]/).pop();
        if (currentNumber.includes(".")) return;

        if (!currentNumber) value = "0.";
    }

    expression += value;
    history.textContent = "Calculation in progress";
    updateDisplay();
}

function calculate() {
    if (!expression || !/[0-9]$/.test(expression)) return;

    try {
        // Accept only numeric expressions and arithmetic operators.
        if (!/^[0-9+\-*/. ()]+$/.test(expression)) {
            throw new Error("Invalid expression");
        }

        // Evaluate the expression using JavaScript arithmetic.
        const result = Function('"use strict"; return (' + expression + ')')();

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        history.textContent = expression.replace(/\*/g, "×")
            .replace(/\//g, "÷") + " =";

        expression = String(Number(result.toPrecision(12)));
        justCalculated = true;
        updateDisplay();
    } catch {
        display.textContent = "Error";
        history.textContent = "Invalid calculation";
        expression = "";
        justCalculated = false;
    }
}

function percentage() {
    if (!expression || !/[0-9]$/.test(expression)) return;

    const match = expression.match(/(\d*\.?\d+)$/);
    if (!match) return;

    const number = Number(match[0]);
    expression = expression.slice(0, -match[0].length) + String(number / 100);
    justCalculated = false;
    updateDisplay();
}

function toggleSign() {
    if (!expression) {
        expression = "-";
    } else if (/^-?\d*\.?\d+$/.test(expression)) {
        expression = expression.startsWith("-")
            ? expression.slice(1)
            : "-" + expression;
    } else {
        const match = expression.match(/(\d*\.?\d+)$/);
        if (match) {
            const number = Number(match[0]);
            expression = expression.slice(0, -match[0].length) +
                String(-number);
        }
    }

    justCalculated = false;
    updateDisplay();
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) addValue(value);

        if (action === "clear") clearAll();
        if (action === "delete") deleteLast();
        if (action === "equals") calculate();
        if (action === "percent") percentage();
        if (action === "sign") toggleSign();
    });
});

document.addEventListener("keydown", event => {
    if (/^[0-9.]$/.test(event.key)) {
        addValue(event.key);
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        addValue(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    } else if (event.key === "%") {
        percentage();
    }
});