import crypto from "crypto";

/**
 * Middleware responsável por gerar automaticamente:
 *  - timestamp
 *  - sign
 *  - base URL da Shopee
 *  - path assinado para qualquer endpoint Shopee
 * 
 * Para usar:
 * const client = middlewareShopeeSign("/api/v2/order/get_order_list");
 * const response = await client.post({ shop_id, time_range_field: ... })
 */
export function middlewareShopeeSign(path) {
  const partnerId = process.env.PARTNER_ID;
  const partnerKey = process.env.PARTNER_KEY;

  if (!partnerId || !partnerKey) {
    throw new Error("PARTNER_ID ou PARTNER_KEY ausentes");
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // SIGNATURE
  const baseString = `${partnerId}${path}${timestamp}`;
  const sign = crypto
    .createHmac("sha256", partnerKey)
    .update(baseString)
    .digest("hex");

  const url =
    `https://partner.shopeemobile.com${path}` +
    `?partner_id=${partnerId}` +
    `&timestamp=${timestamp}` +
    `&sign=${sign}`;

  return {
    url,
    /**
     * Método POST já pronto
     */
    async post(body) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      return response.json();
    },

    /**
     * Método GET com query strings adicionais
     */
    async get(params = {}) {
      const qs = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&");

      const finalUrl = qs ? `${url}&${qs}` : url;

      const response = await fetch(finalUrl);
      return response.json();
    },
  };
}
