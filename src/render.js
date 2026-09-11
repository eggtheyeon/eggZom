/* ===== eggZom :: 캔버스 렌더러 (모든 그래픽은 코드로 그림) ===== */
(function (global) {
  'use strict';
  const D = global.ZD, Z = global.ZS, E = global.ZE, S = Z.S;

  const R = {};
  let cv, ctx, DPR = 1, scale = 1, ox = 0, oy = 0, padX = 0, padY = 0;

  R.attach = function (canvas) {
    cv = canvas; ctx = cv.getContext('2d');
    R.resize();
    window.addEventListener('resize', R.resize);
  };

  R.resize = function () {
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(r.width * DPR));
    cv.height = Math.max(1, Math.round(r.height * DPR));
    // 전장 전체(0..W, 0..H)가 항상 보이도록 contain 매핑.
    // 남는 여백(padX/padY)만큼 배경을 더 그려 레터박스를 없앤다.
    const sx = r.width / E.W, sy = r.height / E.H;
    scale = Math.min(sx, sy);
    ox = (r.width - E.W * scale) / 2;
    oy = (r.height - E.H * scale) * 0.6;   // 전장을 살짝 아래로
    padX = ox / scale;
    padY = oy / scale;
  };

  /* ============ 배경 ============ */
  const buildingSeed = [];
  for (let i = 0; i < 90; i++) buildingSeed.push(Math.random());

  function drawBackground(t) {
    const z = Z.zone(S.d.wave);
    const L = -padX, T = -padY, FW = E.W + padX * 2, FH = E.H + padY * 2;
    const g = ctx.createLinearGradient(0, T, 0, E.GROUND + 30);
    g.addColorStop(0, z.sky[0]); g.addColorStop(1, z.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(L, T, FW, FH);

    // 달
    ctx.save();
    ctx.globalAlpha = 0.85;
    const mx = 800, my = 78;
    const mg = ctx.createRadialGradient(mx, my, 6, mx, my, 74);
    mg.addColorStop(0, 'rgba(255,235,210,.5)'); mg.addColorStop(1, 'rgba(255,235,210,0)');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 74, 0, 7); ctx.fill();
    ctx.fillStyle = '#f6e6cf'; ctx.beginPath(); ctx.arc(mx, my, 30, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.07)';
    ctx.beginPath(); ctx.arc(mx - 9, my - 7, 6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 8, my + 6, 8, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 2, my - 14, 4, 0, 7); ctx.fill();
    ctx.restore();

    // 별
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    for (let i = 0; i < 40; i++) {
      const s = buildingSeed[i];
      const x = (s * 960 + i * 23) % 960, y = (s * 175 + i * 7) % 175;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i));
      ctx.globalAlpha = tw * 0.6; ctx.fillRect(x, y, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;

    // 원경 건물 2겹
    for (let layer = 0; layer < 2; layer++) {
      ctx.fillStyle = layer === 0 ? 'rgba(0,0,0,.30)' : 'rgba(0,0,0,.50)';
      const base = E.GROUND - (layer === 0 ? 36 : 5);
      let x = -padX - 40;
      let i = layer * 30;
      while (x < E.W + padX + 40) {
        const s1 = buildingSeed[i % 90], s2 = buildingSeed[(i + 7) % 90];
        const w = 40 + s1 * 70, h = 58 + s2 * (layer === 0 ? 128 : 92);
        ctx.fillRect(x, base - h, w, h);
        // 창문
        if (layer === 1) {
          ctx.save(); ctx.fillStyle = 'rgba(255,196,120,.13)';
          for (let wy = base - h + 12; wy < base - 12; wy += 16) {
            for (let wx = x + 7; wx < x + w - 8; wx += 14) {
              if (((wx + wy + i) | 0) % 5 < 2) ctx.fillRect(wx, wy, 6, 8);
            }
          }
          ctx.restore();
        }
        x += w + 6 + s2 * 16; i++;
      }
    }

    // 지면
    ctx.fillStyle = z.ground;
    ctx.fillRect(L, E.GROUND - 4, FW, FH - (E.GROUND - T) + 4);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(L, E.GROUND - 4, FW, 4);
    // 지면 얼룩
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    for (let i = 0; i < 26; i++) {
      const s = buildingSeed[(i * 3) % 90];
      ctx.beginPath();
      ctx.ellipse(s * 960, E.GROUND + 14 + (i % 5) * 15, 18 + s * 34, 4 + s * 4, 0, 0, 7);
      ctx.fill();
    }
    // 안개
    const fg = ctx.createLinearGradient(0, E.GROUND - 70, 0, E.GROUND + 30);
    fg.addColorStop(0, 'rgba(120,200,150,0)');
    fg.addColorStop(1, 'rgba(120,200,150,.10)');
    ctx.fillStyle = fg; ctx.fillRect(L, E.GROUND - 70, FW, 100);
  }

  /* ============ 방벽 ============ */
  function drawBarrier(t) {
    const m = E.m, x = E.LINE;
    const ratio = Math.max(0, Math.min(1, S.d.barrier / m.barrierMax));
    const inv = S.d.skillOn.embrace > 0;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
    const TOP = E.GROUND - 126;

    ctx.save();

    /* --- 바리케이드: 모래주머니 + 널판 + 뼈 --- */
    ctx.fillStyle = '#3b2d21';
    ctx.fillRect(x - 18, E.GROUND - 74, 11, 78);
    ctx.fillRect(x + 8, E.GROUND - 58, 9, 62);
    ctx.fillStyle = '#503a28';
    for (const [dy, rot] of [[-52, -0.28], [-26, 0.2]]) {
      ctx.save(); ctx.translate(x - 3, E.GROUND + dy); ctx.rotate(rot);
      ctx.beginPath(); ctx.roundRect(-34, -5.5, 68, 11, 2); ctx.fill();
      ctx.restore();
    }
    // 모래주머니
    ctx.fillStyle = '#5d5340';
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 3 - r; i++) {
        const bx = x - 22 + i * 17 + r * 8, by = E.GROUND - 4 - r * 11;
        ctx.beginPath(); ctx.ellipse(bx, by, 9.5, 6, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx - 7, by); ctx.lineTo(bx + 7, by); ctx.stroke();
      }
    }
    // 뼈 장식
    ctx.fillStyle = '#e8e2d2';
    ctx.save(); ctx.translate(x - 30, E.GROUND - 6); ctx.rotate(0.5);
    ctx.beginPath(); ctx.roundRect(-9, -2, 18, 4, 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-9, 0, 3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(9, 0, 3, 0, 7); ctx.fill();
    ctx.restore();
    // 해골
    ctx.beginPath(); ctx.arc(x + 22, E.GROUND - 3, 6, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a2233';
    ctx.beginPath(); ctx.arc(x + 20, E.GROUND - 4, 1.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 24.5, E.GROUND - 4, 1.6, 0, 7); ctx.fill();

    /* --- 에너지 실드: 위로 갈수록 옅어지는 곡면 --- */
    const col = inv ? [111, 214, 255] : E.barrierHit > 0.15 ? [255, 84, 112] : [124, 186, 255];
    const alpha = (inv ? 0.5 : 0.10 + 0.22 * ratio) + E.barrierHit * 0.4;
    const bulge = 16 + pulse * 3;
    const height = (E.GROUND - TOP) * (0.45 + 0.55 * ratio);
    const top = E.GROUND - height;

    ctx.beginPath();
    ctx.moveTo(x + 2, E.GROUND + 4);
    ctx.quadraticCurveTo(x + 2 + bulge, E.GROUND - height * 0.5, x + 2, top);
    ctx.quadraticCurveTo(x + 2 - bulge * 0.45, E.GROUND - height * 0.5, x + 2, E.GROUND + 4);
    ctx.closePath();
    const sg = ctx.createLinearGradient(0, E.GROUND, 0, top);
    sg.addColorStop(0, `rgba(${col},${alpha * 1.25})`);
    sg.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = sg; ctx.fill();

    // 육각 격자
    ctx.save(); ctx.clip();
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = `rgba(${col},.8)`; ctx.lineWidth = 0.8;
    for (let yy = E.GROUND; yy > top; yy -= 13) {
      ctx.beginPath(); ctx.moveTo(x - 20, yy); ctx.lineTo(x + 26, yy); ctx.stroke();
    }
    ctx.restore();

    // 앞면 테두리
    ctx.globalAlpha = Math.min(1, alpha + 0.18);
    ctx.strokeStyle = `rgba(${col},.95)`; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, E.GROUND + 4);
    ctx.quadraticCurveTo(x + 2 + bulge, E.GROUND - height * 0.5, x + 2, top);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ============ 미소녀 좀비 ============ */
  // (x,y)=발 끝, s=크기(1 ≈ 키 72px)
  function drawGirl(c, x, y, u, t, s, opt) {
    opt = opt || {}; s = s || 1;
    const seed = ((u.id || 'x').charCodeAt(0) % 17) * 0.7;
    const bob = opt.still ? 0 : Math.sin(t * 2.3 + seed) * 1.6 * s;
    const sway = opt.still ? 0 : Math.sin(t * 1.1 + seed) * 0.025;
    const atk = opt.atk || 0;
    const skin = u.skin, skinD = shade(u.skin, -0.14);
    const hair = u.hair, hairD = u.hairDark;
    const HEADY = -50, HR = 19;

    c.save();
    c.translate(x, y + bob);
    c.scale(s, s);
    if (!opt.noShadow) {
      c.fillStyle = 'rgba(0,0,0,.38)';
      c.beginPath(); c.ellipse(0, 2, 15, 4.5, 0, 0, 7); c.fill();
    }
    c.rotate(sway + atk * 0.05);

    /* ===== 뒷머리 (몸을 덮지 않도록 좁고 짧게) ===== */
    c.fillStyle = hairD;
    if (u.style === 'long' || u.style === 'wavy') {
      c.beginPath();
      c.moveTo(-HR + 1, HEADY - 2);
      c.quadraticCurveTo(-HR - 2.5, HEADY + 12, -13, HEADY + 27);
      c.quadraticCurveTo(0, HEADY + 32, 13, HEADY + 27);
      c.quadraticCurveTo(HR + 2.5, HEADY + 12, HR - 1, HEADY - 2);
      c.closePath(); c.fill();
    } else {
      c.beginPath(); c.arc(0, HEADY + 1, HR + 2, 0, 7); c.fill();
    }
    if (u.style === 'twin') {         // 트윈테일은 뒤쪽 볼륨을 먼저
      for (const sx of [-1, 1]) {
        c.save();
        c.translate(sx * (HR + 1), HEADY + 3);
        c.rotate(sx * (0.22 + Math.sin(t * 2 + seed) * 0.07));
        c.fillStyle = hairD;
        c.beginPath(); c.ellipse(sx * 2, 15, 5.6, 16, 0, 0, 7); c.fill();
        c.restore();
      }
    } else if (u.style === 'pony') {
      c.save();
      c.translate(-HR + 3, HEADY - 3);
      c.rotate(-0.35 + Math.sin(t * 2.2 + seed) * 0.09);
      c.fillStyle = hairD;
      c.beginPath(); c.ellipse(-7, 14, 5.2, 17, 0.22, 0, 7); c.fill();
      c.restore();
    }

    /* ===== 다리 ===== */
    const swing = opt.still ? 0 : Math.sin(t * 2.3 + seed) * 1.1;
    c.fillStyle = skin;                            // 허벅지
    c.beginPath(); c.roundRect(-7.5, -17, 6, 9, 3); c.fill();
    c.beginPath(); c.roundRect(1.5, -17, 6, 9, 3); c.fill();
    c.fillStyle = '#f2ecfb';                       // 니삭스
    c.beginPath(); c.roundRect(-7.5, -10, 6, 8 + swing, 3); c.fill();
    c.beginPath(); c.roundRect(1.5, -10, 6, 8 - swing, 3); c.fill();
    c.fillStyle = u.dress;
    c.fillRect(-7.5, -10, 6, 1.6); c.fillRect(1.5, -10, 6, 1.6);
    c.fillStyle = '#171222';                       // 구두
    c.beginPath(); c.roundRect(-8.6, -3.8 + swing, 8.4, 4.4, 2); c.fill();
    c.beginPath(); c.roundRect(0.6, -3.8 - swing, 8.4, 4.4, 2); c.fill();

    /* ===== 상의 ===== */
    c.fillStyle = '#f6f1fc';
    c.beginPath(); c.roundRect(-9.5, -34, 19, 17, 6); c.fill();
    c.fillStyle = 'rgba(120,140,180,.16)';         // 옷 그늘
    c.beginPath(); c.roundRect(-9.5, -34, 6, 17, 6); c.fill();
    // 세일러 칼라
    c.fillStyle = u.dress;
    c.beginPath();
    c.moveTo(-9.5, -33.5); c.lineTo(-3, -33.5); c.lineTo(0, -28.5); c.lineTo(3, -33.5); c.lineTo(9.5, -33.5);
    c.lineTo(9.5, -30); c.lineTo(0, -25.5); c.lineTo(-9.5, -30);
    c.closePath(); c.fill();
    // 리본
    c.fillStyle = shade(u.dress, -0.2);
    c.beginPath(); c.moveTo(0, -28); c.lineTo(-5, -31); c.lineTo(-5, -25.5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, -28); c.lineTo(5, -31); c.lineTo(5, -25.5); c.closePath(); c.fill();
    c.beginPath(); c.arc(0, -28.2, 1.7, 0, 7); c.fill();
    // 꿰맨 자국(작게)
    c.strokeStyle = 'rgba(110,90,140,.35)'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-4.5, -21.5); c.lineTo(4.5, -21.5); c.stroke();
    for (let i = -3; i <= 3; i += 3) { c.beginPath(); c.moveTo(i, -23); c.lineTo(i, -20); c.stroke(); }

    /* ===== 치마 ===== */
    c.fillStyle = u.dress;
    c.beginPath();
    c.moveTo(-9.8, -22); c.lineTo(9.8, -22);
    c.lineTo(15, -12); c.lineTo(11, -13.4); c.lineTo(6, -11.6);
    c.lineTo(0, -13.4); c.lineTo(-6, -11.6); c.lineTo(-11, -13.4); c.lineTo(-15, -12);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,.16)';
    for (let i = -2; i <= 2; i++) c.fillRect(i * 5.2 - 0.5, -21.5, 1, 9);

    /* ===== 뒷팔 ===== */
    c.save();
    c.translate(-8.5, -29); c.rotate(0.62 + atk * 0.35);
    c.fillStyle = skinD; c.beginPath(); c.roundRect(-10, -2.6, 11, 5.2, 2.6); c.fill();
    c.beginPath(); c.arc(-10, 0, 2.9, 0, 7); c.fill();
    c.restore();

    /* ===== 앞팔 + 무기 ===== */
    c.save();
    c.translate(8.5, -29); c.rotate(0.42 - atk * 1.15);
    c.fillStyle = skin; c.beginPath(); c.roundRect(-1, -2.8, 11.5, 5.6, 2.8); c.fill();
    if (u.id === 'haru' || u.id === 'mira') {       // 붕대
      c.fillStyle = 'rgba(245,240,230,.85)';
      c.fillRect(2.5, -2.8, 2.6, 5.6); c.fillRect(6.5, -2.8, 2.2, 5.6);
    }
    c.fillStyle = skinD; c.beginPath(); c.arc(10.5, 0, 3.1, 0, 7); c.fill();
    drawWeapon(c, u, 13, 0, atk);
    c.restore();

    /* ===== 머리 ===== */
    c.fillStyle = skin;
    c.beginPath(); c.ellipse(0, HEADY, HR, HR * 0.98, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(110,150,105,.16)';
    c.beginPath(); c.ellipse(0, HEADY + 9, HR * 0.72, 6.5, 0, 0, 7); c.fill();

    // 눈
    const blink = Math.max(0, Math.sin(t * 0.9 + seed * 3) - 0.962) > 0 ? 0.1 : 1;
    drawEye(c, -7.2, HEADY + 2.5, u.eye, blink);
    drawEye(c, 7.2, HEADY + 2.5, u.eye, blink);
    // 눈썹
    c.strokeStyle = hairD; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-11.5, HEADY - 6.5); c.lineTo(-4, HEADY - 8); c.stroke();
    c.beginPath(); c.moveTo(11.5, HEADY - 6.5); c.lineTo(4, HEADY - 8); c.stroke();
    // 볼터치
    c.fillStyle = 'rgba(255,120,160,.45)';
    c.beginPath(); c.ellipse(-12.5, HEADY + 6.5, 4.2, 2.5, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(12.5, HEADY + 6.5, 4.2, 2.5, 0, 0, 7); c.fill();
    // 입 + 송곳니
    c.fillStyle = '#7a2340';
    c.beginPath(); c.ellipse(0, HEADY + 12, 2.4, atk > 0.25 ? 2.9 : 1.4, 0, 0, 7); c.fill();
    c.fillStyle = '#fff';
    c.beginPath(); c.moveTo(-2, HEADY + 11); c.lineTo(-0.8, HEADY + 14); c.lineTo(0.3, HEADY + 11); c.closePath(); c.fill();
    // 뺨의 꿰맨 자국
    c.strokeStyle = 'rgba(95,65,95,.5)'; c.lineWidth = 0.85;
    c.beginPath(); c.moveTo(9.5, HEADY + 9.5); c.lineTo(14.5, HEADY + 13); c.stroke();
    c.beginPath(); c.moveTo(10.8, HEADY + 12.4); c.lineTo(13.2, HEADY + 10); c.stroke();

    /* ===== 앞머리 ===== */
    c.fillStyle = hair;
    c.beginPath();
    c.moveTo(-HR - 0.5, HEADY + 4);
    c.quadraticCurveTo(-HR - 1, HEADY - HR - 2, 0, HEADY - HR - 1.5);
    c.quadraticCurveTo(HR + 1, HEADY - HR - 2, HR + 0.5, HEADY + 4);
    c.lineTo(HR - 2.5, HEADY + 2.5);
    c.quadraticCurveTo(12, HEADY - 11, 5, HEADY - 6);
    c.quadraticCurveTo(-1, HEADY - 13, -7, HEADY - 5);
    c.quadraticCurveTo(-12.5, HEADY - 12, -HR + 2.5, HEADY + 2.5);
    c.closePath(); c.fill();
    // 하이라이트
    c.fillStyle = 'rgba(255,255,255,.22)';
    c.beginPath(); c.ellipse(-6, HEADY - 12, 7, 2.6, -0.25, 0, 7); c.fill();
    // 아호게
    c.strokeStyle = hair; c.lineWidth = 2.1; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(1, HEADY - HR);
    c.quadraticCurveTo(4.5 + Math.sin(t * 3 + seed) * 2.6, HEADY - HR - 9, -1.5, HEADY - HR - 12);
    c.stroke();

    /* ===== 스타일별 앞쪽 머리 ===== */
    if (u.style === 'twin') {
      for (const sx of [-1, 1]) {
        c.save();
        c.translate(sx * (HR + 1), HEADY + 3);
        c.rotate(sx * (0.22 + Math.sin(t * 2 + seed) * 0.07));
        c.fillStyle = hair;
        c.beginPath(); c.ellipse(sx * 1, 12, 4.8, 13, 0, 0, 7); c.fill();
        c.fillStyle = u.dress;
        c.beginPath(); c.ellipse(sx * -1, -3, 4.2, 2.9, 0, 0, 7); c.fill();
        c.restore();
      }
    } else if (u.style === 'bob') {
      c.fillStyle = hair;
      c.beginPath(); c.ellipse(-HR + 1.5, HEADY + 5, 4.6, 9.5, 0.18, 0, 7); c.fill();
      c.beginPath(); c.ellipse(HR - 1.5, HEADY + 5, 4.6, 9.5, -0.18, 0, 7); c.fill();
    } else if (u.style === 'wavy') {
      c.fillStyle = hair;
      for (const sx of [-1, 1]) {
        c.beginPath();
        c.moveTo(sx * (HR - 2.5), HEADY - 1);
        c.quadraticCurveTo(sx * (HR + 3), HEADY + 12, sx * (HR - 4), HEADY + 22);
        c.quadraticCurveTo(sx * (HR + 2), HEADY + 29, sx * (HR - 7), HEADY + 33);
        c.quadraticCurveTo(sx * (HR - 3), HEADY + 16, sx * (HR - 7), HEADY - 1);
        c.closePath(); c.fill();
      }
    } else if (u.style === 'long') {
      c.fillStyle = hair;
      for (const sx of [-1, 1]) {
        c.beginPath();
        c.moveTo(sx * (HR - 1.5), HEADY - 2);
        c.quadraticCurveTo(sx * (HR + 1.5), HEADY + 14, sx * (HR - 3.5), HEADY + 28);
        c.quadraticCurveTo(sx * (HR - 8), HEADY + 14, sx * (HR - 7), HEADY - 2);
        c.closePath(); c.fill();
      }
    }

    if (u.ears) {
      for (const sx of [-1, 1]) {
        c.fillStyle = hair;
        c.beginPath();
        c.moveTo(sx * 6, HEADY - HR + 2); c.lineTo(sx * 12, HEADY - HR - 11); c.lineTo(sx * 16.5, HEADY - HR + 3.5);
        c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,150,180,.8)';
        c.beginPath();
        c.moveTo(sx * 9, HEADY - HR + 1); c.lineTo(sx * 12, HEADY - HR - 6.5); c.lineTo(sx * 14.2, HEADY - HR + 1.5);
        c.closePath(); c.fill();
      }
    }
    if (u.halo) {
      c.strokeStyle = 'rgba(255,207,92,.95)'; c.lineWidth = 2.2;
      c.beginPath(); c.ellipse(0, HEADY - HR - 11 + Math.sin(t * 2) * 1.4, 11, 3.2, 0, 0, 7); c.stroke();
    }
    c.restore();
  }

  function drawEye(c, x, y, col, open) {
    c.save(); c.translate(x, y); c.scale(1, open);
    c.fillStyle = '#fffdf8';
    c.beginPath(); c.ellipse(0, 0, 4.6, 5.6, 0, 0, 7); c.fill();
    c.fillStyle = col;
    c.beginPath(); c.ellipse(0, 0.6, 3.4, 4.4, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(0,0,0,.55)';
    c.beginPath(); c.ellipse(0, 1, 1.8, 2.6, 0, 0, 7); c.fill();
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(-1.5, -1.8, 1.5, 0, 7); c.fill();
    c.beginPath(); c.arc(1.4, 2, 0.8, 0, 7); c.fill();
    c.restore();
  }

  function drawWeapon(c, u, x, y, atk) {
    const w = u.weapon;
    if (w === 'claw') {
      c.strokeStyle = '#e9e4d6'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        c.beginPath(); c.moveTo(x - 3, y + i * 2.2); c.lineTo(x + 4, y + i * 3.4); c.stroke();
      }
    } else if (w === 'gun') {
      c.fillStyle = '#2f2a3a'; c.beginPath(); c.roundRect(x - 4, y - 2.2, 14, 4.4, 1.5); c.fill();
      c.fillStyle = '#4a4358'; c.beginPath(); c.roundRect(x - 1, y - 4.2, 6, 2.4, 1); c.fill();
      c.fillStyle = u.dress; c.beginPath(); c.arc(x + 9, y, 1.5, 0, 7); c.fill();
      if (atk > 0.4) {
        c.fillStyle = 'rgba(255,220,120,.9)';
        c.beginPath(); c.arc(x + 11, y, 3.4 * atk, 0, 7); c.fill();
      }
    } else if (w === 'wand') {
      c.strokeStyle = '#6b5a45'; c.lineWidth = 1.9;
      c.beginPath(); c.moveTo(x - 5, y + 4); c.lineTo(x + 4, y - 6); c.stroke();
      const gl = 2.8 + atk * 2.6;
      c.fillStyle = u.dress;
      c.beginPath(); c.arc(x + 5, y - 7.5, gl, 0, 7); c.fill();
      c.globalAlpha = 0.35; c.beginPath(); c.arc(x + 5, y - 7.5, gl * 2, 0, 7); c.fill(); c.globalAlpha = 1;
    } else if (w === 'shield') {
      c.fillStyle = '#8d99b5';
      c.beginPath(); c.moveTo(x - 4, y - 9); c.lineTo(x + 5, y - 6.5); c.lineTo(x + 5, y + 5.5); c.lineTo(x - 4, y + 9);
      c.closePath(); c.fill();
      c.fillStyle = u.dress;
      c.beginPath(); c.arc(x + 0.5, y, 2.6, 0, 7); c.fill();
    }
  }
  R.drawGirl = drawGirl;

  /* ============ 적 ============ */
  function drawEnemy(en, t) {
    const s = en.size, x = en.x, y = en.y;
    const walk = Math.sin(t * 5 + en.seed) * (en.boss ? 2 : 3);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(0, 2, 13 * s, 4.5 * s, 0, 0, 7); ctx.fill();
    ctx.scale(-s, s); // 왼쪽을 바라봄

    if (en.hit > 0) ctx.globalAlpha = 0.92;
    const body = en.hit > 0 ? '#ffffff' : en.type.color;
    const dark = en.hit > 0 ? '#ffffff' : shade(en.type.color, -0.35);

    if (en.type.id === 'drone') {
      const hover = Math.sin(t * 6 + en.seed) * 3;
      ctx.translate(0, -34 + hover);
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.ellipse(0, -2, 10, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#ff5470';
      ctx.beginPath(); ctx.arc(-7, 0, 2.4, 0, 7); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 2;
      for (const sx of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(sx * 9, -3); ctx.lineTo(sx * 15, -9); ctx.stroke();
        ctx.globalAlpha *= 0.4;
        ctx.beginPath(); ctx.ellipse(sx * 15, -10, 8, 2, 0, 0, 7); ctx.fill();
        ctx.globalAlpha /= 0.4;
      }
    } else {
      // 다리
      ctx.fillStyle = dark;
      ctx.fillRect(-6, -16, 5, 16 + walk * 0.4);
      ctx.fillRect(2, -16, 5, 16 - walk * 0.4);
      // 몸통
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.roundRect(-9, -36, 18, 22, 4); ctx.fill();
      // 팔 (총/무기 겨눔)
      ctx.fillStyle = dark;
      ctx.save(); ctx.translate(-8, -31); ctx.rotate(-0.15 + Math.sin(t * 5 + en.seed) * 0.1);
      ctx.beginPath(); ctx.roundRect(-14, -2.5, 15, 5, 2.5); ctx.fill();
      ctx.restore();
      // 머리
      ctx.fillStyle = '#e4c8a8';
      ctx.beginPath(); ctx.arc(0, -43, 8, 0, 7); ctx.fill();
      ctx.fillStyle = dark;
      if (en.type.id === 'militia' || en.type.id === 'mech') {
        ctx.beginPath(); ctx.arc(0, -45, 8.6, Math.PI, 0); ctx.fill();
      } else if (en.type.id === 'hazmat') {
        ctx.fillStyle = '#f2ec8a';
        ctx.beginPath(); ctx.arc(0, -43, 9, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(40,60,70,.8)';
        ctx.beginPath(); ctx.ellipse(-2.5, -43, 5, 4, 0, 0, 7); ctx.fill();
      } else {
        ctx.fillRect(-9, -50, 18, 4);  // 모자챙
        ctx.beginPath(); ctx.arc(0, -47, 7.5, Math.PI, 0); ctx.fill();
      }
      // 눈
      if (en.type.id !== 'hazmat') {
        ctx.fillStyle = '#3b2a20';
        ctx.beginPath(); ctx.arc(-4, -42, 1.5, 0, 7); ctx.fill();
      }
      // 무기
      ctx.fillStyle = '#2b2733';
      ctx.beginPath(); ctx.roundRect(-24, -33, 16, 3.6, 1.5); ctx.fill();
    }

    if (en.boss) {
      // 보스 왕관
      ctx.fillStyle = '#ffcf5c';
      ctx.beginPath();
      ctx.moveTo(-9, -52); ctx.lineTo(-9, -60); ctx.lineTo(-4.5, -55); ctx.lineTo(0, -62);
      ctx.lineTo(4.5, -55); ctx.lineTo(9, -60); ctx.lineTo(9, -52);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // HP 바
    if (en.hp < en.max - 0.001 || en.boss) {
      const w = en.boss ? 120 : 34, h = en.boss ? 7 : 4;
      const cx2 = Math.min(E.W - w / 2 - 6, Math.max(w / 2 + 6, x));
      const bx = cx2 - w / 2, by = y - (en.boss ? 82 : 58) * s;
      ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(bx - 1, by - 1, w + 2, h + 2);
      ctx.fillStyle = en.boss ? '#ff5470' : '#c0e050';
      ctx.fillRect(bx, by, w * Math.max(0, en.hp / en.max), h);
      if (en.boss) {
        ctx.fillStyle = '#ffd7e0'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('👑 ' + en.name, cx2, by - 7);
      }
    }
  }

  /* ============ 이펙트 ============ */
  function drawEffects(t) {
    // 투사체
    for (const s of E.shots) {
      ctx.save(); ctx.translate(s.x, s.y);
      if (s.kind === 'gun') {
        ctx.rotate(s.ang || 0);
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath(); ctx.roundRect(-9, -1.4, 18, 2.8, 1.4); ctx.fill();
        ctx.globalAlpha = 0.4; ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.roundRect(-18, -2.6, 22, 5.2, 2.6); ctx.fill();
      } else {
        const p = 2.5 + Math.sin(t * 14) * 0.7;
        ctx.globalAlpha = 0.35; ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.arc(0, 0, 9 + p, 0, 7); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-1, -1, 1.8, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    // 원형/베기 이펙트
    for (const sl of E.slashes) {
      const k = sl.life / (sl.kind === 'slash' ? 0.18 : sl.kind === 'boom' ? 0.25 : 0.5);
      ctx.save();
      if (sl.kind === 'slash') {
        ctx.translate(sl.x, sl.y); ctx.globalAlpha = k;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0, sl.r * (1.3 - k * 0.3), -0.9, 0.9); ctx.stroke();
        ctx.strokeStyle = sl.color || '#ff7aa8'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(0, 0, sl.r * (1.3 - k * 0.3) + 4, -0.9, 0.9); ctx.stroke();
      } else if (sl.kind === 'boom' || sl.kind === 'spore') {
        ctx.globalAlpha = k * 0.75;
        const r = sl.r * (1.5 - k * 0.5);
        const g2 = ctx.createRadialGradient(sl.x, sl.y, 0, sl.x, sl.y, r);
        const c0 = sl.kind === 'spore' ? '141,214,106' : '255,140,190';
        g2.addColorStop(0, `rgba(${c0},.95)`); g2.addColorStop(1, `rgba(${c0},0)`);
        ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(sl.x, sl.y, r, 0, 7); ctx.fill();
      } else if (sl.kind === 'plague') {
        ctx.globalAlpha = k * 0.5;
        ctx.fillStyle = '#6bd45a';
        ctx.fillRect(-padX, -padY, E.W + padX * 2, E.H + padY * 2);
        ctx.globalAlpha = k;
        ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#eaffe0';
        ctx.fillText('☠️ 역병 구름', E.W / 2, 150);
      } else if (sl.kind === 'heal' || sl.kind === 'frenzy') {
        ctx.globalAlpha = k * 0.8;
        const col = sl.kind === 'heal' ? '125,240,180' : '255,122,168';
        ctx.strokeStyle = `rgba(${col},1)`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(sl.x, sl.y, sl.r * (1.2 - k), 0, 7); ctx.stroke();
      }
      ctx.restore();
    }

    // 파티클
    for (const p of E.parts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 데미지 숫자
    ctx.textAlign = 'center';
    for (const f of E.floats) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.6));
      ctx.font = `bold ${f.big ? 21 : 15}px sans-serif`;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.strokeText(f.txt, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.txt, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  /* ============ 프레임 ============ */
  R.draw = function (t) {
    if (!ctx) return;
    const r = cv.getBoundingClientRect();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.save();
    const sh = E.shake;
    ctx.translate(ox + (sh ? (Math.random() - 0.5) * sh : 0), oy + (sh ? (Math.random() - 0.5) * sh : 0));
    ctx.scale(scale, scale);

    drawBackground(t);
    drawBarrier(t);

    // 소녀들 (뒤→앞)
    const team = E.m ? E.m.team : [];
    const order = team.map((_, i) => i).sort((a, b) => E.unitSpot(a).y - E.unitSpot(b).y);
    for (const i of order) {
      const t2 = team[i], spot = E.unitSpot(i, team.length);
      const cd = E.cooldowns ? E.cooldowns[i] : 0;
      const atk = Math.max(0, Math.min(1, 1 - cd / 0.22));
      const l = E.lunge[i];
      const dash = l ? Math.sin((l.t / 0.2) * Math.PI) * l.x * 0.55 : 0;
      drawGirl(ctx, spot.x + dash, spot.y, t2.def, t, 1.2, { atk });
      // 별 표시
      if (t2.star > 1) {
        ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffcf5c';
        ctx.fillText('★'.repeat(Math.min(5, t2.star)), spot.x, spot.y + 14);
      }
    }
    if (!team.length) {
      ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff7aa8';
      ctx.fillText('부대 탭에서 좀비 소녀를 편성하세요!', E.W / 2, 200);
    }

    // 적 (뒤→앞)
    const es = E.enemies.slice().sort((a, b) => a.y - b.y);
    for (const en of es) drawEnemy(en, t);

    drawEffects(t);

    // 화면 플래시
    if (E.flash > 0) {
      ctx.globalAlpha = E.flash * 0.4;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-padX, -padY, E.W + padX * 2, E.H + padY * 2);
      ctx.globalAlpha = 1;
    }
    // 비네트
    const vg = ctx.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.38, E.W / 2, E.H / 2, E.H * 1.05);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = vg; ctx.fillRect(-padX, -padY, E.W + padX * 2, E.H + padY * 2);

    ctx.restore();
  };

  /* ---------- 색 보정 ---------- */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
    else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }

  global.ZR = R;
})(window);
