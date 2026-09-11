/* ===== eggZom :: 외부 일러스트 로더 =====
 * 매니페스트(art/manifest.js)에 적힌 이미지만 불러온다.
 * 없으면 아무것도 로드하지 않고, 렌더러가 코드 드로잉으로 폴백한다.
 * file:// 로 열어도 동작하도록 fetch 대신 <img> 로드만 사용한다.
 */
(function (global) {
  'use strict';

  const DIR = { chibi: 'art/chibi/', bust: 'art/bust/', full: 'art/full/', bg: 'art/bg/' };
  const A = { chibi: {}, bust: {}, full: {}, bg: {}, loaded: 0, pending: 0 };

  function load(kind, key) {
    const img = new Image();
    A.pending++;
    img.onload = () => { A[kind][key] = img; A.loaded++; A.pending--; };
    img.onerror = () => {
      A.pending--;
      console.warn(`[eggZom] 아트 없음: ${DIR[kind]}${key}.png — 매니페스트에서 빼거나 파일을 넣어주세요.`);
    };
    img.src = DIR[kind] + key + '.png';
  }

  A.init = function () {
    const m = global.ZOM_ART;
    if (!m) return;
    for (const kind in DIR) {
      if (!Array.isArray(m[kind])) continue;
      for (const key of m[kind]) load(kind, String(key));
    }
  };

  A.get = function (kind, key) {
    const bag = A[kind];
    return (bag && bag[key]) || null;
  };

  /* 발끝 기준으로 스프라이트를 그린다 (h = 목표 높이, 비율 유지) */
  A.drawFeet = function (c, img, x, y, h, opt) {
    opt = opt || {};
    const w = h * (img.width / img.height);
    c.save();
    c.translate(x, y);
    if (opt.rot) c.rotate(opt.rot);
    c.scale(opt.flip ? -1 : 1, 1);
    if (opt.alpha != null) c.globalAlpha = opt.alpha;
    c.drawImage(img, -w / 2, -h * (opt.sy || 1), w, h * (opt.sy || 1));
    c.restore();
  };

  /* 목표 사각형을 꽉 채우도록(cover) 그린다 */
  A.drawCover = function (c, img, x, y, w, h) {
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s, dh = img.height * s;
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  };

  global.ZA = A;
})(window);
