
const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsConteiner = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCount = document.getElementById("cart-count");
const addrressIpunt = document.getElementById("address");
const addrressWarn = document.getElementById("address-warn");

let cart = [];

// Abrir o Modal do carrinho
cartBtn.addEventListener("click", function () {
  updateCartModal();
  cartModal.style.display = "flex";
});

// Fechar o Modal quando clicar fora
cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

closeModalBtn.addEventListener("click", function () {
  cartModal.style.display = "none";
});

menu.addEventListener("click", function (event) {
  // console.log(event.target)

  let parentButton = event.target.closest(".add-to-cart-btn");

  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    addToCart(name, price);
  }
});

// Função pra adicionar no carrinho
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    // Se o item já existe apenas aumenta a quantity +1
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal();
}

// Atualizar o carrinho
function updateCartModal() {
  cartItemsConteiner.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "mb-4",
      "flex-col"
    );

    cartItemElement.innerHTML = `
        <div class="flex justify-between items-center">
            <div class="">
                <p class="font-medium">${item.name}</p>
                <p>Quantidade (${item.quantity})</p>            
                <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>            
            </div>

            <button class="remove-from-cart-btn" data-name="${item.name}">
                Remover
            </button>
        </div>
        `;

    total += item.price * item.quantity;

    cartItemsConteiner.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCount.innerHTML = cart.length;
}

// Função para remover do carrinho

cartItemsConteiner.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");
    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);

  if (index != -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

addrressIpunt.addEventListener("input", function (event) {
  let inputValue = event.target.value;
  if (inputValue !== "") {
    addrressIpunt.classList.remove("border-red-500");
    addrressWarn.classList.add("hidden");
  }
});
//Finalizar pedido
checkoutBtn.addEventListener("click", function () {
  
    const isOpen = checkoutRestaurantOpen();
    if(!isOpen){
        Toastify({
            text: "Ops o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();
    return;
    }

  if (cart.length === 0) return;
  if (addrressIpunt.value === "") {
    addrressWarn.classList.remove("hidden");
    addrressIpunt.classList.add("border-red-500");
    return;
  }
  //Enviar pedido para api do whats
  const cartItems = cart.map((item) => {
      return (
        `${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price} |`
      );
    }).join("")
  
  const message = encodeURIComponent(cartItems);
  const phone = "85992871308";
  
  window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addrressIpunt.value}`,"_blank");
  
  cart = [];
  updateCartModal();
});



//Varificar a hora e manipular o card do horario

function checkoutRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 22;
  // true = restaurante aberto
}

const spanItem = document.getElementById("date-span");
const isOpen = checkoutRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500");
}
