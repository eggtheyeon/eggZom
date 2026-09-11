/* ===== eggZom :: 게임 데이터 정의 ===== */
(function (global) {
  'use strict';

  /* ---------------- 지역 ---------------- */
  // 10웨이브 = 1지역. 마지막 웨이브는 보스.
  const ZONES = [
    { name: '폐교',       sky: ['#2b1b3d', '#160f24'], ground: '#241a33', boss: '학생회장 좀비' },
    { name: '시장통',     sky: ['#3d2418', '#1d1210'], ground: '#33241a', boss: '정육점 주인' },
    { name: '지하철',     sky: ['#16232e', '#0c141b'], ground: '#1b2a33', boss: '기관사 유령' },
    { name: '종합병원',   sky: ['#1f3330', '#10201d'], ground: '#1d322c', boss: '수간호사 M' },
    { name: '군 기지',    sky: ['#2c3124', '#151a12'], ground: '#2a3020', boss: '강화복 대령' },
    { name: '연구소',     sky: ['#20223f', '#101024'], ground: '#232546', boss: '0번 실험체' },
    { name: '방송국',     sky: ['#3a1d33', '#1d0f1b'], ground: '#331a2c', boss: '생방송 앵커' },
    { name: '항구',       sky: ['#18303f', '#0c1a24'], ground: '#1a2c3a', boss: '심해 작업반장' },
    { name: '국제공항',   sky: ['#2a2438', '#141020'], ground: '#282038', boss: '관제탑 AI' },
    { name: '수도 서울',  sky: ['#3f1a24', '#1f0c12'], ground: '#38181f', boss: '최후의 대통령' },
  ];

  /* ---------------- 적 종류 ---------------- */
  const ENEMIES = [
    { id: 'survivor', name: '생존자',   hp: 1.0,  spd: 96, dmg: 4,  size: 1.0, color: '#c9b79a', tier: 0 },
    { id: 'looter',   name: '약탈자',   hp: 1.35, spd: 124, dmg: 6,  size: 1.05, color: '#a98d6a', tier: 1 },
    { id: 'militia',  name: '자경단원', hp: 2.1,  spd: 78, dmg: 10, size: 1.15, color: '#7f8c6a', tier: 2 },
    { id: 'drone',    name: '방역 드론', hp: 1.5,  spd: 168, dmg: 7, size: 0.85, color: '#7fb6d6', tier: 3 },
    { id: 'hazmat',   name: '방역병',   hp: 3.0,  spd: 66, dmg: 14, size: 1.2, color: '#d8d264', tier: 4 },
    { id: 'mech',     name: '강화 보병', hp: 4.4,  spd: 58, dmg: 20, size: 1.32, color: '#9aa4b8', tier: 5 },
  ];

  /* ---------------- 좀비 소녀 ---------------- */
  // dmg/interval = 기본 DPS 계수. passive는 레벨당 팀 전체 보너스.
  const UNITS = [
    {
      id: 'mira', name: '미라', title: '0번째 감염자', rarity: 'R', role: '근접',
      hair: '#ff9ec2', hairDark: '#e0709c', eye: '#ff4d79', dress: '#ff7aa8', skin: '#d7ecc9',
      style: 'twin', weapon: 'claw',
      dmg: 1.0, interval: 0.85, range: 80,
      passive: { key: 'atkMult', per: 0.010, label: '팀 공격력 +1.0%' },
      desc: '가장 먼저 눈을 뜬 소녀. 균형 잡힌 근접 딜러.',
    },
    {
      id: 'ruby', name: '루비', title: '피의 저격수', rarity: 'SR', role: '원거리',
      hair: '#ff6b5c', hairDark: '#c94434', eye: '#ffd34d', dress: '#e04a3c', skin: '#dceccb',
      style: 'long', weapon: 'gun',
      dmg: 1.85, interval: 1.55, range: 560,
      passive: { key: 'critChance', per: 0.004, label: '치명타 확률 +0.4%p' },
      desc: '숨이 멎어도 조준선은 흔들리지 않는다. 한 방이 무겁다.',
    },
    {
      id: 'neko', name: '네코', title: '발톱의 속삭임', rarity: 'R', role: '연타',
      hair: '#ffe07a', hairDark: '#d9b63f', eye: '#7df0b4', dress: '#f0c64a', skin: '#d7ecc9',
      style: 'bob', weapon: 'claw', ears: true,
      dmg: 0.42, interval: 0.28, range: 64,
      passive: { key: 'aspdMult', per: 0.008, label: '팀 공격속도 +0.8%' },
      desc: '고양이 귀는 장식이 아니라 변이다. 무지막지한 연타.',
    },
    {
      id: 'haru', name: '하루', title: '무너지지 않는 벽', rarity: 'SR', role: '수호',
      hair: '#8fd3ff', hairDark: '#4f9fd1', eye: '#6fd6ff', dress: '#4f86c6', skin: '#d3e9c6',
      style: 'pony', weapon: 'shield',
      dmg: 0.75, interval: 1.1, range: 92,
      passive: { key: 'barrierMult', per: 0.030, label: '방벽 최대치 +3%' },
      desc: '방패 뒤에 모두를 숨긴다. 팔이 떨어져도 놓지 않는다.',
    },
    {
      id: 'vivi', name: '비비', title: '식탐의 성가대', rarity: 'R', role: '지원',
      hair: '#c79bff', hairDark: '#9a63e0', eye: '#e3b8ff', dress: '#9a63e0', skin: '#dceccb',
      style: 'wavy', weapon: 'wand',
      dmg: 0.6, interval: 1.0, range: 380,
      passive: { key: 'brainMult', per: 0.020, label: '🧠 획득량 +2%' },
      desc: '노래를 부르면 뇌수가 더 많이 흐른다. 이유는 아무도 모른다.',
    },
    {
      id: 'nova', name: '노바', title: '역병의 마도사', rarity: 'SSR', role: '광역',
      hair: '#b07bff', hairDark: '#7c45d1', eye: '#ff7aa8', dress: '#6b3fb3', skin: '#d0e9c2',
      style: 'long', weapon: 'wand',
      dmg: 2.4, interval: 1.9, range: 470, splash: 95,
      passive: { key: 'splashChance', per: 0.005, label: '전염 폭발 확률 +0.5%p' },
      desc: '한 명을 터뜨리면 옆 사람도 함께 감염된다. 효율적인 사랑.',
    },
    {
      id: 'yuki', name: '유키', title: '겨울의 잔해', rarity: 'SR', role: '둔화',
      hair: '#dff3ff', hairDark: '#a8c8dd', eye: '#8fd3ff', dress: '#6fb4d6', skin: '#d9eecd',
      style: 'long', weapon: 'wand',
      dmg: 1.3, interval: 1.35, range: 430, slow: 0.3,
      passive: { key: 'critDmg', per: 0.020, label: '치명타 피해 +2%' },
      desc: '얼어붙은 손끝이 닿으면 발이 무거워진다.',
    },
    {
      id: 'sera', name: '세라', title: '역설의 성녀', rarity: 'SSR', role: '신성',
      hair: '#ffe9b8', hairDark: '#d9b877', eye: '#ffcf5c', dress: '#f2e3c0', skin: '#d7ecc9',
      style: 'wavy', weapon: 'wand', halo: true,
      dmg: 1.7, interval: 1.25, range: 410,
      passive: { key: 'bossDmg', per: 0.018, label: '보스 피해 +1.8%' },
      desc: '죽은 뒤에도 기도를 멈추지 않았다. 신은 대답 대신 송곳니를 주었다.',
    },
  ];

  const RARITY = {
    R:   { w: 72, shard: 8,  costMul: 1.0, star: 0.22 },
    SR:  { w: 24, shard: 18, costMul: 1.6, star: 0.28 },
    SSR: { w: 4,  shard: 40, costMul: 2.6, star: 0.36 },
  };

  /* ---------------- 강화 (🧠 소비, 무한) ---------------- */
  const UPGRADES = [
    { id: 'atk',      ico: '💪', name: '근육 변이',     desc: '공격력 +{v}',        base: 15,   growth: 1.113, val: 3,      fmt: (v) => Fmt.n(v) },
    { id: 'aspd',     ico: '⚡', name: '광란의 신경',   desc: '공격속도 +{v}%',     base: 60,   growth: 1.155, val: 2.2,    fmt: (v) => v.toFixed(1) },
    { id: 'crit',     ico: '🎯', name: '급소 감각',     desc: '치명타 확률 +{v}%p', base: 120,  growth: 1.175, val: 0.55,   fmt: (v) => v.toFixed(2), cap: 60 },
    { id: 'critDmg',  ico: '🔪', name: '찢는 송곳니',   desc: '치명타 피해 +{v}%',  base: 90,   growth: 1.15,  val: 6,      fmt: (v) => Fmt.n(v) },
    { id: 'barrier',  ico: '🛡️', name: '시체 바리케이드', desc: '방벽 최대 +{v}',   base: 40,   growth: 1.128, val: 26,     fmt: (v) => Fmt.n(v) },
    { id: 'regen',    ico: '💚', name: '재생 본능',     desc: '방벽 재생 +{v}/초',  base: 150,  growth: 1.16,  val: 1.6,    fmt: (v) => v.toFixed(1) },
    { id: 'greed',    ico: '🧠', name: '굶주림',        desc: '🧠 획득량 +{v}%',    base: 200,  growth: 1.18,  val: 4,      fmt: (v) => Fmt.n(v) },
    { id: 'splash',   ico: '☣️', name: '전염성 포자',   desc: '전염 폭발 +{v}%p',   base: 400,  growth: 1.21,  val: 0.7,    fmt: (v) => v.toFixed(2), cap: 75 },
  ];

  /* ---------------- 유물 (로그라이크 / 재감염 시 소멸) ---------------- */
  // mods 는 곱연산(Mult) 혹은 가산(+) 으로 stat에 누적된다.
  const RELICS = [
    { id: 'fang',     ico: '🦷', name: '깨진 송곳니',     desc: '공격력 +18%',                   mod: { atkMult: 0.18 } },
    { id: 'heart',    ico: '🫀', name: '아직 뛰는 심장',   desc: '공격속도 +14%',                 mod: { aspdMult: 0.14 } },
    { id: 'eye',      ico: '👁️', name: '세 번째 눈',       desc: '치명타 확률 +7%p',              mod: { critChance: 0.07 } },
    { id: 'cleaver',  ico: '🔪', name: '녹슨 식칼',       desc: '치명타 피해 +45%',              mod: { critDmg: 0.45 } },
    { id: 'spore',    ico: '🍄', name: '포자 주머니',     desc: '전염 폭발 확률 +9%p',           mod: { splashChance: 0.09 } },
    { id: 'ribcage',  ico: '🦴', name: '갈비뼈 성벽',     desc: '방벽 최대치 +40%',              mod: { barrierMult: 0.40 } },
    { id: 'moss',     ico: '🌿', name: '시체 이끼',       desc: '방벽 재생 +3%/초',              mod: { regenPct: 0.03 } },
    { id: 'jaw',      ico: '😈', name: '탐식의 턱',       desc: '처치 시 방벽 0.8% 회복',        mod: { leech: 0.008 } },
    { id: 'brainjar', ico: '🧠', name: '뇌수 단지',       desc: '🧠 획득량 +35%',                mod: { brainMult: 0.35 } },
    { id: 'crown',    ico: '👑', name: '왕관의 파편',     desc: '보스 피해 +50%',                mod: { bossDmg: 0.50 } },
    { id: 'clock',    ico: '⏰', name: '멈춘 손목시계',   desc: '스킬 쿨타임 -18%',              mod: { cdr: 0.18 } },
    { id: 'chain',    ico: '⛓️', name: '족쇄',           desc: '적 이동속도 -22%',              mod: { slow: 0.22 } },
    { id: 'vial',     ico: '🧪', name: '변이 촉진제',     desc: '공격력 +10%, 공속 +10%',        mod: { atkMult: 0.10, aspdMult: 0.10 } },
    { id: 'doll',     ico: '🎎', name: '저주받은 인형',   desc: '공격력 +30%, 방벽 -10%',        mod: { atkMult: 0.30, barrierMult: -0.10 } },
    { id: 'lantern',  ico: '🏮', name: '혼불 등롱',       desc: '웨이브당 처치 요구 -1 (최소 5)', mod: { waveCut: 1 } },
    { id: 'stitch',   ico: '🧵', name: '수선 실',         desc: '소녀 레벨당 효과 +12%',         mod: { unitLvMult: 0.12 } },
    { id: 'rose',     ico: '🌹', name: '흑장미',         desc: '공격력 +12%, 🧠 +12%',          mod: { atkMult: 0.12, brainMult: 0.12 } },
    { id: 'skull',    ico: '💀', name: '지휘관의 두개골', desc: '모든 소녀 공격력 +9%(중첩)',    mod: { atkMult: 0.09 }, stack: true },
    { id: 'blood',    ico: '🩸', name: '끓는 혈액',       desc: '방벽 50% 이하일 때 공격력 +60%', mod: { desperate: 0.60 } },
    { id: 'feather',  ico: '🪶', name: '까마귀 깃털',     desc: '적 처치 시 3% 확률로 즉시 재장전', mod: { reload: 0.03 } },
    { id: 'gear',     ico: '⚙️', name: '태엽 심장',       desc: '공격속도 +22%, 공격력 -6%',     mod: { aspdMult: 0.22, atkMult: -0.06 } },
    { id: 'candy',    ico: '🍬', name: '피 맛 사탕',     desc: '치명타 +4%p, 치명 피해 +25%',   mod: { critChance: 0.04, critDmg: 0.25 } },
    { id: 'mask',     ico: '🎭', name: '웃는 가면',       desc: '보스 타이머 +8초',              mod: { bossTime: 8 } },
    { id: 'urn',      ico: '⚱️', name: '유골 단지',       desc: '🦴 획득량 +100%',               mod: { boneMult: 1.0 } },
    { id: 'thorn',    ico: '🌵', name: '가시 덩굴',       desc: '방벽 피격 시 반사 피해',        mod: { thorns: 1 } },
    { id: 'hourglass',ico: '⌛', name: '역행의 모래',     desc: '공격력 +8% (중첩 무제한)',      mod: { atkMult: 0.08 }, stack: true },
  ];

  /* ---------------- 유전자 (영구 / 재감염 재화) ---------------- */
  const GENES = [
    { id: 'g_atk',   ico: '💪', name: '변이 근섬유',   desc: '공격력 +6%',        per: { atkMult: 0.06 },       max: 25, base: 2,  growth: 1.32 },
    { id: 'g_aspd',  ico: '⚡', name: '경련 신경',     desc: '공격속도 +4%',      per: { aspdMult: 0.04 },      max: 20, base: 3,  growth: 1.35 },
    { id: 'g_brain', ico: '🧠', name: '무한한 식욕',   desc: '🧠 획득 +8%',       per: { brainMult: 0.08 },     max: 25, base: 2,  growth: 1.30 },
    { id: 'g_bar',   ico: '🛡️', name: '각질화 피부',   desc: '방벽 +10%',         per: { barrierMult: 0.10 },   max: 20, base: 2,  growth: 1.30 },
    { id: 'g_crit',  ico: '🎯', name: '포식자의 눈',   desc: '치명타 +1.2%p',     per: { critChance: 0.012 },   max: 15, base: 4,  growth: 1.40 },
    { id: 'g_cdmg',  ico: '🔪', name: '파쇄 어금니',   desc: '치명 피해 +10%',    per: { critDmg: 0.10 },       max: 20, base: 3,  growth: 1.36 },
    { id: 'g_boss',  ico: '👑', name: '보스 사냥 본능', desc: '보스 피해 +8%',    per: { bossDmg: 0.08 },       max: 15, base: 5,  growth: 1.42 },
    { id: 'g_off',   ico: '🌙', name: '시체 더미',     desc: '방치 효율 +6%p',    per: { offline: 0.06 },       max: 12, base: 4,  growth: 1.40 },
    { id: 'g_cdr',   ico: '⏰', name: '빠른 부활',     desc: '스킬 쿨 -3%',       per: { cdr: 0.03 },           max: 12, base: 5,  growth: 1.45 },
    { id: 'g_bone',  ico: '🦴', name: '뼈 수집벽',     desc: '🦴 획득 +25%',      per: { boneMult: 0.25 },      max: 10, base: 6,  growth: 1.48 },
    { id: 'g_slot',  ico: '👯', name: '집단 감염',     desc: '부대 슬롯 +1',      per: { slots: 1 },            max: 2,  base: 40, growth: 5.0 },
    { id: 'g_pick',  ico: '🔮', name: '유물 감각',     desc: '유물 선택지 +1',    per: { picks: 1 },            max: 2,  base: 30, growth: 4.0 },
  ];

  /* ---------------- 액티브 스킬 ---------------- */
  const SKILLS = [
    { id: 'frenzy',  ico: '🌀', name: '광란',       desc: '10초간 공격속도 3배',        cd: 45, dur: 10 },
    { id: 'plague',  ico: '☠️', name: '역병 구름',  desc: '화면 전체에 DPS 12배 폭발',  cd: 60, dur: 0 },
    { id: 'embrace', ico: '💗', name: '포옹',       desc: '방벽 60% 회복 + 8초 무적',   cd: 90, dur: 8 },
  ];

  /* ---------------- 숫자 포맷 ---------------- */
  const SUF = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak'];
  const Fmt = {
    n(v) {
      if (!isFinite(v)) return '∞';
      if (v < 0) return '-' + Fmt.n(-v);
      if (v < 1000) return v < 10 && v % 1 !== 0 ? (Math.round(v * 10) / 10).toString() : Math.floor(v).toString();
      let t = 0;
      while (v >= 1000 && t < SUF.length - 1) { v /= 1000; t++; }
      return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v).toString()) + SUF[t];
    },
    pct(v) { return (v * 100).toFixed(v * 100 < 10 ? 1 : 0) + '%'; },
    time(s) {
      s = Math.max(0, Math.floor(s));
      const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      if (d) return `${d}일 ${h}시간`;
      if (h) return `${h}시간 ${m}분`;
      if (m) return `${m}분 ${s % 60}초`;
      return `${s}초`;
    },
  };

  global.ZD = { ZONES, ENEMIES, UNITS, RARITY, UPGRADES, RELICS, GENES, SKILLS, Fmt };
})(window);
