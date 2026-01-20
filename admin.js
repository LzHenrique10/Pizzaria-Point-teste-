function toast(text, type = "success") {
  const colors = {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  Toastify({
    text,
    duration: 3000,
    gravity: "top",
    position: "right",
    close: true,
    style: {
      background: colors[type],
      borderRadius: "8px",
      fontWeight: "600",
    },
  }).showToast();
}

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  toast("Acesso negado", "error");

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
      if (!pedidos.length) {
        pedidosDiv.innerHTML = "<p>Nenhum pedido no momento 🍕</p>";
        return;
      }

      pedidos.forEach((pedido) => {
        const div = document.createElement("div");
        div.setAttribute("data-id", pedido.id); // ✅ ESSENCIAL
        div.style.border = "1px solid #e5e7eb";
        div.style.borderRadius = "10px";
        div.style.background = "#fff";
        div.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
        div.style.transition = "0.2s";

        div.style.padding = "12px";
        div.style.marginBottom = "16px";

        div.classList.add("pedido-card");

        div.innerHTML = `
  <div class="pedido-header">
    <span>🍕 ${pedido.nome}</span>
    <span>${pedido.data || ""}</span>
  </div>

  <p><strong>📞 Telefone:</strong> ${pedido.telefone}</p>
  <p><strong>📍 Endereço:</strong> ${pedido.endereco}</p>
  <p><strong>💳 Pagamento:</strong> ${pedido.pagamento}</p>

  <hr style="margin:10px 0">

  <strong>🧾 Itens:</strong>
  <ul class="pedido-itens">
    ${pedido.itens.map((i) => `<li>${i.quantidade}x ${i.nome}</li>`).join("")}
  </ul>

  <strong>Total:</strong> R$ ${pedido.total.toFixed(2)}

  <div class="pedido-actions">
    <button class="btn-print" onclick="imprimirPedido('${pedido.id}')">
      🖨️ Imprimir
    </button>
    <button class="btn-delete" onclick="excluirPedido(${pedido.id})">
      ❌ Excluir
    </button>
  </div>
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
  if (!confirm("Tem certeza que deseja excluir esse pedido?")) return;

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
    .catch(() => toast("Erro ao excluir pedido", "error"))

    .then(() => {
      toast("Pedido excluído com sucesso 🍕", "success");
      carregarPedidos();
    });
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
/*
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
*/
const listaProdutos = document.getElementById("lista-produtos");

function carregarProdutos() {
  fetch("http://localhost:3000/produtos")
    .then((res) => res.json())
    .then((produtos) => {
      listaProdutos.innerHTML = "";

      produtos.forEach((produto) => {
        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${produto.nome}</strong> - R$ ${produto.preco.toFixed(2)}
          <button onclick="excluirProduto(${produto.id})">❌</button>
        `;
        listaProdutos.appendChild(div);
      });
    });
}

/*
function excluirProduto(id) {
  if (!confirm("Excluir produto?")) return;

  fetch(`http://localhost:3000/admin/produtos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  }).then(() => carregarProdutos());
}
*/

carregarPedidos();
carregarProdutos();
