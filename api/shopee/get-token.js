// api/shopee/get-token.js

import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const partnerId = process.env.PARTNER_ID;
  const partnerKey = process.env.PARTNER_KEY;
  const redirectUrl = process.env.REDIRECT_URL;

  if (!partnerId || !partnerKey || !redirectUrl) {
    return res.status(500).json({
      error: 'MISSING_ENV',
      message:
        'Configure PARTNER_ID, PARTNER_KEY e REDIRECT_URL nas variáveis de ambiente da Vercel.',
      received: { partnerId, hasPartnerKey: !!partnerKey, redirectUrl },
    });
  }

  // Endpoint oficial de auth da Shopee
  const baseUrl = 'https://partner.shopeemobile.com';
  const path = '/api/v2/shop/auth_partner';

  // Shopee pede timestamp + assinatura
  const timestamp = Math.floor(Date.now() / 1000);

  // String base para o HMAC (documentação Shopee v2)
  const signBase = `${partnerId}${path}${timestamp}`;

  const sign = crypto
    .createHmac('sha256', partnerKey)
    .update(signBase)
    .digest('hex');

  const authURL =
    `${baseUrl}${path}` +
    `?partner_id=${encodeURIComponent(partnerId)}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}` +
    `&redirect=${encodeURIComponent(redirectUrl)}`;

  return res.status(200).json({ url: authURL });
}
