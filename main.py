"""Simple arithmetic calculator CLI."""


def calculate(first_number: float, second_number: float, operator: str) -> float:
    if operator == "+":
        return first_number + second_number
    if operator == "-":
        return first_number - second_number
    if operator == "*":
        return first_number * second_number
    if operator == "/":
        if second_number == 0:
            raise ValueError("0으로 나눌 수 없습니다.")
        return first_number / second_number
    raise ValueError("지원하지 않는 연산자입니다.")


def parse_number(prompt: str) -> float:
    raw_value = input(prompt).strip()
    try:
        return float(raw_value)
    except ValueError as exc:
        raise ValueError("유효한 숫자를 입력해 주세요.") from exc


def format_result(value: float) -> str:
    if value.is_integer():
        return str(int(value))
    return f"{value:.10f}".rstrip("0").rstrip(".")


def main() -> None:
    print("사칙연산 계산기")

    first_number = parse_number("첫 번째 숫자: ")
    operator = input("연산자 (+, -, *, /): ").strip()
    second_number = parse_number("두 번째 숫자: ")

    result = calculate(first_number, second_number, operator)
    print(f"결과: {format_result(result)}")


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print(f"오류: {error}")
