// api/shopee/refresh-token.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token, shop_id } = req.body;
  const partnerId = process.env.PARTNER_ID;

  if (!refresh_token || !shop_id) {
    return res.status(400).json({
      error: 'MISSING_PARAMS',
      message: 'Envie "refresh_token" e "shop_id" no body (JSON).',
    });
  }

  if (!partnerId) {
    return res.status(500).json({
      error: 'MISSING_ENV',
      message: 'Variável PARTNER_ID não configurada na Vercel.',
    });
  }

  try {
    const refreshResponse = await axios.post(
      'https://partner.shopeemobile.com/api/v2/auth/access_token/get',
      {
        refresh_token,
        partner_id: Number(partnerId),
        shop_id: Number(shop_id),
      }
    );

    return res.status(200).json({
      message: 'Token renovado com sucesso ✅',
      shopee: refreshResponse.data,
    });
  } catch (err) {
    console.error('Erro ao renovar token na Shopee:', err.response?.data || err.message);

    return res.status(500).json({
      error: 'REFRESH_FAILED',
      details: err.response?.data || err.message,
    });
  }
}
