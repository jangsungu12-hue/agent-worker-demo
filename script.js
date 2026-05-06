const loginScreen = document.querySelector('#login-screen');
const loginForm = document.querySelector('#login-form');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const loginErrorEl = document.querySelector('#login-error');
const logoutButton = document.querySelector('#logout-button');
const calculatorScreen = document.querySelector('#calculator-screen');
const calcResultEl = document.querySelector('#calc-result');
const calcExpressionEl = document.querySelector('#calc-expression');

// Calculator state
let current = '0';
let prev = null;
let op = null;
let shouldReset = false;
let exprStr = '';

function updateDisplay() {
  calcResultEl.textContent = current;
  calcExpressionEl.textContent = exprStr;
}

function inputDigit(digit) {
  if (shouldReset) {
    current = digit;
    shouldReset = false;
  } else {
    current = current === '0' ? digit : current + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (shouldReset) {
    current = '0.';
    shouldReset = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  updateDisplay();
}

function setOp(nextOp) {
  if (prev !== null && !shouldReset) {
    compute();
  }
  prev = current;
  op = nextOp;
  exprStr = `${current} ${nextOp}`;
  shouldReset = true;
  updateDisplay();
}

function compute() {
  if (prev === null || op === null) return;
  const a = parseFloat(prev);
  const b = parseFloat(current);
  let result;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '×': result = a * b; break;
    case '÷': result = b !== 0 ? a / b : 'Error'; break;
    default: return;
  }
  exprStr = `${prev} ${op} ${current} =`;
  current = result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10)));
  prev = null;
  op = null;
  shouldReset = true;
  updateDisplay();
}

function clearCalc() {
  current = '0';
  prev = null;
  op = null;
  shouldReset = false;
  exprStr = '';
  updateDisplay();
}

function toggleSign() {
  if (current !== '0' && current !== 'Error') {
    current = String(parseFloat(current) * -1);
    updateDisplay();
  }
}

function applyPercent() {
  if (current !== 'Error') {
    current = String(parseFloat(current) / 100);
    updateDisplay();
  }
}

document.querySelector('.calc-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.calc-btn');
  if (!btn) return;
  if (btn.dataset.num !== undefined) {
    inputDigit(btn.dataset.num);
  } else if (btn.dataset.op) {
    setOp(btn.dataset.op);
  } else {
    switch (btn.dataset.action) {
      case 'clear':   clearCalc(); break;
      case 'equals':  compute(); break;
      case 'decimal': inputDecimal(); break;
      case 'sign':    toggleSign(); break;
      case 'percent': applyPercent(); break;
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (calculatorScreen.hidden) return;
  if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); return; }
  switch (e.key) {
    case '.': inputDecimal(); break;
    case '+': setOp('+'); break;
    case '-': setOp('-'); break;
    case '*': setOp('×'); break;
    case '/': e.preventDefault(); setOp('÷'); break;
    case 'Enter':
    case '=': compute(); break;
    case 'Escape': clearCalc(); break;
    case 'Backspace':
      if (!shouldReset && current.length > 1) {
        current = current.slice(0, -1);
      } else {
        current = '0';
      }
      updateDisplay();
      break;
  }
});

// Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!username || !password) {
    loginErrorEl.textContent = '아이디와 비밀번호를 모두 입력하세요.';
    (username ? passwordInput : usernameInput).focus();
    return;
  }
  loginErrorEl.textContent = '';
  loginScreen.hidden = true;
  calculatorScreen.hidden = false;
  clearCalc();
});

loginForm.addEventListener('input', () => {
  loginErrorEl.textContent = '';
});

// Logout
logoutButton.addEventListener('click', () => {
  calculatorScreen.hidden = true;
  loginScreen.hidden = false;
  loginForm.reset();
  loginErrorEl.textContent = '';
  usernameInput.focus();
});

usernameInput.focus();
