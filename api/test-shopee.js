export default async function handler(req, res) {
  try {
    const test = await fetch("https://partner.shopeemobile.com/api/v2/shop/get_shop_info");
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
