// Base da URL: pega localhost no dev ou o domínio no servidor
const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://pizzariapointdapraca.com.br";

function login() {
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");

  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: emailInput.value,
      senha: senhaInput.value,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro de login");
      return res.json();
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user)); // 🔥 FALTAVA ISSO

      if (data.role === "admin") {
        window.location.href = "../admin.html";
      } else {
        window.location.href = "../index.html";
      }
    })

    .catch(() => {
      alert("Email ou senha incorretos");
    });
}
