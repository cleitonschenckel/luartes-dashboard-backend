// api/shopee/get-token.js

export default function handler(req, res) {
  const partnerId = process.env.PARTNER_ID;
  const redirectUrl = process.env.REDIRECT_URL;

  if (!partnerId || !redirectUrl) {
    return res.status(500).json({
      error: 'Configuração inválida',
      message: 'PARTNER_ID ou REDIRECT_URL não foram definidos nas variáveis de ambiente',
    });
  }

  // URL correta de produção da Shopee (sem sandbox)
  const authURL =
    `https://partner.shopeemobile.com/api/v2/authenticate?` +
    `partner_id=${partnerId}` +
    `&redirect=${encodeURIComponent(redirectUrl)}`;

  return res.status(200).json({ url: authURL });
}
