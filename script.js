const appShell = document.querySelector(".app-shell");
const loginScreen = document.querySelector("#login-screen");
const calculatorScreen = document.querySelector("#calculator-screen");
const loginForm = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const loginErrorEl = document.querySelector("#login-error");
const logoutButton = document.querySelector("#logout-button");
const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const keypad = document.querySelector(".keypad");

const operators = new Set(["+", "-", "*", "/"]);
const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

let tokens = [];
let currentNumber = "";
let resultShown = false;
let lastResult = "";
let isLoggedIn = false;

function showCalculator() {
  isLoggedIn = true;
  loginScreen.hidden = true;
  calculatorScreen.hidden = false;
  appShell.setAttribute("aria-labelledby", "app-title");
  clearAll();
  keypad.querySelector("button").focus();
}

function showLogin() {
  isLoggedIn = false;
  calculatorScreen.hidden = true;
  loginScreen.hidden = false;
  appShell.setAttribute("aria-labelledby", "login-title");
  loginForm.reset();
  loginErrorEl.textContent = "";
  clearAll();
  usernameInput.focus();
}

function countUnclosedParens() {
  let count = 0;
  for (const token of tokens) {
    if (token === "(") count++;
    if (token === ")") count--;
  }
  return count;
}

function render() {
  const parts = currentNumber ? [...tokens, currentNumber] : [...tokens];
  let display = parts
    .join(" ")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")");
  expressionEl.textContent = display || "0";

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

  // Auto-insert × when number immediately follows )
  if (!currentNumber && tokens.length > 0 && tokens[tokens.length - 1] === ")") {
    tokens.push("*");
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

  const lastTok = tokens[tokens.length - 1];

  // Allow unary minus at expression start or right after (
  if (tokens.length === 0 || lastTok === "(") {
    if (operator === "-") {
      currentNumber = "-";
      render();
    }
    return;
  }

  if (operators.has(lastTok)) {
    tokens[tokens.length - 1] = operator;
  } else {
    tokens.push(operator);
  }

  render();
}

function appendOpenParen() {
  if (resultShown) {
    tokens = [];
    currentNumber = "";
    resultShown = false;
    lastResult = "";
    resultEl.classList.remove("error");
  }

  // Auto-insert × when ( follows a completed number or )
  if (currentNumber) {
    tokens.push(normalizeNumber(currentNumber));
    currentNumber = "";
    tokens.push("*");
  } else if (tokens.length > 0 && tokens[tokens.length - 1] === ")") {
    tokens.push("*");
  }

  tokens.push("(");
  render();
}

function appendCloseParen() {
  if (resultShown) return;

  if (currentNumber) {
    tokens.push(normalizeNumber(currentNumber));
    currentNumber = "";
  }

  const lastTok = tokens[tokens.length - 1];
  const unclosed = countUnclosedParens();

  // ) is only valid when there is an unclosed ( and last token is a number or )
  if (unclosed > 0 && lastTok !== undefined && lastTok !== "(" && !operators.has(lastTok)) {
    tokens.push(")");
    render();
  }
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
  if (value === "-") return "0";
  if (value.endsWith(".")) return value.slice(0, -1);
  return value;
}

function toPostfix(inputTokens) {
  const output = [];
  const stack = [];

  for (const token of inputTokens) {
    if (token === "(") {
      stack.push("(");
    } else if (token === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop();
    } else if (operators.has(token)) {
      while (
        stack.length &&
        stack[stack.length - 1] !== "(" &&
        precedence[stack[stack.length - 1]] >= precedence[token]
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else {
      output.push(Number(token));
    }
  }

  while (stack.length) {
    output.push(stack.pop());
  }

  return output;
}

function evaluatePostfix(postfixTokens) {
  const stack = [];

  for (const token of postfixTokens) {
    if (typeof token === "number") {
      stack.push(token);
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (token === "/" && right === 0) throw new Error("0으로 나눌 수 없습니다");
    if (token === "+") stack.push(left + right);
    if (token === "-") stack.push(left - right);
    if (token === "*") stack.push(left * right);
    if (token === "/") stack.push(left / right);
  }

  return stack[0];
}

function formatResult(value) {
  if (!Number.isFinite(value)) throw new Error("계산 오류");
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function calculate() {
  if (currentNumber) {
    tokens.push(normalizeNumber(currentNumber));
    currentNumber = "";
  }

  const lastTok = tokens[tokens.length - 1];

  if (!tokens.length || operators.has(lastTok) || lastTok === "(") {
    resultEl.textContent = "식을 완성해 주세요";
    resultEl.classList.add("error");
    resultShown = true;
    lastResult = "";
    render();
    return;
  }

  if (countUnclosedParens() !== 0) {
    resultEl.textContent = "괄호가 맞지 않습니다";
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

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    loginErrorEl.textContent = "아이디와 비밀번호를 모두 입력하세요.";
    (username ? passwordInput : usernameInput).focus();
    return;
  }

  loginErrorEl.textContent = "";
  showCalculator();
});

loginForm.addEventListener("input", () => {
  loginErrorEl.textContent = "";
});

logoutButton.addEventListener("click", showLogin);

keypad.addEventListener("click", (event) => {
  if (!isLoggedIn) return;

  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number) appendNumber(button.dataset.number);
  if (button.dataset.operator) appendOperator(button.dataset.operator);
  if (button.dataset.action === "decimal") appendDecimal();
  if (button.dataset.action === "clear") clearAll();
  if (button.dataset.action === "backspace") backspace();
  if (button.dataset.action === "equals") calculate();
  if (button.dataset.action === "open-paren") appendOpenParen();
  if (button.dataset.action === "close-paren") appendCloseParen();
});

window.addEventListener("keydown", (event) => {
  if (!isLoggedIn) return;

  const { key } = event;

  if (/^\d$/.test(key)) appendNumber(key);
  if (operators.has(key)) appendOperator(key);
  if (key === ".") appendDecimal();
  if (key === "Enter" || key === "=") calculate();
  if (key === "Backspace") backspace();
  if (key === "Escape") clearAll();
  if (key === "(") appendOpenParen();
  if (key === ")") appendCloseParen();
});

render();
usernameInput.focus();
