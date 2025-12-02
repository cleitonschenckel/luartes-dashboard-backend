export default function handler(req, res) {
  try {
    const { code, shop_id } = req.query;

    if (!code || !shop_id) {
      return res.status(400).json({
        error: "invalid_callback",
        detail: "Missing code or shop_id"
      });
    }

    const redirectUrl =
      `/api/shopee/exchange-token?code=${code}&shop_id=${shop_id}`;

    return res.redirect(302, redirectUrl);
  } catch (err) {
    return res.status(500).json({
      error: "internal_error",
      detail: err.message
    });
  }
}
