const DEMO_USER = {
  email: "demo@demo.com",
  password: "password123",
  name: "Demo User",
};

const SESSION_KEY = "loggedInUser";

const authPanel = document.getElementById("auth-panel");
const appPanel = document.getElementById("app-panel");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("auth-message");
const welcomeMessage = document.getElementById("welcome-message");
const logoutButton = document.getElementById("logout-button");

const calculatorForm = document.getElementById("calculator-form");
const firstNumberInput = document.getElementById("first-number");
const secondNumberInput = document.getElementById("second-number");
const operatorSelect = document.getElementById("operator");
const resultElement = document.getElementById("result");

function formatResult(value) {
  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("en-US", { maximumFractionDigits: 10 });
}

function calculate(firstNumber, secondNumber, operator) {
  switch (operator) {
    case "+":
      return firstNumber + secondNumber;
    case "-":
      return firstNumber - secondNumber;
    case "*":
      return firstNumber * secondNumber;
    case "/":
      if (secondNumber === 0) {
        throw new Error("Cannot divide by zero.");
      }
      return firstNumber / secondNumber;
    default:
      throw new Error("Unsupported operator.");
  }
}

function setLoggedInUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getLoggedInUser() {
  const storedValue = sessionStorage.getItem(SESSION_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function renderAuthState() {
  const user = getLoggedInUser();
  const isLoggedIn = Boolean(user);

  authPanel.classList.toggle("hidden", isLoggedIn);
  appPanel.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    welcomeMessage.textContent = `Signed in as ${user.name}.`;
    authMessage.textContent = "";
    loginForm.reset();
    emailInput.blur();
    passwordInput.blur();
    firstNumberInput.focus();
    return;
  }

  welcomeMessage.textContent = "";
  resultElement.textContent = "Enter values to begin.";
  emailInput.focus();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    authMessage.textContent = "Enter both email and password.";
    return;
  }

  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    authMessage.textContent = "Invalid email or password.";
    return;
  }

  setLoggedInUser({
    email: DEMO_USER.email,
    name: DEMO_USER.name,
  });
  renderAuthState();
});

logoutButton.addEventListener("click", () => {
  clearSession();
  renderAuthState();
});

calculatorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const firstNumber = Number(firstNumberInput.value);
  const secondNumber = Number(secondNumberInput.value);
  const operator = operatorSelect.value;

  if (firstNumberInput.value === "" || secondNumberInput.value === "") {
    resultElement.textContent = "Enter both numbers.";
    return;
  }

  if (Number.isNaN(firstNumber) || Number.isNaN(secondNumber)) {
    resultElement.textContent = "Enter valid numbers.";
    return;
  }

  try {
    const result = calculate(firstNumber, secondNumber, operator);
    resultElement.textContent = formatResult(result);
  } catch (error) {
    resultElement.textContent = error.message;
  }
});

renderAuthState();
