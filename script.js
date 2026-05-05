const displayValueElement = document.getElementById("display-value");
const expressionElement = document.getElementById("expression");
const keypad = document.querySelector(".keypad");

const operatorLabels = {
  "+": "+",
  "-": "-",
  "*": "x",
  "/": "/",
};

let displayValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let hasError = false;

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  const formatted = rounded.toLocaleString("en-US", {
    maximumFractionDigits: 10,
  });

  return formatted.length <= 14 ? formatted : rounded.toExponential(6);
}

function parseDisplayValue() {
  return Number(displayValue);
}

function updateDisplay() {
  displayValueElement.textContent = hasError ? displayValue : formatNumber(parseDisplayValue());
}

function setExpression(text = "") {
  expressionElement.textContent = text || "\u00a0";
}

function resetCalculator() {
  displayValue = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  hasError = false;
  setExpression();
  updateDisplay();
}

function setError(message) {
  displayValue = message;
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  hasError = true;
  setExpression();
  updateDisplay();
}

function inputDigit(digit) {
  if (hasError) {
    resetCalculator();
  }

  if (waitingForOperand) {
    displayValue = digit;
    waitingForOperand = false;
    updateDisplay();
    return;
  }

  displayValue = displayValue === "0" ? digit : `${displayValue}${digit}`;
  updateDisplay();
}

function inputDecimal() {
  if (hasError) {
    resetCalculator();
  }

  if (waitingForOperand) {
    displayValue = "0.";
    waitingForOperand = false;
    displayValueElement.textContent = displayValue;
    return;
  }

  if (!displayValue.includes(".")) {
    displayValue = `${displayValue}.`;
  }

  displayValueElement.textContent = displayValue;
}

function deleteDigit() {
  if (hasError) {
    resetCalculator();
    return;
  }

  if (waitingForOperand) {
    return;
  }

  displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : "0";
  updateDisplay();
}

function toggleSign() {
  if (hasError || displayValue === "0") {
    return;
  }

  displayValue = displayValue.startsWith("-")
    ? displayValue.slice(1)
    : `-${displayValue}`;
  updateDisplay();
}

function performCalculation(firstValue, secondValue, operator) {
  switch (operator) {
    case "+":
      return firstValue + secondValue;
    case "-":
      return firstValue - secondValue;
    case "*":
      return firstValue * secondValue;
    case "/":
      if (secondValue === 0) {
        throw new Error("0으로 나눌 수 없습니다");
      }
      return firstValue / secondValue;
    default:
      throw new Error("지원하지 않는 연산입니다");
  }
}

function chooseOperator(nextOperator) {
  if (hasError) {
    resetCalculator();
  }

  const inputValue = parseDisplayValue();

  if (pendingOperator && waitingForOperand) {
    pendingOperator = nextOperator;
    setExpression(`${formatNumber(storedValue)} ${operatorLabels[nextOperator]}`);
    return;
  }

  if (storedValue === null) {
    storedValue = inputValue;
  } else if (pendingOperator) {
    try {
      storedValue = performCalculation(storedValue, inputValue, pendingOperator);
    } catch (error) {
      setError(error.message);
      return;
    }

    displayValue = String(storedValue);
    updateDisplay();
  }

  pendingOperator = nextOperator;
  waitingForOperand = true;
  setExpression(`${formatNumber(storedValue)} ${operatorLabels[nextOperator]}`);
}

function calculateResult() {
  if (!pendingOperator || storedValue === null) {
    return;
  }

  const inputValue = parseDisplayValue();
  const expression = `${formatNumber(storedValue)} ${operatorLabels[pendingOperator]} ${formatNumber(inputValue)} =`;

  try {
    const result = performCalculation(storedValue, inputValue, pendingOperator);
    displayValue = String(result);
    storedValue = null;
    pendingOperator = null;
    waitingForOperand = true;
    setExpression(expression);
    updateDisplay();
  } catch (error) {
    setError(error.message);
  }
}

function handleButtonPress(button) {
  const { digit, operator, action } = button.dataset;

  if (digit !== undefined) {
    inputDigit(digit);
    return;
  }

  if (operator) {
    chooseOperator(operator);
    return;
  }

  switch (action) {
    case "clear":
      resetCalculator();
      break;
    case "delete":
      deleteDigit();
      break;
    case "decimal":
      inputDecimal();
      break;
    case "sign":
      toggleSign();
      break;
    case "equals":
      calculateResult();
      break;
    default:
      break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  handleButtonPress(button);
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) {
    inputDigit(event.key);
    return;
  }

  if (event.key === ".") {
    inputDecimal();
    return;
  }

  if (["+", "-", "*", "/"].includes(event.key)) {
    event.preventDefault();
    chooseOperator(event.key);
    return;
  }

  if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculateResult();
    return;
  }

  if (event.key === "Backspace") {
    deleteDigit();
    return;
  }

  if (event.key === "Escape") {
    resetCalculator();
  }
});

resetCalculator();
