export function saveTokens(tokens) {
  const json = JSON.stringify(tokens);

  // isso salva na variável de ambiente em tempo de build
  process.env.TOKENS_JSON = json;

  return tokens;
}

export function loadTokens() {
  if (!process.env.TOKENS_JSON) return null;

  try {
    return JSON.parse(process.env.TOKENS_JSON);
  } catch {
    return null;
  }
}

export function isTokenExpired(tokenData) {
  if (!tokenData) return true;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = tokenData.created_at + tokenData.expire_in - 60;

  return now >= expiresAt;
}
