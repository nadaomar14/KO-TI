// Header Scroll
let header = document.querySelector("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("shadow", window.scrollY > 0);
});

// Products Array
const products = [
  { id: 1, title: "Premium Cat Food", image: "images/OIP.jpeg", price: 12.99 },
  { id: 2, title: "Interactive Toy Mouse", image: "images/4-Colors-Wireless-Remote-Control-Mouse-Toy-Interactive-Plush-Electronic-RC-Rat-Mice-Funny-Pet-Dog.avif", price: 4.99 },
  { id: 3, title: "Comfy Cat Bed", image: "images/soft-plush-cat-bed-blue-1000x1000.jpg", price: 25.00 },
  { id: 4, title: "Cat Climbing Tree", image: "images/71faR-S8i1S.jpg", price: 65.99 },
  { id: 5, title: "Natural Cat Litter", image: "images/71pFQYXRrAL.jpg", price: 10.50 },
  { id: 6, title: "Cat Scratching Post", image: "images/OIP (4).jpeg", price: 18.99 },
  { id: 7, title: "Cat Toy Ball", image: "images/OIP (5).jpeg", price: 3.50 },
  { id: 8, title: "Adjustable Cat Collar", image: "images/Personalized-Cat-Collar-Custom-Engraved-Cat-Collars-With-Bell-Adjustable-Silicone-Kitten-Name-ID-Collar-For.avif", price: 7.99 },
  { id: 9, title: "Elevated Cat Food Bowl", image: "images/743c0a32-9d5c-49e8-a01a-f025833815a9.dc8c98d0660840c191284ce295592428.webp", price: 15.00 },
  { id: 10, title: "Cat Water Fountain", image: "images/R.jpeg", price: 22.50 }
];

// Elements
const productList = document.getElementById("productList");
const cartItemsElement = document.getElementById("cartItems");
const cartTotalElement = document.getElementById("cartTotal");
const cartIcon = document.getElementById("cart-icon");

// Load or initialize cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Render Products
function renderProducts() {
  if (!productList) return;
  productList.innerHTML = products.map(product => `
    <div class="product">
      <img src="${product.image}" alt="${product.title}" class="product-img" />
      <div class="product-info">
        <h2 class="product-title">${product.title}</h2>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <a class="add-to-cart" data-id="${product.id}">Add to cart</a>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", addToCart);
  });
}

// Add to Cart
function addToCart(event) {
  const productID = parseInt(event.target.dataset.id);
  const product = products.find(p => p.id === productID);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productID);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 });
  }

  event.target.textContent = "Added";
  saveToLocalStorage();
  updateCartIcon();
  renderCartItems();
  calculateCartTotal();
}

// Remove from Cart
function removeFromCart(event) {
  const productID = parseInt(event.target.dataset.id);
  cart = cart.filter(item => item.id !== productID);
  saveToLocalStorage();
  renderCartItems();
  calculateCartTotal();
  updateCartIcon();
}

// Quantity Change
function changeQuantity(event) {
  const productID = parseInt(event.target.dataset.id);
  const quantity = parseInt(event.target.value);
  if (quantity > 0) {
    const item = cart.find(item => item.id === productID);
    if (item) {
      item.quantity = quantity;
      saveToLocalStorage();
      calculateCartTotal();
      updateCartIcon();
    }
  }
}

// Render Cart Items
function renderCartItems() {
  if (!cartItemsElement) return;
  cartItemsElement.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" />
      <div class="cart-item-info">
        <h2 class="cart-item-title">${item.title}</h2>
        <input class="cart-item-quantity" type="number" min="1" value="${item.quantity}" data-id="${item.id}" />
      </div>
      <h2 class="cart-item-price">$${item.price}</h2>
      <button class="remove-from-cart" data-id="${item.id}">Remove</button>
    </div>
  `).join("");

  document.querySelectorAll(".remove-from-cart").forEach(btn => {
    btn.addEventListener("click", removeFromCart);
  });

  document.querySelectorAll(".cart-item-quantity").forEach(input => {
    input.addEventListener("change", changeQuantity);
  });
}

// Calculate Total
function calculateCartTotal() {
  if (!cartTotalElement) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Save to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart icon quantity
function updateCartIcon() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartIcon) cartIcon.setAttribute("data-quantity", totalQuantity);
}

// Clear cart (after success)
function clearCart() {
  cart = [];
  saveToLocalStorage();
  updateCartIcon();
}

// Detect page
if (window.location.pathname.includes("cart.html")) {
  renderCartItems();
  calculateCartTotal();
} else if (window.location.pathname.includes("success.html")) {
  clearCart();
} else {
  renderProducts();
}

// Sync with other tabs
window.addEventListener("storage", () => {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartIcon();
});

// Initial icon update
updateCartIcon();

// User Dashboard icon
document.getElementById('user-icon').addEventListener('click', () => {
  fetch('/api/user')
    .then(res => {
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
      }
    })
    .catch(() => {
      window.location.href = '/login';
    });
});
