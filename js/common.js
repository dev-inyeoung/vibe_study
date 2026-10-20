/* 공통: 장바구니, 포맷, 헤더, 토스트 */
(function () {
  const Shop = window.Shop;
  const CART_KEY = 'shop.cart';
  const ORDER_KEY = 'shop.pendingOrder';
  const FREE_SHIPPING_MIN = 50000;
  const SHIPPING_FEE = 3000;

  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 환경 */ }
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* noop */ }
  }

  const Cart = {
    items: function () {
      // 데이터에 없는 상품은 걸러냄
      return safeGet(CART_KEY, []).filter(function (i) { return Shop.findProduct(i.id); });
    },
    save: function (items) {
      safeSet(CART_KEY, items);
      updateBadge();
    },
    add: function (id, size, qty) {
      const items = Cart.items();
      const key = id + '|' + size;
      const found = items.find(function (i) { return i.key === key; });
      if (found) found.qty = Math.min(found.qty + qty, 99);
      else items.push({ key: key, id: id, size: size, qty: qty });
      Cart.save(items);
    },
    setQty: function (key, qty) {
      const items = Cart.items();
      const found = items.find(function (i) { return i.key === key; });
      if (found) found.qty = Math.max(1, Math.min(qty, 99));
      Cart.save(items);
    },
    remove: function (key) {
      Cart.save(Cart.items().filter(function (i) { return i.key !== key; }));
    },
    clear: function () { Cart.save([]); },
    count: function () {
      return Cart.items().reduce(function (sum, i) { return sum + i.qty; }, 0);
    },
    totals: function (items) {
      items = items || Cart.items();
      const subtotal = items.reduce(function (sum, i) {
        return sum + Shop.findProduct(i.id).price * i.qty;
      }, 0);
      const discount = items.reduce(function (sum, i) {
        const p = Shop.findProduct(i.id);
        return sum + (p.originPrice ? (p.originPrice - p.price) * i.qty : 0);
      }, 0);
      const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
      return { subtotal: subtotal, discount: discount, shipping: shipping, total: subtotal + shipping };
    },
  };

  // 결제 요청 직전 주문 정보 저장 → 성공 페이지에서 금액 검증용
  const PendingOrder = {
    save: function (order) { safeSet(ORDER_KEY, order); },
    get: function () { return safeGet(ORDER_KEY, null); },
    clear: function () { safeRemove(ORDER_KEY); },
  };

  function won(n) {
    return Number(n).toLocaleString('ko-KR') + '원';
  }

  function discountRate(p) {
    return p.originPrice ? Math.round((1 - p.price / p.originPrice) * 100) : 0;
  }

  function updateBadge() {
    const badge = document.querySelector('[data-cart-badge]');
    if (!badge) return;
    const n = Cart.count();
    badge.textContent = n > 99 ? '99+' : String(n);
    badge.hidden = n === 0;
  }

  let toastTimer;
  function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(function () { el.classList.add('is-show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-show'); }, 2000);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 헤더 + 카테고리 탭 렌더 (data-page 속성 기준으로 활성 탭 표시)
  function renderHeader() {
    const mount = document.querySelector('[data-header]');
    if (!mount) return;
    const current = document.body.dataset.page;
    const tabs = Object.keys(Shop.CATEGORIES).map(function (key) {
      const c = Shop.CATEGORIES[key];
      return '<a class="tab' + (key === current ? ' is-active' : '') + '" href="' + c.href + '"' +
        (key === current ? ' aria-current="page"' : '') + '>' + c.label + '</a>';
    }).join('');
    const showTabs = mount.dataset.header !== 'simple';

    mount.innerHTML =
      '<header class="header">' +
        '<div class="container header__inner">' +
          '<a class="logo" href="tops.html"><span class="logo__mark">T</span>토스 스토어</a>' +
          '<a class="cart-btn" href="checkout.html" aria-label="장바구니">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4e5968" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>' +
            '<span class="cart-btn__badge" data-cart-badge hidden>0</span>' +
          '</a>' +
        '</div>' +
        (showTabs ? '<nav class="tabs" aria-label="카테고리"><div class="container tabs__list">' + tabs + '</div></nav>' : '') +
      '</header>';
    updateBadge();
  }

  Shop.Cart = Cart;
  Shop.PendingOrder = PendingOrder;
  Shop.won = won;
  Shop.discountRate = discountRate;
  Shop.toast = toast;
  Shop.escapeHtml = escapeHtml;
  Shop.updateBadge = updateBadge;

  document.addEventListener('DOMContentLoaded', renderHeader);
  // 다른 탭에서 장바구니가 바뀌면 배지 동기화
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) updateBadge(); });
})();
