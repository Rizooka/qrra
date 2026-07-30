/** User-facing auth errors — no vendor or infra names. */
export const SERVICE_UNAVAILABLE =
  "Сервис временно недоступен. Попробуй позже.";

export function mapLoginError(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  ) {
    return "Неверный email или пароль. Проверь данные или сбрось пароль.";
  }
  if (lower.includes("email not confirmed")) {
    return "Подтверди email — открой письмо со ссылкой или сбрось пароль.";
  }
  return "Не удалось войти. Проверь email и пароль.";
}

export function mapSignupError(message: string, code?: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("already registered") ||
    code === "user_already_exists"
  ) {
    return "Этот email уже зарегистрирован. Войди или сбрось пароль.";
  }
  if (
    message.includes("Invalid path") ||
    message.includes("PGRST125") ||
    message.includes("No host")
  ) {
    return SERVICE_UNAVAILABLE;
  }
  if (lower.includes("password")) {
    return "Пароль слишком короткий или не подходит. Минимум 6 символов.";
  }
  return "Не удалось создать аккаунт. Попробуй ещё раз или войди, если уже регистрировался.";
}
