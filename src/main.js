/* ===== eggZom :: 부트 / 게임 루프 ===== */
(function (global) {
  'use strict';
  const D = global.ZD, Z = global.ZS, E = global.ZE, R = global.ZR, U = global.ZU, S = Z.S, F = D.Fmt;

  let last = 0, acc = 0, saveAcc = 0;
  const STEP = 1 / 60, MAXSTEP = 0.25;

  function loop(ts) {
    requestAnimationFrame(loop);
    if (!last) { last = ts; return; }
    let dt = (ts - last) / 1000; last = ts;
    if (dt > MAXSTEP) dt = MAXSTEP;            // 탭 복귀 시 폭주 방지

    acc += dt;
    let guard = 0;
    while (acc >= STEP && guard++ < 12) { E.update(STEP); acc -= STEP; }

    R.draw(E.t);
    U.hud();
    U.sync();

    saveAcc += dt;
    if (saveAcc > 10) { saveAcc = 0; Z.save(); }
  }

  /* ---------- 방치 보상 ---------- */
  function offlineReport(lastSeen) {
    const away = (Date.now() - lastSeen) / 1000;
    if (away < 120) return;
    const g = E.offlineGain(away);
    if (g.brains < 1) return;
    S.d.brains += g.brains;
    S.d.stats.brains += g.brains;
    U.modal({
      title: '🌙 자는 동안에도 물어뜯었습니다',
      body: `<p style="text-align:center;font-size:15px;margin:6px 0 14px">
          자리를 비운 시간 <b>${F.time(away)}</b>${away > 12 * 3600 ? ' <span style="color:var(--dim)">(최대 12시간 인정)</span>' : ''}
        </p>
        <div style="text-align:center;font-size:26px;font-weight:800;color:var(--lime)">🧠 +${F.n(g.brains)}</div>
        <p style="text-align:center;color:var(--dim);margin-top:12px">
          방치 효율 <b>${F.pct(g.rate)}</b> · 유전자 <b>🌙 시체 더미</b>로 올릴 수 있습니다.
        </p>`,
      actions: [{ label: '잘 먹었습니다', pri: true }],
    });
  }

  /* ---------- 부트 ---------- */
  function boot() {
    const lastSeen = Z.load();
    E.refresh();
    E.resetField(true);
    R.attach(document.getElementById('cv'));
    U.init();

    // 첫 방문 안내
    if (!lastSeen) {
      S.d.seen.intro = true;
      setTimeout(() => U.helpModal(), 500);
    } else {
      offlineReport(lastSeen);
    }

    document.getElementById('app').hidden = false;
    setTimeout(() => { R.resize(); }, 0);
    setTimeout(() => {
      const b = document.getElementById('boot');
      b.classList.add('gone');
      setTimeout(() => b.remove(), 450);
    }, 420);

    requestAnimationFrame(loop);

    // 탭을 벗어났다 돌아오면 그 사이 시간을 방치로 정산
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { hiddenAt = Date.now(); Z.save(); }
      else if (hiddenAt) {
        last = 0; acc = 0;
        offlineReport(hiddenAt);
        hiddenAt = 0;
        U.rebuild();
      }
    });
    window.addEventListener('beforeunload', Z.save);
    window.addEventListener('blur', Z.save);

    // 단축키
    window.addEventListener('keydown', (e) => {
      if (U.modalOpen()) return;
      if (e.key === '1') E.useSkill('frenzy');
      if (e.key === '2') E.useSkill('plague');
      if (e.key === '3') E.useSkill('embrace');
    });
  }

  /* ---------- 개발용 시뮬레이터 (밸런스 확인) ---------- */
  global.ZDEV = {
    // n초를 즉시 시뮬레이션. 자동 구매 옵션으로 성장 곡선 점검.
    sim(seconds, autobuy) {
      const step = 1 / 30;
      for (let t = 0; t < seconds; t += step) {
        E.update(step);
        if (autobuy && Math.random() < 0.02) ZDEV.autobuy();
      }
      return { wave: S.d.wave, best: S.d.bestWave, brains: F.n(S.d.brains), dps: F.n(E.m.dps) };
    },
    autobuy() {
      // 가장 싼 강화를 계속 산다
      for (let i = 0; i < 60; i++) {
        let best = null, bc = Infinity;
        for (const u of D.UPGRADES) {
          const c = Z.upCost(u, Z.upLv(u.id));
          if (c < bc) { bc = c; best = u; }
        }
        if (!best || S.d.brains < bc) break;
        S.d.brains -= bc; S.d.up[best.id] = Z.upLv(best.id) + 1;
      }
      for (const id in S.d.roster) {
        const u = D.UNITS.find((x) => x.id === id);
        for (let i = 0; i < 40; i++) {
          const c = Z.unitLvCost(u, S.d.roster[id].lv);
          if (S.d.brains < c * 3) break;
          S.d.brains -= c; S.d.roster[id].lv++;
        }
      }
      E.refresh();
    },
    grantRelic(id) { const c = S.d.relics.find((r) => r.id === id); if (c) c.n++; else S.d.relics.push({ id, n: 1 }); E.refresh(); },
    state: S,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
