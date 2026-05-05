const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const keypad = document.querySelector(".keypad");

const operators = new Set(["+", "-", "*", "/"]);
const precedence = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
};

let tokens = [];
let currentNumber = "";
let resultShown = false;
let lastResult = "";

function render() {
  const expression = [...tokens, currentNumber].join(" ");
  expressionEl.textContent = expression || "0";

  if (!resultShown) {
    resultEl.textContent = "Press =";
  }
}

function clearAll() {
  tokens = [];
  currentNumber = "";
  resultShown = false;
  lastResult = "";
  resultEl.classList.remove("error");
  render();
}

function appendNumber(value) {
  if (resultShown) {
    tokens = [];
    currentNumber = "";
    resultShown = false;
    lastResult = "";
    resultEl.classList.remove("error");
  }

  currentNumber = currentNumber === "0" ? value : `${currentNumber}${value}`;
  render();
}

function appendDecimal() {
  if (resultShown) {
    tokens = [];
    currentNumber = "";
    resultShown = false;
    lastResult = "";
    resultEl.classList.remove("error");
  }

  if (!currentNumber.includes(".")) {
    currentNumber = currentNumber ? `${currentNumber}.` : "0.";
    render();
  }
}

function appendOperator(operator) {
  resultEl.classList.remove("error");

  if (resultShown) {
    tokens = lastResult ? [lastResult] : [];
    currentNumber = "";
    resultShown = false;
  }

  if (currentNumber) {
    tokens.push(normalizeNumber(currentNumber));
    currentNumber = "";
  }

  if (!tokens.length) {
    if (operator === "-") {
      currentNumber = "-";
    }
    render();
    return;
  }

  if (operators.has(tokens[tokens.length - 1])) {
    tokens[tokens.length - 1] = operator;
  } else {
    tokens.push(operator);
  }

  render();
}

function backspace() {
  if (resultShown) {
    clearAll();
    return;
  }

  if (currentNumber) {
    currentNumber = currentNumber.slice(0, -1);
  } else {
    tokens.pop();
  }

  render();
}

function normalizeNumber(value) {
  if (value === "-") {
    return "0";
  }

  if (value.endsWith(".")) {
    return value.slice(0, -1);
  }

  return value;
}

function toPostfix(inputTokens) {
  const output = [];
  const stack = [];

  inputTokens.forEach((token) => {
    if (!operators.has(token)) {
      output.push(Number(token));
      return;
    }

    while (
      stack.length &&
      precedence[stack[stack.length - 1]] >= precedence[token]
    ) {
      output.push(stack.pop());
    }

    stack.push(token);
  });

  while (stack.length) {
    output.push(stack.pop());
  }

  return output;
}

function evaluatePostfix(postfixTokens) {
  const stack = [];

  postfixTokens.forEach((token) => {
    if (typeof token === "number") {
      stack.push(token);
      return;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (token === "/" && right === 0) {
      throw new Error("Cannot divide by zero");
    }

    if (token === "+") stack.push(left + right);
    if (token === "-") stack.push(left - right);
    if (token === "*") stack.push(left * right);
    if (token === "/") stack.push(left / right);
  });

  return stack[0];
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid calculation");
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function calculate() {
  if (currentNumber) {
    tokens.push(normalizeNumber(currentNumber));
    currentNumber = "";
  }

  if (!tokens.length || operators.has(tokens[tokens.length - 1])) {
    resultEl.textContent = "Complete expression";
    resultEl.classList.add("error");
    resultShown = true;
    lastResult = "";
    render();
    return;
  }

  try {
    const result = formatResult(evaluatePostfix(toPostfix(tokens)));
    resultEl.textContent = result;
    resultEl.classList.remove("error");
    tokens = [result];
    lastResult = result;
  } catch (error) {
    resultEl.textContent = error.message;
    resultEl.classList.add("error");
    lastResult = "";
  }

  resultShown = true;
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.number) appendNumber(button.dataset.number);
  if (button.dataset.operator) appendOperator(button.dataset.operator);
  if (button.dataset.action === "decimal") appendDecimal();
  if (button.dataset.action === "clear") clearAll();
  if (button.dataset.action === "backspace") backspace();
  if (button.dataset.action === "equals") calculate();
});

window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^\d$/.test(key)) appendNumber(key);
  if (operators.has(key)) appendOperator(key);
  if (key === ".") appendDecimal();
  if (key === "Enter" || key === "=") calculate();
  if (key === "Backspace") backspace();
  if (key === "Escape") clearAll();
});

render();
