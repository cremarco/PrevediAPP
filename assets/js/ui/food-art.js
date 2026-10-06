// One transparent illustration atlas; each cell is a named ingredient, not an icon.
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

export function foodPicture(id, classes = "size-14") {
  if (!Object.hasOwn(positions, id)) return "";
  const [column, row] = positions[id];
  return `<div class="avatar shrink-0" data-food-art="${id}" aria-hidden="true"><div class="relative ${classes} overflow-hidden rounded-none"><img src="assets/images/widget-ingredients-atlas-v1.webp" alt="" width="1254" height="1254" class="absolute top-0 left-0 h-[300%] w-[300%] max-w-none object-fill" style="transform:translate(${-column * (100 / 3)}%,${-row * (100 / 3)}%)" decoding="async"></div></div>`;
}
