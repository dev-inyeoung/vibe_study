# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

토스 스타일 디자인의 옷 쇼핑몰 퍼블리싱(정적 HTML/CSS/JS, 빌드 도구·프레임워크·패키지 매니저 없음)과 토스페이먼츠 결제위젯 v2 연동. 페이지: 상품 목록 `tops.html`(옷) · `shoes.html` · `pants.html`, `checkout.html`(장바구니+결제), `success.html` / `fail.html`(결제 결과). `index.html`은 `tops.html`로 리다이렉트만 함.

## 실행

결제위젯은 `file://`에서 동작하지 않으므로 반드시 http로 열어야 한다. 이 PC에는 Node.js·Python이 없어서 PowerShell 정적 서버를 사용한다.

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

→ http://localhost:5500 (`.claude/launch.json`의 `shop` 설정과 동일). 빌드·린트·테스트 도구는 없다. 검증은 브라우저에서 직접 한다.

- Git은 PATH에 없을 수 있다: `C:\Program Files\Git\cmd\git.exe`. 원격은 `https://github.com/dev-inyeoung/vibe_study.git`(`main`).
- `.mcp.json`에 토스페이먼츠 연동 가이드 MCP(`@tosspayments/integration-guide-mcp`)가 등록되어 있지만 Node.js 설치 전에는 실행되지 않는다.

## 구조

### 스크립트 로드 순서와 전역 `window.Shop`

모듈 시스템 없이 IIFE들이 전역 `window.Shop`에 기능을 붙인다. 순서가 중요하다:

1. `js/theme.js` — `<head>`에서 동기 실행(다크모드 깜빡임 방지). `Shop.theme`
2. `js/config.js` — `window.TOSS_CONFIG` (checkout/success 페이지만)
3. `js/products.js` — `Shop.PRODUCTS`, `Shop.CATEGORIES`, `Shop.renderIllust`, `Shop.findProduct`
4. `js/common.js` — `Shop.Cart`, `Shop.PendingOrder`, `Shop.won`, `Shop.toast` 등. `DOMContentLoaded`에 `[data-header]`에 헤더(로고·테마 토글·장바구니 배지·카테고리 탭)를 렌더
5. 페이지 스크립트 — `catalog.js`(세 목록 페이지 공용), `checkout.js`, `success.js`

목록 페이지 세 개는 마크업이 동일하고 `<body data-page="tops|shoes|pants">`만 다르다. `catalog.js`가 이 값으로 `Shop.CATEGORIES`의 문구와 상품을 골라 렌더한다. 헤더는 `data-header="simple"`이면 탭을 숨긴다.

### 상품 데이터·이미지

상품은 `js/products.js`의 배열에 하드코딩되어 있고 이미지는 실제 사진이 아니라 `SHAPES`의 SVG 실루엣을 `color`로 채워 그린다. 썸네일 배경은 인라인 `style="--thumb:<bg>"`로 넘기고 CSS가 `--thumb-bg`로 변환한다(다크모드에서는 `color-mix`로 어둡게). 썸네일에 `background:`를 직접 넣으면 다크모드가 깨진다.

### 상태 (localStorage)

- `shop.cart` — `[{key: "<id>|<size>", id, size, qty}]`. 같은 상품·사이즈는 합쳐짐
- `shop.pendingOrder` — 결제 요청 직전 저장한 `{orderId, amount, items}`. `success.js`가 리다이렉트 쿼리의 `orderId`/`amount`와 비교해 금액 위변조를 검사한 뒤 장바구니와 함께 비운다
- `shop.theme` — `light`/`dark`. 없으면 OS 설정을 따름

모든 localStorage 접근은 try/catch로 감싸는 기존 패턴(`common.js`의 `safeGet`/`safeSet`)을 따른다.

### 결제 흐름 (토스페이먼츠 SDK v2, `https://js.tosspayments.com/v2/standard`)

`checkout.js`: `TossPayments(clientKey).widgets({customerKey: TossPayments.ANONYMOUS})` → `setAmount` → `renderPaymentMethods('#payment-method')` + `renderAgreement('#agreement')` → `requestPayment({orderId, orderName, successUrl, failUrl, customer…})`. 수량이 바뀌면 `render()`가 `widgets.setAmount`를 다시 호출한다. 배송비 규칙(50,000원 이상 무료, 아니면 3,000원)은 `Cart.totals`에 있다.

- `js/config.js`의 `clientKey`는 토스페이먼츠 문서에 공개된 **결제위젯 연동 키(test_gck_)** 테스트 키다. API 개별 연동 키(test_ck_)와 섞어 쓰면 위젯이 동작하지 않는다.
- **결제 승인(`POST /v1/payments/confirm`)은 구현되어 있지 않다.** 시크릿 키가 필요해 서버에서 해야 하며, `config.confirmEndpoint`에 서버 주소를 넣으면 `success.js`가 `{paymentKey, orderId, amount}`를 POST한다. 비어 있으면 인증 완료 화면과 안내 문구만 보여준다.
- `fail.html`은 쿼리의 `code`/`message`/`orderId`를 표시한다.

### 스타일·다크모드

`css/style.css` 하나. 토스 디자인 토큰(`--blue-500 #3182f6`, `--grey-*`, Pretendard 폰트)과 시맨틱 토큰(`--bg`, `--bg-elevated`, `--on-accent`, `--toast-bg` 등)을 쓴다. 색을 하드코딩하지 말고 토큰을 써야 다크모드가 유지된다. 다크 값은 `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`와 `:root[data-theme="dark"]` **두 곳에 동일하게** 정의되어 있으므로 수정 시 둘 다 바꾼다. 결제위젯 iframe은 항상 밝게 그려지므로 다크모드에서 `.widget-box`가 흰 카드로 감싼다.
