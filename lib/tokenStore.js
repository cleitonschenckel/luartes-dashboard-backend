import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tokens.json");

export function saveTokens(tokens) {
  const data = {
    ...tokens,
    created_at: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
}

export function loadTokens() {
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath);
  try {
    return JSON.parse(raw);
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
