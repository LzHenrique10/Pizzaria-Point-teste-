const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  alert("Acesso negado");
  window.location.href = "login.html";
}


const pedidosDiv = document.getElementById("pedidos");

function carregarPedidos() {
  fetch("http://localhost:3000/admin/pedidos", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Não autorizado");   
      return res.json();
    })
    .then((pedidos) => {
      pedidosDiv.innerHTML = "";

      pedidos.forEach((pedido) => {
        const div = document.createElement("div");
        div.setAttribute("data-id", pedido.id); // ✅ ESSENCIAL
        div.style.border = "1px solid #ccc";
        div.style.padding = "12px";
        div.style.marginBottom = "16px";

        div.innerHTML = `
          <strong>Cliente:</strong> ${pedido.nome}<br>
          <strong>Telefone:</strong> ${pedido.telefone}<br>
          <strong>Endereço:</strong> ${pedido.endereco}<br>
          <strong>Pagamento:</strong> ${pedido.pagamento}<br>
          <hr>
          <strong>Pedido:</strong>
          <ul>
            ${pedido.itens
              .map((i) => `<li>${i.nome} - ${i.quantidade}x</li>`)
              .join("")}
          </ul>

          <button onclick="imprimirPedido('${pedido.id}')">🖨️ Imprimir</button>
          <button onclick="excluirPedido('${pedido.id}')">❌ Excluir</button>
        `;

        pedidosDiv.appendChild(div);
      });
    })
    .catch(() => {
      localStorage.clear();
      alert("Sua sessão expirou ou você não tem permissão");
      window.location.href = "./front/login.html";
    });
}

function excluirPedido(id) {
  if (!confirm("Excluir pedido?")) return;

  fetch(`http://localhost:3000/admin/pedidos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao excluir");
      carregarPedidos();
    })
    .catch(() => alert("Erro ao excluir pedido"));
}

function imprimirPedido(id) {
  const pedidoDiv = document.querySelector(`[data-id="${id}"]`);
  if (!pedidoDiv) return alert("Pedido não encontrado");

  const janela = window.open("", "_blank", "width=300");

  janela.document.write(`
    <html>
      <head>
        <title>Pedido</title>
        <style>
          body { font-family: monospace; font-size: 12px; }
          h2 { text-align: center; }
          hr { border: 1px dashed #000; }
        </style>
      </head>
      <body>
        <h2>Pizzaria Point da Praça</h2>
        ${pedidoDiv.innerHTML}
        <hr>
        <p>Obrigado pela preferência 🍕</p>
      </body>
    </html>
  `);

  janela.document.close();
  janela.print();
}

function cadastrarProduto() {
  fetch("http://localhost:3000/admin/produtos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nome: document.getElementById("nome").value,
      descricao: document.getElementById("descricao").value,
      preco: Number(document.getElementById("preco").value),
      imagem: document.getElementById("imagem").value,
      categoria: document.getElementById("categoria").value,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Produto cadastrado!");
    });
}

const listaProdutos = document.getElementById("lista-produtos");

function carregarProdutos() {
  fetch("http://localhost:3000/produtos")
    .then(res => res.json())
    .then(produtos => {
      listaProdutos.innerHTML = "";

      produtos.forEach(produto => {
        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${produto.nome}</strong> - R$ ${produto.preco.toFixed(2)}
          <button onclick="excluirProduto(${produto.id})">❌</button>
        `;
        listaProdutos.appendChild(div);
      });
    });
}

function excluirProduto(id) {
  if (!confirm("Excluir produto?")) return;

  fetch(`http://localhost:3000/admin/produtos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  }).then(() => carregarProdutos());
}


carregarPedidos();
carregarProdutos();
