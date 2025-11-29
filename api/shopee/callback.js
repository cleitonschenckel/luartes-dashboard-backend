// api/shopee/callback.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, shop_id } = req.query;
  const partnerId = process.env.PARTNER_ID;

  if (!code || !shop_id) {
    return res.status(400).json({
      error: 'MISSING_PARAMS',
      message: 'Parâmetros "code" e "shop_id" são obrigatórios.',
      received: { code, shop_id },
    });
  }

  if (!partnerId) {
    return res.status(500).json({
      error: 'MISSING_ENV',
      message: 'Variável PARTNER_ID não configurada na Vercel.',
    });
  }

  try {
    const tokenResponse = await axios.post(
      'https://partner.shopeemobile.com/api/v2/auth/token/get',
      {
        code,
        partner_id: Number(partnerId),
        shop_id: Number(shop_id),
      }
    );

    // Eu não assumo o formato exato, só devolvo tudo que a Shopee mandar
    return res.status(200).json({
      message: 'Tokens obtidos com sucesso ✅',
      received: { code, shop_id },
      shopee: tokenResponse.data,
    });
  } catch (err) {
    console.error('Erro ao trocar code por token na Shopee:', err.response?.data || err.message);

    return res.status(500).json({
      error: 'TOKEN_EXCHANGE_FAILED',
      details: err.response?.data || err.message,
    });
  }
}
