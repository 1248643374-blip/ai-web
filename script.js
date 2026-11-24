const display = document.getElementById("display");
const expression = document.getElementById("expression");
const keys = document.querySelector(".keys");
const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

let current = "0";
let previous = null;
let operator = null;
let waitingForOperand = false;

function updateDisplay() {
  display.textContent = current;
  expression.textContent =
    operator && previous !== null
      ? `${previous} ${operatorSymbols[operator] || operator}`
      : "";

  keys.querySelectorAll('button[data-action="operator"]').forEach((button) => {
    button.classList.toggle(
      "is-active",
      waitingForOperand && button.dataset.value === operator
    );
  });
}

function inputDigit(digit) {
  if (waitingForOperand) {
    current = digit;
    waitingForOperand = false;
    return;
  }

  current = current === "0" ? digit : current + digit;
}

function inputDecimal() {
  if (waitingForOperand) {
    current = "0.";
    waitingForOperand = false;
    return;
  }

  if (!current.includes(".")) {
    current += ".";
  }
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  waitingForOperand = false;
}

function toggleSign() {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
}

function percent() {
  current = String(parseFloat(current) / 100);
}

function calculate(left, op, right) {
  const a = parseFloat(left);
  const b = parseFloat(right);

  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") {
    if (b === 0) return "错误";
    return a / b;
  }

  return b;
}

function formatResult(value) {
  if (value === "错误") return value;
  const rounded = Math.round(value * 1e10) / 1e10;
  return String(rounded);
}

function chooseOperator(nextOperator) {
  if (operator && !waitingForOperand) {
    const result = calculate(previous, operator, current);
    current = formatResult(result);
    previous = current === "错误" ? null : current;
    operator = current === "错误" ? null : nextOperator;
    waitingForOperand = current !== "错误";
    return;
  }

  previous = current;
  operator = nextOperator;
  waitingForOperand = true;
}

function equals() {
  if (!operator || previous === null) return;

  const result = calculate(previous, operator, current);
  current = formatResult(result);
  previous = null;
  operator = null;
  waitingForOperand = true;
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;

  if (action === "digit") inputDigit(button.dataset.value);
  if (action === "decimal") inputDecimal();
  if (action === "clear") clearAll();
  if (action === "sign") toggleSign();
  if (action === "percent") percent();
  if (action === "operator") chooseOperator(button.dataset.value);
  if (action === "equals") equals();

  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key >= "0" && key <= "9") inputDigit(key);
  else if (key === ".") inputDecimal();
  else if (key === "+" || key === "-" || key === "*" || key === "/") chooseOperator(key);
  else if (key === "Enter" || key === "=") equals();
  else if (key === "Escape") clearAll();
  else if (key === "Backspace") {
    if (waitingForOperand) return;
    current = current.length > 1 ? current.slice(0, -1) : "0";
    if (current === "-") current = "0";
  } else {
    return;
  }

  event.preventDefault();
  updateDisplay();
});
