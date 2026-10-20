/* 주문/결제 페이지: 장바구니 + 주문자 정보 + 토스페이먼츠 결제위젯 */
(function () {
  const Shop = window.Shop;
  const config = window.TOSS_CONFIG;

  document.addEventListener('DOMContentLoaded', function () {
    const emptyEl = document.querySelector('[data-empty]');
    const checkoutEl = document.querySelector('[data-checkout]');
    const linesEl = document.querySelector('[data-lines]');
    const countEl = document.querySelector('[data-count]');
    const summaryEl = document.querySelector('[data-summary]');
    const payBtn = document.querySelector('[data-pay]');
    const form = document.querySelector('[data-form]');

    let widgets = null;
    let widgetReady = false;

    // ----- 장바구니 렌더 -----
    function render() {
      const items = Shop.Cart.items();
      const isEmpty = items.length === 0;
      emptyEl.hidden = !isEmpty;
      checkoutEl.hidden = isEmpty;
      if (isEmpty) return;

      countEl.textContent = '총 ' + Shop.Cart.count() + '개';
      linesEl.innerHTML = items.map(function (i) {
        const p = Shop.findProduct(i.id);
        return '<div class="line">' +
          '<div class="line__thumb" style="--thumb:' + p.bg + '">' + Shop.renderIllust(p) + '</div>' +
          '<div class="line__info">' +
            '<p class="line__name">' + p.name + '</p>' +
            '<p class="line__opt">' + p.brand + ' · 사이즈 ' + i.size + '</p>' +
            '<div class="line__bottom">' +
              '<div class="qty">' +
                '<button type="button" data-key="' + i.key + '" data-step="-1" aria-label="수량 줄이기"' + (i.qty <= 1 ? ' disabled' : '') + '>−</button>' +
                '<span>' + i.qty + '</span>' +
                '<button type="button" data-key="' + i.key + '" data-step="1" aria-label="수량 늘리기"' + (i.qty >= 99 ? ' disabled' : '') + '>+</button>' +
              '</div>' +
              '<span class="line__price">' + Shop.won(p.price * i.qty) + '</span>' +
            '</div>' +
            '<button type="button" class="line__remove" data-remove="' + i.key + '">삭제</button>' +
          '</div>' +
        '</div>';
      }).join('');

      const t = Shop.Cart.totals(items);
      summaryEl.innerHTML =
        '<div class="summary__row"><span>상품 금액</span><span>' + Shop.won(t.subtotal + t.discount) + '</span></div>' +
        (t.discount ? '<div class="summary__row"><span>할인 금액</span><span style="color:var(--red-500)">-' + Shop.won(t.discount) + '</span></div>' : '') +
        '<div class="summary__row"><span>배송비</span><span>' + (t.shipping ? Shop.won(t.shipping) : '무료') + '</span></div>' +
        '<div class="summary__row summary__row--total"><span>총 결제 금액</span><strong>' + Shop.won(t.total) + '</strong></div>';

      if (widgetReady) {
        payBtn.textContent = Shop.won(t.total) + ' 결제하기';
        widgets.setAmount({ currency: 'KRW', value: t.total });
      }
      return t;
    }

    linesEl.addEventListener('click', function (e) {
      const stepBtn = e.target.closest('[data-step]');
      const removeBtn = e.target.closest('[data-remove]');
      if (stepBtn) {
        const item = Shop.Cart.items().find(function (i) { return i.key === stepBtn.dataset.key; });
        if (item) Shop.Cart.setQty(item.key, item.qty + Number(stepBtn.dataset.step));
        render();
      } else if (removeBtn) {
        Shop.Cart.remove(removeBtn.dataset.remove);
        render();
        Shop.toast('상품을 삭제했어요');
      }
    });

    // ----- 주문자 정보 검증 -----
    const validators = {
      name: function (v) { return v.trim().length > 0; },
      phone: function (v) { return /^01[016789]\d{7,8}$/.test(v.replace(/\D/g, '')); },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      address: function (v) { return v.trim().length > 0; },
    };

    function validate() {
      let firstInvalid = null;
      Object.keys(validators).forEach(function (name) {
        const input = form.elements[name];
        const ok = validators[name](input.value);
        input.classList.toggle('is-error', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-error') && validators[e.target.name](e.target.value)) {
        e.target.classList.remove('is-error');
        e.target.setAttribute('aria-invalid', 'false');
      }
    });

    // ----- 토스페이먼츠 결제위젯 -----
    async function initWidget(amount) {
      if (typeof TossPayments !== 'function') {
        payBtn.textContent = '결제 모듈을 불러오지 못했어요';
        return;
      }
      const tossPayments = TossPayments(config.clientKey);
      // 비회원 결제. 회원 결제라면 회원 ID 기반의 고유한 customerKey를 넘기세요.
      widgets = tossPayments.widgets({ customerKey: TossPayments.ANONYMOUS });

      await widgets.setAmount({ currency: 'KRW', value: amount });
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
        widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
      ]);

      widgetReady = true;
      payBtn.disabled = false;
      payBtn.textContent = Shop.won(Shop.Cart.totals().total) + ' 결제하기';
    }

    function makeOrderId() {
      // 6~64자, 영문 대소문자/숫자/-/_ 만 허용
      const rand = Math.random().toString(36).slice(2, 10);
      return 'ORDER-' + Date.now() + '-' + rand;
    }

    function makeOrderName(items) {
      const first = Shop.findProduct(items[0].id).name;
      const name = items.length > 1 ? first + ' 외 ' + (items.length - 1) + '건' : first;
      return name.slice(0, 100);
    }

    payBtn.addEventListener('click', async function () {
      if (!widgetReady) return;
      if (!validate()) {
        Shop.toast('주문자 정보를 확인해주세요');
        return;
      }
      const items = Shop.Cart.items();
      const total = Shop.Cart.totals(items).total;
      const orderId = makeOrderId();

      // 성공 페이지에서 결제 금액을 검증하기 위해 주문 정보를 저장해둡니다.
      Shop.PendingOrder.save({ orderId: orderId, amount: total, items: items, createdAt: Date.now() });

      try {
        await widgets.requestPayment({
          orderId: orderId,
          orderName: makeOrderName(items),
          successUrl: new URL('success.html', location.href).href,
          failUrl: new URL('fail.html', location.href).href,
          customerName: form.elements.name.value.trim(),
          customerEmail: form.elements.email.value.trim(),
          customerMobilePhone: form.elements.phone.value.replace(/\D/g, ''),
        });
      } catch (err) {
        // 사용자가 결제창을 닫은 경우 등
        if (err && err.code === 'USER_CANCEL') Shop.toast('결제를 취소했어요');
        else Shop.toast((err && err.message) || '결제 요청 중 문제가 생겼어요');
      }
    });

    const totals = render();
    if (totals) {
      initWidget(totals.total).catch(function (err) {
        console.error(err);
        payBtn.textContent = '결제 수단을 불러오지 못했어요';
        Shop.toast((err && err.message) || '결제위젯을 불러오지 못했어요');
      });
    }
  });
})();
