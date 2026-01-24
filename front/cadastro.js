// Base da URL: pega localhost no dev ou o domínio no servidor
const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://pizzariapointdapraca.com.br";

function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  if (!nome || !telefone || !email || !senha || !confirmarSenha) {
    alert("Preencha todos os campos");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter no mínimo 6 caracteres");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem");
    return;
  }

  fetch(`${BASE_URL}/cadastro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome,
      telefone,
      email,
      senha,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.error);
        });
      }
      return res.json();
    })
    .then(() => {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "login.html";
    })
    .catch((err) => {
      alert(err.message || "Erro ao cadastrar");
    });
}
