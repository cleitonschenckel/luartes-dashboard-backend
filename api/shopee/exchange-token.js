import crypto from 'crypto';
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';
    const payload = method === 'GET' ? req.query : req.body;

    const { code, shop_id } = payload || {};

    if (!code || !shop_id) {
      return res.status(400).json({
        error: 'missing_params',
        message: 'Parâmetros "code" e "shop_id" são obrigatórios.',
        received: { code, shop_id },
      });
    }

    const partnerId = process.env.PARTNER_ID;
    const partnerKey = process.env.PARTNER_KEY;

    if (!partnerId || !partnerKey) {
      return res.status(500).json({
        error: 'missing_env',
        message: 'PARTNER_ID ou PARTNER_KEY não configurados nas variáveis de ambiente.',
      });
    }

    const baseUrl = 'https://partner.shopeemobile.com';
    const path = '/api/v2/auth/token/get';
    const timestamp = Math.floor(Date.now() / 1000);

    const signBase = `${partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', partnerKey)
      .update(signBase)
      .digest('hex');

    // ATENÇÃO: partner_id na query
    const url = `${baseUrl}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;

    const body = {
      code,
      shop_id: Number(shop_id),
      partner_id: Number(partnerId),
    };

    const { data } = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    return res.status(200).json({
      message: 'Resposta da Shopee ao trocar code por tokens',
      shopee: data,
    });
  } catch (err) {
    console.error('Erro em /api/shopee/exchange-token:', err.response?.data || err.message);

    return res.status(500).json({
      error: 'internal_error',
      detail: err.response?.data || err.message,
    });
  }
}
