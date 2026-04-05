(function() {
  'use strict';

  // ========== LOADER FIX ==========
  const loader = document.getElementById('loader');
  const skipLoaderBtn = document.getElementById('skipLoaderBtn');
  
  function hideLoader() {
    if (loader) loader.classList.add('hide-loader');
  }
  
  setTimeout(hideLoader, 1500);
  if (skipLoaderBtn) skipLoaderBtn.addEventListener('click', hideLoader);
  window.addEventListener('DOMContentLoaded', hideLoader);
  window.addEventListener('load', hideLoader);

  // ========== PRODUCTS DATA ==========
  const products = [
    { id: 'choco', name: 'Belgian Chocolate', price: 55, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
    { id: 'fraise', name: 'Wild Strawberry', price: 50, img: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80' },
    { id: 'vanille', name: 'Madagascar Vanilla', price: 48, img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80' }
  ];

  // ========== CART SYSTEM ==========
  let cart = [];
  
  function loadCart() {
    const saved = localStorage.getItem('glace_cart');
    if (saved) {
      try { cart = JSON.parse(saved); } catch(e) { cart = []; }
    } else {
      cart = [];
    }
    updateCartUI();
  }
  
  function saveCart() {
    localStorage.setItem('glace_cart', JSON.stringify(cart));
  }
  
  function updateCartUI() {
    const badge = document.getElementById('cartCount');
    const container = document.getElementById('cartItemsList');
    const totalSpan = document.getElementById('cartTotal');
    let totalItems = 0, totalPrice = 0;
    
    cart.forEach(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    });
    
    if (badge) badge.innerText = totalItems;
    if (totalSpan) totalSpan.innerText = totalPrice + ' د.م.';
    if (!container) return;
    
    if (cart.length === 0) {
      container.innerHTML = '<div class="empty-cart-msg">🍃 سلة التسوق فارغة</div>';
      return;
    }
    
    let html = '';
    cart.forEach((item, idx) => {
      html += `
        <div class="cart-item">
          <div><strong>${escapeHtml(item.name)}</strong><br>${item.price} د.م.</div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" data-index="${idx}" data-delta="-1">−</button>
            <span>${item.quantity}</span>
            <button class="cart-qty-btn" data-index="${idx}" data-delta="1">+</button>
            <button class="cart-remove" data-index="${idx}">🗑️</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const delta = parseInt(btn.dataset.delta);
        if (cart[idx]) {
          let newQty = cart[idx].quantity + delta;
          if (newQty <= 0) {
            cart.splice(idx, 1);
          } else {
            cart[idx].quantity = newQty;
          }
          saveCart();
          updateCartUI();
          showToast('تم تحديث السلة');
        }
      });
    });
    
    document.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        cart.splice(idx, 1);
        saveCart();
        updateCartUI();
        showToast('تم إزالة المنتج');
      });
    });
  }
  
  function addToCart(product, quantity = 1) {
    const existing = cart.find(p => p.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    saveCart();
    updateCartUI();
    showToast(`تم إضافة ${product.name} (x${quantity})`);
    
    // إضافة تأثير اهتزاز لأيقونة السلة
    const cartIcon = document.getElementById('cartBtn');
    if (cartIcon) {
      cartIcon.style.transform = 'scale(1.2)';
      setTimeout(() => { if (cartIcon) cartIcon.style.transform = ''; }, 300);
    }
  }
  
  function showToast(msg) {
    const toast = document.getElementById('toastMsg');
    if (!toast) return;
    toast.innerText = '✓ ' + msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
  
  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // ========== CART DRAWER ==========
  const cartBtn = document.getElementById('cartBtn');
  const overlay = document.getElementById('cartOverlay');
  const closeCart = document.getElementById('closeCartBtn');
  
  if (cartBtn) {
    cartBtn.addEventListener('click', () => overlay.classList.add('open'));
  }
  if (closeCart) {
    closeCart.addEventListener('click', () => overlay.classList.remove('open'));
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  }

  // ========== MAIN PRODUCT QUANTITY ==========
  let mainQty = 1;
  const qtySpan = document.getElementById('qtyValue');
  const decrQty = document.getElementById('decrQty');
  const incrQty = document.getElementById('incrQty');
  
  if (decrQty) {
    decrQty.addEventListener('click', () => {
      if (mainQty > 1) {
        mainQty--;
        if (qtySpan) {
          qtySpan.innerText = mainQty;
          qtySpan.style.transform = 'scale(1.2)';
          setTimeout(() => { if (qtySpan) qtySpan.style.transform = ''; }, 200);
        }
      }
    });
  }
  if (incrQty) {
    incrQty.addEventListener('click', () => {
      if (mainQty < 20) {
        mainQty++;
        if (qtySpan) {
          qtySpan.innerText = mainQty;
          qtySpan.style.transform = 'scale(1.2)';
          setTimeout(() => { if (qtySpan) qtySpan.style.transform = ''; }, 200);
        }
      }
    });
  }
  
  const heroAddBtn = document.getElementById('heroAddBtn');
  if (heroAddBtn) {
    heroAddBtn.addEventListener('click', () => {
      addToCart({ id: 'main', name: 'Glacé Signature', price: 69 }, mainQty);
      
      // تأثير مؤقت على الزر
      heroAddBtn.style.transform = 'scale(0.95)';
      setTimeout(() => { if (heroAddBtn) heroAddBtn.style.transform = ''; }, 200);
    });
  }

  // ========== RENDER PRODUCT CARDS ==========
  const grid = document.getElementById('productGrid');
  if (grid) {
    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img"><img src="${prod.img}" alt="${prod.name}" loading="lazy"></div>
        <div class="card-info">
          <div><h3>${prod.name}</h3><div class="card-price">${prod.price} د.م.</div></div>
          <button class="add-card" data-id="${prod.id}" data-name="${prod.name}" data-price="${prod.price}">+</button>
        </div>
      `;
      grid.appendChild(card);
    });
    
    document.querySelectorAll('.add-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        addToCart({ id, name, price }, 1);
        
        // Animation feedback
        btn.style.transform = 'rotate(90deg) scale(1.2)';
        setTimeout(() => { if (btn) btn.style.transform = ''; }, 300);
      });
    });
  }

  // ========== SCROLL TO PRODUCTS ==========
  const scrollBtn = document.getElementById('scrollToProducts');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ========== WHATSAPP ORDER ==========
  const whatsappBtn = document.getElementById('whatsappOrderBtn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('سلة التسوق فارغة');
        return;
      }
      let orderDetails = "🍦 *طلب من Glacé* 🍦\n\n";
      let total = 0;
      cart.forEach(item => {
        orderDetails += `• ${item.name} x${item.quantity} → ${item.price * item.quantity} د.م.\n`;
        total += item.price * item.quantity;
      });
      orderDetails += `\n💰 *المجموع: ${total} د.م.*\n\n📍 التوصيل: مراكش، المغرب\n📞 للاستفسار: +212 5XX XXX XXX\n\nشكراً لتأكيد طلبكم!`;
      const encoded = encodeURIComponent(orderDetails);
      window.open(`https://wa.me/212612345678?text=${encoded}`, '_blank');
    });
  }

  // ========== CHECKOUT SIMULATION ==========
  const checkout = document.getElementById('checkoutBtn');
  if (checkout) {
    checkout.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('السلة فارغة');
      } else {
        showToast('شكراً! تمت محاكاة الطلب 🎉');
        // اختياري: تفريغ السلة بعد الشراء
        // cart = [];
        // saveCart();
        // updateCartUI();
      }
    });
  }

  // ========== NAVBAR SCROLL EFFECT ==========
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
      if (window.scrollY > 30) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });

  // ========== ABOUT SECTION SCROLL REVEAL ==========
  const aboutSection = document.querySelector('.about-us');
  if (aboutSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(aboutSection);
  }

  // ========== PRODUCT CARDS SCROLL REVEAL ==========
  const cards = document.querySelectorAll('.card');
  if (cards.length > 0) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      cardObserver.observe(card);
    });
  }

  // ========== FOOTER FUNCTIONS ==========
  const newsletterBtn = document.getElementById('newsletterBtn');
  if (newsletterBtn) {
    newsletterBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput ? emailInput.value.trim() : '';
      if (email && email.includes('@') && email.includes('.')) {
        showToast('شكراً لتسجيلك! ✨ ستصلك العروض قريباً');
        if (emailInput) emailInput.value = '';
      } else {
        showToast('الرجاء إدخال بريد إلكتروني صحيح');
      }
    });
    
    // Allow enter key in newsletter input
    const emailInput = document.getElementById('newsletterEmail');
    if (emailInput) {
      emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          newsletterBtn.click();
        }
      });
    }
  }

  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.style.transition = '0.3s';
    backToTopBtn.style.opacity = '0';
    backToTopBtn.style.visibility = 'hidden';
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
      }
    });
  }

  // ========== PREVENT BODY SCROLL WHEN CART OPEN ==========
  if (overlay) {
    overlay.addEventListener('open', () => {
      document.body.style.overflow = 'hidden';
    });
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (overlay.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        }
      });
    });
    observer.observe(overlay, { attributes: true });
  }

  // ========== INIT ==========
  loadCart();
  
  // إضافة تأثيرات للروابط في الفوتر
  const footerLinks = document.querySelectorAll('.footer-column a');
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') === '#') {
        e.preventDefault();
        showToast('🚧 قريباً');
      }
    });
  });
})();