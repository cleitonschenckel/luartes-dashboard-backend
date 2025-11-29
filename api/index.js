const axios = require("axios");
const CryptoJS = require("crypto-js");

module.exports = async (req, res) => {
  try {
    const { code, shop_id } = req.query;

    if (!code || !shop_id) {
      return res.status(400).json({ error: "Missing code or shop_id" });
    }

    const partner_id = Number(process.env.PARTNER_ID);
    const partner_key = process.env.PARTNER_KEY;
    const redirect = process.env.REDIRECT_URL;

    const timestamp = Math.floor(Date.now() / 1000);

    const baseString = `${partner_id}${apiPath}${timestamp}`;
    const sign = CryptoJS.HmacSHA256(baseString, partner_key).toString();

    const tokenResponse = await axios.post(
      "https://partner.test-stable.shopeemobile.com/api/v2/auth/token/get",
      {
        code,
        shop_id,
        partner_id,
      },
      {
        headers: {
          Authorization: sign,
          "Content-Type": "application/json",
          "X-Timestamp": timestamp,
        },
      }
    );

    const data = tokenResponse.data;

    return res.status(200).json({
      status: "success",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
      shop_id,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error", details: err.message });
  }
};
