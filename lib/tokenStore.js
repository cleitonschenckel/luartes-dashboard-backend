import { saveTokens, loadTokens, isTokenExpired } from '../../lib/tokenStore.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Nome fixo da tabela
const TABLE = "tokens";

export async function saveTokens(tokens) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expire_in: tokens.expire_in,
    shop_id: tokens.shop_id,
    created_at: now,
    updated_at: now,
  };

  // Sempre mantém só 1 linha — então você faz UPSERT
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: 1, ...payload }, { onConflict: 'id' });

  if (error) {
    console.error("Erro ao salvar tokens no Supabase:", error);
    throw error;
  }

  return tokens;
}

export async function loadTokens() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error("Erro ao carregar tokens do Supabase:", error);
    return null;
  }

  return data;
}

export function isTokenExpired(tokenData) {
  if (!tokenData) return true;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = tokenData.created_at + tokenData.expire_in - 60; // margem de 60s

  return now >= expiresAt;
}
