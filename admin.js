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
  fetch("/admin/pedidos", {
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
        div.setAttribute("data-numero", pedido.numero);
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
    <span>🍕 Pedido #${pedido.numero} — ${pedido.nome}</span>
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
        ${
          pedido.observacoes && pedido.observacoes.trim() !== ""
            ? `
  <p class="pedido-obs"><strong>📝 Observações:</strong><br>${pedido.observacoes}</p>
`
            : ""
        }
  <strong>Total:</strong> R$ ${pedido.total.toFixed(2)}

  <div class="pedido-actions">
    <button class="btn-print" onclick="imprimirPedido('${pedido.numero}')">
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

  fetch(`/admin/pedidos/${id}`, {
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
  const pedidoDiv = document.querySelector(`[data-numero="${id}"]`);
  if (!pedidoDiv) return alert("Pedido não encontrado");

  const numero = id;

  const nome =
    pedidoDiv
      .querySelector(".pedido-header span")
      ?.innerText.split("—")[1]
      ?.trim() || "";

  const telefone =
    pedidoDiv.innerHTML.match(/Telefone:<\/strong>(.*?)<\/p>/)?.[1] || "";
  const endereco =
    pedidoDiv.innerHTML.match(/Endereço:<\/strong>(.*?)<\/p>/)?.[1] || "";
  const pagamento =
    pedidoDiv.innerHTML.match(/Pagamento:<\/strong>(.*?)<\/p>/)?.[1] || "";

  const obsEl = pedidoDiv.querySelector(".pedido-obs");
  const observacoes = obsEl
    ? obsEl.innerText.replace("📝 Observações:", "").trim()
    : "";
  const total = pedidoDiv.innerHTML.match(/Total:<\/strong>(.*?)$/)?.[1] || "";

  const itens = [...pedidoDiv.querySelectorAll(".pedido-itens li")]
    .map((li) => `<p>${li.innerText}</p>`)
    .join("");

  const agora = new Date();
  const dataHora =
    agora.toLocaleDateString("pt-BR") +
    " - " +
    agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const janela = window.open("", "_blank", "width=300,height=600");

  janela.document.write(`
    <html>
      <head>
        <title>Pedido ${numero}</title>
        <style>
          * {
            font-family: monospace;
          }

          body {
            width: 80mm;
            padding: 8px;
            font-size: 12px;
          }

          h1 {
            text-align: center;
            font-size: 16px;
            margin-bottom: 6px;
          }

          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }

          .linha {
            margin: 4px 0;
          }

          .itens p {
            margin-left: 6px;
          }

          .obs {
            margin-top: 6px;
            font-style: italic;
          }

          .total {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-top: 6px;
          }

          .center {
            text-align: center;
            margin-top: 6px;
          }
        </style>
      </head>

      <body onload="window.print(); window.close();">
        <h1>PIZZARIA POINT DA PRAÇA</h1>

        <hr>

        <div class="linha"><strong>PEDIDO Nº:</strong> ${numero}</div>
        <div class="linha">${dataHora}</div>

        <hr>

        <div class="linha"><strong>Cliente:</strong> ${nome}</div>
        <div class="linha"><strong>Tel:</strong> ${telefone}</div>
        <div class="linha"><strong>End:</strong> ${endereco}</div>

        <hr>

        <div class="itens">
          ${itens}
        </div>

        <hr>

        <div class="linha"><strong>Pagamento:</strong> ${pagamento}</div>
        <div class="total">TOTAL: ${total}</div>

        ${
          observacoes
            ? `
          <hr>
          <div class="obs">
            <strong>Obs do cliente:</strong><br>
            ${observacoes}
          </div>
        `
            : ""
        }

        <hr>

        <div class="center">Obrigado pela preferência 🍕</div>
      </body>
    </html>
  `);

  janela.document.close();
}

/*
function cadastrarProduto() {
  fetch("/admin/produtos", {
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
  fetch("/produtos")
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

  fetch(`/admin/produtos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  }).then(() => carregarProdutos());
}
*/

carregarPedidos();
carregarProdutos();
