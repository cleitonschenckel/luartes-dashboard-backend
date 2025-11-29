import axios from "axios";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const { refresh_token } = req.query;

    if (!refresh_token) {
      return res.status(400).json({ error: "refresh_token não informado" });
    }

    const PARTNER_ID = process.env.PARTNER_ID;
    const PARTNER_KEY = process.env.PARTNER_KEY;
    const SHOP_ID = process.env.SHOP_ID;

    const timestamp = Math.floor(Date.now() / 1000);

    const baseString = `${PARTNER_ID}${refresh_token}${timestamp}`;
    const sign = crypto
      .createHmac("sha256", PARTNER_KEY)
      .update(baseString)
      .digest("hex");

    const response = await axios.post(
      "https://partner.shopeemobile.com/api/v2/auth/access_token/get",
      {
        partner_id: Number(PARTNER_ID),
        refresh_token,
        shop_id: Number(SHOP_ID),
        sign,
        timestamp
      }
    );

    res.status(200).json({
      message: "Token renovado",
      data: response.data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
