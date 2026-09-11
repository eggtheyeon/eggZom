#!/usr/bin/env node
/* ===== eggZom :: 아트 프롬프트 생성기 =====
 * src/data.js 의 실제 구현값(머리·눈·의상 hex, 지역 팔레트)을 읽어
 * 조립이 끝난 복붙용 프롬프트를 docs/prompts/ 에 뽑는다.
 * 게임 색을 바꾸면 프롬프트도 같이 바뀐다.
 *
 *   node tools/build-prompts.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'prompts');

/* ---- src/data.js 를 그대로 평가해서 실제 값을 가져온다 ---- */
const win = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'src', 'data.js'), 'utf8'))(win);
const { UNITS, ZONES } = win.ZD;

/* ================= 공통 블록 ================= */

const STYLE_LOCK = `Official full-body character art for a modern Japanese mobile gacha RPG. Anime illustration, premium key-visual quality.
Line: clean confident linework with tapered weight variation, closed shapes, zero sketch noise.
Shading: bold two-step cel shading with clearly visible hard-edged shadow shapes under the chin, inside the collar, beneath the skirt and along the inner limbs, plus a soft airbrush gradient inside the core shadow; glossy specular on hair, eyes and any glossy material; warm subsurface glow at ears, fingertips and the bridge of the nose. High contrast, rich saturation, deep shadow values — never washed out or flat-lit.
Eyes: large glossy anime eyes, vertical iris gradient from dark rim to bright center, crisp highlight ring, two white specular dots, soft light bounce on the lower lid, thick upper lash line, delicate lower lashes.
Light: key light from upper-front-left, cool moonlight fill from the right.
Rim light: mandatory and obvious — a bright saturated rim tracing the entire back edge of the hair and body, clearly separated in both hue and value from the local color.
Hands: keep both hands near the body or partially occluded by the weapon; never a foreground hand disconnected from a visible forearm.
Palette: low-saturation neutral base plus exactly two high-saturation accent hues; strong value separation between skin, hair and costume so the silhouette reads at thumbnail size.
Costume craft: layered fabric with visible seams and stitched trim, small metal hardware, buckles, straps and ribbons that react to the pose and to a light breeze.
Hair: grouped into clear readable clumps with rim-lit edges and 3-5 flyaway strands; never a flat blob.
Pose: relaxed combat-ready contrapposto, three-quarter body turn, face toward camera, weight on one leg, both hands doing something specific and characterful.
Framing: full body, head to shoes, entirely inside the frame with an 8% margin; figure fills 85% of frame height; eye line on the upper third.`;

const CARD_OUTPUT = `Output: vertical 3:4, 4K, razor-sharp focus, no text, no watermark, no signature, no border, no UI, no logo.`;

/* 게임 데이터의 한글 표기를 프롬프트용 영문으로 옮긴다 */
const ROLE_EN = {
  '근접': 'melee brawler', '원거리': 'long-range marksman', '연타': 'rapid multi-hit striker',
  '수호': 'guardian tank', '지원': 'support buffer', '광역': 'area-of-effect mage',
  '둔화': 'slow and control caster', '신성': 'holy boss-slayer',
};
const ZONE_EN = [
  'Abandoned High School', 'Old Market Alley', 'Flooded Subway', 'General Hospital', 'Military Base',
  'Research Facility', 'Broadcast Station', 'Container Harbor', 'International Airport', 'The Fallen Capital',
];

const WORLD_RULE = `These girls are zombies, but the undead reads as FASHION, not as injury.
ALWAYS include: pale mint-green skin, two small neat cross-stitch marks on one cheek or one thigh, one or two small clean bandages, tiny fangs peeking from the corner of the mouth, a faintly glowing iris, one frayed ribbon or slightly torn hem.
NEVER include: blood, gore, open wounds, exposed bone, rot, decay texture, missing limbs, pus, lesions, flies, horror expression, dead or empty eyes, grimdark mood.
Mood: cheerful, mischievous, charming, a little melancholy. Cute first, undead second. Suitable for a general-audience store page.`;

const EFFECTS = {
  R: 'minimal — a few floating motes in the accent hue.',
  SR: 'moderate — accent-colored energy ribbons curling around the body, drifting light particles, a secondary rim light on the opposite edge.',
  SSR: 'maximal — an ornate glowing magic circle beneath the feet, floating runes and shards orbiting the figure, volumetric god rays, dual rim light, hair and garments frozen mid-motion as if caught in an updraft.',
};

const CHIBI_LOCK = `Chibi game sprite of the character, for a 2D side-scrolling battle field.
Proportions: two-and-a-half heads tall, oversized round head, tiny compact body, short stubby limbs, no visible neck.
Identity: exactly the same hair color, eye color, costume colors and signature silhouette cues as the character's full illustration, so the two read as the same character at a glance. Keep the one clearest identifying feature oversized and obvious.
Facing: three-quarter view turned to the RIGHT, standing idle, weight settled evenly, weapon held so its silhouette is readable at 128 pixels.
Rendering: thick uniform outline, flat cel shading with a single shadow step, chunky readable shapes, high contrast against a plain background. No gradients, no fine detail, no texture, no small text or tiny ornaments on the costume.
Zombie cues, simplified: pale mint-green skin, ONE cross-stitch mark, ONE bandage, tiny fangs. Nothing more — small details disappear at game size.
Framing: character centered horizontally; the soles of the feet touch the BOTTOM EDGE of the canvas exactly, the top of the head near the top edge. No empty padding under the feet.
Background: plain flat solid color, clean hard edges, easy to cut out. No ground shadow, no platform, no scenery, no effects.
Output: square 1:1, no text, no watermark, no border, no multiple views, no turnaround sheet.`;

const BG_LOCK = `Horizontal side-scrolling 2D game background plate for an anime mobile game. Absolutely no characters, no people, no creatures, no text.
Aspect ratio 16:7 ultrawide, composed to tile seamlessly left to right.
Three separated depth planes:
  FAR  (top 45%)    — night sky and a distant skyline silhouette at 25% contrast, heavy atmospheric haze.
  MID  (middle 35%) — the zone's signature architecture as flat two-or-three-value silhouettes with warm window lights.
  NEAR (bottom 20%) — a flat walkable ground plane, perfectly horizontal, wet surface with soft reflections and scattered debris.
The ground line sits at exactly 79% of image height and runs dead straight from edge to edge. This is a hard requirement: the game aligns the plate by that line.
Style: painterly anime background art, clean readable shapes, limited palette, strong value hierarchy, cinematic night lighting, volumetric fog pooling at the ground, gentle bloom on every light source.
Mood: beautiful desolation — abandoned, quiet, moonlit. No blood, no corpses, no gore, no horror.
Output: 4K, no characters, no text, no watermark, no UI, no vignette, no border, no foreground framing elements.`;

const NEGATIVE = `blood, gore, wound, injury, rotting flesh, exposed bone, missing limb, scar, horror, creepy, grimdark,
extra fingers, extra limbs, fused fingers, deformed hands, bad anatomy, malformed face, asymmetric eyes,
cropped head, cropped feet, out of frame, cluttered background, environment, scenery, furniture,
text, letters, watermark, signature, logo, ui, hud, border, frame, multiple views, collage,
3d render, photorealistic, live action, oil painting texture, sketch, unfinished lineart, low resolution, jpeg artifacts`;

/* ================= 캐릭터별 아트 디렉션 ================= */
/* 색상은 data.js 에서 자동 주입된다. 여기에는 연출만 적는다. */
const ART = {
  mira: {
    en: 'Mira', epithet: 'Patient Zero', bg: '#1f3a3a', bgName: 'deep teal',
    build: 'Looks 16-17, slim, seven heads tall.',
    hair: 'twin tails, soft pink {hair} with deeper rose shadow {hairDark}, a single bouncy ahoge strand, twin tails tied with wide ribbons',
    eyes: 'rose red {eye}, bright and mischievous, faint inner glow',
    costume: 'pink sailor school uniform {dress} — white blouse, pink sailor collar and ribbon, pink pleated skirt, white knee socks, brown loafers. Still the most intact uniform of the group: she died first, before things got bad.',
    weapon: 'clawed gloves, dark tapered claw tips, both forearms lightly bandaged.',
    motif: 'a hospital wristband on her left wrist stamped "00", cherry blossom petals drifting.',
    pose: 'low forward crouch, one clawed hand raised beside her cheek, the other braced on her knee.',
    face: 'playful open-mouth grin with two small fangs, one eye winked.',
    sdHair: 'twin tails in soft pink {hair} with rose shadow {hairDark}, one bouncy ahoge, big pink ribbons — the twin tails should be exaggerated and oversized, they are her silhouette',
    sdEyes: 'huge rose red {eye} eyes taking up most of the face, one winked shut',
    sdCostume: 'pink {dress} sailor uniform, white blouse, pink pleated skirt, white knee socks, brown loafers',
    sdWeapon: 'small dark clawed gloves, claws clearly readable against the skirt',
    sdFace: 'wide happy open-mouth grin',
  },
  ruby: {
    en: 'Ruby', epithet: 'The Bloodline Sniper', bg: '#12303a', bgName: 'deep blue-teal',
    build: 'Looks 17-18, tall and lean.',
    hair: 'long straight hair to the waist, vivid coral red {hair} with crimson shadow {hairDark}, blunt bangs, one thin braid at the temple',
    eyes: 'golden amber {eye}, sharp, half-lidded and confident',
    costume: 'crimson {dress} military-cut blazer worn open over a white sailor collar, black tactical belt, thigh holster with spare magazines, a long red scarf streaming behind her, black shorts, high combat boots.',
    weapon: 'an oversized bolt-action anti-materiel rifle held across the body with both hands, scuffed metal, a small bone charm tied to the stock.',
    motif: 'spent brass casings floating weightlessly around her, a crosshair glint in one eye.',
    pose: 'standing tall, rifle angled across the chest, both hands on the weapon, hip cocked.',
    face: 'cool smirk, chin slightly down, looking up at the viewer through her lashes.',
    sdHair: 'very long straight coral red {hair} hair with crimson shadow {hairDark}, blunt bangs — the long hair and the red scarf are her silhouette',
    sdEyes: 'huge golden amber {eye} eyes, half-lidded and confident',
    sdCostume: 'crimson {dress} blazer over a white collar, long red scarf trailing behind, black shorts, chunky combat boots',
    sdWeapon: 'an oversized rifle held across the body, comically large for the chibi frame',
    sdFace: 'small cool smirk with one fang',
  },
  neko: {
    en: 'Neko', epithet: 'Whisper of Claws', bg: '#2a1f4a', bgName: 'deep violet',
    build: 'Looks 15-16, small and springy.',
    hair: 'short messy bob, butter yellow {hair} with gold shadow {hairDark}, a stubborn cowlick, a fish-bone shaped hairpin',
    eyes: 'mint green {eye}, huge, round, gleeful',
    costume: 'oversized yellow {dress} cardigan with sweater-paw sleeves worn over a white school blouse, very short pleated skirt, deliberately mismatched socks (one striped knee-high, one ankle sock), scuffed sneakers.',
    weapon: 'dark claws extending past the sweater-paw sleeves.',
    motif: 'real cat ears growing from her skull, fused into the hair with a faint stitched seam at the base, and a matching tail with a seam ring near the tip; yellow after-image slash arcs trailing behind her hands.',
    pose: 'caught mid-pounce, both clawed hands raised, knees tucked, body arcing forward.',
    face: 'enormous open grin with prominent fangs, eyes squeezed into happy crescents.',
    sdHair: 'short messy butter yellow {hair} bob with gold shadow {hairDark} — but the CAT EARS are her silhouette: make them oversized and unmistakable, with a stitched seam at the base',
    sdEyes: 'huge mint green {eye} eyes squeezed into happy crescents',
    sdCostume: 'oversized yellow {dress} cardigan with sweater-paw sleeves, very short skirt, mismatched socks, sneakers, a seamed tail',
    sdWeapon: 'dark claws poking out of the sleeve ends',
    sdFace: 'enormous open grin with big fangs',
  },
  haru: {
    en: 'Haru', epithet: 'The Wall That Will Not Fall', bg: '#3a2718', bgName: 'warm dark brown',
    build: 'Looks 17-18, the tallest of the group, broad-shouldered for her frame.',
    hair: 'high ponytail, sky blue {hair} with steel blue shadow {hairDark}, swept-back bangs, tied with a plain elastic',
    eyes: 'cyan {eye}, calm, steady, kind',
    costume: 'navy blue {dress} school uniform under a riot-gear chest harness and one shoulder pad, one arm wrapped shoulder-to-knuckle in clean white bandages holding the limb in place, an armored gauntlet over the other hand, long shorts, heavy boots.',
    weapon: 'a huge makeshift riot shield built from a bolted-together steel school door and a road sign, edges dented, a cheerful smiley face hand-painted on the front in white.',
    motif: 'a faint hexagonal blue barrier shimmer hanging in the air just in front of the shield.',
    pose: 'planted wide stance, shield held forward and slightly low with both arms, body turned behind it.',
    face: 'calm reassuring closed-mouth smile, one small fang just visible.',
    sdHair: 'high sky blue {hair} ponytail with steel blue shadow {hairDark}, swept-back bangs',
    sdEyes: 'huge calm cyan {eye} eyes',
    sdCostume: 'navy blue {dress} uniform with a riot-gear chest harness, one arm fully wrapped in white bandages, heavy boots',
    sdWeapon: 'an enormous makeshift riot shield with a hand-painted white smiley — the shield is her silhouette, make it nearly as big as she is',
    sdFace: 'calm closed-mouth smile with one fang',
  },
  vivi: {
    en: 'Vivi', epithet: 'Choir of Gluttony', bg: '#1f3320', bgName: 'dark olive',
    build: 'Looks 16-17, soft and round-cheeked.',
    hair: 'long wavy hair, lavender {hair} with violet shadow {hairDark}, loose curls, a small crossed fork-and-knife hairpin',
    eyes: 'pale lilac {eye}, half-closed in blissful rapture',
    costume: 'purple {dress} choir robe layered over a white school blouse — wide white collar, enormous bell sleeves, a gold cord at the waist, long skirt, simple flats.',
    weapon: 'a tuning-fork shaped wand held at her chest; a hymnal floating open beside her, pages turning by themselves.',
    motif: 'floating music notes rendered as pale green wisps drifting up from her mouth.',
    pose: 'mid-song, both hands clasped around the wand at her chest, head tilted back slightly, bell sleeves falling away from the wrists.',
    face: 'eyes closed in bliss, mouth open singing, two small fangs visible.',
    sdHair: 'long wavy lavender {hair} hair with violet shadow {hairDark}, loose curls',
    sdEyes: 'huge pale lilac {eye} eyes, closed in bliss',
    sdCostume: 'purple {dress} choir robe with enormous bell sleeves — the giant sleeves are her silhouette, exaggerate them',
    sdWeapon: 'a small hymnal floating open beside her',
    sdFace: 'mouth open singing, two tiny fangs',
  },
  nova: {
    en: 'Nova', epithet: 'Plague Archmage', bg: '#16281c', bgName: 'dark moss',
    build: 'Looks 18, statuesque and theatrical.',
    hair: 'very long flowing hair, amethyst {hair} with deep violet shadow {hairDark}, asymmetric bangs partly covering one eye, hair lifting in an updraft',
    eyes: 'hot pink {eye}, narrowed, gleaming with intelligence and glee',
    costume: 'elaborate deep violet {dress} mage coat, asymmetric hem, tall standing collar, layered violet skirts, many belts and buckles, thigh-high heeled boots, long fingerless gloves.',
    weapon: 'a tall black staff held diagonally in both hands, topped with a pulsing toxic-green orb in a metal claw setting.',
    motif: 'a biohazard rune redrawn as an elegant sigil, drifting green spore motes that glow.',
    pose: 'floating a few centimetres off the ground, staff held diagonally across the body, coat and hair billowing outward.',
    face: 'confident closed-mouth smirk, one fang showing, chin lifted.',
    sdHair: 'very long amethyst {hair} hair with deep violet shadow {hairDark}, asymmetric bangs over one eye',
    sdEyes: 'huge hot pink {eye} eyes, narrowed and smug',
    sdCostume: 'deep violet {dress} mage coat with a tall standing collar and layered skirts, thigh-high boots',
    sdWeapon: 'a tall black staff with a glowing toxic-green orb on top — the staff and the giant collar are her silhouette',
    sdFace: 'smug closed-mouth smirk with one fang',
  },
  yuki: {
    en: 'Yuki', epithet: "Winter's Leftovers", bg: '#16203d', bgName: 'deep navy',
    build: 'Looks 16-17, quiet and still.',
    hair: 'very long straight hair, near-white ice blue {hair} with pale grey-blue shadow {hairDark}, strands frosted stiff at the tips, straight-cut bangs',
    eyes: 'pale blue {eye}, gentle, a little sad, catching the light',
    costume: 'pale blue {dress} winter school uniform under a long coat with white fur trim at the hood and cuffs, a thick knitted scarf, fingerless mittens, tights, snow boots.',
    weapon: 'a wand of clear icicle held close to her chest; frost creeping up her forearm from the fingertips.',
    motif: 'individual six-point snowflakes suspended in the air around her, visible breath.',
    pose: 'standing quietly, one hand holding the icicle wand at her chest, the other gathering her scarf.',
    face: 'small closed-mouth melancholy smile, eyes lowered slightly, one fang barely visible.',
    sdHair: 'very long straight near-white ice blue {hair} hair with pale grey-blue shadow {hairDark}, frosted tips',
    sdEyes: 'huge pale blue {eye} eyes, gentle and a little sad',
    sdCostume: 'pale blue {dress} winter coat with white fur trim, a thick oversized knitted scarf — the huge scarf is her silhouette, snow boots',
    sdWeapon: 'a small icicle wand held at the chest, frost on the hand',
    sdFace: 'tiny closed-mouth smile, one fang',
  },
  sera: {
    en: 'Sera', epithet: 'The Paradox Saint', bg: '#241a3f', bgName: 'deep indigo',
    build: 'Looks 17-18, poised and luminous.',
    hair: 'long wavy hair, cream gold {hair} with honey shadow {hairDark}, soft curls falling past the waist, framed by a sheer veil',
    eyes: 'warm gold {eye}, serene, almost closed',
    costume: "cream and gold {dress} saint's vestment — layered white-and-cream robes with heavy gold embroidery at the hem and cuffs, a sheer veil over the hair, a wide gold-trimmed stole, a rosary strung with small clean bone beads at her waist, simple sandals.",
    weapon: 'a slender gold censer-staff trailing pale smoke, cradled in both arms; a cracked golden halo hovering above and slightly tilted.',
    motif: 'floating feathers with slightly ragged edges, stained-glass colored light falling across her.',
    pose: 'hands clasped in prayer at her chest around the censer-staff, head bowed a fraction, robes and veil lifting gently.',
    face: 'serene closed-eye smile, one single fang resting on her lower lip.',
    sdHair: 'long wavy cream gold {hair} hair with honey shadow {hairDark} under a sheer veil',
    sdEyes: 'huge warm gold {eye} eyes, closed in serenity',
    sdCostume: "cream and gold {dress} saint's vestment with a veil and a gold-trimmed stole",
    sdWeapon: 'a cracked golden halo floating above her head — the tilted cracked halo is her silhouette, make it large and obvious; a small gold censer in her hands',
    sdFace: 'serene closed-eye smile with one fang',
  },
};

/* ================= 지역별 아트 디렉션 ================= */
const BG_SCENE = [
  'Abandoned high school at night: classroom windows, a rusted jungle gym, scattered desks spilling into the yard, a torn banner sagging on the fence. A single cold fluorescent tube still flickering.',
  'Collapsed traditional market alley: tangled awnings, overturned food carts, rows of hanging bare bulbs, hand-painted signage boards. Warm orange bulb glow.',
  'Flooded subway platform: tiled pillars, a derailed train half in shadow, emergency strip lighting along the floor, ankle-deep water giving mirror reflections. Green emergency exit sign glow.',
  'Gutted hospital wing: overturned gurneys, swinging plastic curtains, an X-ray lightbox still lit, rows of abandoned IV stands. Sterile teal light.',
  'Overrun military base: sandbag walls, a toppled watchtower, coils of razor wire, a burnt-out transport truck, floodlight masts. Harsh white floodlight.',
  'Underground research lab: rows of cracked containment tanks glowing faintly, thick cable bundles along the floor, a blast door left half open. Cyan tank glow.',
  'Dead broadcast station: a toppled studio light rig, a wall of hundreds of monitors showing static, a cracked ON AIR sign, tangled cable underfoot. Magenta static glow.',
  'Ruined container port: stacked shipping containers, a leaning gantry crane, dark still water, a beached fishing boat. A lone rotating beacon.',
  'Silent international airport apron: a jetliner with one wing broken, jet bridges hanging loose, the control tower dark, scattered luggage. Runway edge lights receding into fog.',
  'The last stand in a ruined capital: broken river-bridge stumps, shattered high-rises, a collapsed overpass, a giant faded evacuation banner. Distant fires on the horizon.',
];

/* ================= 조립 ================= */
const fill = (tpl, u) => tpl
  .replace(/\{hair\}/g, u.hair).replace(/\{hairDark\}/g, u.hairDark)
  .replace(/\{eye\}/g, u.eye).replace(/\{dress\}/g, u.dress).replace(/\{skin\}/g, u.skin);

function cardPrompt(u) {
  const a = ART[u.id];
  return `${STYLE_LOCK}
Background: flat radial gradient in ${a.bgName} ${a.bg}, far darker than the character's own colors, so the silhouette separates hard even at thumbnail size; sparse floating light particles. No environment, no floor, no cast shadow, clean edges that are easy to cut out.
${CARD_OUTPUT}

${WORLD_RULE}

Name: ${a.en}, "${a.epithet}".
Rarity ${u.rarity}, ${ROLE_EN[u.role] || u.role}. ${a.build}
Hair: ${fill(a.hair, u)}.
Eyes: ${fill(a.eyes, u)}.
Skin: pale mint-green ${u.skin}.
Costume: ${fill(a.costume, u)}
Weapon: ${a.weapon}
Signature motif: ${a.motif}
Pose: ${a.pose}
Expression: ${a.face}
Effects: ${EFFECTS[u.rarity]}`;
}

function sdPrompt(u) {
  const a = ART[u.id];
  return `${CHIBI_LOCK}

Character: ${a.en}.
Hair: ${fill(a.sdHair, u)}.
Eyes: ${fill(a.sdEyes, u)}.
Skin: pale mint-green ${u.skin}.
Costume: ${fill(a.sdCostume, u)}.
Weapon: ${fill(a.sdWeapon, u)}.
Zombie cue: one cross-stitch on the cheek, one bandage on a forearm, two tiny fangs.
Expression: ${a.sdFace}.`;
}

function bgPrompt(i) {
  const z = ZONES[i];
  return `${BG_LOCK}

Zone ${i + 1} — ${ZONE_EN[i]}. ${BG_SCENE[i]}
Palette: vertical sky gradient from ${z.sky[0]} at the top to ${z.sky[1]} at the horizon; ground plane ${z.ground}; exactly one warm accent light source as described.`;
}

/* ================= 출력 ================= */
fs.mkdirSync(OUT, { recursive: true });
const bundle = { cards: {}, sd: {}, bg: {}, negative: NEGATIVE };
const all = [];

UNITS.forEach((u, i) => {
  const n = String(i + 1).padStart(2, '0');
  const card = cardPrompt(u), sd = sdPrompt(u);
  bundle.cards[u.id] = { name: u.name, en: ART[u.id].en, rarity: u.rarity, text: card };
  bundle.sd[u.id] = { name: u.name, en: ART[u.id].en, rarity: u.rarity, text: sd };
  fs.writeFileSync(path.join(OUT, `card-${n}-${u.id}.txt`), card + '\n');
  fs.writeFileSync(path.join(OUT, `sd-${n}-${u.id}.txt`), sd + '\n');
  all.push(`===== 카드 일러 — ${u.name} (${ART[u.id].en}) / ${u.rarity} =====\n\n${card}\n`);
  all.push(`===== SD 아바타 — ${u.name} (${ART[u.id].en}) =====\n\n${sd}\n`);
});

ZONES.forEach((z, i) => {
  const n = String(i + 1).padStart(2, '0');
  const bg = bgPrompt(i);
  bundle.bg[i + 1] = { name: z.name, text: bg };
  fs.writeFileSync(path.join(OUT, `bg-${n}.txt`), bg + '\n');
  all.push(`===== 배경 ${i + 1} — ${z.name} =====\n\n${bg}\n`);
});

all.push(`===== NEGATIVE PROMPT (Stable Diffusion 계열) =====\n\n${NEGATIVE}\n`);
fs.writeFileSync(path.join(OUT, 'ALL.txt'), all.join('\n'));
fs.writeFileSync(path.join(OUT, 'prompts.json'), JSON.stringify(bundle, null, 2));

console.log(`생성 완료: 카드 ${UNITS.length} · SD ${UNITS.length} · 배경 ${ZONES.length} → ${path.relative(ROOT, OUT)}/`);
