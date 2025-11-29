export default function handler(req, res) {
  return res.status(200).json({
    message: "Callback recebido com sucesso!",
    query: req.query
  });
}
