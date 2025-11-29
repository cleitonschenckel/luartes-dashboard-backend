export default function handler(req, res) {
  const { code, shop_id } = req.query;

  return res.json({
    message: "Shopee redirect OK!",
    code,
    shop_id,
  });
}
