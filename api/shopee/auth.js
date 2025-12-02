import crypto from "crypto";

export default function handler(req, res) {
  try {
    const partnerId = process.env.PARTNER_ID;
    const partnerKey = process.env.PARTNER_KEY;
    const redirectUrl = process.env.REDIRECT_URL;

    // 🔍 validação das variáveis de ambiente
    if (!partnerId || !partnerKey || !redirectUrl) {
      return res.status(500).json({
        error: "missing_env",
        detail: "Verifique PARTNER_ID, PARTNER_KEY e REDIRECT_URL nas variáveis de ambiente."
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const path = "/api/v2/shop/auth_partner";

    // assinatura obrigatória: partner_id + path + timestamp
    const baseString = `${partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac("sha256", partnerKey)
      .update(baseString)
      .digest("hex");

    // monta a URL final de login
    const loginUrl =
      `https://partner.shopeemobile.com${path}` +
      `?partner_id=${partnerId}` +
      `&timestamp=${timestamp}` +
      `&sign=${sign}` +
      `&redirect=${encodeURIComponent(redirectUrl)}`;

    return res.status(200).json({ login_url: loginUrl });

  } catch (error) {
    console.error("Erro no auth:", error);
    return res.status(500).json({
      error: "internal_error",
      detail: error.message
    });
  }
}
