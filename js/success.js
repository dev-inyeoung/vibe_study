/* 결제 성공 페이지: successUrl 쿼리 파라미터 검증 → (서버가 있다면) 결제 승인 요청 */
(function () {
  const Shop = window.Shop;
  const config = window.TOSS_CONFIG;
  const esc = Shop.escapeHtml;

  const ICON_OK = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_FAIL = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 7v6"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg>';

  function row(label, value) {
    return '<div class="result__row"><dt>' + label + '</dt><dd>' + esc(value) + '</dd></div>';
  }

  function renderFail(el, title, desc) {
    el.innerHTML =
      '<div class="result__icon result__icon--fail">' + ICON_FAIL + '</div>' +
      '<h1 class="result__title">' + esc(title) + '</h1>' +
      '<p class="result__desc">' + esc(desc) + '</p>' +
      '<div class="result__actions">' +
        '<a class="btn btn--primary btn--block" href="checkout.html">다시 결제하기</a>' +
        '<a class="btn btn--grey btn--block" href="tops.html">쇼핑 계속하기</a>' +
      '</div>';
  }

  async function confirmPayment(payload) {
    const res = await fetch(config.confirmEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(json.message || '결제 승인에 실패했어요');
    return json;
  }

  document.addEventListener('DOMContentLoaded', async function () {
    const el = document.querySelector('[data-result]');
    const params = new URLSearchParams(location.search);
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));
    const order = Shop.PendingOrder.get();

    if (!paymentKey || !orderId || !amount) {
      renderFail(el, '결제 정보가 없어요', '올바르지 않은 접근이에요.');
      return;
    }

    // 결제 요청 전 저장한 주문과 금액이 같은지 확인 (금액 위변조 방지)
    if (!order || order.orderId !== orderId || order.amount !== amount) {
      renderFail(el, '결제 금액이 일치하지 않아요', '주문 금액과 결제 금액이 달라 결제를 진행하지 않았어요.');
      return;
    }

    let confirmed = false;
    if (config.confirmEndpoint) {
      try {
        await confirmPayment({ paymentKey: paymentKey, orderId: orderId, amount: amount });
        confirmed = true;
      } catch (err) {
        renderFail(el, '결제 승인에 실패했어요', err.message);
        return;
      }
    }

    // 주문 완료 → 장바구니 비우기
    Shop.Cart.clear();
    Shop.PendingOrder.clear();

    const itemCount = order.items.reduce(function (s, i) { return s + i.qty; }, 0);
    el.innerHTML =
      '<div class="result__icon result__icon--ok">' + ICON_OK + '</div>' +
      '<h1 class="result__title">결제를 완료했어요</h1>' +
      '<p class="result__desc">주문하신 상품 ' + itemCount + '개를 곧 보내드릴게요.</p>' +
      '<dl class="result__box">' +
        row('결제 금액', Shop.won(amount)) +
        row('주문번호', orderId) +
        row('결제 키', paymentKey) +
        (params.get('paymentType') ? row('결제 유형', params.get('paymentType')) : '') +
      '</dl>' +
      (confirmed ? '' :
        '<p class="result__notice">이 화면은 결제 인증까지 완료된 상태예요. 실제 결제를 확정하려면 서버에서 ' +
        '<b>결제 승인 API</b>(POST /v1/payments/confirm)를 시크릿 키로 호출해야 해요. ' +
        '<code>js/config.js</code>의 <code>confirmEndpoint</code>에 서버 주소를 넣으면 자동으로 호출합니다.</p>') +
      '<div class="result__actions">' +
        '<a class="btn btn--primary btn--block" href="tops.html">쇼핑 계속하기</a>' +
      '</div>';
  });
})();
