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
  if (!toastEl) return;
  toastMsgSpan.innerText = msg;
  toastEl.classList.add('show');
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
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
    } catch(e) {
      cart = [];
    }
  } else {
    cart = [];
  }
  updateCartUI();
}

// ---------- CART UI RENDER ----------
function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (cartCountSpan) {
    cartCountSpan.innerText = totalItems;
    cartCountSpan.classList.add('pop');
    setTimeout(() => cartCountSpan.classList.remove('pop'), 300);
  }
  
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-msg">🍃 Votre panier est vide</div>';
    if (cartTotalSpan) cartTotalSpan.innerText = `0 د.م.`;
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
  if (cartTotalSpan) cartTotalSpan.innerText = `${total} د.م.`;
  saveCartToLocalStorage();
  
  // Attach events dynamically
  document.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.removeEventListener('click', handleQtyChange);
    btn.addEventListener('click', handleQtyChange);
  });
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.removeEventListener('click', handleRemoveItem);
    btn.addEventListener('click', handleRemoveItem);
  });
}

function handleQtyChange(e) {
  const btn = e.currentTarget;
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
}

function handleRemoveItem(e) {
  const btn = e.currentTarget;
  const idx = parseInt(btn.dataset.idx);
  cart.splice(idx, 1);
  updateCartUI();
  showToast(`🗑️ Article retiré`);
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
if (cartDrawerBtn) {
  cartDrawerBtn.addEventListener('click', () => cartOverlay.classList.add('open'));
}
if (closeCartBtn) {
  closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('open'));
}
if (cartOverlay) {
  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) cartOverlay.classList.remove('open');
  });
}

// ---------- MAIN PRODUCT QUANTITY ----------
let mainQty = 1;
const qtySpan = document.getElementById('qtyValue');
const decrQty = document.getElementById('decrQty');
const incrQty = document.getElementById('incrQty');

function animateQty() {
  if (qtySpan) {
    qtySpan.style.transform = 'scale(1.2)';
    setTimeout(() => qtySpan.style.transform = '', 200);
  }
}

if (decrQty) {
  decrQty.addEventListener('click', () => {
    if (mainQty > 1) {
      mainQty--;
      qtySpan.innerText = mainQty;
      animateQty();
    }
  });
}
if (incrQty) {
  incrQty.addEventListener('click', () => {
    if (mainQty < 20) {
      mainQty++;
      qtySpan.innerText = mainQty;
      animateQty();
    }
  });
}

const addMainToCartBtn = document.getElementById('addMainToCart');
if (addMainToCartBtn) {
  addMainToCartBtn.addEventListener('click', () => {
    addToCart(mainProduct, mainQty);
  });
}

// ---------- PRODUCT CARDS ----------
document.querySelectorAll('.product-card').forEach(card => {
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const id = card.dataset.id || name.replace(/\s/g, '_');
  const btn = card.querySelector('.add-to-cart-card');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart({ id, name, price }, 1);
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => btn.style.transform = '', 200);
    });
  }
});

// Scroll to products
const scrollBtn = document.getElementById('scrollToProducts');
if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    const produitsSection = document.getElementById('produits');
    if (produitsSection) produitsSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// Checkout
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) showToast("🍃 Votre panier est vide");
    else showToast("🎉 Merci ! Simulation de commande effectuée");
  });
}

// ---------- LOADER & SCROLL REVEAL ----------
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('gone'), 1000);
  }
  
  const reveals = document.querySelectorAll('.sr');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.2 });
  reveals.forEach(el => observer.observe(el));
  
  loadCartFromLocalStorage();
});

// Navbar solid on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    if (window.scrollY > 40) nav.classList.add('solid');
    else nav.classList.remove('solid');
  }
});

// Custom cursor (only for desktop)
if (window.innerWidth > 860) {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateCursor() {
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }
}