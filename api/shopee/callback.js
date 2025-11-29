export default function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      error: "Código não recebido",
    });
  }

  return res.status(200).json({
    message: "Código recebido com sucesso",
    code,
  });
}
