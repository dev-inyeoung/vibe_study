/*
 * 토스페이먼츠 설정
 * - 아래 키는 토스페이먼츠 개발자 문서에 공개된 "결제위젯 연동 키" 테스트용 클라이언트 키입니다.
 *   실제 결제는 일어나지 않습니다.
 * - 내 상점 키로 바꾸려면 개발자센터(https://developers.tosspayments.com) > API 키 > 결제위젯 연동 키의
 *   클라이언트 키(test_gck_...)를 넣으세요. 시크릿 키(test_gsk_...)는 절대 프론트엔드에 넣지 마세요.
 */
window.TOSS_CONFIG = {
  clientKey: 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm',
  // 결제 승인 API를 호출할 서버 엔드포인트. 비워두면 성공 페이지에서 승인 단계를 건너뜁니다.
  // 예) '/api/payments/confirm' — 요청 본문: { paymentKey, orderId, amount }
  confirmEndpoint: '',
};
