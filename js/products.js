/* 상품 데이터 + 상품 일러스트(SVG) */
(function () {
  const SHAPES = {
    tee: '<path d="M30 18 L42 13 Q50 22 58 13 L70 18 L88 32 L79 45 L71 40 L71 86 L29 86 L29 40 L21 45 L12 32 Z"/>',
    long: '<path d="M32 16 L42 12 Q50 21 58 12 L68 16 L83 30 L90 78 L78 80 L71 44 L71 88 L29 88 L29 44 L22 80 L10 78 L17 30 Z"/>',
    hoodie: '<path d="M33 20 Q36 6 50 6 Q64 6 67 20 L83 30 L90 78 L78 80 L71 46 L71 88 L29 88 L29 46 L22 80 L10 78 L17 30 Z"/><path d="M42 20 Q50 32 58 20" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2.5" stroke-linecap="round"/><rect x="38" y="60" width="24" height="12" rx="3" fill="rgba(0,0,0,.08)"/>',
    shirt: '<path d="M32 16 L44 12 L50 22 L56 12 L68 16 L83 30 L90 78 L78 80 L71 44 L71 88 L29 88 L29 44 L22 80 L10 78 L17 30 Z"/><path d="M50 22 L50 88" stroke="rgba(0,0,0,.15)" stroke-width="2"/><circle cx="50" cy="40" r="1.6" fill="rgba(0,0,0,.25)"/><circle cx="50" cy="54" r="1.6" fill="rgba(0,0,0,.25)"/><circle cx="50" cy="68" r="1.6" fill="rgba(0,0,0,.25)"/>',
    jacket: '<path d="M32 14 L44 10 L50 30 L56 10 L68 14 L84 28 L90 80 L78 82 L71 44 L71 90 L29 90 L29 44 L22 82 L10 80 L16 28 Z"/><path d="M50 30 L50 90" stroke="rgba(0,0,0,.2)" stroke-width="2.5"/><path d="M44 10 L40 30 L50 30 M56 10 L60 30 L50 30" fill="rgba(0,0,0,.08)"/>',
    pants: '<path d="M28 10 L72 10 L77 90 L56 90 L50 36 L44 90 L23 90 Z"/><path d="M28 18 L72 18" stroke="rgba(0,0,0,.15)" stroke-width="2"/>',
    wide: '<path d="M30 10 L70 10 L84 90 L56 90 L50 38 L44 90 L16 90 Z"/><path d="M30 18 L70 18" stroke="rgba(0,0,0,.15)" stroke-width="2"/>',
    shorts: '<path d="M24 24 L76 24 L82 72 L56 74 L50 44 L44 74 L18 72 Z"/><path d="M24 32 L76 32" stroke="rgba(0,0,0,.15)" stroke-width="2"/>',
    sneaker: '<path d="M8 60 Q10 42 22 38 L38 34 Q46 46 60 48 L82 53 Q93 57 93 68 L93 72 L8 72 Z"/><rect x="6" y="70" width="88" height="9" rx="4.5" fill="#fff" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/><path d="M30 44 L40 50 M36 40 L46 47" stroke="rgba(255,255,255,.7)" stroke-width="2.5" stroke-linecap="round"/>',
    runner: '<path d="M8 62 Q12 40 28 36 L40 33 Q50 48 66 50 L84 55 Q94 60 92 70 L8 70 Z"/><path d="M6 70 L94 70 Q92 80 82 80 L14 80 Q6 80 6 70 Z" fill="rgba(0,0,0,.18)"/><path d="M48 52 Q64 46 80 60" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3" stroke-linecap="round"/>',
    boot: '<path d="M26 12 L54 12 L54 52 L80 60 Q92 64 92 74 L92 78 L26 78 Z"/><rect x="24" y="76" width="70" height="9" rx="3" fill="rgba(0,0,0,.25)"/><path d="M26 22 L54 22" stroke="rgba(0,0,0,.15)" stroke-width="2"/>',
    loafer: '<path d="M8 64 Q10 50 24 48 L60 50 Q86 54 92 66 L92 72 L8 72 Z"/><rect x="6" y="70" width="88" height="7" rx="3.5" fill="rgba(0,0,0,.25)"/><path d="M40 54 L64 56" stroke="rgba(0,0,0,.2)" stroke-width="3" stroke-linecap="round"/>',
  };

  const PRODUCTS = [
    // ===== 옷(상의/아우터) =====
    { id: 'top-01', category: 'tops', sub: '티셔츠', brand: 'DAILY BASIC', name: '데일리 오버핏 코튼 반팔 티셔츠', price: 19900, originPrice: 29000, shape: 'tee', color: '#ffffff', bg: '#eef1f4', tag: 'BEST', sizes: ['S', 'M', 'L', 'XL'], desc: '20수 코튼으로 부드럽고 탄탄한 데일리 반팔 티셔츠예요.' },
    { id: 'top-02', category: 'tops', sub: '티셔츠', brand: 'DAILY BASIC', name: '헤비웨이트 무지 반팔 티셔츠 네이비', price: 24900, shape: 'tee', color: '#2c3e66', bg: '#e6ebf5', sizes: ['S', 'M', 'L', 'XL'], desc: '두께감 있는 원단으로 한 장만 입어도 핏이 살아나요.' },
    { id: 'top-03', category: 'tops', sub: '맨투맨', brand: 'SOFT ROOM', name: '루즈핏 기모 스웨트셔츠', price: 39000, originPrice: 49000, shape: 'long', color: '#9fb7d9', bg: '#e8f0fa', tag: 'NEW', sizes: ['M', 'L', 'XL'], desc: '안쪽 기모로 따뜻하고 포근한 스웨트셔츠예요.' },
    { id: 'top-04', category: 'tops', sub: '후드', brand: 'SOFT ROOM', name: '쭈리 오버핏 후드 티셔츠', price: 45000, shape: 'hoodie', color: '#7a8a6e', bg: '#edf1e8', sizes: ['M', 'L', 'XL'], desc: '여유 있는 핏과 넉넉한 후드로 어디에나 잘 어울려요.' },
    { id: 'top-05', category: 'tops', sub: '셔츠', brand: 'OFFICE MOOD', name: '옥스포드 버튼다운 셔츠', price: 42000, originPrice: 52000, shape: 'shirt', color: '#cfe0f5', bg: '#eef4fb', sizes: ['S', 'M', 'L', 'XL'], desc: '구김이 적은 옥스포드 원단의 클래식 셔츠예요.' },
    { id: 'top-06', category: 'tops', sub: '아우터', brand: 'URBAN LAYER', name: '경량 크롭 블루종 자켓', price: 89000, originPrice: 119000, shape: 'jacket', color: '#3b3b3f', bg: '#ececee', tag: 'BEST', sizes: ['M', 'L', 'XL'], desc: '가볍고 활동성 좋은 간절기 블루종이에요.' },
    { id: 'top-07', category: 'tops', sub: '후드', brand: 'URBAN LAYER', name: '피그먼트 워싱 후드 티셔츠', price: 52000, shape: 'hoodie', color: '#d98a6c', bg: '#fbefe9', sizes: ['M', 'L'], desc: '피그먼트 워싱으로 빈티지한 색감을 살렸어요.' },
    { id: 'top-08', category: 'tops', sub: '아우터', brand: 'OFFICE MOOD', name: '울 블렌드 싱글 자켓', price: 129000, shape: 'jacket', color: '#a68b6a', bg: '#f4efe8', tag: 'NEW', sizes: ['M', 'L', 'XL'], desc: '울 혼방 원단으로 단정하고 고급스러운 자켓이에요.' },

    // ===== 신발 =====
    { id: 'shoe-01', category: 'shoes', sub: '스니커즈', brand: 'STEP LAB', name: '클래식 로우탑 캔버스 스니커즈', price: 59000, originPrice: 69000, shape: 'sneaker', color: '#f5f5f5', bg: '#eef1f4', tag: 'BEST', sizes: ['240', '250', '260', '270', '280'], desc: '어떤 룩에도 잘 어울리는 기본 캔버스 스니커즈예요.' },
    { id: 'shoe-02', category: 'shoes', sub: '러닝화', brand: 'STEP LAB', name: '에어쿠션 데일리 러닝화', price: 99000, originPrice: 129000, shape: 'runner', color: '#3182f6', bg: '#e8f3ff', tag: 'NEW', sizes: ['250', '260', '270', '280'], desc: '쿠셔닝이 뛰어나 오래 걸어도 편안해요.' },
    { id: 'shoe-03', category: 'shoes', sub: '스니커즈', brand: 'COURT ONE', name: '레더 코트 스니커즈 블랙', price: 79000, shape: 'sneaker', color: '#2a2d33', bg: '#ececee', sizes: ['240', '250', '260', '270'], desc: '천연 가죽 갑피로 고급스러운 코트 스니커즈예요.' },
    { id: 'shoe-04', category: 'shoes', sub: '부츠', brand: 'WORK & CO', name: '스웨이드 첼시 부츠', price: 139000, originPrice: 169000, shape: 'boot', color: '#8c6a4f', bg: '#f4eee8', sizes: ['250', '260', '270', '280'], desc: '부드러운 스웨이드 소재의 클래식 첼시 부츠예요.' },
    { id: 'shoe-05', category: 'shoes', sub: '로퍼', brand: 'WORK & CO', name: '페니 로퍼 브라운', price: 109000, shape: 'loafer', color: '#6b4a34', bg: '#f2ece6', sizes: ['250', '260', '270'], desc: '슬랙스와 데님 모두 잘 어울리는 페니 로퍼예요.' },
    { id: 'shoe-06', category: 'shoes', sub: '러닝화', brand: 'COURT ONE', name: '라이트 메쉬 트레이닝화', price: 69000, shape: 'runner', color: '#f2a65a', bg: '#fdf2e6', sizes: ['240', '250', '260', '270', '280'], desc: '통기성이 좋은 메쉬 소재로 가벼운 트레이닝화예요.' },
    { id: 'shoe-07', category: 'shoes', sub: '스니커즈', brand: 'STEP LAB', name: '하이퍼 청키 스니커즈', price: 119000, shape: 'sneaker', color: '#c9c3e6', bg: '#f1effa', tag: 'NEW', sizes: ['240', '250', '260'], desc: '볼륨감 있는 아웃솔로 키높이 효과가 있어요.' },
    { id: 'shoe-08', category: 'shoes', sub: '부츠', brand: 'WORK & CO', name: '레이스업 워커 부츠', price: 159000, shape: 'boot', color: '#3a3330', bg: '#ecebea', sizes: ['260', '270', '280'], desc: '튼튼한 러그솔의 데일리 워커 부츠예요.' },

    // ===== 바지 =====
    { id: 'pants-01', category: 'pants', sub: '데님', brand: 'BLUE MILL', name: '스트레이트 핏 워싱 데님 팬츠', price: 49000, originPrice: 65000, shape: 'pants', color: '#4a6fa5', bg: '#e8eef7', tag: 'BEST', sizes: ['28', '30', '32', '34'], desc: '자연스러운 워싱의 스트레이트 핏 데님이에요.' },
    { id: 'pants-02', category: 'pants', sub: '데님', brand: 'BLUE MILL', name: '와이드 데님 팬츠 라이트블루', price: 55000, shape: 'wide', color: '#8fb0d9', bg: '#ecf2fa', tag: 'NEW', sizes: ['28', '30', '32'], desc: '여유 있는 와이드 핏으로 편안하게 입을 수 있어요.' },
    { id: 'pants-03', category: 'pants', sub: '슬랙스', brand: 'OFFICE MOOD', name: '세미와이드 투턱 슬랙스', price: 45000, originPrice: 59000, shape: 'wide', color: '#4b4f57', bg: '#ececee', sizes: ['28', '30', '32', '34'], desc: '구김이 적은 원단의 투턱 세미와이드 슬랙스예요.' },
    { id: 'pants-04', category: 'pants', sub: '슬랙스', brand: 'OFFICE MOOD', name: '테이퍼드 밴딩 슬랙스 베이지', price: 42000, shape: 'pants', color: '#cdb796', bg: '#f6f1ea', sizes: ['S', 'M', 'L'], desc: '허리 밴딩으로 편하면서도 단정한 슬랙스예요.' },
    { id: 'pants-05', category: 'pants', sub: '카고', brand: 'URBAN LAYER', name: '나일론 카고 조거 팬츠', price: 58000, shape: 'wide', color: '#6e7a5a', bg: '#eef1e8', sizes: ['M', 'L', 'XL'], desc: '가볍고 활동적인 나일론 카고 팬츠예요.' },
    { id: 'pants-06', category: 'pants', sub: '쇼츠', brand: 'DAILY BASIC', name: '코튼 버뮤다 쇼츠', price: 29000, originPrice: 35000, shape: 'shorts', color: '#e7d9bd', bg: '#f8f4ec', sizes: ['M', 'L', 'XL'], desc: '여름에 시원하게 입기 좋은 코튼 쇼츠예요.' },
    { id: 'pants-07', category: 'pants', sub: '쇼츠', brand: 'URBAN LAYER', name: '스웻 하프 팬츠 그레이', price: 25000, shape: 'shorts', color: '#a3a8b0', bg: '#eff0f2', sizes: ['M', 'L', 'XL'], desc: '부드러운 스웻 원단의 데일리 하프 팬츠예요.' },
    { id: 'pants-08', category: 'pants', sub: '카고', brand: 'URBAN LAYER', name: '와이드 카고 팬츠 블랙', price: 62000, shape: 'wide', color: '#2b2d31', bg: '#ececee', tag: 'BEST', sizes: ['28', '30', '32', '34'], desc: '포켓 디테일이 돋보이는 와이드 카고 팬츠예요.' },
  ];

  const CATEGORIES = {
    tops: { label: '옷', href: 'tops.html', eyebrow: '상의 · 아우터', title: '매일 입기 좋은\n옷을 모았어요', desc: '티셔츠부터 아우터까지, 지금 가장 많이 찾는 옷이에요.' },
    shoes: { label: '신발', href: 'shoes.html', eyebrow: '스니커즈 · 부츠 · 로퍼', title: '어디든 편하게\n걸을 수 있는 신발', desc: '데일리 스니커즈부터 포멀한 로퍼까지 준비했어요.' },
    pants: { label: '바지', href: 'pants.html', eyebrow: '데님 · 슬랙스 · 카고', title: '핏이 살아나는\n바지를 찾아보세요', desc: '체형과 스타일에 맞는 바지를 골라보세요.' },
  };

  function renderIllust(product) {
    const stroke = 'rgba(0,0,0,.12)';
    return (
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<g fill="' + product.color + '" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round">' +
      SHAPES[product.shape] +
      '</g></svg>'
    );
  }

  window.Shop = window.Shop || {};
  window.Shop.PRODUCTS = PRODUCTS;
  window.Shop.CATEGORIES = CATEGORIES;
  window.Shop.renderIllust = renderIllust;
  window.Shop.findProduct = function (id) {
    return PRODUCTS.find(function (p) { return p.id === id; });
  };
})();
