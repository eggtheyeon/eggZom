/* ===== eggZom :: 전투 엔진 ===== */
(function (global) {
  'use strict';
  const D = global.ZD, Z = global.ZS, S = Z.S;

  // 가상 해상도
  const W = 960, H = 470;
  const GROUND = 372;          // 지면 y
  const LINE = 300;            // 방벽선 x (적이 여기 닿으면 방벽을 때린다)
  const SPAWN = W + 40;

  const E = {
    W, H, GROUND, LINE,
    enemies: [], shots: [], slashes: [], floats: [], parts: [],
    m: null,                   // 현재 파생 스탯
    t: 0,                      // 누적 시간
    shake: 0, flash: 0, barrierHit: 0,
    lunge: [], spawnTimer: 0, killRate: 0, dpsReal: 0, _dmgAcc: 0, _dmgT: 0,
    paused: false,
    _handlers: {},
  };

  /* ---------- 이벤트 ---------- */
  E.on = (n, f) => { (E._handlers[n] = E._handlers[n] || []).push(f); };
  const emit = (n, a) => { (E._handlers[n] || []).forEach((f) => f(a)); };

  /* ---------- 유틸 ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  function unitSpot(i, total) {
    // 소녀들을 방벽 뒤에 지그재그로 배치
    const cols = [150, 204, 256, 176, 230];
    const rows = [GROUND, GROUND - 30, GROUND, GROUND - 30, GROUND + 16];
    return { x: cols[i % 5], y: rows[i % 5] };
  }
  E.unitSpot = unitSpot;

  /* ---------- 초기화 ---------- */
  E.refresh = function () {
    E.m = Z.computeStats();
    if (S.d.barrier > E.m.barrierMax) S.d.barrier = E.m.barrierMax;
    if (S.d.barrier <= 0) S.d.barrier = E.m.barrierMax;
    E.cooldowns = (E.m.team || []).map(() => Math.random() * 0.4);
  };

  E.resetField = function (fullHeal) {
    E.enemies.length = 0; E.shots.length = 0; E.slashes.length = 0;
    E.spawnTimer = 0.2;
    S.d.waveKills = 0;
    S.d.bossPhase = Z.isBossWave(S.d.wave);
    S.d.bossTimer = S.d.bossPhase ? Z.bossTime(E.m) : 0;
    if (fullHeal) S.d.barrier = E.m.barrierMax;
  };

  /* ---------- 적 생성 ---------- */
  function enemyTypeFor(w) {
    const zi = Z.zoneIndex(w);
    const pool = D.ENEMIES.filter((e) => e.tier <= Math.min(5, zi + 1));
    // 뒤쪽 지역일수록 강한 종류가 자주 나온다
    const weights = pool.map((e) => 1 + e.tier * (0.35 + zi * 0.12));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[0];
  }

  function spawnEnemy(boss) {
    const w = S.d.wave;
    if (boss) {
      const zi = Z.zoneIndex(w);
      E.enemies.push({
        boss: true, name: D.ZONES[zi].boss, type: D.ENEMIES[Math.min(5, zi)],
        x: W - 70, y: GROUND, hp: Z.bossHp(w), max: Z.bossHp(w),
        spd: 42, dmg: 40 + w * 1.6, size: 2.5, hit: 0, atkCd: 0, slowT: 0, seed: Math.random() * 99,
      });
      E.flash = 0.5;
      emit('boss', D.ZONES[zi].boss);
      return;
    }
    const t = enemyTypeFor(w);
    const hp = Z.enemyHp(w) * t.hp;
    E.enemies.push({
      boss: false, name: t.name, type: t,
      x: SPAWN + rnd(0, 120), y: GROUND + rnd(-26, 22),
      hp, max: hp, spd: t.spd * rnd(0.88, 1.12), dmg: t.dmg * (1 + w * 0.035),
      size: t.size, hit: 0, atkCd: 0, slowT: 0, seed: Math.random() * 99,
    });
  }

  /* ---------- 데미지 ---------- */
  function floatText(x, y, txt, color, big) {
    if (E.floats.length > 60) E.floats.shift();
    E.floats.push({ x, y, txt, color, big: !!big, life: big ? 1.1 : 0.8, vy: big ? -46 : -34 });
  }
  function burst(x, y, color, n, spd) {
    if (E.parts.length > 220) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rnd(0.3, 1) * (spd || 130);
      E.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: rnd(0.3, 0.7), color, r: rnd(1.5, 3.5) });
    }
  }

  function damage(en, amount, crit, silent) {
    if (en.dead) return;
    const m = E.m;
    if (en.boss) amount *= m.bossDmg;
    en.hp -= amount;
    en.hit = 0.12;
    E._dmgAcc += amount;
    if (!silent) floatText(en.x, en.y - 34 * en.size, D.Fmt.n(amount), crit ? '#ffcf5c' : '#ffffff', crit);
    if (en.hp <= 0) kill(en);
  }

  function kill(en) {
    if (en.dead) return;
    en.dead = true;
    const m = E.m, w = S.d.wave;
    burst(en.x, en.y - 22 * en.size, '#8bd46a', en.boss ? 34 : 9, en.boss ? 260 : 150);
    burst(en.x, en.y - 22 * en.size, '#ff5470', en.boss ? 22 : 5, en.boss ? 220 : 130);

    // 보상
    let gain = Z.enemyReward(w) * m.brainMult * (en.boss ? 14 : 1);
    S.d.brains += gain;
    S.d.stats.brains += gain;
    S.d.stats.kills++;
    floatText(en.x, en.y - 56 * en.size, '+' + D.Fmt.n(gain) + '🧠', '#b8f06a');

    // 흡혈
    if (m.leech > 0) S.d.barrier = Math.min(m.barrierMax, S.d.barrier + m.barrierMax * m.leech);
    // 즉시 재장전
    if (m.reload > 0 && Math.random() < m.reload && E.cooldowns) {
      for (let i = 0; i < E.cooldowns.length; i++) E.cooldowns[i] = 0;
    }
    // 전염 폭발
    if (m.splashChance > 0 && Math.random() < m.splashChance) {
      const r = 110, dmg = Math.max(en.max * 0.5, m.dps * 0.6);
      E.slashes.push({ x: en.x, y: en.y - 20, r, life: 0.3, kind: 'spore' });
      for (const o of E.enemies) {
        if (o === en || o.dead) continue;
        if (Math.hypot(o.x - en.x, o.y - en.y) < r) damage(o, dmg, false, true);
      }
    }

    if (en.boss) {
      const bones = Math.max(1, Math.floor((6 + Z.zoneIndex(w) * 5) * m.boneMult));
      S.d.bones += bones;
      S.d.stats.bosses++;
      S.d.pending++;
      E.flash = 0.65; E.shake = 14;
      emit('bossDown', { name: en.name, bones });
      advanceWave();
    } else {
      S.d.waveKills++;
      if (S.d.waveKills >= Z.waveTarget(w, m)) advanceWave();
    }
  }

  /* ---------- 웨이브 진행 ---------- */
  function advanceWave() {
    if (E._reset) return;          // 한 프레임에 두 번 넘어가지 않게
    S.d.wave++;
    if (S.d.wave > S.d.bestWave) S.d.bestWave = S.d.wave;
    if (S.d.wave > S.d.bestWaveEver) S.d.bestWaveEver = S.d.wave;
    // 순회 중 배열을 비우면 안 되므로 프레임 끝에서 정리한다
    E._reset = { full: false };
    // 지역 돌파
    if ((S.d.wave - 1) % 10 === 0 && S.d.wave > 1) emit('zone', Z.zone(S.d.wave).name);
    emit('wave', S.d.wave);
  }

  function defeat(reason) {
    const back = Math.max(Z.zoneStart(S.d.wave), S.d.wave - 3);
    S.d.wave = back;
    E._reset = { full: true };
    E.flash = 0.8; E.shake = 18;
    emit('defeat', { reason, wave: back });
  }

  function applyReset() {
    if (!E._reset) return;
    const full = E._reset.full;
    E._reset = null;
    E.resetField(full);
  }

  /* ---------- 스킬 ---------- */
  E.useSkill = function (id) {
    const cd = S.d.skillCd[id] || 0;
    if (cd > 0) return false;
    const def = D.SKILLS.find((s) => s.id === id);
    const m = E.m;
    S.d.skillCd[id] = def.cd * (1 - m.cdr);
    if (def.dur) S.d.skillOn[id] = def.dur;

    if (id === 'plague') {
      const dmg = m.dps * 12 + 30;
      for (const en of E.enemies) if (!en.dead) damage(en, dmg, true);
      E.slashes.push({ x: W / 2, y: GROUND - 60, r: 700, life: 0.5, kind: 'plague' });
      E.shake = 12; E.flash = 0.35;
    } else if (id === 'embrace') {
      S.d.barrier = Math.min(m.barrierMax, S.d.barrier + m.barrierMax * 0.6);
      E.slashes.push({ x: 180, y: GROUND - 40, r: 260, life: 0.6, kind: 'heal' });
    } else if (id === 'frenzy') {
      E.slashes.push({ x: 180, y: GROUND - 40, r: 240, life: 0.5, kind: 'frenzy' });
    }
    emit('skill', id);
    return true;
  };

  function autoSkills() {
    if (!S.d.autoSkill) return;
    const m = E.m;
    if (S.d.skillCd.embrace <= 0 && S.d.barrier < m.barrierMax * 0.45) E.useSkill('embrace');
    if (S.d.skillCd.plague <= 0 && (E.enemies.length >= 5 || (S.d.bossPhase && S.d.bossTimer < 22))) E.useSkill('plague');
    if (S.d.skillCd.frenzy <= 0 && (E.enemies.length >= 3 || S.d.bossPhase)) E.useSkill('frenzy');
  }

  /* ---------- 소녀 공격 ---------- */
  // 사거리는 방벽선(LINE)에서부터 잰다. 가장 앞선(=x가 작은) 적을 노린다.
  function nearestEnemy(range) {
    const reach = LINE + range;
    let best = null, bx = Infinity;
    for (const en of E.enemies) {
      if (en.dead || en.x > reach) continue;
      if (en.x < bx) { bx = en.x; best = en; }
    }
    return best;
  }

  function fire(t, i, spot) {
    const m = E.m;
    const crit = Math.random() < m.critChance;
    let dmg = t.dmg * (crit ? m.critDmg : 1);
    if (m.desperate > 0 && S.d.barrier < m.barrierMax * 0.5) dmg *= 1 + m.desperate;

    const target = nearestEnemy(t.range);
    if (!target) return false;
    const wp = t.def.weapon;

    if (wp === 'claw' || wp === 'shield') {
      damage(target, dmg, crit);
      E.lunge[i] = { t: 0.2, x: target.x - spot.x - 26 };
      E.slashes.push({ x: target.x - 12, y: target.y - 26, r: 34, life: 0.18, kind: 'slash', color: t.def.dress });
      if (t.def.slow) target.slowT = 1.6;
    } else {
      E.shots.push({
        x: spot.x + 16, y: spot.y - 36, tx: target.x, ty: target.y - 24 * target.size,
        target, dmg, crit, kind: wp, color: t.def.dress,
        speed: wp === 'gun' ? 1500 : 620, splash: t.def.splash || 0, slow: t.def.slow || 0, life: 2,
      });
    }
    return true;
  }

  /* ---------- 메인 업데이트 ---------- */
  E.update = function (dt) {
    if (E.paused) return;
    const m = E.m; if (!m) return;
    E.t += dt;
    S.d.stats.play += dt;
    E.shake = Math.max(0, E.shake - dt * 40);
    E.flash = Math.max(0, E.flash - dt * 2.2);
    E.barrierHit = Math.max(0, E.barrierHit - dt * 3);

    // 스킬 타이머
    for (const s of D.SKILLS) {
      if (S.d.skillCd[s.id] > 0) S.d.skillCd[s.id] = Math.max(0, S.d.skillCd[s.id] - dt);
      if (S.d.skillOn[s.id] > 0) S.d.skillOn[s.id] = Math.max(0, S.d.skillOn[s.id] - dt);
    }
    autoSkills();

    const frenzy = S.d.skillOn.frenzy > 0 ? 3 : 1;
    const invuln = S.d.skillOn.embrace > 0;

    // 방벽 재생
    if (S.d.barrier < m.barrierMax) S.d.barrier = Math.min(m.barrierMax, S.d.barrier + m.regen * dt);

    /* --- 스폰 --- */
    const boss = S.d.bossPhase;
    if (boss) {
      if (!E.enemies.some((e) => e.boss && !e.dead)) {
        if (E.spawnTimer <= 0) { spawnEnemy(true); E.spawnTimer = 999; }
        else E.spawnTimer -= dt;
      }
      S.d.bossTimer -= dt;
      if (S.d.bossTimer <= 0) { defeat('보스 격퇴 실패'); applyReset(); return; }
      // 보스전 잡졸
      E.spawnAdd = (E.spawnAdd || 3) - dt;
      if (E.spawnAdd <= 0 && E.enemies.length < 4) { spawnEnemy(false); E.spawnAdd = 4.2; }
    } else {
      E.spawnTimer -= dt;
      // 동시 등장 수를 제한해 '밀려서 전멸'하는 느낌을 줄인다
      const cap = 7;
      const need = Z.waveTarget(S.d.wave, m) - S.d.waveKills;
      if (E.spawnTimer <= 0 && E.enemies.length < Math.min(cap, need)) {
        spawnEnemy(false);
        E.spawnTimer = Math.max(0.34, 0.85 - Z.zoneIndex(S.d.wave) * 0.05);
      }
    }

    /* --- 소녀 공격 --- */
    const team = m.team;
    if (!E.cooldowns || E.cooldowns.length !== team.length) E.cooldowns = team.map(() => 0);
    for (let i = 0; i < team.length; i++) {
      const t = team[i], spot = unitSpot(i, team.length);
      E.cooldowns[i] -= dt * frenzy;
      let guard = 0;
      while (E.cooldowns[i] <= 0 && guard++ < 6) {
        if (!fire(t, i, spot)) { E.cooldowns[i] = 0.1; break; }
        E.cooldowns[i] += t.interval;
      }
    }

    /* --- 투사체 --- */
    for (let i = E.shots.length - 1; i >= 0; i--) {
      const s = E.shots[i];
      if (!s) continue;
      s.life -= dt;
      if (s.target && !s.target.dead) { s.tx = s.target.x; s.ty = s.target.y - 24 * s.target.size; }
      const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy) || 1;
      const step = s.speed * dt;
      if (d <= step || s.life <= 0) {
        if (s.target && !s.target.dead) {
          damage(s.target, s.dmg, s.crit);
          if (s.slow) s.target.slowT = 1.8;
          if (s.splash) {
            E.slashes.push({ x: s.tx, y: s.ty, r: s.splash, life: 0.25, kind: 'boom', color: s.color });
            for (const o of E.enemies) {
              if (o === s.target || o.dead) continue;
              if (Math.hypot(o.x - s.tx, o.y - s.ty) < s.splash) damage(o, s.dmg * 0.55, false, true);
            }
          }
        }
        burst(s.tx, s.ty, s.color, 4, 90);
        E.shots.splice(i, 1);
        continue;
      }
      s.x += (dx / d) * step; s.y += (dy / d) * step;
      s.ang = Math.atan2(dy, dx);
    }

    /* --- 적 이동 / 공격 --- */
    for (let i = E.enemies.length - 1; i >= 0; i--) {
      const en = E.enemies[i];
      if (!en) continue;
      if (en.dead) { E.enemies.splice(i, 1); continue; }
      en.hit = Math.max(0, en.hit - dt);
      if (en.slowT > 0) en.slowT -= dt;
      const slowMul = (1 - m.slow) * (en.slowT > 0 ? 0.55 : 1);
      if (en.x > LINE + en.size * 14) {
        en.x -= en.spd * slowMul * dt;
      } else {
        en.atkCd -= dt;
        if (en.atkCd <= 0) {
          en.atkCd = 1.05;
          if (!invuln) {
            S.d.barrier -= en.dmg;
            E.barrierHit = 1; E.shake = Math.max(E.shake, en.boss ? 9 : 4);
            floatText(LINE - 10, GROUND - 70, '-' + D.Fmt.n(en.dmg), '#ff5470');
          } else {
            floatText(LINE - 10, GROUND - 70, 'BLOCK', '#6fd6ff');
          }
          if (m.thorns > 0) damage(en, m.dps * 0.9 * m.thorns, false, true);
          if (S.d.barrier <= 0) { defeat('방벽 붕괴'); applyReset(); return; }
        }
      }
    }

    /* --- 이펙트 --- */
    for (let i = E.slashes.length - 1; i >= 0; i--) {
      const sl = E.slashes[i]; if (!sl) continue;
      if ((sl.life -= dt) <= 0) E.slashes.splice(i, 1);
    }
    for (let i = E.floats.length - 1; i >= 0; i--) {
      const f = E.floats[i]; if (!f) continue; f.life -= dt; f.y += f.vy * dt; f.vy += 42 * dt;
      if (f.life <= 0) E.floats.splice(i, 1);
    }
    for (let i = E.parts.length - 1; i >= 0; i--) {
      const p = E.parts[i]; if (!p) continue; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt;
      if (p.life <= 0) E.parts.splice(i, 1);
    }

    for (let i = 0; i < E.lunge.length; i++) {
      const l = E.lunge[i];
      if (l && (l.t -= dt) <= 0) E.lunge[i] = null;
    }

    applyReset();

    /* --- 실측 DPS --- */
    E._dmgT += dt;
    if (E._dmgT >= 0.5) { E.dpsReal = E._dmgAcc / E._dmgT; E._dmgAcc = 0; E._dmgT = 0; }
  };

  /* ---------- 방치 보상 ---------- */
  E.offlineGain = function (seconds) {
    const m = Z.computeStats();
    const w = Math.max(1, S.d.wave - 1);
    // 이론 처치 속도 = dps / 평균체력, 상한을 둬서 폭주 방지
    const avgHp = Z.enemyHp(w) * 1.6;
    const kps = Math.min(3.2, m.dps / Math.max(1, avgHp));
    const per = Z.enemyReward(w) * m.brainMult;
    const capped = Math.min(seconds, 12 * 3600);
    const brains = kps * per * capped * m.offline;
    return { brains, seconds: capped, kps, rate: m.offline };
  };

  global.ZE = E;
})(window);
