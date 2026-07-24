const products = [
  { id: 1, name: 'Єдинорог', price: 5, image: 'фото товара/Єдинорог, 5грн.jpg' },
  { id: 2, name: 'Єнот', price: 110, image: 'фото товара/Єнот, 110грн.jpg' },
  { id: 3, name: 'Гипно блум', price: 5, image: 'фото товара/Гипно блум, 5грн.jpg' },
  { id: 4, name: 'Гост пеппер', price: 8, image: 'фото товара/гост пеппер, 8грн.jpg' },
  { id: 5, name: 'Драгон фрукт', price: 5, image: 'фото товара/Драгон фрукт, 5грн.jpg' },
  { id: 6, name: 'Лейка', price: 1, image: 'фото товара/Лейка, 1грн.jpg' },
  { id: 7, name: 'Спринклеер', price: 2, image: 'фото товара/Спринклеер, 2грн.jpg' },
  { id: 8, name: 'Стар фрукт', price: 170, image: 'фото товара/Стар фрукт, 170грн.jpg' }
];

const cart = [];

const productsContainer = document.getElementById('products');
const cartItemsContainer = document.getElementById('cart-items');
const orderForm = document.getElementById('order-form');
const statusBox = document.getElementById('status');

function renderProducts() {
  productsContainer.innerHTML = '';

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="card-body">
        <h3>${product.name}</h3>
        <div class="price">${product.price} грн</div>
        <button class="buy-btn" data-id="${product.id}">Купити</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

function renderCart() {
  cartItemsContainer.innerHTML = '';

  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p>Корзина порожня</p>';
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong><br />
        <small>${item.price} грн × ${item.quantity}</small>
      </div>
      <strong>${item.price * item.quantity} грн</strong>
    `;
    cartItemsContainer.appendChild(row);
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  statusBox.textContent = `${product.name} додано до корзини`;
}

productsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('.buy-btn');
  if (!button) return;
  addToCart(Number(button.dataset.id));
});

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!cart.length) {
    statusBox.textContent = 'Додайте хоча б один товар у корзину.';
    return;
  }

  const formData = new FormData(orderForm);
  const customer = {
    name: formData.get('name')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    telegram: formData.get('telegram')?.toString().trim() || '',
    comment: formData.get('comment')?.toString().trim() || ''
  };

  statusBox.textContent = 'Відправляю замовлення...';

  // Если страница открыта внутри Telegram Web App — отправляем данные боту
  if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.sendData === 'function') {
    try {
      const payload = { items: cart, customer };
      window.Telegram.WebApp.sendData(JSON.stringify(payload));
      statusBox.textContent = '✅ Замовлення відправлено через Telegram Web App.';
      orderForm.reset();
      cart.length = 0;
      renderCart();
      return;
    } catch (err) {
      console.error('Ошибка отправки через WebApp:', err);
      statusBox.textContent = 'Не вдалося відправити через Telegram Web App.';
      return;
    }
  }

  // Помощник для безопасного JSON-парсинга ответа
  async function parseJsonSafe(response) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (err) {
      return { error: `Unexpected response from server: ${text}` };
    }
  }

  // Сначала пробуем отправить на Netlify Function (если сайт задеплоен на Netlify)
  try {
    const response = await fetch('/.netlify/functions/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, customer })
    });

    const result = await parseJsonSafe(response);
    if (response.ok && result && result.ok) {
      statusBox.textContent = 'Замовлення надіслано адміністратору (Netlify Function).';
      orderForm.reset();
      cart.length = 0;
      renderCart();
      return;
    }

    const errorMessage = result?.error || result?.message || `Функция вернула статус ${response.status}`;
    throw new Error(errorMessage);
  } catch (err) {
    console.warn('Netlify function not available or failed, falling back to local API.', err);
  }

  // Фоллбек — локальный сервер /api/order
  try {
    const response2 = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, customer })
    });

    const result2 = await parseJsonSafe(response2);

    if (!response2.ok || !result2?.ok) {
      const errorMessage = result2?.error || 'Не вдалося відправити замовлення';
      throw new Error(errorMessage);
    }

    statusBox.textContent = 'Замовлення надіслано адміністратору.';
    orderForm.reset();
    cart.length = 0;
    renderCart();
  } catch (error) {
    statusBox.textContent = error.message;
  }
});

renderProducts();
renderCart();
