/* ===== eggZom :: 상태 / 저장 / 스탯 계산 ===== */
(function (global) {
  'use strict';
  const D = global.ZD;
  const SAVE_KEY = 'eggzom.save.v1';

  function freshState() {
    return {
      v: 1,
      brains: 0, bones: 0, genes: 0,
      wave: 1, bestWave: 1, bestWaveEver: 1,
      waveKills: 0,
      bossPhase: false, bossTimer: 0,
      barrier: 100,
      up: {},                       // 강화 레벨
      roster: { mira: { lv: 1, star: 1, shard: 0 } },
      shards: {},                   // 미보유 소녀의 조각
      slots: ['mira', null, null],
      relics: [],                   // [{id, n}]
      gene: {},                     // 유전자 노드 레벨
      skillCd: { frenzy: 0, plague: 0, embrace: 0 },
      skillOn: { frenzy: 0, plague: 0, embrace: 0 },
      autoSkill: true,
      buyMode: 1,                   // 1 | 10 | 'max'
      pending: 0,                   // 미수령 유물 선택 횟수
      seen: {},
      stats: { kills: 0, brains: 0, bosses: 0, runs: 0, play: 0, started: Date.now() },
      lastSeen: Date.now(),
    };
  }

  const S = { d: freshState(), dirty: false };

  /* ---------------- 저장 / 불러오기 ---------------- */
  function save() {
    S.d.lastSeen = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S.d)); } catch (e) { /* 시크릿 모드 등 */ }
  }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return null; }
    if (!raw) return null;
    try {
      const d = JSON.parse(raw);
      if (!d || d.v !== 1) return null;
      S.d = Object.assign(freshState(), d);
      // 중첩 객체 보정
      const f = freshState();
      for (const k of ['up', 'roster', 'shards', 'gene', 'skillCd', 'skillOn', 'stats', 'seen']) {
        S.d[k] = Object.assign(f[k], d[k] || {});
      }
      if (!Array.isArray(S.d.slots)) S.d.slots = f.slots;
      if (!Array.isArray(S.d.relics)) S.d.relics = [];
      return d.lastSeen || null;
    } catch (e) { return null; }
  }
  function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S.d = freshState(); }

  /* ---------------- 헬퍼 ---------------- */
  const zoneIndex = (w) => Math.min(D.ZONES.length - 1, Math.floor((w - 1) / 10));
  const zone = (w) => D.ZONES[zoneIndex(w)];
  const isBossWave = (w) => w % 10 === 0;
  const zoneStart = (w) => Math.floor((w - 1) / 10) * 10 + 1;

  function geneLv(id) { return S.d.gene[id] || 0; }
  function upLv(id) { return S.d.up[id] || 0; }
  function relicCount(id) { const r = S.d.relics.find((x) => x.id === id); return r ? r.n : 0; }

  /* 강화 비용: base * growth^lv */
  function upCost(def, lv) { return Math.ceil(def.base * Math.pow(def.growth, lv)); }
  /* n레벨 묶음 비용 */
  function upCostBulk(def, lv, n) {
    const g = def.growth;
    return Math.ceil(def.base * Math.pow(g, lv) * (Math.pow(g, n) - 1) / (g - 1));
  }
  /* 보유 뇌수로 살 수 있는 최대 레벨 수 */
  function upMaxBuy(def, lv, brains) {
    const g = def.growth, c0 = def.base * Math.pow(g, lv);
    if (brains < c0) return 0;
    const n = Math.floor(Math.log(1 + (brains * (g - 1)) / c0) / Math.log(g));
    return Math.max(0, Math.min(n, 5000));
  }
  function geneCost(def, lv) { return Math.ceil(def.base * Math.pow(def.growth, lv)); }
  function unitLvCost(u, lv) {
    return Math.ceil(30 * D.RARITY[u.rarity].costMul * Math.pow(1.152, lv - 1));
  }

  /* ---------------- 파생 스탯 ---------------- */
  // 모든 보너스를 한 곳에서 합산한다.
  function computeStats() {
    const d = S.d;
    const m = {
      atkFlat: 5, atkMult: 1, aspdMult: 1, critChance: 0.05, critDmg: 1.5,
      barrierFlat: 120, barrierMult: 1, regenFlat: 0, regenPct: 0.012,
      brainMult: 1, boneMult: 1, bossDmg: 1, splashChance: 0, cdr: 0,
      slow: 0, leech: 0, thorns: 0, offline: 0.35, waveCut: 0,
      unitLvMult: 0, desperate: 0, reload: 0, bossTime: 0,
      slots: 3, picks: 3,
    };

    // 1) 강화
    for (const u of D.UPGRADES) {
      const lv = upLv(u.id); if (!lv) continue;
      const v = u.val * lv;
      switch (u.id) {
        case 'atk': m.atkFlat += v; break;
        case 'aspd': m.aspdMult += v / 100; break;
        case 'crit': m.critChance += Math.min(u.cap, v) / 100; break;
        case 'critDmg': m.critDmg += v / 100; break;
        case 'barrier': m.barrierFlat += v; break;
        case 'regen': m.regenFlat += v; break;
        case 'greed': m.brainMult += v / 100; break;
        case 'splash': m.splashChance += Math.min(u.cap, v) / 100; break;
      }
    }

    // 2) 유전자 (영구)
    for (const g of D.GENES) {
      const lv = geneLv(g.id); if (!lv) continue;
      for (const k in g.per) {
        if (k === 'slots' || k === 'picks') m[k] += g.per[k] * lv;
        else m[k] += g.per[k] * lv;
      }
    }

    // 3) 유물 (로그라이크)
    for (const r of d.relics) {
      const def = D.RELICS.find((x) => x.id === r.id); if (!def) continue;
      for (const k in def.mod) m[k] = (m[k] || 0) + def.mod[k] * r.n;
    }

    // 4) 편성된 소녀들의 패시브
    const team = [];
    for (const id of d.slots.slice(0, Math.floor(m.slots))) {
      if (!id || !d.roster[id]) continue;
      const def = D.UNITS.find((u) => u.id === id); if (!def) continue;
      const r = d.roster[id];
      team.push({ def, lv: r.lv, star: r.star });
      const p = def.passive;
      if (p) m[p.key] = (m[p.key] || 0) + p.per * r.lv;
    }

    m.critChance = Math.min(0.95, m.critChance);
    m.splashChance = Math.min(0.95, m.splashChance);
    m.slow = Math.min(0.7, m.slow);
    m.cdr = Math.min(0.75, m.cdr);
    m.offline = Math.min(1, m.offline);
    m.atkMult = Math.max(0.1, m.atkMult);

    // 5) 각 소녀의 실제 공격 수치
    const atkPower = m.atkFlat * m.atkMult;
    m.team = team.map((t) => {
      const lvMul = 1 + (t.lv - 1) * (0.115 + m.unitLvMult);
      const starMul = 1 + (t.star - 1) * 0.25;
      return {
        id: t.def.id, def: t.def, lv: t.lv, star: t.star,
        dmg: atkPower * t.def.dmg * lvMul * starMul,
        interval: t.def.interval / m.aspdMult,
        range: t.def.range,
      };
    });

    m.atkPower = atkPower;
    m.barrierMax = Math.max(10, m.barrierFlat * m.barrierMult);
    m.regen = m.regenFlat + m.barrierMax * m.regenPct;
    m.dps = m.team.reduce((s, t) => s + (t.dmg * (1 + m.critChance * (m.critDmg - 1))) / t.interval, 0);
    return m;
  }

  /* ---------------- 웨이브 수치 ---------------- */
  function enemyHp(w) { return 11 * Math.pow(1.148, w - 1) * (1 + (w - 1) * 0.045); }
  function enemyReward(w) { return 5 * Math.pow(1.142, w - 1) * (1 + (w - 1) * 0.035); }
  function bossHp(w) { return enemyHp(w) * 11; }
  function waveTarget(w, m) { return Math.max(4, 8 + Math.floor(w / 30) - Math.floor(m.waveCut || 0)); }
  function bossTime(m) { return 30 + (m.bossTime || 0); }

  /* 재감염 보상 */
  function genesFor(best) {
    if (best < 25) return 0;
    return Math.floor(3 * Math.pow(best / 10, 1.78));
  }

  global.ZS = {
    S, save, load, wipe, freshState,
    zone, zoneIndex, zoneStart, isBossWave,
    upLv, geneLv, relicCount, upCost, upCostBulk, upMaxBuy, geneCost, unitLvCost,
    computeStats, enemyHp, enemyReward, bossHp, waveTarget, bossTime, genesFor,
  };
})(window);
