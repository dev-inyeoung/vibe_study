/* 상품 목록 페이지: 필터 칩, 상품 그리드, 상품 상세 바텀시트 */
(function () {
  const Shop = window.Shop;

  document.addEventListener('DOMContentLoaded', function () {
    const category = document.body.dataset.page;
    const meta = Shop.CATEGORIES[category];
    const products = Shop.PRODUCTS.filter(function (p) { return p.category === category; });

    const heroEl = document.querySelector('[data-hero]');
    const chipsEl = document.querySelector('[data-chips]');
    const gridEl = document.querySelector('[data-grid]');

    heroEl.innerHTML =
      '<p class="hero__eyebrow">' + meta.eyebrow + '</p>' +
      '<h1 class="hero__title">' + meta.title.replace('\n', '<br>') + '</h1>' +
      '<p class="hero__desc">' + meta.desc + '</p>';

    // ----- 필터 칩 -----
    const subs = ['전체'].concat(products.map(function (p) { return p.sub; })
      .filter(function (s, i, arr) { return arr.indexOf(s) === i; }));
    let activeSub = '전체';

    function renderChips() {
      chipsEl.innerHTML = subs.map(function (s) {
        return '<button type="button" class="chip' + (s === activeSub ? ' is-active' : '') + '" data-sub="' + s + '"' +
          ' aria-pressed="' + (s === activeSub) + '">' + s + '</button>';
      }).join('');
    }

    chipsEl.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-sub]');
      if (!btn) return;
      activeSub = btn.dataset.sub;
      renderChips();
      renderGrid();
    });

    // ----- 상품 그리드 -----
    function priceHtml(p) {
      const rate = Shop.discountRate(p);
      return (rate ? '<span class="card__discount">' + rate + '%</span>' : '') +
        Shop.won(p.price) +
        (p.originPrice ? '<span class="card__origin">' + Shop.won(p.originPrice) + '</span>' : '');
    }

    function renderGrid() {
      const list = products.filter(function (p) { return activeSub === '전체' || p.sub === activeSub; });
      gridEl.innerHTML = list.map(function (p) {
        return '<button type="button" class="card" data-id="' + p.id + '">' +
          '<div class="card__thumb" style="--thumb:' + p.bg + '">' +
            Shop.renderIllust(p) +
            (p.tag ? '<span class="card__tag">' + p.tag + '</span>' : '') +
          '</div>' +
          '<p class="card__brand">' + p.brand + '</p>' +
          '<p class="card__name">' + p.name + '</p>' +
          '<p class="card__price">' + priceHtml(p) + '</p>' +
        '</button>';
      }).join('');
    }

    gridEl.addEventListener('click', function (e) {
      const card = e.target.closest('[data-id]');
      if (card) openSheet(Shop.findProduct(card.dataset.id));
    });

    // ----- 상품 상세 바텀시트 -----
    const dim = document.querySelector('[data-dim]');
    const sheet = document.querySelector('[data-sheet]');
    let state = null;
    let lastFocus = null;

    function renderSheet() {
      const p = state.product;
      sheet.innerHTML =
        '<div class="sheet__handle"></div>' +
        '<div class="sheet__body">' +
          '<div class="sheet__thumb" style="--thumb:' + p.bg + '">' + Shop.renderIllust(p) + '</div>' +
          '<p class="sheet__brand">' + p.brand + '</p>' +
          '<h2 class="sheet__name" id="sheet-title">' + p.name + '</h2>' +
          '<p class="sheet__price">' + priceHtml(p) + '</p>' +
          '<p class="sheet__desc">' + p.desc + '</p>' +
          '<p class="sheet__label">사이즈</p>' +
          '<div class="sizes" role="radiogroup" aria-label="사이즈">' + p.sizes.map(function (s) {
            return '<button type="button" class="size' + (s === state.size ? ' is-active' : '') + '" data-size="' + s + '"' +
              ' role="radio" aria-checked="' + (s === state.size) + '">' + s + '</button>';
          }).join('') + '</div>' +
          '<p class="sheet__label">수량</p>' +
          '<div class="qty">' +
            '<button type="button" data-qty="-1" aria-label="수량 줄이기"' + (state.qty <= 1 ? ' disabled' : '') + '>−</button>' +
            '<span aria-live="polite">' + state.qty + '</span>' +
            '<button type="button" data-qty="1" aria-label="수량 늘리기"' + (state.qty >= 99 ? ' disabled' : '') + '>+</button>' +
          '</div>' +
          '<div class="sheet__actions">' +
            '<button type="button" class="btn btn--secondary" data-action="cart">장바구니 담기</button>' +
            '<button type="button" class="btn btn--primary" data-action="buy">' + Shop.won(p.price * state.qty) + ' 구매하기</button>' +
          '</div>' +
        '</div>';
    }

    function openSheet(product) {
      lastFocus = document.activeElement;
      state = { product: product, size: null, qty: 1 };
      renderSheet();
      sheet.setAttribute('aria-hidden', 'false');
      dim.classList.add('is-open');
      sheet.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { const first = sheet.querySelector('.size'); if (first) first.focus(); }, 50);
    }

    function closeSheet() {
      dim.classList.remove('is-open');
      sheet.classList.remove('is-open');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    function addToCart() {
      if (!state.size) {
        Shop.toast('사이즈를 선택해주세요');
        return false;
      }
      Shop.Cart.add(state.product.id, state.size, state.qty);
      return true;
    }

    sheet.addEventListener('click', function (e) {
      const sizeBtn = e.target.closest('[data-size]');
      const qtyBtn = e.target.closest('[data-qty]');
      const actionBtn = e.target.closest('[data-action]');
      if (sizeBtn) {
        state.size = sizeBtn.dataset.size;
        renderSheet();
        sheet.querySelector('[data-size="' + state.size + '"]').focus();
      } else if (qtyBtn) {
        state.qty = Math.max(1, Math.min(99, state.qty + Number(qtyBtn.dataset.qty)));
        renderSheet();
      } else if (actionBtn) {
        if (!addToCart()) return;
        if (actionBtn.dataset.action === 'buy') {
          location.href = 'checkout.html';
        } else {
          closeSheet();
          Shop.toast('장바구니에 담았어요');
        }
      }
    });

    dim.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
    });

    renderChips();
    renderGrid();
  });
})();
