const form = document.getElementById("calculator-form");
const firstNumberInput = document.getElementById("first-number");
const secondNumberInput = document.getElementById("second-number");
const operatorSelect = document.getElementById("operator");
const resultElement = document.getElementById("result");

function formatResult(value) {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("ko-KR", { maximumFractionDigits: 10 });
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
        throw new Error("0으로 나눌 수 없습니다.");
      }
      return firstNumber / secondNumber;
    default:
      throw new Error("지원하지 않는 연산입니다.");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const firstNumber = Number(firstNumberInput.value);
  const secondNumber = Number(secondNumberInput.value);
  const operator = operatorSelect.value;

  if (firstNumberInput.value === "" || secondNumberInput.value === "") {
    resultElement.textContent = "두 숫자를 모두 입력해 주세요.";
    return;
  }

  if (Number.isNaN(firstNumber) || Number.isNaN(secondNumber)) {
    resultElement.textContent = "유효한 숫자를 입력해 주세요.";
    return;
  }

  try {
    const result = calculate(firstNumber, secondNumber, operator);
    resultElement.textContent = formatResult(result);
  } catch (error) {
    resultElement.textContent = error.message;
  }
});
