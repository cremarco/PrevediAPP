import { foods } from "../data.js";

export const foodExtras = [
  { id: "mela-rossa", name: "Mela rossa", group: "fruit" },
  { id: "mela-verde", name: "Mela verde", group: "fruit" },
  { id: "mirtilli", name: "Mirtilli", group: "fruit" },
  { id: "ceci", name: "Ceci", group: "legumes" },
  { id: "noci", name: "Noci", group: "nuts" },
  { id: "yogurt", name: "Yogurt bianco", group: "dairy" },
  { id: "avena", name: "Fiocchi d’avena", group: "carbs" },
  { id: "farro", name: "Farro", group: "carbs" },
  { id: "uova", name: "Uova", group: "protein" },
  { id: "carote", name: "Carote", group: "vegetables" },
  { id: "zucchine", name: "Zucchine", group: "vegetables" },
  { id: "succo-mela", name: "Succo di mela", group: "drinks" },
];
export const foodCategories = {
  all: "Tutti gli ingredienti",
  vegetables: "Verdure",
  carbs: "Cereali e carboidrati",
  protein: "Proteine",
  fruit: "Frutta",
  legumes: "Legumi",
  nuts: "Frutta a guscio",
  dairy: "Latticini",
  drinks: "Bevande",
};
export const catalogFoods = () => [...foods, ...foodExtras];
// Plate placement is separate from discovery categories and the v1 pantry schema.
// Chickpeas occupy the plant-protein sector of this space model; their catalog
// category remains legumes, and this placement does not describe nutrient ratios.
export const plateFoods = catalogFoods()
  .filter(
    (food) =>
      ["vegetables", "carbs", "protein"].includes(food.group) ||
      food.id === "ceci",
  )
  .map((food) => ({
    ...food,
    plateGroup: food.id === "ceci" ? "protein" : food.group,
  }));
export const foodById = (id) => catalogFoods().find((food) => food.id === id);

export function catalogPlateBalance(items = []) {
  const groups = { vegetables: 0, carbs: 0, protein: 0 };
  for (const id of items) {
    const food = plateFoods.find((item) => item.id === id);
    if (food) groups[food.plateGroup]++;
  }
  const count = Object.values(groups).reduce((sum, value) => sum + value, 0);
  return {
    groups,
    percent: Object.fromEntries(
      Object.entries(groups).map(([group, value]) => [
        group,
        count ? Math.round((value / count) * 100) : 0,
      ]),
    ),
    balanced:
      items.length === 4 &&
      count === 4 &&
      groups.vegetables === 2 &&
      groups.carbs === 1 &&
      groups.protein === 1,
  };
}
const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT")
    .trim();
export function findFoods(query = "", category = "all") {
  const q = normalize(query);
  return catalogFoods().filter(
    (food) =>
      (category === "all" || food.group === category) &&
      normalize(food.name).includes(q),
  );
}
export const recipes = [
  {
    id: "quinoa",
    name: "Insalata di Quinoa",
    minutes: 15,
    tag: "Vegetale",
    ingredients: [
      "Quinoa già cotta",
      "Pomodori",
      "Cetriolo",
      "Ceci già cotti",
      "Olio e limone secondo il tuo gusto",
    ],
    steps: [
      "Taglia pomodori e cetriolo dopo averli lavati.",
      "Unisci le verdure alla quinoa e ai ceci già cotti.",
      "Condisci e mescola. Adatta ingredienti e porzioni alle tue esigenze.",
    ],
    pantry: ["quinoa", "pomodori", "ceci"],
  },
  {
    id: "salmone",
    name: "Salmone al Vapore",
    minutes: 20,
    tag: "Pesce",
    ingredients: [
      "Salmone",
      "Broccoli",
      "Riso integrale già cotto",
      "Limone ed erbe aromatiche",
    ],
    steps: [
      "Prepara il salmone seguendo le indicazioni di cottura del prodotto.",
      "Cuoci i broccoli al vapore finché hanno la consistenza che preferisci.",
      "Servi con riso integrale e limone. Adatta ingredienti e porzioni alle tue esigenze.",
    ],
    pantry: ["salmone", "broccoli", "riso"],
  },
  {
    id: "hummus",
    name: "Hummus di Ceci",
    minutes: 10,
    tag: "Vegetale",
    ingredients: [
      "Ceci già cotti",
      "Tahina, se adatta alle tue esigenze",
      "Limone, acqua e olio secondo il tuo gusto",
      "Verdure e pane integrale per accompagnare",
    ],
    steps: [
      "Frulla i ceci già cotti con limone e gli ingredienti che hai scelto.",
      "Aggiungi poca acqua alla volta fino alla consistenza desiderata.",
      "Servi con verdure e pane integrale. Considera le allergie, anche al sesamo.",
    ],
    pantry: ["ceci", "pane", "carote"],
  },
];
export const recipeById = (id) =>
  recipes.find((recipe) => recipe.id === id) || recipes[0];
export function recipeStepsFor(id, indices = []) {
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe || !Array.isArray(indices)) return [];
  return [...new Set(indices)].filter(
    (index) =>
      Number.isInteger(index) && index >= 0 && index < recipe.steps.length,
  );
}

// Preparation checklists are transient UI state, separate for each recipe.
export function toggleRecipeStep(stepsByRecipe, id, index) {
  const recipe = recipes.find((item) => item.id === id);
  if (
    !recipe ||
    !stepsByRecipe ||
    typeof stepsByRecipe !== "object" ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= recipe.steps.length
  )
    return false;
  const current = recipeStepsFor(id, stepsByRecipe[id]);
  stepsByRecipe[id] = current.includes(index)
    ? current.filter((value) => value !== index)
    : [...current, index];
  return true;
}

export function recipePantryFoods(id) {
  const recipe = recipes.find((item) => item.id === id);
  return recipe ? recipe.pantry.map(foodById).filter(Boolean) : [];
}
export function searchRecipes(query = "", filter = "all") {
  const q = normalize(query);
  return recipes.filter(
    (recipe) =>
      normalize(recipe.name).includes(q) &&
      (filter === "all" || recipe.tag === filter),
  );
}
export const fridgeRounds = [
  "vegetables",
  "carbs",
  "protein",
  "vegetables",
  "protein",
];
export function initialFridgeGame() {
  return {
    index: 0,
    correct: 0,
    lives: 3,
    started: false,
    finished: false,
    selected: [],
    message: "",
  };
}
export function answerFridgeGame(game, id) {
  if (!game.started || game.finished) return false;
  const food = foods.find((item) => item.id === id);
  if (!food) return false;
  const correct = food.group === fridgeRounds[game.index];
  if (correct) {
    game.correct++;
    game.selected.push(id);
    game.message = `${food.name}: appartiene al gruppo ${foodCategories[food.group].toLocaleLowerCase("it-IT")}.`;
    game.index++;
  } else {
    game.lives--;
    game.message = `${food.name} appartiene al gruppo ${foodCategories[food.group].toLocaleLowerCase("it-IT")}. Riprova con ${foodCategories[fridgeRounds[game.index]].toLocaleLowerCase("it-IT")}.`;
  }
  game.finished = game.lives === 0 || game.index === fridgeRounds.length;
  return true;
}
