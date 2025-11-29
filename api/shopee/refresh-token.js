import crypto from 'crypto';
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';
    const payload = method === 'GET' ? req.query : req.body;

    const { refresh_token, shop_id } = payload || {};

    if (!refresh_token || !shop_id) {
      return res.status(400).json({
        error: 'missing_params',
        message: 'Parâmetros "refresh_token" e "shop_id" são obrigatórios.',
        received: { refresh_token, shop_id },
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
    const path = '/api/v2/auth/access_token/get';
    const timestamp = Math.floor(Date.now() / 1000);

    const signBase = `${partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', partnerKey)
      .update(signBase)
      .digest('hex');

    // partner_id também na query
    const url = `${baseUrl}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`;

    const body = {
      refresh_token,
      shop_id: Number(shop_id),
      partner_id: Number(partnerId),
    };

    const { data } = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    return res.status(200).json({
      message: 'Resposta da Shopee ao atualizar access_token',
      shopee: data,
    });
  } catch (err) {
    console.error('Erro em /api/shopee/refresh-token:', err.response?.data || err.message);

    return res.status(500).json({
      error: 'internal_error',
      detail: err.response?.data || err.message,
    });
  }
}
