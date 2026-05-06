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

// ─── Calculator ──────────────────────────────────────────────────────────────

const calcExprEl   = document.getElementById('calc-expr');
const calcResultEl = document.getElementById('calc-result');
const calcGrid     = document.querySelector('.calc-grid');

let calcExpression = '';
let afterEquals    = false;

function resetCalc() {
  calcExpression = '';
  afterEquals    = false;
  renderCalc();
}

function renderCalc() {
  calcExprEl.textContent   = '';
  calcResultEl.textContent = calcExpression ? toDisplayStr(calcExpression) : '0';
}

// Replace operators with visual symbols for display only
function toDisplayStr(expr) {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
}

function fmtNumber(n) {
  if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
  return parseFloat(n.toPrecision(12)).toString();
}

function calcAppend(char) {
  if (afterEquals) {
    afterEquals = false;
    if (/[0-9(.]/.test(char)) {
      calcExpression = char;
      renderCalc();
      return;
    }
    // operator/paren after = continues from the result value
  }
  calcExpression += char;
  renderCalc();
}

function calcClear() {
  calcExpression = '';
  afterEquals    = false;
  renderCalc();
}

function calcBackspace() {
  if (afterEquals) { calcClear(); return; }
  calcExpression = calcExpression.slice(0, -1);
  renderCalc();
}

function calcEquals() {
  if (!calcExpression || afterEquals) return;
  try {
    const result = evaluate(calcExpression);
    calcExprEl.textContent   = toDisplayStr(calcExpression) + ' =';
    calcResultEl.textContent = fmtNumber(result);
    calcExpression           = fmtNumber(result);
    afterEquals              = true;
  } catch {
    calcExprEl.textContent   = toDisplayStr(calcExpression);
    calcResultEl.textContent = 'Error';
    calcExpression           = '';
    afterEquals              = true;
  }
}

calcGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.calc-btn');
  if (!btn) return;
  const { action, value } = btn.dataset;
  if      (action === 'clear')     calcClear();
  else if (action === 'backspace') calcBackspace();
  else if (action === 'equals')    calcEquals();
  else if (value !== undefined)    calcAppend(value);
});

document.addEventListener('keydown', (e) => {
  if (calcScreen.hidden) return;
  const k = e.key;
  if (/^[0-9+\-*/.()]$/.test(k)) calcAppend(k);
  else if (k === 'Enter' || k === '=') calcEquals();
  else if (k === 'Backspace') calcBackspace();
  else if (k === 'Escape')    calcClear();
});

// ─── Expression parser (recursive descent) ───────────────────────────────────

function evaluate(expr) {
  const tokens = tokenize(expr);
  const state  = { pos: 0 };
  const result = parseExpr(tokens, state);
  if (state.pos !== tokens.length) throw new Error('Syntax error');
  return result;
}

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') { i++; continue; }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expr[i + 1] ?? ''))) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push({ type: 'NUM', value: parseFloat(num) });
    } else if ('+-*/()'.includes(ch)) {
      tokens.push({ type: ch });
      i++;
    } else {
      throw new Error(`Invalid character: ${ch}`);
    }
  }
  return tokens;
}

// expr → term (('+' | '-') term)*
function parseExpr(tokens, state) {
  let left = parseTerm(tokens, state);
  while (state.pos < tokens.length) {
    const { type } = tokens[state.pos];
    if (type !== '+' && type !== '-') break;
    state.pos++;
    const right = parseTerm(tokens, state);
    left = type === '+' ? left + right : left - right;
  }
  return left;
}

// term → factor (('*' | '/') factor)*
function parseTerm(tokens, state) {
  let left = parseFactor(tokens, state);
  while (state.pos < tokens.length) {
    const { type } = tokens[state.pos];
    if (type !== '*' && type !== '/') break;
    state.pos++;
    const right = parseFactor(tokens, state);
    if (type === '/' && right === 0) throw new Error('Division by zero');
    left = type === '*' ? left * right : left / right;
  }
  return left;
}

// factor → ['+' | '-'] factor | NUM | '(' expr ')'
function parseFactor(tokens, state) {
  if (state.pos >= tokens.length) throw new Error('Unexpected end of expression');
  const t = tokens[state.pos];

  if (t.type === '-') { state.pos++; return -parseFactor(tokens, state); }
  if (t.type === '+') { state.pos++; return  parseFactor(tokens, state); }

  if (t.type === 'NUM') {
    state.pos++;
    return t.value;
  }

  if (t.type === '(') {
    state.pos++;
    const val = parseExpr(tokens, state);
    if (state.pos >= tokens.length || tokens[state.pos].type !== ')') {
      throw new Error('Missing closing parenthesis');
    }
    state.pos++;
    return val;
  }

  throw new Error(`Unexpected token: ${t.type}`);
}
