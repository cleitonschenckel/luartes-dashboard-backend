export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        error: 'method_not_allowed',
        message: 'Use apenas requisições GET neste endpoint.',
      });
    }

    const { code, shop_id, main_account_id } = req.query || {};

    if (!code || !shop_id) {
      return res.status(400).json({
        error: 'missing_params',
        message: 'Parâmetros "code" e "shop_id" são obrigatórios no callback.',
        received: { code, shop_id, main_account_id },
      });
    }

    // Monta a URL base da própria aplicação (Vercel ou local)
    const host =
      process.env.VERCEL_URL ||
      req.headers.host ||
      'localhost:3000';

    const baseUrl = host.startsWith('http')
      ? host
      : `https://${host}`;

    // Chama nossa rota interna /api/shopee/exchange-token
    const exchangeResponse = await fetch(`${baseUrl}/api/shopee/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, shop_id }),
    });

    const exchangeData = await exchangeResponse.json();

    // Se a Shopee retornou erro, a própria exchange-token já traz isso
    const shopee = exchangeData.shopee || exchangeData;

    const hasError = shopee?.error && shopee.error !== 0;

    if (hasError) {
      return res.status(400).json({
        message: 'Falha ao obter tokens da Shopee ❌',
        received: { code, shop_id, main_account_id },
        shopee,
      });
    }

    return res.status(200).json({
      message: 'Tokens obtidos com sucesso ✅',
      received: { code, shop_id, main_account_id },
      shopee,
    });
  } catch (err) {
    console.error('Erro em /api/shopee/callback:', err.message);

    return res.status(500).json({
      error: 'internal_error',
      detail: err.message,
    });
  }
}
