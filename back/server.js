const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "segredo_super_secreto";

const produtosPath = path.join(__dirname, "produtos.json");
const pedidosPath = path.join(__dirname, "pedidos.json");

// ================= LOGIN ADMIN =================
app.post("/admin/login", (req, res) => {
  const { email, senha } = req.body;

  if (email === "admin@gmail.com" && senha === "123456") {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }

  res.status(401).json({ error: "Credenciais inválidas" });
});

// ================= MIDDLEWARE =================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err) => {
    if (err) return res.sendStatus(403);
    next();
  });
}

// ================= PRODUTOS =================
app.get("/produtos", (req, res) => {
  const produtos = JSON.parse(fs.readFileSync(produtosPath));
  res.json(produtos);
});

// ================= PEDIDOS =================

// 📦 CLIENTE ENVIA PEDIDO
app.post("/pedidos", (req, res) => {
  const {
    nome,
    telefone,
    endereco,
    pagamento,
    itens,
    total
  } = req.body;

  if (!nome || !telefone || !endereco || !pagamento || !itens?.length) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const pedidos = JSON.parse(fs.readFileSync(pedidosPath));

  const novoPedido = {
    id: Date.now(),
    nome,
    telefone,
    endereco,
    pagamento,
    itens,
    total,
    status: "novo",
    data: new Date().toLocaleString("pt-BR")
  };

  pedidos.push(novoPedido);
  fs.writeFileSync(pedidosPath, JSON.stringify(pedidos, null, 2));

  res.json({ message: "Pedido recebido com sucesso" });
});

// 🛡️ ADMIN VÊ PEDIDOS
app.get("/admin/pedidos", auth, (req, res) => {
  const pedidos = JSON.parse(fs.readFileSync(pedidosPath));
  res.json(pedidos);
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("🔥 Servidor rodando em http://localhost:3000");
});
