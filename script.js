// ─── Login ───────────────────────────────────────────────────────────────────

const appShell      = document.querySelector('.app-shell');
const loginScreen   = document.getElementById('login-screen');
const calcScreen    = document.getElementById('calc-screen');
const loginForm     = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginErrorEl  = document.getElementById('login-error');
const logoutButton  = document.getElementById('logout-button');

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
  calcScreen.hidden  = false;
  appShell.setAttribute('aria-labelledby', 'calc-title');
  resetCalc();
});

loginForm.addEventListener('input', () => {
  loginErrorEl.textContent = '';
});

logoutButton.addEventListener('click', () => {
  calcScreen.hidden  = true;
  loginScreen.hidden = false;
  appShell.setAttribute('aria-labelledby', 'login-title');
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
