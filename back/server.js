const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");


const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "segredo_super_secreto";

// const produtosPath = path.join(__dirname, "produtos.json");
const pedidosPath = path.join(__dirname, "pedidos.json");

// ================= UPLOAD DE IMAGENS =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// Deixar a pasta uploads pública
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= LOGIN ADMIN =================

const usuariosPath = path.join(__dirname, "usuarios.json");

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const usuarios = JSON.parse(fs.readFileSync(usuariosPath));

  const user = usuarios.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, {
    expiresIn: "1d",
  });

  res.json({
    token,
    role: user.role,
    user: {
      nome: user.nome,
      telefone: user.telefone,
      email: user.email,
    },
  });
});

// ================= MIDDLEWARE =================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    if (decoded.role !== "admin") {
      return res.sendStatus(403);
    }

    req.user = decoded;
    next();
  });
}
/*
// ================= PRODUTOS =================
app.get("/produtos", (req, res) => {
  const produtos = JSON.parse(fs.readFileSync(produtosPath));
  res.json(produtos);
});
*/
// ================= PEDIDOS =================

// 📦 CLIENTE ENVIA PEDIDO
app.post("/pedidos", (req, res) => {
  const { nome, telefone, endereco, pagamento, itens, total } = req.body;

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
    data: new Date().toLocaleString("pt-BR"),
  };

  pedidos.push(novoPedido);
  fs.writeFileSync(pedidosPath, JSON.stringify(pedidos, null, 2));

  res.json({ message: "Pedido recebido com sucesso" });
});

// 🛡️ ADMIN VÊ PEDIDOS
app.get("/admin/pedidos", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const pedidos = JSON.parse(fs.readFileSync(pedidosPath));
  res.json(pedidos);
});
// ================= CADASTRO DE USUÁRIO =================
app.post("/cadastro", async (req, res) => {
  const { nome, telefone, email, senha } = req.body;

  const usuarios = JSON.parse(fs.readFileSync(usuariosPath));

  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({ error: "Email já cadastrado" });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const novoUsuario = {
    id: Date.now(),
    nome,
    telefone,
    email,
    senha: senhaHash,
    role: "cliente"
  };

  usuarios.push(novoUsuario);

  // 👉 É AQUI 👇
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

  res.json({ message: "Usuário cadastrado com sucesso" });
});



// ❌ EXCLUIR PEDIDO (ADMIN)
app.delete("/admin/pedidos/:id", auth, (req, res) => {
  const id = Number(req.params.id);

  const pedidos = JSON.parse(fs.readFileSync(pedidosPath));
  const novosPedidos = pedidos.filter(p => String(p.id) !== String(id));

  fs.writeFileSync(pedidosPath, JSON.stringify(novosPedidos, null, 2));

  res.json({ message: "Pedido excluído com sucesso" });
});


/*
// 🛡️ ADMIN — CADASTRAR PRODUTO
app.post("/admin/produtos", auth, upload.single("imagem"), (req, res) => {
  const { nome, descricao, preco, categoria } = req.body;

  if (!nome || !preco || !categoria || !req.file) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const produtos = JSON.parse(fs.readFileSync(produtosPath));

  const novoProduto = {
    id: Date.now(),
    nome,
    descricao,
    preco: Number(preco),
    categoria,
    imagem: "/uploads/" + req.file.filename
  };

  produtos.push(novoProduto);
  fs.writeFileSync(produtosPath, JSON.stringify(produtos, null, 2));

  res.json(novoProduto);
});


// 🛡️ ADMIN — EXCLUIR PRODUTO
app.delete("/admin/produtos/:id", auth, (req, res) => {
  let produtos = JSON.parse(fs.readFileSync(produtosPath));

  produtos = produtos.filter(p => p.id != req.params.id);

  fs.writeFileSync(produtosPath, JSON.stringify(produtos, null, 2));

  res.json({ message: "Produto excluído" });
});

*/

// ================= SERVER =================
app.listen(3000, () => {
  console.log("🔥 Servidor rodando em http://localhost:3000");
});
