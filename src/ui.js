/* ===== eggZom :: UI ===== */
(function (global) {
  'use strict';
  const D = global.ZD, Z = global.ZS, E = global.ZE, R = global.ZR, S = Z.S, F = D.Fmt;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  const UI = { syncers: [], activeTab: 'upgrade' };

  // 매 프레임 DOM 을 다시 만들지 않도록, 내용이 실제로 바뀔 때만 갱신한다
  function setHTML(node, html) { if (node._h !== html) { node._h = html; node.innerHTML = html; } }

  /* ================= 토스트 ================= */
  UI.toast = function (msg, kind) {
    const area = $('#toast-area');
    const n = el('div', 'toast ' + (kind || ''), msg);
    area.appendChild(n);
    setTimeout(() => n.remove(), 3100);
    while (area.children.length > 5) area.firstChild.remove();
  };

  /* ================= 모달 ================= */
  let modalQueue = [], modalOpen = false;
  UI.modal = function (opt) { modalQueue.push(opt); if (!modalOpen) nextModal(); };
  function nextModal() {
    const opt = modalQueue.shift();
    if (!opt) { modalOpen = false; $('#modal').hidden = true; return; }
    modalOpen = true;
    $('#modal-title').innerHTML = opt.title || '';
    $('#modal-body').innerHTML = '';
    if (typeof opt.body === 'string') $('#modal-body').innerHTML = opt.body;
    else if (opt.body) $('#modal-body').appendChild(opt.body);
    const acts = $('#modal-actions'); acts.innerHTML = '';
    (opt.actions || [{ label: '확인', pri: true }]).forEach((a) => {
      const b = el('button', a.pri ? 'pri' : '', a.label);
      b.onclick = () => { if (a.fn && a.fn() === false) return; nextModal(); };
      acts.appendChild(b);
    });
    $('#modal').hidden = false;
  }
  UI.modalOpen = () => modalOpen;

  /* ================= 탭 ================= */
  function initTabs() {
    document.querySelectorAll('.tab').forEach((t) => {
      t.onclick = () => {
        document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
        UI.activeTab = t.dataset.tab;
        document.querySelectorAll('.tab-page').forEach((p) => { p.hidden = p.dataset.page !== UI.activeTab; });
        UI.rebuild();
      };
    });
  }

  /* ================= 강화 탭 ================= */
  function buildUpgrade() {
    const page = $('[data-page="upgrade"]'); page.innerHTML = ''; const syncs = [];

    const modes = el('div', 'buy-modes');
    [1, 10, 'MAX'].forEach((mv) => {
      const b = el('button', '', mv === 'MAX' ? 'MAX' : 'x' + mv);
      b.onclick = () => { S.d.buyMode = mv; UI.rebuild(); };
      if (S.d.buyMode === mv) b.classList.add('on');
      modes.appendChild(b);
    });
    page.appendChild(modes);

    page.appendChild(el('div', 'sec-title', '영구 강화 — 🧠 뇌수 소비'));

    for (const u of D.UPGRADES) {
      const row = el('button', 'row');
      row.innerHTML = `<span class="row-ico">${u.ico}</span>
        <span class="row-mid"><span class="row-name">${u.name}</span><span class="row-desc"></span></span>
        <span class="row-right"><span class="row-cost"></span><br><span class="row-lv"></span></span>`;
      const dEl = row.querySelector('.row-desc'), cEl = row.querySelector('.row-cost'), lEl = row.querySelector('.row-lv');
      function amount() {
        const lv = Z.upLv(u.id);
        if (S.d.buyMode === 'MAX') return Math.max(1, Z.upMaxBuy(u, lv, S.d.brains));
        return S.d.buyMode;
      }
      row.onclick = () => {
        const lv = Z.upLv(u.id);
        let n = amount();
        if (S.d.buyMode === 'MAX') n = Z.upMaxBuy(u, lv, S.d.brains);
        if (n <= 0) return;
        const cost = Z.upCostBulk(u, lv, n);
        if (S.d.brains < cost) return;
        S.d.brains -= cost;
        S.d.up[u.id] = lv + n;
        E.refresh();
        UI.flashTab();
      };
      syncs.push(() => {
        const lv = Z.upLv(u.id);
        const n = Math.max(1, amount());
        const cost = Z.upCostBulk(u, lv, n);
        const cur = u.val * lv;
        dEl.textContent = u.desc.replace('{v}', u.fmt(u.val * n)) + (lv ? ` · 현재 ${u.fmt(u.cap ? Math.min(u.cap, cur) : cur)}` : '');
        cEl.textContent = '🧠 ' + F.n(cost);
        cEl.classList.toggle('no', S.d.brains < cost);
        lEl.textContent = `Lv.${lv}` + (n > 1 ? ` +${n}` : '');
        row.disabled = S.d.brains < cost;
      });
      page.appendChild(row);
    }

    page.appendChild(el('div', 'sec-title', '전투 정보'));
    const info = el('div', 'row'); info.disabled = true;
    info.style.cursor = 'default';
    info.innerHTML = '<span class="row-mid" id="statbox" style="font-size:11.5px;line-height:1.75"></span>';
    page.appendChild(info);
    syncs.push(() => {
      const m = E.m; if (!m) return;
      const box = info.querySelector('#statbox');
      setHTML(box, [
        `공격력 <b>${F.n(m.atkPower)}</b> · 이론 DPS <b>${F.n(m.dps)}</b>`,
        `치명타 <b>${F.pct(m.critChance)}</b> · 치명 피해 <b>${F.n(m.critDmg * 100)}%</b>`,
        `방벽 <b>${F.n(m.barrierMax)}</b> · 재생 <b>${F.n(m.regen)}/s</b>`,
        `🧠 배율 <b>${F.n(m.brainMult * 100)}%</b> · 전염 <b>${F.pct(m.splashChance)}</b>`,
        `방치 효율 <b>${F.pct(m.offline)}</b> · 총 처치 <b>${F.n(S.d.stats.kills)}</b>`,
      ].join('<br>'));
    });
    return syncs;
  }

  /* ================= 부대 탭 ================= */
  function portraitCanvas(u, w, h, s) {
    const c = document.createElement('canvas');
    c.width = w * 2; c.height = h * 2;
    const cx = c.getContext('2d');
    cx.scale(2, 2);
    R.drawGirl(cx, w / 2, h - 4, u, 1.2, s, { still: true, noShadow: true });
    return c;
  }

  function shardNeed(u, star) { return Math.ceil(D.RARITY[u.rarity].shard * star); }

  function buildParty() {
    const page = $('[data-page="party"]'); page.innerHTML = ''; const syncs = [];
    const m = E.m, maxSlots = Math.floor(m.slots);

    page.appendChild(el('div', 'sec-title', `편성 (${maxSlots}칸)`));
    const slots = el('div', 'slots');
    for (let i = 0; i < 5; i++) {
      const sl = el('div', 'slot');
      if (i >= maxSlots) { sl.classList.add('locked'); sl.innerHTML = '🔒'; }
      else {
        const id = S.d.slots[i];
        if (id && S.d.roster[id]) {
          const u = D.UNITS.find((x) => x.id === id);
          sl.classList.add('filled');
          sl.appendChild(portraitCanvas(u, 56, 52, 0.56));
          sl.appendChild(el('span', 'sl-name', u.name));
          sl.appendChild(el('span', 'sl-lv', 'Lv.' + S.d.roster[id].lv));
          sl.onclick = () => { S.d.slots[i] = null; E.refresh(); UI.rebuild(); };
          sl.title = '클릭하면 편성 해제';
        } else { sl.innerHTML = '<span style="font-size:20px">＋</span><span>비어있음</span>'; }
      }
      slots.appendChild(sl);
    }
    page.appendChild(slots);

    /* --- 소환 --- */
    page.appendChild(el('div', 'sec-title', '감염 소환 — 🦴 뼈 소비'));
    const sumWrap = el('div', 'buy-modes');
    [['1회', 1, 40], ['10연차', 10, 360]].forEach(([lab, n, cost]) => {
      const b = el('button', '', `${lab} · 🦴${cost}`);
      b.onclick = () => doSummon(n, cost);
      sumWrap.appendChild(b);
      syncs.push(() => { b.disabled = S.d.bones < cost; b.style.opacity = S.d.bones < cost ? .45 : 1; });
    });
    page.appendChild(sumWrap);

    page.appendChild(el('div', 'sec-title', '보유 소녀'));
    const order = D.UNITS.slice().sort((a, b) => (!!S.d.roster[b.id]) - (!!S.d.roster[a.id]));
    for (const u of order) {
      const owned = !!S.d.roster[u.id];
      const card = el('div', 'unit-card');
      const por = el('div', 'unit-por'); por.appendChild(portraitCanvas(u, 52, 60, 0.62));
      if (!owned) por.style.filter = 'grayscale(1) brightness(.45)';
      card.appendChild(por);

      const body = el('div', 'unit-body');
      card.appendChild(body);
      const acts = el('div', 'unit-actions');
      card.appendChild(acts);

      const bLv = el('button', 'mini-btn pri', '레벨업');
      const bEq = el('button', 'mini-btn', '편성');
      const bSt = el('button', 'mini-btn', '승급');
      acts.appendChild(bLv); acts.appendChild(bEq); acts.appendChild(bSt);

      bLv.onclick = () => {
        const r = S.d.roster[u.id]; if (!r) return;
        const c = Z.unitLvCost(u, r.lv);
        if (S.d.brains < c) return;
        S.d.brains -= c; r.lv++; E.refresh(); UI.rebuild();
      };
      bEq.onclick = () => {
        if (!S.d.roster[u.id]) return;
        const idx = S.d.slots.indexOf(u.id);
        if (idx >= 0) { S.d.slots[idx] = null; }
        else {
          let free = -1;
          for (let i = 0; i < Math.floor(E.m.slots); i++) if (!S.d.slots[i]) { free = i; break; }
          if (free < 0) free = 0;
          S.d.slots[free] = u.id;
        }
        E.refresh(); UI.rebuild();
      };
      bSt.onclick = () => {
        const r = S.d.roster[u.id]; if (!r || r.star >= 5) return;
        const need = shardNeed(u, r.star);
        if (r.shard < need) return;
        r.shard -= need; r.star++;
        UI.toast(`⭐ ${u.name} ${r.star}성 각성!`, 'gold');
        E.refresh(); UI.rebuild();
      };

      syncs.push(() => {
        const r = S.d.roster[u.id];
        const equipped = S.d.slots.indexOf(u.id) >= 0;
        card.classList.toggle('equipped', equipped);
        if (r) {
          const c = Z.unitLvCost(u, r.lv);
          const need = shardNeed(u, r.star);
          setHTML(body, `<div class="row-name">${u.name}
              <span class="pill ${u.rarity}">${u.rarity}</span>
              <span class="stars">${'★'.repeat(r.star)}${'☆'.repeat(5 - r.star)}</span></div>
            <div class="row-desc" style="white-space:normal">${u.role} · ${u.passive.label.replace('+', '+')} (Lv당)</div>
            <div style="font-size:11px;color:var(--gold);margin-top:2px">Lv.${r.lv} · 🧠${F.n(c)}</div>
            <div class="shardbar"><i style="width:${Math.min(100, r.shard / need * 100)}%"></i></div>
            <div style="font-size:10px;color:var(--dim)">조각 ${r.shard}/${need}</div>`);
          bLv.disabled = S.d.brains < c;
          bEq.textContent = equipped ? '해제' : '편성';
          bEq.disabled = false;
          bSt.disabled = r.star >= 5 || r.shard < need;
          bSt.textContent = r.star >= 5 ? 'MAX' : '승급';
        } else {
          setHTML(body, `<div class="row-name" style="color:var(--dim)">???
              <span class="pill ${u.rarity}">${u.rarity}</span></div>
            <div class="row-desc" style="white-space:normal">${u.role} · 미발견</div>
            <div style="font-size:10px;color:var(--dim);margin-top:4px">감염 소환으로 찾을 수 있다</div>`);
          bLv.disabled = bSt.disabled = bEq.disabled = true;
        }
      });
      page.appendChild(card);
    }
    return syncs;
  }

  /* --- 소환 실행 --- */
  function rollUnit() {
    const tot = D.UNITS.reduce((s, u) => s + D.RARITY[u.rarity].w, 0);
    let r = Math.random() * tot;
    for (const u of D.UNITS) { r -= D.RARITY[u.rarity].w; if (r <= 0) return u; }
    return D.UNITS[0];
  }
  function doSummon(n, cost) {
    if (S.d.bones < cost) return;
    S.d.bones -= cost;
    const got = [];
    for (let i = 0; i < n; i++) {
      let u = rollUnit();
      // 10연차 첫 획득 보정: 미보유 유닛 우선 1회
      if (n === 10 && i === 9 && !got.some((g) => g.isNew)) {
        const locked = D.UNITS.filter((x) => !S.d.roster[x.id]);
        if (locked.length) u = locked[(Math.random() * locked.length) | 0];
      }
      if (!S.d.roster[u.id]) {
        S.d.roster[u.id] = { lv: 1, star: 1, shard: 0 };
        got.push({ u, isNew: true });
        // 빈 슬롯이 있으면 자동 편성
        for (let k = 0; k < Math.floor(E.m.slots); k++) if (!S.d.slots[k]) { S.d.slots[k] = u.id; break; }
      } else {
        const amt = D.RARITY[u.rarity].shard >= 40 ? 6 : D.RARITY[u.rarity].shard >= 18 ? 4 : 3;
        S.d.roster[u.id].shard += amt;
        got.push({ u, isNew: false, amt });
      }
    }
    E.refresh();
    const grid = el('div', 'sum-grid');
    for (const g of got) {
      const it = el('div', 'sum-item');
      it.appendChild(portraitCanvas(g.u, 60, 66, 0.66));
      it.innerHTML += `<div style="font-weight:700">${g.u.name}</div>
        <span class="pill ${g.u.rarity}">${g.u.rarity}</span>
        ${g.isNew ? '<span class="pill new">NEW</span>' : `<div style="color:var(--violet);font-size:10px">조각 +${g.amt}</div>`}`;
      grid.appendChild(it);
    }
    UI.modal({ title: '🦴 감염 소환 결과', body: grid, actions: [{ label: '확인', pri: true }] });
    UI.rebuild();
  }

  /* ================= 유물 탭 ================= */
  function buildRelic() {
    const page = $('[data-page="relic"]'); page.innerHTML = ''; const syncs = [];

    const note = el('div', 'row'); note.disabled = true; note.style.cursor = 'default';
    note.innerHTML = `<span class="row-ico">🔮</span><span class="row-mid">
      <span class="row-name">로그라이크 유물</span>
      <span class="row-desc" style="white-space:normal">보스를 잡을 때마다 1개를 고른다. 재감염하면 전부 사라진다.</span></span>`;
    page.appendChild(note);

    const btn = el('button', 'big-btn', '유물 선택하기');
    btn.onclick = () => UI.offerRelic();
    page.appendChild(btn);
    syncs.push(() => {
      btn.disabled = S.d.pending <= 0;
      btn.textContent = S.d.pending > 0 ? `🔮 유물 선택 (${S.d.pending})` : '보스를 처치하면 유물을 얻는다';
    });

    page.appendChild(el('div', 'sec-title', '보유 유물'));
    const grid = el('div', 'relic-grid');
    page.appendChild(grid);
    const emptyBox = el('div', 'empty', '아직 유물이 없다. 첫 보스는 WAVE 10.');
    page.appendChild(emptyBox);
    syncs.push(() => {
      emptyBox.hidden = S.d.relics.length > 0;
      const html = S.d.relics.map((r) => {
        const def = D.RELICS.find((x) => x.id === r.id);
        if (!def) return '';
        return `<div class="relic"><div class="rn">${def.ico} ${def.name}` +
          (r.n > 1 ? ` <span class="pill SR">x${r.n}</span>` : '') +
          `</div><div class="rd">${def.desc}</div></div>`;
      }).join('');
      setHTML(grid, html);
    });
    return syncs;
  }

  UI.offerRelic = function () {
    if (S.d.pending <= 0) return;
    const picks = Math.floor(E.m.picks);
    const pool = D.RELICS.filter((r) => r.stack || Z.relicCount(r.id) === 0);
    const list = [];
    const src = pool.length ? pool.slice() : D.RELICS.slice();
    for (let i = 0; i < picks && src.length; i++) list.push(src.splice((Math.random() * src.length) | 0, 1)[0]);

    const grid = el('div', 'pick-grid');
    list.forEach((def) => {
      const b = el('button', 'pick');
      b.innerHTML = `<div class="pi">${def.ico}</div><div class="pn">${def.name}</div><div class="pd">${def.desc}</div>`;
      b.onclick = () => {
        const cur = S.d.relics.find((x) => x.id === def.id);
        if (cur) cur.n++; else S.d.relics.push({ id: def.id, n: 1 });
        S.d.pending--;
        E.refresh();
        UI.toast(`${def.ico} ${def.name} 획득!`, 'good');
        nextModal();
        UI.rebuild();
        if (S.d.pending > 0) setTimeout(UI.offerRelic, 260);
      };
      grid.appendChild(b);
    });
    UI.modal({ title: '🔮 유물을 하나 고르세요', body: grid, actions: [] });
  };

  /* ================= 유전자 탭 ================= */
  function buildGene() {
    const page = $('[data-page="gene"]'); page.innerHTML = ''; const syncs = [];

    const box = el('div', 'prestige-box');
    box.innerHTML = `<h3>🧬 재감염</h3><p id="pres-desc"></p>`;
    const pb = el('button', 'big-btn', '재감염');
    box.appendChild(pb);
    pb.onclick = () => doPrestige();
    page.appendChild(box);
    syncs.push(() => {
      const g = Z.genesFor(S.d.bestWave);
      setHTML(box.querySelector('#pres-desc'),
        `이번 회차 최고 <b>WAVE ${S.d.bestWave}</b> → <b style="color:var(--gold)">🧬 ${F.n(g)}</b> 획득<br>` +
        `<span style="color:var(--dim)">강화·유물·소녀 레벨은 초기화. 소녀·성급·🦴·🧬는 유지.</span>` +
        (g <= 0 ? '<br><b style="color:var(--blood)">WAVE 25 이상부터 가능</b>' : ''));
      pb.disabled = g <= 0;
      pb.textContent = g > 0 ? `재감염하고 🧬 ${F.n(g)} 획득` : '아직 이르다';
    });

    page.appendChild(el('div', 'sec-title', '영구 유전자 — 🧬 소비'));
    for (const g of D.GENES) {
      const row = el('button', 'row');
      row.innerHTML = `<span class="row-ico">${g.ico}</span>
        <span class="row-mid"><span class="row-name">${g.name}</span><span class="row-desc"></span></span>
        <span class="row-right"><span class="row-cost"></span><br><span class="row-lv"></span></span>`;
      const dEl = row.querySelector('.row-desc'), cEl = row.querySelector('.row-cost'), lEl = row.querySelector('.row-lv');
      row.onclick = () => {
        const lv = Z.geneLv(g.id); if (lv >= g.max) return;
        const c = Z.geneCost(g, lv);
        if (S.d.genes < c) return;
        S.d.genes -= c; S.d.gene[g.id] = lv + 1;
        E.refresh(); UI.rebuild();
        UI.toast(`${g.ico} ${g.name} Lv.${lv + 1}`, 'good');
      };
      syncs.push(() => {
        const lv = Z.geneLv(g.id), maxed = lv >= g.max;
        const c = Z.geneCost(g, lv);
        dEl.textContent = g.desc + (lv ? ` · 누적 효과 ${lv}단계` : '');
        cEl.textContent = maxed ? 'MAX' : '🧬 ' + F.n(c);
        cEl.classList.toggle('no', !maxed && S.d.genes < c);
        lEl.textContent = `${lv} / ${g.max}`;
        row.disabled = maxed || S.d.genes < c;
      });
      page.appendChild(row);
    }
    return syncs;
  }

  function doPrestige() {
    const gain = Z.genesFor(S.d.bestWave);
    if (gain <= 0) return;
    UI.modal({
      title: '🧬 재감염하시겠습니까?',
      body: `<p>세상을 한 번 더 처음부터 물어뜯습니다.</p>
        <ul><li>획득: <b style="color:var(--gold)">🧬 ${F.n(gain)} 유전자</b></li>
        <li>초기화: 웨이브 · 🧠 뇌수 · 강화 · <b>모든 유물</b> · 소녀 레벨</li>
        <li>유지: 보유 소녀 · ⭐성급 · 🦴 뼈 · 🧬 유전자 · 유전자 강화</li></ul>`,
      actions: [
        { label: '아직', fn: () => {} },
        {
          label: '재감염!', pri: true, fn: () => {
            S.d.genes += gain;
            S.d.brains = 0; S.d.up = {}; S.d.relics = []; S.d.pending = 0;
            S.d.wave = 1; S.d.bestWave = 1;
            for (const id in S.d.roster) S.d.roster[id].lv = 1;
            S.d.stats.runs++;
            E.refresh(); E.resetField(true);
            UI.toast(`🧬 유전자 ${F.n(gain)} 획득! ${S.d.stats.runs}회차 시작`, 'gold');
            UI.rebuild();
          },
        },
      ],
    });
  }

  /* ================= 스킬바 ================= */
  function buildSkills() {
    const bar = $('#skillbar'); bar.innerHTML = ''; const syncs = [];
    for (const s of D.SKILLS) {
      const b = el('button', 'skill');
      b.innerHTML = `<span class="skill-cd"></span><span class="skill-ico">${s.ico}</span>
        <span class="skill-meta"><span class="skill-name">${s.name}</span><span class="skill-sub">${s.desc}</span></span>`;
      const cdEl = b.querySelector('.skill-cd');
      b.onclick = () => { if (E.useSkill(s.id)) UI.toast(`${s.ico} ${s.name}!`, 'good'); };
      syncs.push(() => {
        const cd = S.d.skillCd[s.id] || 0;
        const total = s.cd * (1 - (E.m ? E.m.cdr : 0));
        const k = total > 0 ? cd / total : 0;
        cdEl.style.transform = `scaleX(${Math.max(0, Math.min(1, k))})`;
        b.classList.toggle('ready', cd <= 0);
        b.classList.toggle('active', (S.d.skillOn[s.id] || 0) > 0);
        b.disabled = cd > 0;
        b.querySelector('.skill-name').textContent = cd > 0 ? `${s.name} ${cd.toFixed(0)}s` : s.name;
      });
      bar.appendChild(b);
    }
    return syncs;
  }

  /* ================= 상단 HUD ================= */
  UI.hud = function () {
    const m = E.m; if (!m) return;
    $('#res-brains').textContent = F.n(S.d.brains);
    $('#res-bones').textContent = F.n(S.d.bones);
    $('#res-genes').textContent = F.n(S.d.genes);
    $('#zone-name').textContent = `${Z.zoneIndex(S.d.wave) + 1}지역 · ${Z.zone(S.d.wave).name}`;
    $('#wave-label').textContent = 'WAVE ' + S.d.wave;
    $('#best-label').textContent = `최고 ${S.d.bestWave} / 역대 ${S.d.bestWaveEver}`;

    const boss = S.d.bossPhase;
    const tgt = Z.waveTarget(S.d.wave, m);
    const k = boss
      ? (() => { const b = E.enemies.find((e) => e.boss); return b ? 1 - b.hp / b.max : 0; })()
      : S.d.waveKills / tgt;
    $('#wave-fill').style.width = Math.max(0, Math.min(1, k)) * 100 + '%';
    $('#wave-count').textContent = boss ? '👑 BOSS' : `${S.d.waveKills} / ${tgt}`;

    $('#boss-timer').hidden = !boss;
    if (boss) $('#boss-timer-txt').textContent = '⏱ ' + Math.max(0, S.d.bossTimer).toFixed(1) + 's';

    const bp = Math.max(0, S.d.barrier) / m.barrierMax;
    $('#bb-fill').style.width = bp * 100 + '%';
    $('#bb-fill').style.background = bp < 0.3
      ? 'linear-gradient(90deg,#a02030,#ff5470)' : 'linear-gradient(90deg,#3c7de0,#6fd6ff)';
    $('#bb-txt').textContent = `${F.n(Math.max(0, S.d.barrier))} / ${F.n(m.barrierMax)}`;
    $('#dps-txt').textContent = 'DPS ' + F.n(E.dpsReal);

    // 유물 대기 알림
    const relicTab = document.querySelector('.tab[data-tab="relic"]');
    const has = relicTab.querySelector('.dot');
    if (S.d.pending > 0 && !has) relicTab.innerHTML = '유물<span class="dot"></span>';
    else if (S.d.pending <= 0 && has) relicTab.innerHTML = '유물';
  };

  UI.flashTab = function () { /* 구매 피드백 자리 */ };

  /* ================= 재구축 / 동기화 ================= */
  UI.rebuild = function () {
    const body = $('#tab-body'), sc = body.scrollTop;
    UI.syncers = [];
    UI.syncers = UI.syncers.concat(
      UI.activeTab === 'upgrade' ? buildUpgrade() :
      UI.activeTab === 'party' ? buildParty() :
      UI.activeTab === 'relic' ? buildRelic() : buildGene()
    );
    UI.syncers = UI.syncers.concat(UI.skillSyncs || []);
    body.scrollTop = sc;
    UI.sync();
  };
  UI.sync = function () { for (const f of UI.syncers) f(); };

  /* ================= 도움말 / 설정 ================= */
  function helpModal() {
    UI.modal({
      title: '🧟‍♀️ eggZom 안내서',
      body: `<p>당신은 최초의 감염자. 귀여운 좀비 소녀들을 이끌고 인류의 방어선을 웨이브 단위로 무너뜨립니다. 전투는 <b>전부 자동</b>입니다.</p>
        <h4>기본 흐름</h4>
        <ul>
          <li>적을 처치하면 <b>🧠 뇌수</b>를 얻고, <b>강화</b> 탭에서 무한히 성장합니다.</li>
          <li>10웨이브마다 <b>👑 보스</b>. 제한 시간 안에 못 잡으면 지역 시작 웨이브로 후퇴합니다.</li>
          <li>보스를 잡으면 <b>🦴 뼈</b>와 <b>🔮 유물 선택권</b>을 얻습니다.</li>
          <li><b>🛡️ 방벽</b>이 0이 되어도 후퇴합니다. 방벽 강화와 재생을 잊지 마세요.</li>
        </ul>
        <h4>로그라이크 — 유물</h4>
        <p>보스마다 무작위 3장 중 1장을 고릅니다. 조합에 따라 매 회차가 전혀 다른 빌드가 됩니다. 재감염하면 전부 사라집니다.</p>
        <h4>방치 &amp; 재감염</h4>
        <ul>
          <li>게임을 꺼두면 <b>최대 12시간</b>까지 🧠 뇌수가 쌓입니다. (유전자로 효율 상승)</li>
          <li><b>WAVE 25</b> 이상에서 <b>🧬 재감염</b>이 가능합니다. 영구 성장의 핵심입니다.</li>
        </ul>
        <h4>부대</h4>
        <p>🦴 뼈로 <b>감염 소환</b>을 돌려 새 소녀를 찾고, 중복은 조각이 되어 <b>⭐승급</b>에 쓰입니다. 편성한 소녀의 패시브는 팀 전체에 적용됩니다.</p>
        <p style="color:var(--dim);font-size:11px">진행 상황은 이 브라우저에 자동 저장됩니다.</p>`,
    });
  }

  function settingsModal() {
    const box = el('div');
    const auto = el('button', 'row');
    auto.innerHTML = `<span class="row-ico">🤖</span><span class="row-mid"><span class="row-name">자동 스킬</span>
      <span class="row-desc">쿨타임마다 스킬을 알아서 사용</span></span><span class="row-right" id="autov"></span>`;
    const upd = () => { auto.querySelector('#autov').innerHTML = S.d.autoSkill ? '<b style="color:var(--lime)">ON</b>' : '<b style="color:var(--dim)">OFF</b>'; };
    auto.onclick = () => { S.d.autoSkill = !S.d.autoSkill; upd(); }; upd();
    box.appendChild(auto);

    const st = el('div', 'row'); st.style.marginTop = '8px'; st.style.cursor = 'default';
    st.innerHTML = `<span class="row-mid" style="font-size:11.5px;line-height:1.7">
      총 플레이 <b>${F.time(S.d.stats.play)}</b><br>
      총 처치 <b>${F.n(S.d.stats.kills)}</b> · 보스 <b>${F.n(S.d.stats.bosses)}</b><br>
      누적 🧠 <b>${F.n(S.d.stats.brains)}</b> · 회차 <b>${S.d.stats.runs + 1}</b><br>
      역대 최고 <b>WAVE ${S.d.bestWaveEver}</b></span>`;
    box.appendChild(st);

    const wipe = el('button', 'row'); wipe.style.marginTop = '8px'; wipe.style.borderColor = 'var(--blood)';
    wipe.innerHTML = `<span class="row-ico">💀</span><span class="row-mid"><span class="row-name" style="color:var(--blood)">처음부터 다시</span>
      <span class="row-desc">모든 진행도를 영구 삭제합니다</span></span>`;
    wipe.onclick = () => {
      UI.modal({
        title: '정말 전부 지울까요?', body: '<p>저장 데이터가 완전히 사라지고 되돌릴 수 없습니다.</p>',
        actions: [{ label: '취소' }, { label: '삭제', pri: true, fn: () => { Z.wipe(); location.reload(); } }],
      });
    };
    box.appendChild(wipe);

    UI.modal({ title: '⚙ 설정', body: box });
  }

  /* ================= 초기화 ================= */
  UI.init = function () {
    initTabs();
    UI.skillSyncs = buildSkills();
    $('#btn-help').onclick = helpModal;
    $('#btn-settings').onclick = settingsModal;
    UI.rebuild();

    // 엔진 이벤트 → UI
    E.on('bossDown', (d) => {
      UI.toast(`👑 ${d.name} 격파! 🦴 +${d.bones}`, 'gold');
      setTimeout(() => UI.offerRelic(), 420);
    });
    E.on('boss', (n) => UI.toast(`👑 ${n} 등장!`, 'bad'));
    E.on('zone', (n) => UI.toast(`🚩 새로운 지역 — ${n}`, 'good'));
    E.on('defeat', (d) => UI.toast(`💀 ${d.reason}… WAVE ${d.wave}로 후퇴`, 'bad'));
  };

  UI.helpModal = helpModal;
  global.ZU = UI;
})(window);
