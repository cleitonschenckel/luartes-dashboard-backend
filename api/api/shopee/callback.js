export default function handler(req, res) {
  return res.status(200).json({
    message: "Callback Shopee recebido!",
    query: req.query
  });
}
