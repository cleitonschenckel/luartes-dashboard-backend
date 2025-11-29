import axios from "axios";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Código não informado" });
    }

    const PARTNER_ID = process.env.PARTNER_ID;
    const PARTNER_KEY = process.env.PARTNER_KEY;
    const SHOP_ID = process.env.SHOP_ID; // futuro para multiloja
    const REDIRECT_URL = process.env.REDIRECT_URL;

    const timestamp = Math.floor(Date.now() / 1000);

    // Geração do HMAC para autenticação
    const baseString = `${PARTNER_ID}${code}${timestamp}`;
    const sign = crypto
      .createHmac("sha256", PARTNER_KEY)
      .update(baseString)
      .digest("hex");

    const response = await axios.post(
      "https://partner.shopeemobile.com/api/v2/auth/token/get",
      {
        code,
        partner_id: Number(PARTNER_ID),
        shop_id: Number(SHOP_ID),
        sign,
        timestamp
      }
    );

    res.status(200).json({
      message: "Token obtido com sucesso",
      data: response.data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
