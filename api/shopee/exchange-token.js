// api/shopee/exchange-token.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, shop_id } = req.body;
  const partnerId = process.env.PARTNER_ID;

  if (!code || !shop_id) {
    return res.status(400).json({
      error: 'MISSING_PARAMS',
      message: 'Envie "code" e "shop_id" no body (JSON).',
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

    return res.status(200).json({
      message: 'Tokens obtidos com sucesso ✅',
      shopee: tokenResponse.data,
    });
  } catch (err) {
    console.error('Erro ao trocar code por token (endpoint manual):', err.response?.data || err.message);

    return res.status(500).json({
      error: 'TOKEN_EXCHANGE_FAILED',
      details: err.response?.data || err.message,
    });
  }
}
