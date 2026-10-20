/* 테마(라이트/다크) — 깜빡임을 막기 위해 <head>에서 가장 먼저 실행 */
(function () {
  const KEY = 'shop.theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function current() {
    return saved() || (media.matches ? 'dark' : 'light');
  }
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }
  function toggle() {
    const next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) { /* 저장 불가 환경 */ }
    apply(next);
  }

  apply(current());

  // 사용자가 직접 고르지 않았다면 OS 설정 변경을 따라감
  media.addEventListener('change', function () { if (!saved()) apply(current()); });

  window.Shop = window.Shop || {};
  window.Shop.theme = { current: current, toggle: toggle, apply: apply };
})();
