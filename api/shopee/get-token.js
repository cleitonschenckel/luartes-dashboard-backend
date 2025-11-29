// api/shopee/get-token.js
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const partnerId = process.env.PARTNER_ID;
  const redirectUrl = process.env.REDIRECT_URL;

  if (!partnerId || !redirectUrl) {
    return res.status(500).json({
      error: 'MISSING_ENV',
      message: 'Configure PARTNER_ID e REDIRECT_URL nas variáveis de ambiente da Vercel.',
    });
  }

  const authURL = `https://partner.shopeemobile.com/api/v2/shop/auth_partner` +
    `?partner_id=${encodeURIComponent(partnerId)}` +
    `&redirect=${encodeURIComponent(redirectUrl)}`;

  return res.status(200).json({ url: authURL });
}
