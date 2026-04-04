// ---------- STATE ----------
let cart = [];
const mainProduct = { id: "main", name: "Glacé Signature", price: 69 };

// DOM Elements
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawerBtn = document.getElementById('cartDrawerBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalSpan = document.getElementById('cartTotalPrice');
const cartCountSpan = document.getElementById('cartCount');
const toastEl = document.getElementById('toast');
const toastMsgSpan = document.getElementById('toastMsg');

// ---------- HELPER FUNCTIONS ----------
function showToast(msg) {
  toastMsgSpan.innerText = msg;
  toastEl.classList.add('show');
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

function saveCartToLocalStorage() {
  localStorage.setItem('glaceCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const saved = localStorage.getItem('glaceCart');
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch(e) { cart = []; }
  } else {
    cart = [];
  }
  updateCartUI();
}

// ---------- CART UI RENDER (deep & beautiful) ----------
function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartCountSpan.innerText = totalItems;
  cartCountSpan.classList.add('pop');
  setTimeout(() => cartCountSpan.classList.remove('pop'), 300);
  
  if (!cartItemsContainer) return;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-msg">🍃 Votre panier est vide</div>';
    cartTotalSpan.innerText = `0 د.م.`;
    saveCartToLocalStorage();
    return;
  }
  
  let html = '';
  let total = 0;
  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `
      <div class="cart-item" data-index="${idx}">
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <div class="cart-item-price">${item.price} د.م.</div>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-idx="${idx}" data-delta="-1">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="cart-qty-btn" data-idx="${idx}" data-delta="1">+</button>
          <button class="remove-item" data-idx="${idx}">🗑️</button>
        </div>
      </div>
    `;
  });
  cartItemsContainer.innerHTML = html;
  cartTotalSpan.innerText = `${total} د.م.`;
  saveCartToLocalStorage();
  
  // Attach events to new buttons
  document.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.idx);
      const delta = parseInt(btn.dataset.delta);
      if (cart[idx]) {
        let newQty = cart[idx].quantity + delta;
        if (newQty <= 0) {
          cart.splice(idx, 1);
        } else {
          cart[idx].quantity = newQty;
        }
        updateCartUI();
        showToast(`🛒 Panier mis à jour`);
      }
    });
  });
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.idx);
      cart.splice(idx, 1);
      updateCartUI();
      showToast(`🗑️ Article retiré`);
    });
  });
}

function addToCart(product, quantity = 1) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity: quantity });
  }
  updateCartUI();
  showToast(`✨ ${product.name} ajouté (x${quantity})`);
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ---------- CART DRAWER ----------
cartDrawerBtn.addEventListener('click', () => cartOverlay.classList.add('open'));
closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('open'));
cartOverlay.addEventListener('click', (e) => { if(e.target === cartOverlay) cartOverlay.classList.remove('open'); });

// ---------- MAIN PRODUCT QUANTITY ----------
let mainQty = 1;
const qtySpan = document.getElementById('qtyValue');
document.getElementById('decrQty')?.addEventListener('click', () => {
  if(mainQty > 1) { mainQty--; qtySpan.innerText = mainQty; animateQty(); }
});
document.getElementById('incrQty')?.addEventListener('click', () => {
  if(mainQty < 20) { mainQty++; qtySpan.innerText = mainQty; animateQty(); }
});
function animateQty() { qtySpan.style.transform = 'scale(1.2)'; setTimeout(() => qtySpan.style.transform = '', 200); }

document.getElementById('addMainToCart')?.addEventListener('click', () => {
  addToCart(mainProduct, mainQty);
});

// ---------- PRODUCT CARDS ----------
document.querySelectorAll('.product-card').forEach(card => {
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const id = card.dataset.id || name.replace(/\s/g, '_');
  const btn = card.querySelector('.add-to-cart-card');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart({ id, name, price }, 1);
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => btn.style.transform = '', 200);
  });
});

document.getElementById('scrollToProducts')?.addEventListener('click', () => {
  document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if(cart.length === 0) showToast("🍃 Votre panier est vide");
  else showToast("🎉 Merci ! Simulation de commande effectuée");
});

// ---------- LOADER & SCROLL REVEAL ----------
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader')?.classList.add('gone'), 1000);
  const reveals = document.querySelectorAll('.sr');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.2 });
  reveals.forEach(el => observer.observe(el));
  loadCartFromLocalStorage();
});

// Navbar solid on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if(window.scrollY > 40) nav.classList.add('solid');
  else nav.classList.remove('solid');
});

// Custom cursor (only for desktop)
if(window.innerWidth > 860) {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  function animateCursor() {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}