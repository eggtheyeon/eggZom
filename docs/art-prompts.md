# 🎨 eggZom 아트 프롬프트 키트

수집형(가챠) 게임 일러스트를 다른 이미지 AI에 맡기기 위한 프롬프트 모음.
**프롬프트 본문은 영어**입니다 — 이미지 모델은 영어에서 압도적으로 잘 나옵니다.

## 쓰는 법 (중요)

8명이 **한 게임의 캐릭터로 보이게** 하는 게 전부입니다. 방법은 하나뿐:

1. `STYLE LOCK` + `WORLD RULE` 블록을 **글자 하나 안 바꾸고** 매번 앞에 붙인다
2. `SUBJECT` 블록만 캐릭터별로 교체한다
3. **미라를 먼저** 뽑아서 마음에 들 때까지 돌린 뒤, 그 이미지를 나머지 7명의
   **스타일 레퍼런스**로 물린다 (Midjourney `--sref`, Nano Banana / Seedream /
   Firefly 는 "스타일 참조 이미지" 슬롯)
4. 시드 고정이 되는 모델이면 세트 전체를 같은 시드로

> 투명 배경은 모델에 직접 요구하지 말고, **평평한 단색 배경으로 뽑아서 따내는 편**이
> 훨씬 깨끗합니다. 프롬프트에 이미 "flat gradient, easy to cut out"으로 넣어뒀습니다.

---

## 1. STYLE LOCK — 매번 그대로 붙일 것

```
[STYLE LOCK]
Official full-body character art for a modern Japanese mobile gacha RPG. Anime illustration, premium key-visual quality.
Line: clean confident linework with tapered weight variation, closed shapes, zero sketch noise.
Shading: cel shading with exactly two shadow steps plus a soft airbrush gradient inside the core shadow; glossy specular on hair, eyes and any glossy material; warm subsurface glow at ears, fingertips and the bridge of the nose.
Eyes: large glossy anime eyes, vertical iris gradient from dark rim to bright center, crisp highlight ring, two white specular dots, soft light bounce on the lower lid, thick upper lash line, delicate lower lashes.
Light: key light from upper-front-left, cool moonlight fill from the right, a saturated rim light tracing the entire back edge of the figure in the character's own accent hue.
Palette: low-saturation neutral base plus exactly two high-saturation accent hues; strong value separation between skin, hair and costume so the silhouette reads at thumbnail size.
Costume craft: layered fabric with visible seams and stitched trim, small metal hardware, buckles, straps and ribbons that react to the pose and to a light breeze.
Hair: grouped into clear readable clumps with rim-lit edges and 3-5 flyaway strands; never a flat blob.
Pose: relaxed combat-ready contrapposto, three-quarter body turn, face toward camera, weight on one leg, both hands doing something specific and characterful.
Framing: full body, head to shoes, entirely inside the frame with an 8% margin; figure fills 85% of frame height; eye line on the upper third.
Background: flat soft radial gradient in the character's accent hue with sparse floating light particles. No environment, no floor, no cast shadow, clean edges that are easy to cut out.
Output: vertical 3:4, 4K, razor-sharp focus, no text, no watermark, no signature, no border, no UI, no logo.
```

## 2. WORLD RULE — 이것도 그대로

이 게임의 생명선입니다. **귀여움이 먼저, 좀비는 액세서리.**

```
[WORLD RULE — cute undead, never gore]
These girls are zombies, but the undead reads as FASHION, not as injury.
ALWAYS include: pale mint-green skin, two small neat cross-stitch marks on one cheek or one thigh, one or two small clean bandages, tiny fangs peeking from the corner of the mouth, a faintly glowing iris, one frayed ribbon or slightly torn hem.
NEVER include: blood, gore, open wounds, exposed bone, rot, decay texture, missing limbs, pus, lesions, flies, horror expression, dead or empty eyes, grimdark mood.
Mood: cheerful, mischievous, charming, a little melancholy. Cute first, undead second. Suitable for a general-audience store page.
```

## 3. 등급별 연출 강도 — SUBJECT 안에서 골라 쓸 것

가챠 게임의 핵심 문법입니다. 등급이 올라갈수록 **이펙트 물량**이 늘어납니다.

| 등급 | 연출 |
|---|---|
| **R** | `Effects: minimal — a few floating motes in the accent hue, plain radial gradient background.` |
| **SR** | `Effects: moderate — accent-colored energy ribbons curling around the body, drifting light particles, a secondary rim light on the opposite edge.` |
| **SSR** | `Effects: maximal — an ornate glowing magic circle beneath the feet, floating runes and shards orbiting the figure, volumetric god rays, dual rim light, hair and garments frozen mid-motion as if caught in an updraft.` |

## 4. NEGATIVE PROMPT (Stable Diffusion 계열용)

```
blood, gore, wound, injury, rotting flesh, exposed bone, missing limb, scar, horror, creepy, grimdark, dark souls,
extra fingers, extra limbs, fused fingers, deformed hands, bad anatomy, malformed face, asymmetric eyes,
cropped head, cropped feet, out of frame, cluttered background, environment, scenery, furniture,
text, letters, watermark, signature, logo, ui, hud, border, frame, multiple views, collage,
3d render, photorealistic, live action, oil painting texture, sketch, unfinished lineart, low resolution, jpeg artifacts
```

---

# 5. 캐릭터 8인 SUBJECT 블록

색상 hex는 게임 구현값 그대로입니다. 그대로 쓰면 인게임 UI와 색이 맞습니다.

### 미라 (Mira) — R · 근접 · "0번째 감염자"

```
[SUBJECT]
Name: Mira, "Patient Zero" — the first girl who woke up.
Rarity R, melee brawler. Looks 16-17, slim, seven heads tall.
Hair: twin tails, soft pink #ff9ec2 with deeper rose shadow #e0709c, a single bouncy ahoge strand, twin tails tied with wide ribbons.
Eyes: rose red #ff4d79, bright and mischievous, faint inner glow.
Skin: pale mint-green #d7ecc9.
Costume: pink sailor school uniform #ff7aa8 — white blouse, pink sailor collar and ribbon, pink pleated skirt, white knee socks, brown loafers. Still the most intact uniform of the group: she died first, before things got bad.
Weapon: clawed gloves, dark tapered claw tips, both forearms lightly bandaged.
Signature motif: a hospital wristband on her left wrist stamped "00", cherry blossom petals drifting.
Pose: low forward crouch, one clawed hand reaching toward the viewer, other hand back for balance.
Expression: playful open-mouth grin with two small fangs, one eye winked.
Effects: minimal — a few floating pink motes, plain radial gradient background.
```

### 루비 (Ruby) — SR · 원거리 · "피의 저격수"

```
[SUBJECT]
Name: Ruby, "The Bloodline Sniper" — her heart stopped, her aim did not.
Rarity SR, long-range marksman. Looks 17-18, tall and lean.
Hair: long straight hair to the waist, vivid coral red #ff6b5c with crimson shadow #c94434, blunt bangs, one thin braid at the temple.
Eyes: golden amber #ffd34d, sharp, half-lidded and confident.
Skin: pale mint-green #dceccb.
Costume: crimson #e04a3c military-cut blazer worn open over a white sailor collar, black tactical belt, thigh holster with spare magazines, a long red scarf streaming behind her, black shorts, high combat boots.
Weapon: an oversized bolt-action anti-materiel rifle slung over one shoulder, scuffed metal, a small bone charm tied to the stock.
Signature motif: spent brass casings floating weightlessly around her, crosshair glint in one eye.
Pose: standing tall, rifle resting across one shoulder held by the barrel, hip cocked, free hand on her waist.
Expression: cool smirk, chin slightly down, looking up at the viewer through her lashes.
Effects: moderate — crimson energy ribbons, drifting particles, secondary rim light.
```

### 네코 (Neko) — R · 연타 · "발톱의 속삭임"

```
[SUBJECT]
Name: Neko, "Whisper of Claws" — the cat ears are not an accessory, they are a mutation.
Rarity R, rapid multi-hit striker. Looks 15-16, small and springy.
Hair: short messy bob, butter yellow #ffe07a with gold shadow #d9b63f, a stubborn cowlick, fish-bone shaped hairpin.
Eyes: mint green #7df0b4, huge, round, gleeful.
Skin: pale mint-green #d7ecc9.
Costume: oversized yellow #f0c64a cardigan with sweater-paw sleeves worn over a white school blouse, very short pleated skirt, deliberately mismatched socks (one striped knee-high, one ankle sock), scuffed sneakers.
Mutation: real cat ears growing from her skull, fused into the hair with a faint stitched seam at the base; a matching tail with a visible seam ring near the tip.
Weapon: dark claws extending past the sweater-paw sleeves.
Signature motif: yellow after-image slash arcs trailing behind her hands.
Pose: caught mid-pounce, both clawed hands raised, knees tucked, body arcing forward.
Expression: enormous open grin with prominent fangs, eyes squeezed into happy crescents.
Effects: minimal — a few floating yellow motes, plain radial gradient background.
```

### 하루 (Haru) — SR · 수호 · "무너지지 않는 벽"

```
[SUBJECT]
Name: Haru, "The Wall That Will Not Fall" — she hides everyone behind her shield, even after her arm comes loose.
Rarity SR, guardian tank. Looks 17-18, the tallest of the group, broad-shouldered for her frame.
Hair: high ponytail, sky blue #8fd3ff with steel blue shadow #4f9fd1, swept-back bangs, ponytail tied with a plain elastic.
Eyes: cyan #6fd6ff, calm, steady, kind.
Skin: pale mint-green #d3e9c6.
Costume: navy blue #4f86c6 school uniform under a riot-gear chest harness and shoulder pad, one arm wrapped shoulder-to-knuckle in clean white bandages holding the limb in place, an armored gauntlet over the other hand, long shorts, heavy boots.
Weapon: a huge makeshift riot shield built from a bolted-together steel school door and a road sign, edges dented, a cheerful smiley face hand-painted on the front in white.
Signature motif: a faint hexagonal blue barrier shimmer hanging in the air just in front of the shield.
Pose: planted wide stance, shield held forward and slightly low, free hand open in a protective "stay behind me" gesture.
Expression: calm reassuring closed-mouth smile, one small fang just visible.
Effects: moderate — cyan energy ribbons, hexagonal light particles, secondary rim light.
```

### 비비 (Vivi) — R · 지원 · "식탐의 성가대"

```
[SUBJECT]
Name: Vivi, "Choir of Gluttony" — when she sings, more brains spill. Nobody knows why.
Rarity R, support buffer. Looks 16-17, soft and round-cheeked.
Hair: long wavy hair, lavender #c79bff with violet shadow #9a63e0, loose curls, a small fork-and-knife crossed hairpin.
Eyes: pale lilac #e3b8ff, half-closed in blissful rapture.
Skin: pale mint-green #dceccb.
Costume: purple #9a63e0 choir robe layered over a white school blouse — wide white collar, enormous bell sleeves, a gold cord at the waist, long skirt, simple flats.
Weapon: a tuning-fork shaped wand in one hand; a hymnal floating open beside her, pages turning by themselves.
Signature motif: floating music notes rendered as pale green wisps drifting up from her mouth.
Pose: mid-song, one arm raised conducting, head tilted back slightly, robe sleeve falling away from the wrist.
Expression: eyes closed in bliss, mouth open singing, two small fangs visible.
Effects: minimal — a few floating violet motes and note wisps, plain radial gradient background.
```

### 노바 (Nova) — SSR · 광역 · "역병의 마도사"

```
[SUBJECT]
Name: Nova, "Plague Archmage" — burst one and the one beside them is infected too. Efficient love.
Rarity SSR, area-of-effect mage. Looks 18, statuesque and theatrical.
Hair: very long flowing hair, amethyst #b07bff with deep violet shadow #7c45d1, asymmetric bangs covering one eye partially, hair lifting in an updraft.
Eyes: hot pink #ff7aa8, narrowed, gleaming with intelligence and glee.
Skin: pale mint-green #d0e9c2.
Costume: elaborate deep violet #6b3fb3 mage coat, asymmetric hem, tall standing collar, layered violet skirts, many belts and buckles, thigh-high heeled boots, long fingerless gloves.
Weapon: a tall black staff topped with a pulsing toxic-green orb held in a metal claw setting.
Signature motif: a biohazard rune redrawn as an elegant sigil, drifting green spore motes that glow.
Pose: floating a few centimetres off the ground, staff held diagonally across the body, coat and hair billowing outward, one hand casting downward.
Expression: confident closed-mouth smirk, one fang showing, chin lifted.
Effects: maximal — an ornate violet magic circle beneath her feet, floating runes and glass shards orbiting, volumetric god rays, dual rim light, everything frozen mid-motion.
```

### 유키 (Yuki) — SR · 둔화 · "겨울의 잔해"

```
[SUBJECT]
Name: Yuki, "Winter's Leftovers" — whatever her fingertips touch grows heavy.
Rarity SR, slow/control caster. Looks 16-17, quiet and still.
Hair: very long straight hair, near-white ice blue #dff3ff with pale grey-blue shadow #a8c8dd, strands frosted stiff at the tips, straight-cut bangs.
Eyes: pale blue #8fd3ff, gentle, a little sad, catching the light.
Skin: pale mint-green #d9eecd, faintly frosted at the knuckles.
Costume: pale blue #6fb4d6 winter school uniform under a long coat with white fur trim at the hood and cuffs, a thick knitted scarf, fingerless mittens, tights, snow boots.
Weapon: a wand of clear icicle held loosely; frost creeping up her forearm from the fingertips.
Signature motif: individual six-point snowflakes suspended in the air around her, visible breath.
Pose: standing quietly, one hand extended palm-up with a single snowflake resting on it, the other holding her scarf.
Expression: small closed-mouth melancholy smile, eyes lowered slightly, one fang barely visible.
Effects: moderate — pale blue energy ribbons, suspended snowflakes and frost particles, secondary rim light.
```

### 세라 (Sera) — SSR · 신성 · "역설의 성녀"

```
[SUBJECT]
Name: Sera, "The Paradox Saint" — she never stopped praying after she died. God answered with fangs instead.
Rarity SSR, holy boss-slayer. Looks 17-18, poised and luminous.
Hair: long wavy hair, cream gold #ffe9b8 with honey shadow #d9b877, soft curls falling past the waist, framed by a sheer veil.
Eyes: warm gold #ffcf5c, serene, almost closed.
Skin: pale mint-green #d7ecc9.
Costume: cream and gold #f2e3c0 saint's vestment — layered white-and-cream robes with heavy gold embroidery at the hem and cuffs, a sheer veil over the hair, a wide gold-trimmed stole, a rosary strung with small clean bone beads at her waist, simple sandals.
Weapon: a slender gold censer-staff trailing pale smoke; a cracked golden halo hovering above and slightly tilted.
Signature motif: floating feathers with slightly ragged edges, stained-glass colored light falling across her.
Pose: hands clasped in prayer at her chest, head bowed a fraction, robes and veil lifting gently.
Expression: serene closed-eye smile, one single fang resting on her lower lip.
Effects: maximal — a golden magic circle beneath, floating runes and feathers orbiting, strong volumetric god rays from above, dual rim light, cracked halo glowing.
```

---

# 6. 배경 — 사이드스크롤 전장 10종

배경은 **일러스트가 아니라 게임 에셋**입니다. 예쁜 도시 그림을 받으면 못 씁니다.
아래 스펙을 반드시 붙이세요.

## BACKGROUND STYLE LOCK

```
[BACKGROUND STYLE LOCK]
Horizontal side-scrolling 2D game background plate for an anime mobile game. Absolutely no characters, no people, no creatures, no text.
Aspect ratio 16:7 ultrawide, composed to tile seamlessly left to right.
Three separated depth planes:
  FAR  (top 45%)    — night sky and a distant skyline silhouette at 25% contrast, heavy atmospheric haze.
  MID  (middle 35%) — the zone's signature architecture as flat two-or-three-value silhouettes with warm window lights.
  NEAR (bottom 20%) — a flat walkable ground plane, perfectly horizontal, wet surface with soft reflections and scattered debris.
The ground line sits at exactly 79% of image height and runs dead straight from edge to edge.
Style: painterly anime background art, clean readable shapes, limited palette, strong value hierarchy, cinematic night lighting, volumetric fog pooling at the ground, gentle bloom on every light source.
Mood: beautiful desolation — abandoned, quiet, moonlit. No blood, no corpses, no gore, no horror.
Output: 4K, no characters, no text, no watermark, no UI, no vignette, no border, no foreground framing elements.
```

## 지역별 한 줄 (SKY/GROUND hex는 구현값)

각 줄을 `[BACKGROUND STYLE LOCK]` 뒤에 붙이면 됩니다.

```
1. 폐교      — Abandoned Japanese-Korean high school at night: classroom windows, a rusted jungle gym, scattered desks, a torn banner on the fence. Sky gradient #2b1b3d to #160f24, ground #241a33, single cold fluorescent light still flickering.
2. 시장통    — Collapsed traditional market alley: tangled awnings, overturned food carts, hanging bare bulbs, hand-painted signage boards. Sky #3d2418 to #1d1210, ground #33241a, warm orange bulb glow.
3. 지하철    — Flooded subway platform: tiled pillars, a derailed train half in shadow, emergency strip lighting, ankle-deep water with mirror reflections. Sky (ceiling) #16232e to #0c141b, ground #1b2a33, green emergency exit sign glow.
4. 종합병원  — Gutted hospital wing: overturned gurneys, swinging plastic curtains, an X-ray lightbox still lit, IV stands. Sky #1f3330 to #10201d, ground #1d322c, sterile teal light.
5. 군 기지   — Overrun military base: sandbag walls, a toppled watchtower, razor wire, a burnt-out transport truck, floodlight masts. Sky #2c3124 to #151a12, ground #2a3020, harsh white floodlight.
6. 연구소    — Underground research lab: rows of cracked containment tanks glowing faintly, cable bundles, a blast door left open. Sky (ceiling) #20223f to #101024, ground #232546, cyan tank glow.
7. 방송국    — Dead broadcast station: a toppled studio light rig, hundreds of monitors showing static, a cracked ON AIR sign, tangled cable. Sky #3a1d33 to #1d0f1b, ground #331a2c, magenta static glow.
8. 항구      — Ruined container port: stacked shipping containers, a leaning gantry crane, dark water, a beached fishing boat. Sky #18303f to #0c1a24, ground #1a2c3a, a lone rotating beacon.
9. 국제공항  — Silent international airport apron: a jetliner with one wing broken, jet bridges, the control tower dark, scattered luggage. Sky #2a2438 to #141020, ground #282038, runway edge lights receding.
10. 수도 서울 — The last stand in central Seoul: Han river bridge stumps, broken high-rises, a collapsed overpass, a giant faded evacuation banner. Sky #3f1a24 to #1f0c12, ground #38181f, distant fires on the horizon.
```

---

# 7. 필요한 산출물 규격

지금 게임은 캐릭터를 Canvas 로 직접 그리고 있습니다. 일러스트로 교체하려면
캐릭터당 **3종**이 필요합니다.

| 용도 | 크기 | 내용 |
|---|---|---|
| `art/full/{id}.png` | 1536×2048 (3:4) | 전신 일러스트. 도감 / 소환 연출용 |
| `art/bust/{id}.png` | 512×512 | 가슴 위 크롭. 편성 슬롯 · 카드 썸네일 (원형 크롭 대비해 여백 확보) |
| `art/chibi/{id}.png` | 256×256 | 2.5등신 치비. **전장에 실제로 서는 스프라이트** |

치비는 같은 STYLE LOCK 으로는 안 나옵니다. 아래로 교체하세요.

```
[CHIBI STYLE LOCK]
Chibi sprite of the same character for a 2D side-scrolling battle field.
Two-and-a-half heads tall, huge head, tiny body, stubby limbs, no visible neck.
Same hair color, same eye color, same costume colors and same silhouette cues as the full illustration so the character is instantly recognizable.
Facing right in three-quarter view, standing idle, weapon visible and readable at 128 pixels.
Thick uniform outline, flat cel shading with a single shadow step, chunky readable shapes, no fine detail, no small text on the costume.
Centered, full body with feet on the bottom edge, plain flat background for easy cutout.
Output: square 1:1, no text, no watermark, no border, no ground shadow.
```

배경은 지역당 `art/bg/{n}.png` 3840×1680 하나면 충분합니다.

---

# 8. 복붙용 완성 프롬프트 (미라 · R)

테스트는 이거 하나 던져보고 시작하세요.

```
Official full-body character art for a modern Japanese mobile gacha RPG. Anime illustration, premium key-visual quality.
Line: clean confident linework with tapered weight variation, closed shapes, zero sketch noise.
Shading: cel shading with exactly two shadow steps plus a soft airbrush gradient inside the core shadow; glossy specular on hair, eyes and any glossy material; warm subsurface glow at ears, fingertips and the bridge of the nose.
Eyes: large glossy anime eyes, vertical iris gradient from dark rim to bright center, crisp highlight ring, two white specular dots, soft light bounce on the lower lid, thick upper lash line, delicate lower lashes.
Light: key light from upper-front-left, cool moonlight fill from the right, a saturated rim light tracing the entire back edge of the figure in the character's own accent hue.
Palette: low-saturation neutral base plus exactly two high-saturation accent hues; strong value separation between skin, hair and costume so the silhouette reads at thumbnail size.
Costume craft: layered fabric with visible seams and stitched trim, small metal hardware, buckles, straps and ribbons that react to the pose and to a light breeze.
Hair: grouped into clear readable clumps with rim-lit edges and 3-5 flyaway strands; never a flat blob.
Pose: relaxed combat-ready contrapposto, three-quarter body turn, face toward camera, weight on one leg, both hands doing something specific and characterful.
Framing: full body, head to shoes, entirely inside the frame with an 8% margin; figure fills 85% of frame height; eye line on the upper third.
Background: flat soft radial gradient in the character's accent hue with sparse floating light particles. No environment, no floor, no cast shadow, clean edges that are easy to cut out.
Output: vertical 3:4, 4K, razor-sharp focus, no text, no watermark, no signature, no border, no UI, no logo.

These girls are zombies, but the undead reads as FASHION, not as injury.
ALWAYS include: pale mint-green skin, two small neat cross-stitch marks on one cheek or one thigh, one or two small clean bandages, tiny fangs peeking from the corner of the mouth, a faintly glowing iris, one frayed ribbon or slightly torn hem.
NEVER include: blood, gore, open wounds, exposed bone, rot, decay texture, missing limbs, pus, lesions, flies, horror expression, dead or empty eyes, grimdark mood.
Mood: cheerful, mischievous, charming, a little melancholy. Cute first, undead second. Suitable for a general-audience store page.

Name: Mira, "Patient Zero" — the first girl who woke up.
Rarity R, melee brawler. Looks 16-17, slim, seven heads tall.
Hair: twin tails, soft pink #ff9ec2 with deeper rose shadow #e0709c, a single bouncy ahoge strand, twin tails tied with wide ribbons.
Eyes: rose red #ff4d79, bright and mischievous, faint inner glow.
Skin: pale mint-green #d7ecc9.
Costume: pink sailor school uniform #ff7aa8 — white blouse, pink sailor collar and ribbon, pink pleated skirt, white knee socks, brown loafers. Still the most intact uniform of the group: she died first, before things got bad.
Weapon: clawed gloves, dark tapered claw tips, both forearms lightly bandaged.
Signature motif: a hospital wristband on her left wrist stamped "00", cherry blossom petals drifting.
Pose: low forward crouch, one clawed hand reaching toward the viewer, other hand back for balance.
Expression: playful open-mouth grin with two small fangs, one eye winked.
Effects: minimal — a few floating pink motes, plain radial gradient background.
```

---

## 자주 실패하는 지점

| 증상 | 원인 / 처방 |
|---|---|
| 8명이 서로 다른 게임 캐릭터 같다 | STYLE LOCK 을 조금씩 바꿔 썼을 때. 반드시 동일 문자열 + 스타일 레퍼런스 병행 |
| 무섭고 징그럽게 나온다 | WORLD RULE 의 NEVER 목록을 통째로 빼먹었을 때. `zombie` 단어보다 `pale mint-green skin` 같은 **구체 묘사**가 훨씬 안전하게 먹힘 |
| 발이 잘린다 | Framing 줄을 지우지 말 것. 그래도 잘리면 `full body, feet visible, head to toe` 를 맨 앞으로 |
| 배경이 화려해서 캐릭터가 안 보인다 | Background 줄을 프롬프트 **마지막**으로 옮기고 `plain background` 를 한 번 더 반복 |
| 배경 플레이트에 사람이 나온다 | `no characters` 를 프롬프트 맨 앞 + 네거티브 양쪽에 넣을 것 |
| 손가락이 망가진다 | 손을 무기/소품이 가리는 포즈로 바꾸는 게 가장 확실 (미라는 클로, 루비는 총열, 세라는 기도 손) |
