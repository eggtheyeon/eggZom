/* ===== eggZom 아트 매니페스트 =====
 *
 * 일러스트를 넣었으면 파일 이름(확장자 .png 제외)을 아래 배열에 추가하세요.
 * 비워두면 해당 항목은 코드로 그리는 기본 그래픽을 그대로 씁니다.
 * 부분 교체도 됩니다 — 미라만 그림이 있으면 미라만 그림으로 나옵니다.
 *
 *   chibi : art/chibi/{소녀id}.png    256x256   전장에 서는 SD 아바타
 *   bust  : art/bust/{소녀id}.png     512x512   편성 슬롯 · 카드 썸네일
 *   full  : art/full/{소녀id}.png    1536x2048  캐릭터 카드 전신 일러스트
 *   bg    : art/bg/{지역번호}.png    3840x1680  지역 배경 (1~10)
 *
 * 소녀 id : mira ruby neko haru vivi nova yuki sera
 *
 * 배경은 지면선이 이미지 높이의 79% 지점에 있다고 가정하고 정렬합니다.
 * 납품물이 다르면 bgGround 값을 실제 비율로 바꿔주세요.
 */
window.ZOM_ART = {
  chibi: [],
  bust: [],
  full: [],
  bg: [],
  bgGround: 0.79,
};
