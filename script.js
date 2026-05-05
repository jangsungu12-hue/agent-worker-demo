const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberInput = document.getElementById("remember");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const formMessage = document.getElementById("form-message");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(input, errorElement, message) {
  input.setAttribute("aria-invalid", "true");
  errorElement.textContent = message;
}

function clearFieldError(input, errorElement) {
  input.removeAttribute("aria-invalid");
  errorElement.textContent = "";
}

function validateEmail() {
  const email = emailInput.value.trim();

  if (!email) {
    setFieldError(emailInput, emailError, "이메일을 입력해 주세요.");
    return false;
  }

  if (!emailPattern.test(email)) {
    setFieldError(emailInput, emailError, "올바른 이메일 형식이 아닙니다.");
    return false;
  }

  clearFieldError(emailInput, emailError);
  return true;
}

function validatePassword() {
  if (!passwordInput.value) {
    setFieldError(passwordInput, passwordError, "비밀번호를 입력해 주세요.");
    return false;
  }

  clearFieldError(passwordInput, passwordError);
  return true;
}

function setSuccessMessage() {
  const email = emailInput.value.trim();
  const suffix = rememberInput.checked ? " 로그인 상태가 유지됩니다." : "";
  formMessage.textContent = `${email} 계정으로 로그인되었습니다.${suffix}`;
  formMessage.classList.add("is-success");
}

function clearStatus() {
  formMessage.textContent = "";
  formMessage.classList.remove("is-success");
}

emailInput.addEventListener("input", () => {
  clearStatus();
  if (emailInput.getAttribute("aria-invalid") === "true") {
    validateEmail();
  }
});

passwordInput.addEventListener("input", () => {
  clearStatus();
  if (passwordInput.getAttribute("aria-invalid") === "true") {
    validatePassword();
  }
});

rememberInput.addEventListener("change", clearStatus);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  clearStatus();

  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (!isEmailValid) {
    emailInput.focus();
    return;
  }

  if (!isPasswordValid) {
    passwordInput.focus();
    return;
  }

  setSuccessMessage();
});
