export default function handler(req, res) {
  try {
    const { code, shop_id } = req.query;

    if (!code || !shop_id) {
      return res.status(400).json({
        error: "invalid_callback",
        detail: "Missing code or shop_id"
      });
    }

    // redirecionar automaticamente para a rota de troca de token (opcional)
    const redirect = `/api/shopee/exchange-token?code=${code}&shop_id=${shop_id}`;

    return res.status(200).json({
      success: true,
      message: "Callback recebido com sucesso",
      code,
      shop_id,
      next_step: redirect
    });

  } catch (error) {
    return res.status(500).json({
      error: "internal_error",
      detail: error.message
    });
  }
}
