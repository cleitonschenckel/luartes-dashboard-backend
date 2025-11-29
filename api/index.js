// api/index.js
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    message: 'Luartes Shopee Backend está rodando ✅',
  });
}
