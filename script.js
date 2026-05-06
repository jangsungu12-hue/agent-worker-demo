const appShell = document.querySelector(".app-shell");
const loginScreen = document.querySelector("#login-screen");
const welcomeScreen = document.querySelector("#welcome-screen");
const loginForm = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const loginErrorEl = document.querySelector("#login-error");
const logoutButton = document.querySelector("#logout-button");
const welcomeMessage = document.querySelector("#welcome-message");

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
  welcomeMessage.textContent = `${username}님, 로그인되었습니다.`;
  loginScreen.hidden = true;
  welcomeScreen.hidden = false;
  appShell.setAttribute("aria-labelledby", "welcome-title");
});

loginForm.addEventListener("input", () => {
  loginErrorEl.textContent = "";
});

logoutButton.addEventListener("click", () => {
  welcomeScreen.hidden = true;
  loginScreen.hidden = false;
  appShell.setAttribute("aria-labelledby", "login-title");
  loginForm.reset();
  loginErrorEl.textContent = "";
  usernameInput.focus();
});

usernameInput.focus();
