// Original ingredients share a transparent atlas; extra ingredients use cutouts.
const positions = {
  broccoli: [0, 0],
  spinaci: [1, 0],
  pomodori: [2, 0],
  quinoa: [0, 1],
  riso: [1, 1],
  pane: [2, 1],
  salmone: [0, 2],
  pollo: [1, 2],
  tofu: [2, 2],
};

const individualPictures = {
  carote: "assets/images/food-carote-v1.webp",
  zucchine: "assets/images/food-zucchine-v1.webp",
  avena: "assets/images/food-avena-v1.webp",
  farro: "assets/images/food-farro-v1.webp",
  ceci: "assets/images/food-ceci-v1.webp",
  uova: "assets/images/food-uova-v1.webp",
};

export const hasFoodPicture = (id) =>
  Object.hasOwn(positions, id) || Object.hasOwn(individualPictures, id);

export function foodPicture(id, classes = "size-14") {
  if (!hasFoodPicture(id)) return "";
  if (Object.hasOwn(individualPictures, id)) {
    return `<div class="avatar shrink-0" data-food-art="${id}" aria-hidden="true"><div class="${classes} overflow-hidden rounded-none"><img src="${individualPictures[id]}" alt="" width="512" height="512" class="h-full w-full object-contain" decoding="async"></div></div>`;
  }
  const [column, row] = positions[id];
  return `<div class="avatar shrink-0" data-food-art="${id}" aria-hidden="true"><div class="relative ${classes} overflow-hidden rounded-none"><img src="assets/images/widget-ingredients-atlas-v1.webp" alt="" width="1254" height="1254" class="absolute top-0 left-0 h-[300%] w-[300%] max-w-none object-fill" style="transform:translate(${-column * (100 / 3)}%,${-row * (100 / 3)}%)" decoding="async"></div></div>`;
}
