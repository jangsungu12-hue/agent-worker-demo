const authPanel = document.getElementById("auth-panel");
const appPanel = document.getElementById("app-panel");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("auth-message");
const welcomeMessage = document.getElementById("welcome-message");
const logoutButton = document.getElementById("logout-button");
const loginButton = loginForm.querySelector('button[type="submit"]');

const calculatorForm = document.getElementById("calculator-form");
const firstNumberInput = document.getElementById("first-number");
const secondNumberInput = document.getElementById("second-number");
const operatorSelect = document.getElementById("operator");
const resultElement = document.getElementById("result");

let currentUser = null;

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

function setAuthMessage(message) {
  authMessage.textContent = message;
}

function setLoginPending(isPending) {
  loginButton.disabled = isPending;
  loginButton.textContent = isPending ? "Logging In..." : "Log In";
}

function renderAuthState() {
  const isLoggedIn = Boolean(currentUser);

  authPanel.classList.toggle("hidden", isLoggedIn);
  appPanel.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    welcomeMessage.textContent = `Signed in as ${currentUser.name}.`;
    setAuthMessage("");
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

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let payload = {};

  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

async function restoreSession() {
  try {
    const payload = await requestJson("/api/session", { method: "GET" });
    currentUser = payload.authenticated ? payload.user : null;
  } catch {
    currentUser = null;
    setAuthMessage("Unable to load session.");
  } finally {
    renderAuthState();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setAuthMessage("Enter both email and password.");
    return;
  }

  setLoginPending(true);
  setAuthMessage("");

  try {
    const payload = await requestJson("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    currentUser = payload.user;
    renderAuthState();
  } catch (error) {
    setAuthMessage(error.message);
  } finally {
    setLoginPending(false);
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  try {
    await requestJson("/api/logout", { method: "POST", body: "{}" });
  } catch {
    // Clear client state even if the session has already expired server-side.
  } finally {
    currentUser = null;
    logoutButton.disabled = false;
    renderAuthState();
  }
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

restoreSession();
