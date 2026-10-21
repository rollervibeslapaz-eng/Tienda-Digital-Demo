// DATOS DE EJEMPLO
const categories = [
  { id: 1, name: 'Vestidos', icon: '👗' },
  { id: 2, name: 'Blusas', icon: '👚' },
  { id: 3, name: 'Pantalones', icon: '👖' },
  { id: 4, name: 'Bolsas', icon: '👜' },
  { id: 5, name: 'Zapatos', icon: '👠' },
];

const products = [
  { id: 1, name: 'Vestido Floral', price: 499, oldPrice: 699, category: 1, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', badge: '-30%' },
  { id: 2, name: 'Blusa Elegante', price: 349, category: 2, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400' },
  { id: 3, name: 'Jeans Push Up', price: 599, category: 3, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', badge: 'NUEVO' },
  { id: 4, name: 'Top Básico', price: 199, category: 2, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400' },
  { id: 5, name: 'Blazer Moderno', price: 899, oldPrice: 1199, category: 2, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', badge: '-25%' },
  { id: 6, name: 'Tenis Casual', price: 749, category: 5, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { id: 7, name: 'Bolsa de Mano', price: 459, category: 4, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
  { id: 8, name: 'Falda Plisada', price: 399, category: 1, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400' },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentCategory = null;

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = categories.map(cat => `
    <div class="category-item ${currentCategory === cat.id ? 'active' : ''}" onclick="filterByCategory(${cat.id})">
      <div class="category-icon">${cat.icon}</div>
      <span>${cat.name}</span>
    </div>
  `).join('');
}

function renderProducts(productsToRender = products) {
  const grid = document.getElementById('productsGrid');
  if (productsToRender.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#9ca3af;padding:40px;">No se encontraron productos</p>';
    return;
  }
  grid.innerHTML = productsToRender.map(p => {
    const isFav = favorites.includes(p.id);
    return `
    <div class="product-card">
      <div class="product-img-container">
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <button class="product-fav ${isFav ? 'active' : ''}" onclick="toggleFav(${p.id})">
          <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-category">${categories.find(c => c.id === p.category)?.name || ''}</div>
        <div class="product-price-row">
          <div>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            ${p.oldPrice ? `<div style="font-size:11px;color:#9ca3af;text-decoration:line-through;">$${p.oldPrice.toFixed(2)}</div>` : ''}
          </div>
          <button class="btn-add" onclick="addToCart(${p.id})"><i class="fas fa-plus"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  saveCart();
  updateCartUI();
  showToast(`✅ ${product.name} agregado`);
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  renderCartItems();
  showToast('🗑️ Producto eliminado');
}

function toggleFav(productId) {
  const index = favorites.indexOf(productId);
  if (index > -1) { favorites.splice(index, 1); showToast('💔 Eliminado de favoritos'); } 
  else { favorites.push(productId); showToast('❤️ Agregado a favoritos'); }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderProducts(getFilteredProducts());
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = totalItems;
  const navBadge = document.getElementById('navBadge');
  navBadge.textContent = totalItems;
  navBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const footer = document.getElementById('cartFooter');
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p></div>`;
    footer.style.display = 'none';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          <button class="qty-btn" onclick="removeFromCart(${item.id})" style="margin-left:auto;color:#ef4444;"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cartShipping').textContent = shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  footer.style.display = 'block';
}

function filterByCategory(catId) {
  currentCategory = currentCategory === catId ? null : catId;
  renderCategories();
  renderProducts(getFilteredProducts());
}

function getFilteredProducts() {
  return currentCategory ? products.filter(p => p.category === currentCategory) : products;
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('active');
  if (bar.classList.contains('active')) document.getElementById('searchInput').focus();
  else { document.getElementById('searchInput').value = ''; renderProducts(getFilteredProducts()); }
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase().trim();
  let filtered = getFilteredProducts();
  if (term) filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
  renderProducts(filtered);
});

function sendWhatsAppOrder() {
  if (cart.length === 0) { showToast('⚠️ Tu carrito está vacío'); return; }
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;
  let message = '🛍️ *NUEVO PEDIDO*\n\n';
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n   ${item.quantity} x $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}\n\n`;
  });
  message += `━━━━━━━━━━━━━━━\nSubtotal: $${subtotal.toFixed(2)}\nEnvío: ${shipping === 0 ? 'GRATIS' : '$' + shipping.toFixed(2)}\n*TOTAL: $${total.toFixed(2)}*\n\n📍 Dirección: \n Teléfono: `;
  window.open(`https://wa.me/521234567890?text=${encodeURIComponent(message)}`, '_blank'); 
}

function checkout() {
  if (cart.length === 0) { showToast('⚠️ Tu carrito está vacío'); return; }
  showToast('🚧 Próximamente: pago en línea');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function openCart() {
  renderCartItems();
  document.getElementById('cartModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('navCartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', checkout);
document.getElementById('whatsappBtn').addEventListener('click', sendWhatsAppOrder);
document.getElementById('cartModal').addEventListener('click', (e) => { if (e.target.id === 'cartModal') closeCart(); });

renderCategories();
renderProducts();
updateCartUI();
